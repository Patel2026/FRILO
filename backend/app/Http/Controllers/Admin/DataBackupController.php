<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SystemBackup;
use App\Services\DatabaseBackupService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use RuntimeException;
use Throwable;

class DataBackupController extends Controller
{
    public function __construct(private readonly DatabaseBackupService $databaseBackupService) {}

    public function index(): View
    {
        return view('admin.backups.index', [
            'backups' => SystemBackup::query()
                ->with(['creator', 'lastRestorer'])
                ->latest('id')
                ->paginate(20),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        try {
            $backup = $this->databaseBackupService->createBackup(
                actor: $request->user(),
                note: $validated['note'] ?? null
            );
        } catch (Throwable $exception) {
            return back()->withErrors([
                'backup' => 'Échec de la sauvegarde: '.$exception->getMessage(),
            ]);
        }

        return redirect()
            ->route('admin.backups.index')
            ->with('success', 'Sauvegarde créée avec succès (#'.$backup->id.').');
    }

    public function download(SystemBackup $backup)
    {
        try {
            return $this->databaseBackupService->downloadBackup($backup);
        } catch (RuntimeException $exception) {
            return redirect()
                ->route('admin.backups.index')
                ->withErrors(['backup' => $exception->getMessage()]);
        }
    }

    public function restore(Request $request, SystemBackup $backup): RedirectResponse
    {
        $request->validate([
            'confirm_restore' => ['required', 'accepted'],
        ]);

        try {
            $result = $this->databaseBackupService->restoreBackup($backup, $request->user());
        } catch (Throwable $exception) {
            return redirect()
                ->route('admin.backups.index')
                ->withErrors(['restore' => 'Restauration échouée: '.$exception->getMessage()]);
        }

        return redirect()
            ->route('admin.backups.index')
            ->with('success', sprintf(
                'Restauration terminée: %d table(s), %d ligne(s) restaurée(s).',
                (int) ($result['tables'] ?? 0),
                (int) ($result['rows'] ?? 0)
            ));
    }
}
