<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Barangay;
use App\Models\Pin;
use App\Models\Program;

class DashboardController extends Controller
{
    public function index()
    {
        // Programs
        $totalPrograms  = Program::count();
        $activePrograms = Program::whereIn('status', ['approved', 'ongoing'])->count();
        $totalReach     = Program::whereNotNull('reach')->sum('reach');

        $programsByStatus = collect(Program::$statuses)
            ->mapWithKeys(fn($s, $key) => [$key => [
                'label' => $s['label'],
                'color' => $s['color'],
                'count' => Program::where('status', $key)->count(),
            ]]);

        $programsByCategory = collect(Program::$categories)
            ->mapWithKeys(fn($c, $key) => [$key => [
                'label' => $c['label'],
                'color' => $c['color'],
                'count' => Program::where('category', $key)->count(),
            ]]);

        // Activity types — count per activity_type across all programs
        $programsByActivity = Program::whereNotNull('activity_type')
            ->selectRaw('activity_type, category, COUNT(*) as count')
            ->groupBy('activity_type', 'category')
            ->get()
            ->map(fn($p) => [
                'activity' => Program::$activityTypes[$p->category][$p->activity_type] ?? $p->activity_type,
                'category' => $p->category,
                'color'    => Program::$categories[$p->category]['color'] ?? '#888',
                'count'    => $p->count,
            ]);

        // Beneficiaries — flatten and count
        $beneficiaryCounts = [];
        Program::whereNotNull('target_beneficiaries')->get()->each(function ($p) use (&$beneficiaryCounts) {
            foreach ($p->target_beneficiaries ?? [] as $slug) {
                $beneficiaryCounts[$slug] = ($beneficiaryCounts[$slug] ?? 0) + 1;
            }
        });
        arsort($beneficiaryCounts);
        $beneficiaryLabels = array_map(
            fn($slug) => Program::$beneficiaries[$slug] ?? $slug,
            array_keys($beneficiaryCounts)
        );

        // Upcoming programs
        $upcomingPrograms = Program::whereIn('status', ['approved'])
            ->where('start_at', '>=', now())
            ->orderBy('start_at')
            ->take(5)
            ->get()
            ->map(fn($p) => [
                'title'    => $p->title,
                'category' => $p->category,
                'start_at' => $p->start_at->format('M d, Y'),
            ]);

        // Recent programs
        $recentPrograms = Program::orderByDesc('created_at')
            ->take(5)
            ->get()
            ->map(fn($p) => [
                'title'    => $p->title,
                'category' => $p->category,
                'status'   => $p->status,
                'start_at' => $p->start_at->format('M d, Y'),
            ]);

        // Map / Pins
        $totalPins        = Pin::count();
        $totalBarangays   = Barangay::count();
        $coveredBarangays = Barangay::withCount('pins')->get()->where('pins_count', '>', 0)->count();

        // SDG coverage
        $sdgCoverage = \App\Models\Sdg::withCount('programs')
        ->orderByDesc('programs_count')
        ->get()
        ->map(fn($s) => [
            'number' => $s->number,
            'title'  => $s->title,
            'color'  => $s->color,
            'count'  => $s->programs_count,
        ]);

        // Program timeline - last 6 months
        $timeline = collect(range(5, 0))->map(function ($i) {
            $month = now()->subMonths($i);
            return [
                'label' => $month->format('M Y'),
                'count' => \App\Models\Program::whereYear('created_at', $month->year)
                    ->whereMonth('created_at', $month->month)
                    ->count(),
            ];
        });

        // Reach by component
        $reachByCategory = collect(\App\Models\Program::$categories)
            ->mapWithKeys(fn($c, $key) => [$key => [
                'label' => $c['label'],
                'color' => $c['color'],
                'reach' => \App\Models\Program::where('category', $key)
                    ->whereNotNull('reach')
                    ->sum('reach'),
            ]]);


        // Group programs by category AND status
        $stackedByCategory = Program::selectRaw('category, status, count(*) as count')
            ->groupBy('category', 'status')
            ->get()
            ->groupBy('category')
            ->map(fn($rows) => $rows->pluck('count', 'status'))
            ->toArray();

        return view('admin.dashboard.index', compact(
            'totalPrograms', 'activePrograms', 'totalReach',
            'programsByStatus', 'programsByCategory',
            'programsByActivity', 'beneficiaryCounts', 'beneficiaryLabels',
            'upcomingPrograms', 'recentPrograms',
            'totalPins', 'totalBarangays', 'coveredBarangays',
            'sdgCoverage', 'timeline', 'reachByCategory',
            'stackedByCategory'
        ));
    }
}