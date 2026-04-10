<?php

namespace Database\Seeders;

use App\Models\Template;
use Illuminate\Database\Seeder;

class TemplatePreviewSeeder extends Seeder
{
    public function run(): void
    {
        $templates = Template::query()->get();

        foreach ($templates as $template) {
            $slug = $template->slug;

            $template->update([
                'preview_url' => 'http://localhost:3000',
                'preview_pages' => [
                    ['label' => 'Accueil', 'path' => "/demo/{$slug}"],
                    ['label' => 'Services', 'path' => "/demo/{$slug}/services"],
                    ['label' => 'Tarifs', 'path' => "/demo/{$slug}/pricing"],
                    ['label' => 'Contact', 'path' => "/demo/{$slug}/contact"],
                ],
                'preview_gallery' => [
                    "https://picsum.photos/seed/{$slug}-home/1400/900",
                    "https://picsum.photos/seed/{$slug}-services/1400/900",
                    "https://picsum.photos/seed/{$slug}-pricing/1400/900",
                    "https://picsum.photos/seed/{$slug}-contact/1400/900",
                ],
            ]);
        }
    }
}
