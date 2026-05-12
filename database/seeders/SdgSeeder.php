<?php

namespace Database\Seeders;

use App\Models\Sdg;
use Illuminate\Database\Seeder;

class SdgSeeder extends Seeder
{
    public function run(): void
    {
        $sdgs = [
            [1,  'No Poverty',                '#e5243b'],
            [2,  'Zero Hunger',               '#dda63a'],
            [3,  'Good Health and Well-being', '#4c9f38'],
            [4,  'Quality Education',         '#c5192d'],
            [5,  'Gender Equality',           '#ff3a21'],
            [6,  'Clean Water and Sanitation','#26bde2'],
            [7,  'Affordable and Clean Energy','#fcc30b'],
            [8,  'Decent Work and Economic Growth','#a21942'],
            [9,  'Industry, Innovation and Infrastructure','#fd6925'],
            [10, 'Reduced Inequalities',      '#dd1367'],
            [11, 'Sustainable Cities and Communities','#fd9d24'],
            [12, 'Responsible Consumption and Production','#bf8b2e'],
            [13, 'Climate Action',            '#3f7e44'],
            [14, 'Life Below Water',          '#0a97d9'],
            [15, 'Life on Land',              '#56c02b'],
            [16, 'Peace, Justice and Strong Institutions','#00689d'],
            [17, 'Partnerships for the Goals','#19486a'],
        ];

        foreach ($sdgs as [$number, $title, $color]) {
            Sdg::create(['number' => $number, 'title' => $title, 'color' => $color]);
        }
    }
}
