<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoClientSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'client@frilo.com'],
            [
                'name'     => 'Client Demo',
                'password' => Hash::make('password'),
                'role'     => 'client',
            ]
        );
    }
}
