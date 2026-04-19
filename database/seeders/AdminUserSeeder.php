<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'superadmin@spup-cdcfi.com'],
            [
                'name'     => 'Super Admin',
                'email'    => 'superadmin@spup-cdcfi.com',
                'password' => Hash::make('Admin@1234'),
                'role'     => 'super_admin',
            ]
        );
    }
}