@extends('layouts.admin')

@section('title', 'Dashboard - SPUP-CDCFI Admin')

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/admin/dashboard.css') }}">
@endpush

@section('content')
<div class="dash-page">

    {{-- Header --}}
    <div class="dash-header">
        <div>
            <h1 class="dash-title">Dashboard</h1>
            <p class="dash-subtitle">Overview of programs, community coverage, and activity</p>
        </div>
    </div>

    {{-- Stat Cards --}}
    <div class="dash-stat-grid">
        <div class="dash-stat-card">
            <span class="dash-stat-label">Total Programs</span>
            <span class="dash-stat-value">{{ $totalPrograms }}</span>
        </div>
        <div class="dash-stat-card">
            <span class="dash-stat-label">Active Programs</span>
            <span class="dash-stat-value">{{ $activePrograms }}</span>
        </div>
        <div class="dash-stat-card">
            <span class="dash-stat-label">Total Reach</span>
            <span class="dash-stat-value">{{ number_format($totalReach) }}</span>
        </div>
        <div class="dash-stat-card">
            <span class="dash-stat-label">Total Pins</span>
            <span class="dash-stat-value">{{ $totalPins }}</span>
        </div>
        <div class="dash-stat-card">
            <span class="dash-stat-label">Barangays Covered</span>
            <span class="dash-stat-value">{{ $coveredBarangays }}
                <span class="dash-stat-sub">/ {{ $totalBarangays }}</span>
            </span>
        </div>
    </div>

    {{-- Row 1: Status donut (narrow) + Timeline line (wide) --}}
    <div class="dash-charts-row dash-charts-row--4060">
        <div class="dash-card">
            <p class="dash-card-title">Programs by Status</p>
            <div class="dash-donut-wrap">
                <div class="dash-chart-wrap dash-chart-wrap--donut">
                    <canvas id="chart-status"></canvas>
                </div>
                <div class="dash-legend" id="legend-status"></div>
            </div>
        </div>
        <div class="dash-card">
            <p class="dash-card-title">Programs Added (Last 6 Months)</p>
            <div class="dash-chart-wrap">
                <canvas id="chart-timeline"></canvas>
            </div>
        </div>
    </div>

    {{-- Row 2: Stacked bar (wide) + Radar (narrow) --}}
    <div class="dash-charts-row dash-charts-row--6040">
        <div class="dash-card">
            <p class="dash-card-title">Programs by Component & Status</p>
            <p class="dash-card-sub">Breakdown of each program component by current status</p>
            <div class="dash-chart-wrap dash-chart-wrap--tall">
                <canvas id="chart-stacked"></canvas>
            </div>
        </div>
        <div class="dash-card">
            <p class="dash-card-title">Component Overview</p>
            <p class="dash-card-sub">Reach, count, and activity balance across components</p>
            <div class="dash-chart-wrap dash-chart-wrap--tall">
                <canvas id="chart-radar"></canvas>
            </div>
        </div>
    </div>

    {{-- Row 3: Polar area beneficiaries (narrow) + SDG coverage (wide) --}}
    <div class="dash-charts-row dash-charts-row--3565">
        <div class="dash-card">
            <p class="dash-card-title">Target Beneficiaries</p>
            <div class="dash-chart-wrap dash-chart-wrap--polar">
                <canvas id="chart-beneficiaries"></canvas>
            </div>
            <div class="dash-legend" id="legend-beneficiaries"></div>
        </div>
        <div class="dash-card">
            <p class="dash-card-title">SDG Coverage</p>
            <p class="dash-card-sub">Number of programs linked to each Sustainable Development Goal</p>
            <div class="dash-chart-wrap dash-chart-wrap--tall">
                <canvas id="chart-sdg"></canvas>
            </div>
        </div>
    </div>

    {{-- Row 4: Activity types full width --}}
    <div class="dash-card">
        <p class="dash-card-title">Programs by Activity Type</p>
        <div class="dash-chart-wrap dash-chart-wrap--tall">
            <canvas id="chart-activity"></canvas>
        </div>
    </div>

    {{-- Tables --}}
    <div class="dash-tables-row">
        <div class="dash-card">
            <p class="dash-card-title">Upcoming Programs</p>
            <table class="dash-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Component</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($upcomingPrograms as $p)
                    <tr>
                        <td>{{ $p['title'] }}</td>
                        <td>
                            <span class="dash-cat-pill" style="background:{{ \App\Models\Program::$categories[$p['category']]['color'] ?? '#888' }}22; color:{{ \App\Models\Program::$categories[$p['category']]['color'] ?? '#888' }}">
                                {{ \App\Models\Program::$categories[$p['category']]['label'] ?? $p['category'] }}
                            </span>
                        </td>
                        <td>{{ $p['start_at'] }}</td>
                    </tr>
                    @empty
                    <tr><td colspan="3" class="dash-table-empty">No upcoming programs</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="dash-card">
            <p class="dash-card-title">Recently Added</p>
            <table class="dash-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Component</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse ($recentPrograms as $p)
                    @php $statuses = \App\Models\Program::$statuses; @endphp
                    <tr>
                        <td>{{ $p['title'] }}</td>
                        <td>
                            <span class="dash-cat-pill" style="background:{{ \App\Models\Program::$categories[$p['category']]['color'] ?? '#888' }}22; color:{{ \App\Models\Program::$categories[$p['category']]['color'] ?? '#888' }}">
                                {{ \App\Models\Program::$categories[$p['category']]['label'] ?? $p['category'] }}
                            </span>
                        </td>
                        <td>
                            <span class="dash-status-pill" style="background:{{ $statuses[$p['status']]['color'] ?? '#888' }}22; color:{{ $statuses[$p['status']]['color'] ?? '#888' }}">
                                {{ $statuses[$p['status']]['label'] ?? $p['status'] }}
                            </span>
                        </td>
                    </tr>
                    @empty
                    <tr><td colspan="3" class="dash-table-empty">No programs yet</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>

</div>
@endsection

@push('scripts')
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
<script>
    window.DASH_DATA = {
        status:            @json($programsByStatus),
        category:          @json($programsByCategory),
        activity:          @json($programsByActivity),
        beneficiaryCounts: @json($beneficiaryCounts),
        beneficiaryLabels: @json($beneficiaryLabels),
        sdgCoverage:       @json($sdgCoverage),
        timeline:          @json($timeline),
        reachByCategory:   @json($reachByCategory),
        stackedByCategory: @json($stackedByCategory),
        covered:           {{ $coveredBarangays }},
        uncovered:         {{ $totalBarangays - $coveredBarangays }},
    };
</script>
<script src="{{ asset('js/admin/dashboard.js') }}" defer></script>
@endpush