<?php

namespace Database\Seeders;

use App\Models\Template;
use Illuminate\Database\Seeder;

class TemplatePreviewSeeder extends Seeder
{
    public function run(): void
    {
        $previewMap = [
            'batipro' => [
                'preview_url' => '/template-previews/tpl-BTP-01/',
                'preview_pages' => [
                    ['label' => 'Accueil', 'path' => 'index.html'],
                    ['label' => 'À propos', 'path' => 'about.html'],
                    ['label' => 'Services', 'path' => 'services.html'],
                    ['label' => 'Réalisations', 'path' => 'portfolio.html'],
                    ['label' => 'Contact', 'path' => 'contact.html'],
                ],
            ],
            'architectus' => [
                'preview_url' => '/template-previews/tpl-BTP-02/',
                'preview_pages' => [
                    ['label' => 'Accueil', 'path' => 'index.html'],
                    ['label' => 'À propos', 'path' => 'about.html'],
                    ['label' => 'Services', 'path' => 'services.html'],
                    ['label' => 'Réalisations', 'path' => 'portfolio.html'],
                    ['label' => 'Contact', 'path' => 'contact.html'],
                ],
            ],
            'coachvision' => [
                'preview_url' => '/template-previews/tpl-COA-03/',
                'preview_pages' => [
                    ['label' => 'Accueil', 'path' => 'index.html'],
                    ['label' => 'À propos', 'path' => 'about.html'],
                    ['label' => 'Programmes', 'path' => 'services.html'],
                    ['label' => 'Contact', 'path' => 'contact.html'],
                ],
            ],
            'frilo-africa' => [
                'preview_url' => '/template-previews/tpl-COA-02/',
                'preview_pages' => [
                    ['label' => 'Accueil', 'path' => 'index.html'],
                    ['label' => 'Notre vision', 'path' => 'about.html'],
                    ['label' => 'Expertises', 'path' => 'services.html'],
                    ['label' => 'Diagnostic', 'path' => 'contact.html'],
                ],
            ],
            'legalexpert' => [
                'preview_url' => '/template-previews/tpl-avocat-01-corporate/',
                'preview_pages' => [
                    ['label' => 'Accueil', 'path' => 'index.html'],
                    ['label' => 'Cabinet', 'path' => 'about.html'],
                    ['label' => 'Expertises', 'path' => 'services.html'],
                    ['label' => 'Contact', 'path' => 'contact.html'],
                ],
            ],
            'sanctum-avocats' => [
                'preview_url' => '/template-previews/tpl-avocat-02-legaltech/',
                'preview_pages' => [
                    ['label' => 'Accueil', 'path' => 'index.html'],
                    ['label' => 'Cabinet', 'path' => 'about.html'],
                    ['label' => 'Services', 'path' => 'services.html'],
                    ['label' => 'Contact', 'path' => 'contact.html'],
                ],
            ],
        ];

        $templates = Template::query()->get();

        foreach ($templates as $template) {
            $preview = $previewMap[$template->slug] ?? null;

            $template->update([
                'preview_url' => $preview['preview_url'] ?? null,
                'preview_pages' => $preview['preview_pages'] ?? [],
                'preview_gallery' => [],
            ]);
        }
    }
}
