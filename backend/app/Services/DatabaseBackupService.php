<?php

namespace App\Services;

use App\Models\SystemBackup;
use App\Models\User;
use Illuminate\Database\Connection;
use Illuminate\Support\Arr;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class DatabaseBackupService
{
    private const STORAGE_DISK = 'local';

    private const STORAGE_DIR = 'backups/database';

    /**
     * Ces tables sont conservées en dehors de la restauration "métier".
     */
    private const NON_RESTORABLE_TABLES = [
        'migrations',
        'system_backups',
        'admin_audit_logs',
    ];

    public function __construct(private readonly AdminAuditLogger $auditLogger) {}

    public function createBackup(?User $actor = null, ?string $note = null): SystemBackup
    {
        $connection = DB::connection();
        $driver = $connection->getDriverName();
        $tableNames = $this->listTables($connection);

        $rowsCount = 0;
        $tablesPayload = [];
        foreach ($tableNames as $tableName) {
            $rows = $connection->table($tableName)->get()->map(static fn ($row): array => (array) $row)->all();
            $rowsCount += count($rows);
            $tablesPayload[$tableName] = $rows;
        }

        $now = Carbon::now();
        $filename = sprintf(
            'frilo-backup-%s-%s.json',
            $now->format('Ymd-His'),
            Str::lower(Str::random(6))
        );
        $storagePath = self::STORAGE_DIR.'/'.$filename;

        $payload = [
            'meta' => [
                'version' => 1,
                'created_at' => $now->toISOString(),
                'app_name' => (string) config('app.name', 'FRILO'),
                'app_env' => (string) config('app.env', 'production'),
                'database_driver' => $driver,
                'tables_count' => count($tableNames),
                'rows_count' => $rowsCount,
                'non_restorable_tables' => self::NON_RESTORABLE_TABLES,
            ],
            'tables' => $tablesPayload,
        ];

        $encoded = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
        if (! is_string($encoded)) {
            throw new RuntimeException('Impossible de sérialiser la sauvegarde.');
        }

        Storage::disk(self::STORAGE_DISK)->put($storagePath, $encoded);

        $backup = SystemBackup::create([
            'filename' => $filename,
            'storage_path' => $storagePath,
            'database_driver' => $driver,
            'file_size_bytes' => (int) Storage::disk(self::STORAGE_DISK)->size($storagePath),
            'tables_count' => count($tableNames),
            'rows_count' => $rowsCount,
            'status' => SystemBackup::STATUS_READY,
            'note' => $note,
            'meta' => [
                'table_names' => $tableNames,
            ],
            'created_by' => $actor?->id,
        ]);

        Log::info('system.backup.created', [
            'backup_id' => $backup->id,
            'filename' => $backup->filename,
            'tables_count' => $backup->tables_count,
            'rows_count' => $backup->rows_count,
            'created_by' => $actor?->id,
        ]);
        $this->auditLogger->record(
            event: 'system.backup.created',
            payload: [
                'backup_id' => $backup->id,
                'filename' => $backup->filename,
                'tables_count' => $backup->tables_count,
                'rows_count' => $backup->rows_count,
            ],
            actor: $actor,
            message: 'Création sauvegarde base de données',
            targetType: 'system_backup',
            targetId: (string) $backup->id
        );

        return $backup;
    }

    public function restoreBackup(SystemBackup $backup, User $actor): array
    {
        $data = $this->loadBackupData($backup);
        $tablesData = Arr::get($data, 'tables', []);
        if (! is_array($tablesData) || $tablesData === []) {
            throw new RuntimeException('Sauvegarde invalide: tables absentes.');
        }

        $connection = DB::connection();
        $restoredTables = 0;
        $restoredRows = 0;

        DB::transaction(function () use ($connection, $tablesData, &$restoredTables, &$restoredRows): void {
            $this->setForeignKeyChecks($connection, false);

            try {
                $tableNames = array_keys($tablesData);
                $tableNames = array_filter($tableNames, fn ($table): bool => $this->isRestorableTable((string) $table));

                foreach (array_reverse($tableNames) as $tableName) {
                    $tableName = (string) $tableName;
                    if (! $this->tableExists($connection, $tableName)) {
                        continue;
                    }

                    try {
                        $connection->table($tableName)->truncate();
                    } catch (Throwable) {
                        $connection->table($tableName)->delete();
                    }
                }

                foreach ($tableNames as $tableName) {
                    $tableName = (string) $tableName;
                    if (! $this->tableExists($connection, $tableName)) {
                        continue;
                    }

                    $rows = $tablesData[$tableName] ?? [];
                    if (! is_array($rows)) {
                        continue;
                    }

                    $normalizedRows = [];
                    foreach ($rows as $row) {
                        if (! is_array($row)) {
                            continue;
                        }

                        $normalizedRows[] = $row;
                    }

                    if ($normalizedRows !== []) {
                        foreach (array_chunk($normalizedRows, 250) as $chunk) {
                            $connection->table($tableName)->insert($chunk);
                            $restoredRows += count($chunk);
                        }
                    }

                    $restoredTables++;
                }
            } finally {
                $this->setForeignKeyChecks($connection, true);
            }
        });

        $backup->update([
            'status' => SystemBackup::STATUS_RESTORED,
            'last_restored_at' => now(),
            'last_restored_by' => $actor->id,
            'restore_count' => $backup->restore_count + 1,
            'meta' => array_replace($backup->meta ?? [], [
                'last_restore' => [
                    'restored_tables' => $restoredTables,
                    'restored_rows' => $restoredRows,
                    'at' => now()->toISOString(),
                ],
            ]),
        ]);

        Log::warning('system.backup.restored', [
            'backup_id' => $backup->id,
            'filename' => $backup->filename,
            'restored_tables' => $restoredTables,
            'restored_rows' => $restoredRows,
            'restored_by' => $actor->id,
        ]);
        $this->auditLogger->record(
            event: 'system.backup.restored',
            payload: [
                'backup_id' => $backup->id,
                'filename' => $backup->filename,
                'restored_tables' => $restoredTables,
                'restored_rows' => $restoredRows,
            ],
            actor: $actor,
            message: 'Restauration sauvegarde base de données',
            targetType: 'system_backup',
            targetId: (string) $backup->id
        );

        return [
            'tables' => $restoredTables,
            'rows' => $restoredRows,
        ];
    }

    public function downloadBackup(SystemBackup $backup): StreamedResponse
    {
        if (! Storage::disk(self::STORAGE_DISK)->exists($backup->storage_path)) {
            throw new RuntimeException('Fichier de sauvegarde introuvable.');
        }

        return Storage::disk(self::STORAGE_DISK)->download($backup->storage_path, $backup->filename);
    }

    /**
     * @return array<int, string>
     */
    private function listTables(Connection $connection): array
    {
        $driver = $connection->getDriverName();

        return match ($driver) {
            'mysql' => collect($connection->select('SHOW TABLES'))
                ->map(static fn ($row): string => (string) array_values((array) $row)[0])
                ->filter()
                ->values()
                ->all(),
            'sqlite' => collect($connection->select("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"))
                ->map(static fn ($row): string => (string) ($row->name ?? ''))
                ->filter()
                ->values()
                ->all(),
            'pgsql' => collect($connection->select("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"))
                ->map(static fn ($row): string => (string) ($row->tablename ?? ''))
                ->filter()
                ->values()
                ->all(),
            'sqlsrv' => collect($connection->select("SELECT TABLE_NAME AS name FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME"))
                ->map(static fn ($row): string => (string) ($row->name ?? ''))
                ->filter()
                ->values()
                ->all(),
            default => throw new RuntimeException('Driver base de données non supporté pour la sauvegarde: '.$driver),
        };
    }

    private function loadBackupData(SystemBackup $backup): array
    {
        if (! Storage::disk(self::STORAGE_DISK)->exists($backup->storage_path)) {
            throw new RuntimeException('Le fichier de sauvegarde est introuvable.');
        }

        $raw = Storage::disk(self::STORAGE_DISK)->get($backup->storage_path);
        if (! is_string($raw) || trim($raw) === '') {
            throw new RuntimeException('Le fichier de sauvegarde est vide.');
        }

        $decoded = json_decode($raw, true);
        if (! is_array($decoded)) {
            throw new RuntimeException('Le format du fichier de sauvegarde est invalide.');
        }

        return $decoded;
    }

    private function setForeignKeyChecks(Connection $connection, bool $enabled): void
    {
        $driver = $connection->getDriverName();
        $flag = $enabled ? 1 : 0;

        match ($driver) {
            'mysql' => $connection->statement('SET FOREIGN_KEY_CHECKS='.$flag),
            'sqlite' => $connection->statement('PRAGMA foreign_keys = '.$flag),
            'pgsql' => $connection->statement('SET CONSTRAINTS ALL '.($enabled ? 'IMMEDIATE' : 'DEFERRED')),
            default => null,
        };
    }

    private function tableExists(Connection $connection, string $tableName): bool
    {
        return Schema::connection($connection->getName())->hasTable($tableName);
    }

    private function isRestorableTable(string $tableName): bool
    {
        if (! preg_match('/^[A-Za-z0-9_]+$/', $tableName)) {
            return false;
        }

        return ! in_array($tableName, self::NON_RESTORABLE_TABLES, true);
    }
}
