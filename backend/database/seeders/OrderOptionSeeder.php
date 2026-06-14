<?php

namespace Database\Seeders;

use App\Models\OrderOption;
use Illuminate\Database\Seeder;

class OrderOptionSeeder extends Seeder
{
    public function run(): void
    {
        $options = [
            ['Galerie photos / réalisations', 'galerie-photos', 'Montrez vos plats, chantiers, produits ou événements.', 'Restaurant, BTP, commerce, école', 10000, 10],
            ['Page supplémentaire', 'page-supplementaire', 'Ajoutez une page dédiée à un service, une équipe ou une information importante.', 'Cabinet, école, institution, service professionnel', 10000, 20],
            ['Catalogue organisé', 'catalogue-organise', 'Présentez plusieurs biens, produits, programmes ou offres de façon claire.', 'Immobilier, école, commerce', 25000, 30],
            ['Formulaire avancé', 'formulaire-avance', 'Recevez des demandes plus précises que le simple nom et téléphone.', 'BTP, immobilier, école, cabinet', 15000, 40],
            ['Réservation ou devis structuré', 'reservation-devis', 'Guidez vos clients vers une réservation, un devis ou un rendez-vous.', 'Restaurant, BTP, coach, santé', 15000, 50],
            ['Multilingue FR/EN', 'multilingue-fr-en', 'Affichez les contenus principaux en français et en anglais.', 'Institution, tourisme, cabinet, école', 20000, 60],
            ['SEO local de départ', 'seo-local', 'Préparez les titres et textes pour mieux décrire votre activité et votre zone.', 'Tous les secteurs', 15000, 70],
            ['Aide rédaction contenu', 'aide-redaction', 'Transformez vos notes en textes simples et clairs pour vos pages.', 'Entrepreneur sans contenus prêts', 20000, 80],
        ];

        foreach ($options as [$name, $slug, $description, $personaHint, $price, $sortOrder]) {
            OrderOption::updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $name,
                    'description' => $description,
                    'persona_hint' => $personaHint,
                    'price' => $price,
                    'is_active' => true,
                    'sort_order' => $sortOrder,
                ]
            );
        }
    }
}
