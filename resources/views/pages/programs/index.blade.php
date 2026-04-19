@extends('layouts.app')

@section('title', 'Programs & Events - SPUP-CDCFI')

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/public-programs.css') }}">
@endpush

@section('content')
<div class="pub-programs-page">
    <!-- Header -->
    <div class="pub-programs-header">
        <h1 class="pub-programs-title">Community Programs</h1>
        <p class="pub-programs-subtitle">View upcoming and ongoing community programs</p>
    </div>

    <!-- Calendar -->
    <div class="pub-programs-calendar">
        <div class="pub-cal-nav">
            <button class="pub-cal-nav-btn" id="cal-prev">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                </svg>
            </button>
            <span class="pub-cal-month-label" id="cal-month-label"></span>
            <button class="pub-cal-nav-btn" id="cal-next">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                </svg>
            </button>
            <button class="pub-cal-today-btn" id="cal-today">Today</button>
        </div>
        <div class="pub-cal-grid-header">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
        </div>
        <div class="pub-cal-grid" id="cal-grid"></div>
    </div>
</div>

<!-- Day Popover -->
<div class="pub-day-popover" id="day-popover" hidden>
    <div class="pub-day-popover-header">
        <span class="pub-day-popover-date" id="day-popover-date"></span>
        <button class="pub-day-popover-close" id="day-popover-close" aria-label="Close">&times;</button>
    </div>
    <div class="pub-day-popover-list" id="day-popover-list"></div>
</div>

<!-- Program Detail Modal -->
<div class="pub-modal-overlay" id="program-detail-modal" aria-hidden="true">
    <div class="pub-modal pub-modal--detail" role="dialog">
        <div class="pub-modal-header">
            <div class="pub-detail-header-meta">
                <span class="pub-detail-category-pill" id="pub-detail-category"></span>
                <span class="pub-detail-status-pill" id="pub-detail-status"></span>
            </div>
            <button class="pub-modal-close" id="pub-detail-close" aria-label="Close">&times;</button>
        </div>
        <div class="pub-modal-body">
            <h3 class="pub-detail-title" id="pub-detail-title"></h3>
            <div class="pub-detail-fields">
                <div class="pub-detail-field">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span id="pub-detail-dates"></span>
                </div>
                <div class="pub-detail-field" id="pub-detail-location-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span id="pub-detail-location"></span>
                </div>
                <div class="pub-detail-field" id="pub-detail-desc-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    <span id="pub-detail-description"></span>
                </div>
            </div>
        </div>
    </div>
</div>

@endsection

@push('scripts')
<script>
    window.PROGRAMS_DATA   = @json($programs);
    window.CATEGORIES_DATA = @json($categories);
    window.STATUSES_DATA   = @json($statuses);
</script>
<script src="{{ asset('js/public-programs.js') }}" defer></script>
@endpush
