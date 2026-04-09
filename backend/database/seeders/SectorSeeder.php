<?php

namespace Database\Seeders;

use App\Models\Sector;
use Illuminate\Database\Seeder;

class SectorSeeder extends Seeder
{
    public function run(): void
    {
        $sectors = [
            ['name' => 'Restaurants & Traiteurs',  'slug' => 'restaurants',  'icon' => 'Utensils', 'description' => 'Mettez en appétit vos clients avec un menu interactif et des photos alléchantes.'],
            ['name' => 'BTP & Artisanat',          'slug' => 'btp',          'icon' => 'Hammer',   'description' => 'Présentez vos réalisations et rassurez vos futurs clients.'],
            ['name' => 'Santé & Bien-être',        'slug' => 'sante',        'icon' => 'Heart',    'description' => 'Inspirez confiance et facilitez la prise de rendez-vous.'],
            ['name' => 'Avocats & Juridique',      'slug' => 'avocats',      'icon' => 'Scale',    'description' => 'Une image professionnelle pour votre cabinet.'],
            ['name' => 'Coaching & Consulting',    'slug' => 'coaching',     'icon' => 'Users',    'description' => 'Vendez vos expertises et formations en ligne.'],
            ['name' => 'Immobilier',               'slug' => 'immobilier',   'icon' => 'Home',     'description' => 'Mettez en valeur vos biens avec des galeries immersives.'],
        ];

        foreach ($sectors as $sector) {
            Sector::firstOrCreate(['slug' => $sector['slug']], $sector + ['is_active' => true]);
        }
    }
}
