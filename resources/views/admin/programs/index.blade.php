@use('App\Models\Program')

@extends('layouts.admin')

@section('title', 'Programs - SPUP-CDCFI Admin')

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/admin/programs.css') }}">
@endpush

@section('content')
<div class="programs-page">

    {{-- Header --}}
    <div class="programs-header">
        <div class="programs-header-left">
            <h1 class="programs-title">Programs & Planning</h1>
            <p class="programs-subtitle">Calendar of community programs and proposed events</p>
        </div>
        <button class="pgbtn-add" id="open-program-create">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Program
        </button>
    </div>

{{-- Body: Sidebar + Calendar --}}
    <div class="programs-body">
        {{-- Left Sidebar --}}
        <aside class="programs-sidebar">
            {{-- Status Cards --}}
            <div class="pgsidebar-section">
                <span class="pgsidebar-section-label">Overview</span>
                <div class="programs-stats">
                    @foreach (Program::$statuses as $key => $status)
                    <div class="pgstat-card">
                        <div class="pgstat-card-left">
                            <span class="pgstat-dot" style="background: {{ $status['color'] }}"></span>
                            <span class="pgstat-label">{{ $status['label'] }}</span>
                        </div>
                        <span class="pgstat-value" id="stat-{{ $key }}">0</span>
                    </div>
                    @endforeach
                </div>
            </div>

            {{-- Recent Programs --}}
            <div class="pgsidebar-section">
                <span class="pgsidebar-section-label">Recently Added</span>
                <div class="pgsidebar-programs" id="sidebar-recent"></div>
            </div>

            @if(auth()->user()->isSuperAdmin())
            {{-- Pending Requests --}}
            <div class="pgsidebar-section" id="sidebar-requests-section">
                <div class="pgsidebar-requests-header">
                    <span class="pgsidebar-section-label">Pending Requests</span>
                    <span class="pgsidebar-requests-badge" id="sidebar-requests-badge" hidden></span>
                </div>
                <div class="pgsidebar-requests" id="sidebar-requests"></div>
                <button class="pgsidebar-view-all" id="sidebar-requests-view-all" hidden>View all</button>
            </div>
            @endif

            {{-- Filters --}}
            <div class="pgsidebar-section">
                <span class="pgsidebar-section-label">Program Component</span>
                <div class="pg-filter-btns pg-filter-btns--col" id="category-filters">
                    <button class="pgfbtn active" data-filter="category" data-value="">All</button>
                    @foreach ($categories as $slug => $cat)
                    <button class="pgfbtn" data-filter="category" data-value="{{ $slug }}"
                        style="--cat-color: {{ $cat['color'] }}">
                        {{ $cat['label'] }}
                    </button>
                    @endforeach
                </div>
            </div>

            <div class="pgsidebar-section">
                <span class="pgsidebar-section-label">Status</span>
                <div class="pg-filter-btns pg-filter-btns--col" id="status-filters">
                    <button class="pgfbtn active" data-filter="status" data-value="">All</button>
                    @foreach ($statuses as $key => $status)
                    <button class="pgfbtn" data-filter="status" data-value="{{ $key }}"
                        style="--cat-color: {{ $status['color'] }}">
                        {{ $status['label'] }}
                    </button>
                    @endforeach
                </div>
            </div>

        </aside>

        {{-- Calendar --}}
        <div class="programs-main">
            <div class="programs-calendar-wrap">
            <div class="cal-nav">
                <button class="cal-nav-btn" id="cal-prev">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 18 9 12 15 6"/>
                    </svg>
                </button>
                <span class="cal-month-label" id="cal-month-label"></span>
                <button class="cal-nav-btn" id="cal-next">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="9 18 15 12 9 6"/>
                    </svg>
                </button>
                <button class="cal-today-btn" id="cal-today">Today</button>
            </div>
            <div class="cal-grid-header">
                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>
            <div class="cal-grid" id="cal-grid"></div>
        </div>
    </div>
</div>

{{-- All Requests Overlay --}}
<div class="pg-requests-overlay" id="requests-overlay" hidden>
    <div class="pg-requests-panel">
        <div class="pg-requests-panel-header">
            <span class="pg-requests-panel-title">All Pending Requests</span>
            <button class="pg-requests-panel-close" id="requests-overlay-close">&times;</button>
        </div>
        <div class="pg-requests-panel-list" id="requests-overlay-list"></div>
    </div>
</div>

{{-- Day Popover --}}
<div class="pg-day-popover" id="day-popover" hidden>
    <div class="pg-day-popover-header">
        <span class="pg-day-popover-date" id="day-popover-date"></span>
        <button class="pg-day-popover-close" id="day-popover-close" aria-label="Close">&times;</button>
    </div>
    <div class="pg-day-popover-list" id="day-popover-list"></div>
</div>

{{-- Program Form Modal (Create & Edit) --}}
<div class="pgmodal-overlay" id="program-modal" aria-hidden="true">
    <div class="pgmodal" role="dialog" aria-labelledby="pgmodal-title">
        <div class="pgmodal-header">
            <h2 class="pgmodal-title" id="pgmodal-title">Add Program</h2>
            <button class="pgmodal-close" id="pgmodal-close" aria-label="Close">&times;</button>
        </div>
        <form id="program-form" method="POST">
            @csrf
            <div class="pgmodal-body">
                <div class="pgfield">
                    <label class="pgfield-label" for="pg-title">Title</label>
                    <input class="pgfield-input" type="text" id="pg-title" name="title" required maxlength="255" placeholder="Program title">
                </div>
                <div class="pgfield">
                    <label class="pgfield-label" for="pg-description">Description <span class="pgfield-optional">optional</span></label>
                    <textarea class="pgfield-input pgfield-textarea" id="pg-description" name="description" rows="3" placeholder="Brief description of the program"></textarea>
                </div>
                <div class="pgfield-row">
                    <div class="pgfield">
                        <label class="pgfield-label" for="pg-category">Program Component</label>
                        <select class="pgfield-input pgfield-select" id="pg-category" name="category" required>
                            <option value="" disabled selected>Select program component</option>
                            @foreach ($categories as $slug => $cat)
                            <option value="{{ $slug }}">{{ $cat['label'] }}</option>
                            @endforeach
                        </select>
                    </div>

                    @if(auth()->user()->isSuperAdmin())
                    <div class="pgfield">
                        <label class="pgfield-label" for="pg-status">Status</label>
                        <select class="pgfield-input pgfield-select" id="pg-status" name="status" required>
                            @foreach ($statuses as $key => $status)
                            <option value="{{ $key }}">{{ $status['label'] }}</option>
                            @endforeach
                        </select>
                    </div>
                    @else
                    <input type="hidden" id="pg-status" name="status" value="proposed">
                    @endif
                </div>

                <div class="pgfield" id="pg-activity-type-wrap" style="display:none;">
                    <label class="pgfield-label" for="pg-activity-type">Activity Type</label>
                    <select class="pgfield-input pgfield-select" id="pg-activity-type" name="activity_type">
                        <option value="" disabled selected>Select activity type</option>
                    </select>
                </div>

                <div class="pgfield-row">
                    <div class="pgfield">
                        <label class="pgfield-label" for="pg-reach">Reach</label>
                        <input class="pgfield-input" type="number" id="pg-reach" name="reach" min="0" placeholder="e.g. 150" required>
                    </div>
                    <div class="pgfield">
                        <label class="pgfield-label">Target Beneficiaries</label>
                        <div class="pg-beneficiary-wrap" id="pg-beneficiary-wrap">
                            <button type="button" class="pg-beneficiary-trigger" id="pg-beneficiary-trigger">
                                <span id="pg-beneficiary-label">Select beneficiaries...</span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="12" height="12">
                                    <polyline points="6 9 12 15 18 9"/>
                                </svg>
                            </button>
                            <div class="pg-beneficiary-dropdown" id="pg-beneficiary-dropdown" hidden>
                                @foreach ($beneficiaries as $slug => $label)
                                <label class="pg-beneficiary-option">
                                    <input type="checkbox" name="target_beneficiaries[]" value="{{ $slug }}">
                                    <span>{{ $label }}</span>
                                </label>
                                @endforeach
                            </div>
                        </div>
                    </div>
                </div>
                <div class="pgfield">
                    <label class="pgfield-label" for="pg-pin">Location <span class="pgfield-optional">optional</span></label>
                    <div class="pgpin-wrap">
                        <input class="pgfield-input" type="text" id="pg-pin-search" autocomplete="off" placeholder="Search pins or type a custom location...">
                        <input type="hidden" id="pg-pin-id" name="pin_id">
                        <input type="hidden" id="pg-location" name="location">
                        <div class="pgpin-dropdown" id="pg-pin-dropdown" hidden></div>
                    </div>
                    <span class="pgfield-hint" id="pg-pin-hint" hidden></span>
                    <div class="pgfield">
                        <label class="pgfield-label">
                            Sustainable Development Goals
                            <span class="pgfield-optional">auto-suggested · editable</span>
                        </label>
                        <div class="pg-sdg-picker" id="pg-sdg-picker"></div>
                        <div id="pg-sdg-hidden"></div>
                    </div>
                </div>
                <div class="pgfield-row">
                    <div class="pgfield">
                        <label class="pgfield-label" for="pg-start">Start</label>
                        <input class="pgfield-input" type="datetime-local" id="pg-start" name="start_at" required>
                    </div>
                    <div class="pgfield">
                        <label class="pgfield-label" for="pg-end">End</label>
                        <input class="pgfield-input" type="datetime-local" id="pg-end" name="end_at" required>
                    </div>
                </div>
                <div class="pgmodal-error" id="pgmodal-error" hidden></div>
            </div>
            <div class="pgmodal-footer">
                <button type="button" class="pgmodal-btn pgmodal-btn--cancel" id="pgmodal-cancel">Cancel</button>
                <button type="submit" class="pgmodal-btn pgmodal-btn--save" id="pgmodal-save">
                    <span class="pgmodal-btn-text">Save Program</span>
                    <span class="pgmodal-btn-spinner" hidden>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                    </span>
                </button>
            </div>
        </form>
    </div>
</div>

{{-- Delete Confirmation Modal --}}
<div class="pgmodal-overlay" id="program-delete-modal" aria-hidden="true">
    <div class="pgmodal pgmodal--sm" role="dialog">
        <div class="pgmodal-header">
            <h2 class="pgmodal-title pgmodal-title--danger">Delete Program</h2>
            <button class="pgmodal-close" id="pgdelmodal-close" aria-label="Close">&times;</button>
        </div>
        <div class="pgmodal-body">
            <div class="pgdelete-warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <p>Are you sure you want to delete <strong id="pgdelete-name"></strong>? This cannot be undone.</p>
            </div>
        </div>
        <div class="pgmodal-footer">
            <button type="button" class="pgmodal-btn pgmodal-btn--cancel" id="pgdelmodal-cancel">Cancel</button>
            <button type="button" class="pgmodal-btn pgmodal-btn--danger" id="pgdelmodal-confirm">
                <span class="pgmodal-btn-text">Delete</span>
                <span class="pgmodal-btn-spinner" hidden>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                </span>
            </button>
        </div>
    </div>
</div>

{{-- Program Detail Modal --}}
<div class="pgmodal-overlay" id="program-detail-modal" aria-hidden="true">
    <div class="pgmodal pgmodal--detail" role="dialog">
        <div class="pgmodal-header">
            <div class="pgdetail-header-meta">
                <span class="pgdetail-category-pill" id="pgdetail-category"></span>
                <span class="pgdetail-status-pill" id="pgdetail-status"></span>
            </div>
            <button class="pgmodal-close" id="pgdetailmodal-close" aria-label="Close">&times;</button>
        </div>
        <div class="pgmodal-body">
            <h3 class="pgdetail-title" id="pgdetail-title"></h3>
            <div class="pgdetail-fields">
                <div class="pgdetail-field">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    <span id="pgdetail-dates"></span>
                </div>
                <div class="pgdetail-field" id="pgdetail-location-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span id="pgdetail-location"></span>
                </div>
                <div class="pgdetail-field" id="pgdetail-desc-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    <span id="pgdetail-description"></span>
                </div>
                <div class="pgdetail-field" id="pgdetail-activity-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                        <rect x="9" y="3" width="6" height="4" rx="1" ry="1"/>
                        <line x1="9" y1="12" x2="15" y2="12"/>
                        <line x1="9" y1="16" x2="13" y2="16"/>
                    </svg>
                    <span id="pgdetail-activity-type"></span>
                </div>
                <div class="pgdetail-field" id="pgdetail-reach-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                        <path d="M16 3.13a4 4 0 010 7.75"/>
                    </svg>
                    <span id="pgdetail-reach"></span>
                </div>
                <div class="pgdetail-field" id="pgdetail-beneficiaries-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                    </svg>
                    <div id="pgdetail-beneficiaries" style="display:flex; flex-wrap:wrap; gap:0.35rem;"></div>
                </div>
                <div class="pgdetail-field pgdetail-sdg-row" id="pgdetail-sdg-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="2" y1="12" x2="22" y2="12"/>
                        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                    </svg>
                    <div id="pgdetail-sdgs" style="display:flex; flex-wrap:wrap; gap:0.35rem;"></div>
                </div>
            </div>
        </div>
        <div class="pgmodal-footer" id="pgdetail-footer">
            {{-- Super Admin actions --}}
            @if(auth()->user()->isSuperAdmin())
            <button type="button" class="pgmodal-btn pgmodal-btn--danger-soft" id="pgdetail-delete">Delete</button>
            <button type="button" class="pgmodal-btn pgmodal-btn--save" id="pgdetail-edit">Edit Program</button>
            @else
            {{-- Admin request actions --}}
            <button type="button" class="pgmodal-btn pgmodal-btn--request-delete" id="pgdetail-request-delete">Request Deletion</button>
            <button type="button" class="pgmodal-btn pgmodal-btn--request-approve" id="pgdetail-request-approve">Request Approval</button>
            <button type="button" class="pgmodal-btn pgmodal-btn--save" id="pgdetail-edit">Edit Program</button>
            @endif
        </div>
    </div>
</div>

@endsection

@push('scripts')
<script>
    window.PROGRAMS_DATA   = @json($programs);
    window.CATEGORIES_DATA = @json($categories);
    window.STATUSES_DATA   = @json($statuses);
    window.PINS_DATA = @json($pins);
    window.SDGS_DATA = @json($sdgs);
    window.ACTIVITY_TYPES_DATA = @json($activityTypes);
    window.SDG_MAP_DATA        = @json($sdgMap);
    window.BENEFICIARIES_DATA   = @json($beneficiaries);
    window.PROGRAMS_STORE_URL          = "{{ route('admin.programs.store') }}";
    window.PROGRAMS_UPDATE_URL         = "/admin/programs/";
    window.PROGRAM_REQUESTS_URL        = "{{ route('admin.program-requests.store') }}";
    window.PROGRAM_REQUESTS_PENDING_URL = "{{ route('admin.program-requests.pending') }}";
    window.CSRF_TOKEN                  = "{{ csrf_token() }}";
    window.IS_SUPER_ADMIN              = {{ auth()->user()->isSuperAdmin() ? 'true' : 'false' }};
    window.AUTH_USER_ID                = {{ auth()->id() }};
</script>
<script src="{{ asset('js/admin/programs.js') }}" defer></script>
@endpush