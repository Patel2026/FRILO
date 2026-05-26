<?php

namespace App\Support;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class LocalTemplatePreviewCatalog
{
    private const PAGE_LABELS = [
        'index' => 'Accueil',
        'about' => 'A propos',
        'services' => 'Services',
        'portfolio' => 'Realisations',
        'pricing' => 'Tarifs',
        'contact' => 'Contact',
    ];

    public function all(): array
    {
        $root = $this->resolveSourceRoot();

        if ($root === null) {
            return [];
        }

        return collect(File::directories($root))
            ->map(fn (string $directory) => $this->buildEntry($directory))
            ->filter()
            ->values()
            ->all();
    }

    public function find(string $folder): ?array
    {
        return collect($this->all())
            ->firstWhere('folder', $folder);
    }

    private function buildEntry(string $directory): ?array
    {
        $folder = basename($directory);
        $normalizedFolder = Str::lower(trim($folder));

        if ($normalizedFolder === '' || Str::startsWith($normalizedFolder, '.') || Str::startsWith($normalizedFolder, 'maquette')) {
            return null;
        }

        $htmlFiles = collect(File::files($directory))
            ->filter(fn ($file) => Str::lower($file->getExtension()) === 'html')
            ->map(fn ($file) => $file->getFilename())
            ->values()
            ->all();

        $pages = $this->buildPages($htmlFiles);

        if ($pages === []) {
            return null;
        }

        return [
            'folder' => $folder,
            'label' => $folder,
            'preview_url' => "/template-previews/{$folder}/",
            'pages' => $pages,
            'pages_count' => count($pages),
        ];
    }

    private function buildPages(array $htmlFiles): array
    {
        $orderedFiles = collect($htmlFiles)
            ->sortBy(function (string $file) {
                $baseName = pathinfo($file, PATHINFO_FILENAME);
                $orderedKeys = array_keys(self::PAGE_LABELS);
                $index = array_search($baseName, $orderedKeys, true);

                return $index === false ? count($orderedKeys) + 1 : $index;
            })
            ->values();

        return $orderedFiles
            ->map(function (string $file) {
                $baseName = pathinfo($file, PATHINFO_FILENAME);

                return [
                    'label' => self::PAGE_LABELS[$baseName] ?? Str::headline(str_replace(['-', '_'], ' ', $baseName)),
                    'path' => $file,
                ];
            })
            ->all();
    }

    private function resolveSourceRoot(): ?string
    {
        $candidates = [
            base_path('../template'),
            base_path('template-source'),
            '/var/www/template-source',
        ];

        foreach ($candidates as $candidate) {
            if (is_dir($candidate)) {
                return $candidate;
            }
        }

        return null;
    }
}
