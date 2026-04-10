<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@frilo.com'],
            [
                'name' => 'Super Admin FRILO',
                'password' => Hash::make('password'),
                'role' => 'super_admin',
            ]
        );
    }
}
