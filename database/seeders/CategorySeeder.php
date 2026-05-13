<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('categories')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $categories = [
            ['slug' => 'spiritual-values',  'label' => 'Spiritual & Values Formation',   'color' => '#16a085'],
            ['slug' => 'health',            'label' => 'Health & Well-Being',            'color' => '#c0392b'],
            ['slug' => 'livelihood',        'label' => 'Livelihood & Enterprise',        'color' => '#27ae60'],
            ['slug' => 'education',         'label' => 'Education & Culture',            'color' => '#2980b9'],
            ['slug' => 'digital-inclusion', 'label' => 'Digital Inclusion & Innovation', 'color' => '#e67e22'],
            ['slug' => 'environment',       'label' => 'Environmental Stewardship',      'color' => '#1a9e6e'],
            ['slug' => 'disaster-risk',     'label' => 'DRRM & Emergency Preparedness',  'color' => '#8e44ad'],
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