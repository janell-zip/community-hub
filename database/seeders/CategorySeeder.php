<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['slug' => 'health',          'label' => 'Health',          'color' => '#c0392b'],
            ['slug' => 'education',        'label' => 'Education',       'color' => '#2980b9'],
            ['slug' => 'infrastructure',   'label' => 'Infrastructure',  'color' => '#e67e22'],
            ['slug' => 'livelihood',       'label' => 'Livelihood',      'color' => '#27ae60'],
            ['slug' => 'disaster-risk',    'label' => 'Disaster Risk',   'color' => '#8e44ad'],
            ['slug' => 'social-services',  'label' => 'Social Services', 'color' => '#16a085'],
        ];

        foreach ($categories as $category) {
            DB::table('categories')->insert([
                'slug'       => $category['slug'],
                'label'      => $category['label'],
                'color'      => $category['color'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}