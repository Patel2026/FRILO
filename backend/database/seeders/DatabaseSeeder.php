<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
            SectorSeeder::class,
            TemplateSeeder::class,
            TemplatePreviewSeeder::class,
            FaqItemSeeder::class,
            DemoClientSeeder::class,
        ]);
    }
}
