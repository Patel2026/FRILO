<?php

namespace Database\Seeders;

use App\Models\Sector;
use App\Models\Template;
use Illuminate\Database\Seeder;

class TemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'sector_slug' => 'restaurants',
                'name'        => 'Le Gourmet',
                'description' => 'Site élégant pour restaurant avec menu interactif et galerie photos.',
                'price'       => 50000,
                'features'    => ['Menu digital', 'Réservation en ligne', 'Galerie photos', 'Carte interactive'],
            ],
            [
                'sector_slug' => 'btp',
                'name'        => 'BatiPro',
                'description' => 'Site professionnel pour artisan BTP avec portfolio et devis en ligne.',
                'price'       => 50000,
                'features'    => ['Devis en ligne', 'Portfolio chantiers', 'Avis clients', 'Zones d\'intervention'],
            ],
            [
                'sector_slug' => 'sante',
                'name'        => 'ZenClick',
                'description' => 'Site pour praticien de santé avec prise de rendez-vous intégrée.',
                'price'       => 50000,
                'features'    => ['Prise de RDV en ligne', 'Blog conseils', 'Présentation équipe', 'Tarifs'],
            ],
            [
                'sector_slug' => 'avocats',
                'name'        => 'LegalExpert',
                'description' => 'Site sobre et professionnel pour cabinet d\'avocats.',
                'price'       => 50000,
                'features'    => ['Espace client', 'Articles juridiques', 'Contact sécurisé', 'Domaines d\'expertise'],
            ],
            [
                'sector_slug' => 'coaching',
                'name'        => 'CoachVision',
                'description' => 'Site pour coach et consultant avec présentation offres et témoignages.',
                'price'       => 50000,
                'features'    => ['Présentation offres', 'Témoignages clients', 'Prise de contact', 'Calendrier'],
            ],
            [
                'sector_slug' => 'immobilier',
                'name'        => 'ImmoPrestige',
                'description' => 'Site agence immobilière avec listings et galeries de biens.',
                'price'       => 75000,
                'features'    => ['Galerie des biens', 'Filtres de recherche', 'Demande de visite', 'Estimation en ligne'],
            ],
        ];

        foreach ($templates as $data) {
            $sector = Sector::where('slug', $data['sector_slug'])->first();
            if (! $sector) {
                continue;
            }

            $slug = \Illuminate\Support\Str::slug($data['name']);

            Template::firstOrCreate(
                ['slug' => $slug],
                [
                    'sector_id'   => $sector->id,
                    'name'        => $data['name'],
                    'description' => $data['description'],
                    'price'       => $data['price'],
                    'features'    => $data['features'],
                    'is_active'   => true,
                ]
            );
        }
    }
}
