@extends('layouts.admin')

@section('title', 'Community - SPUP-CDCFI Admin')

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/admin/community.css') }}">
@endpush

@section('content')

<div class="community-page">

    {{-- Header --}}
    <div class="community-header">
        <div class="community-header-left">
            <h1 class="community-title">Community Overview</h1>
            <p class="community-subtitle">Barangay coverage and pin distribution across Cagayan Valley</p>
        </div>
        <button class="cbtn-add" id="open-create-modal">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Barangay
        </button>
    </div>

    {{-- Stats --}}
    <div class="community-stats">
        <div class="cstat-card">
            <span class="cstat-value">{{ $totalBarangays }}</span>
            <span class="cstat-label">Total Barangays</span>
        </div>
        <div class="cstat-card">
            <span class="cstat-value">{{ $coveredBarangays }}</span>
            <span class="cstat-label">With Pins</span>
        </div>
        <div class="cstat-card">
            <span class="cstat-value">{{ $totalBarangays - $coveredBarangays }}</span>
            <span class="cstat-label">No Coverage</span>
        </div>
        <div class="cstat-card">
            <span class="cstat-value">{{ $totalPins }}</span>
            <span class="cstat-label">Total Pins</span>
        </div>
    </div>

    {{-- Search --}}
    <div class="community-toolbar">
    <form method="GET" action="{{ route('admin.community') }}" class="community-search-form" id="search-form">
        <input
            type="text"
            name="search"
            id="barangay-search"
            class="community-search"
            placeholder="Search barangay..."
            value="{{ request('search') }}"
            data-url="{{ route('admin.community') }}"
        >
        <button type="submit" class="community-search-btn" style="display:none;">Search</button>
        @if(request('search'))
            <a href="{{ route('admin.community') }}" class="community-search-clear">Clear</a>
        @endif
        </form>
        <div class="community-filter-btns">
            <a href="{{ route('admin.community', array_merge(request()->except('category', 'page'), [])) }}"
                class="cbtn {{ !request('category') ? 'active' : '' }}">
                    All
                </a>
                @foreach ($categories as $category)
                <a href="{{ route('admin.community', array_merge(request()->except('category', 'page'), ['category' => $category->slug])) }}"
                class="cbtn {{ request('category') === $category->slug ? 'active' : '' }}"
                style="{{ request('category') === $category->slug ? 'background:' . $category->color . '1a; color:' . $category->color . '; border-color:' . $category->color . '40' : '' }}">
                    {{ $category->label }}
                </a>
                @endforeach
        </div>
    </div>

    {{-- Barangay table --}}
    <div class="community-table-wrap">
        <table class="community-table" id="barangay-grid">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Barangay</th>
                    <th>City</th>
                    <th>Province</th>
                    <th>Total</th>
                    @foreach ($categories as $category)
                    <th>
                        <span class="cat-header-pill" style="background:{{ $category->color }}1a; color:{{ $category->color }}; border:1px solid {{ $category->color }}40">
                            {{ $category->label }}
                        </span>
                    </th>
                    @endforeach
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($barangays as $i => $barangay)
                <tr
                    class="barangay-row"
                    data-name="{{ strtolower($barangay->name) }}"
                    data-status="{{ $barangay->pins_count > 0 ? 'covered' : 'uncovered' }}"
                >
                    <td class="col-num">{{ $barangays->firstItem() + $loop->index }}</td>
                    <td class="col-name">{{ $barangay->name }}</td>
                    <td class="col-city">{{ $barangay->city }}</td>
                    <td class="col-province">{{ $barangay->province }}</td>
                    <td class="col-pins">
                        <span class="pin-badge {{ $barangay->pins_count > 0 ? 'pin-badge--active' : '' }}">
                            {{ $barangay->pins_count }}
                        </span>
                    </td>
                    @foreach ($categories as $category)
                    <td class="col-cat">
                        @php $count = $barangay->pins_by_category->get($category->slug, 0); @endphp
                        @if ($count > 0)
                            <span class="cat-count" style="color:{{ $category->color }}">{{ $count }}</span>
                        @else
                            <span class="cat-count cat-count--zero">—</span>
                        @endif
                    </td>
                    @endforeach
                    <td class="col-action">
                        <div class="action-btns">
                            <a href="{{ route('admin.community.show', $barangay) }}" 
                                class="action-btn action-btn--view" 
                                title="View"
                                data-id="{{ $barangay->id }}"
                                data-name="{{ $barangay->name }}"
                                data-city="{{ $barangay->city }}"
                                data-province="{{ $barangay->province }}"
                                data-pins="{{ $barangay->pins_count }}">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                                </svg>
                            </a>
                            <a href="#" class="action-btn action-btn--edit" 
                                title="Edit"
                                data-id="{{ $barangay->id }}"
                                data-name="{{ $barangay->name }}"
                                data-city="{{ $barangay->city }}"
                                data-province="{{ $barangay->province }}">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                </svg>
                            </a>
                            <button type="button"
                                class="action-btn action-btn--delete"
                                title="Delete"
                                data-id="{{ $barangay->id }}"
                                data-name="{{ $barangay->name }}">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                                    <path d="M10 11v6M14 11v6"/>
                                    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
                @endforeach
                    @if ($barangays->isEmpty())
                    <tr class="empty-row">
                        <td colspan="{{ 3 + $categories->count() + 1 }}">
                            <div class="empty-state">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                </svg>
                                <p>No barangays found
                                    @if(request('search'))
                                        for <strong>"{{ request('search') }}"</strong>
                                    @endif
                                    @if(request('category'))
                                        in <strong>{{ $categories->firstWhere('slug', request('category'))?->label }}</strong>
                                    @endif
                                </p>
                                <a href="{{ route('admin.community') }}" class="empty-state-reset">Clear filters</a>
                            </div>
                        </td>
                    </tr>
                    @endif
            </tbody>
        </table>
    </div>

    @if ($barangays->hasPages())
    <div class="community-pagination">
        <span class="pagination-info">
            Showing {{ $barangays->firstItem() }}–{{ $barangays->lastItem() }} of {{ $barangays->total() }}
        </span>
        {{ $barangays->links() }}
    </div>
    @endif
</div>

    {{-- Delete Barangay Modal --}}
    <div class="cbmodal-overlay" id="delete-modal" aria-hidden="true">
        <div class="cbmodal cbmodal--sm" role="dialog" aria-labelledby="cbdeletemodal-title">
            <div class="cbmodal-header">
                <h2 class="cbmodal-title cbmodal-title--danger" id="cbdeletemodal-title">Delete Barangay</h2>
                <button class="cbmodal-close" id="cbdeletemodal-close" aria-label="Close">&times;</button>
            </div>
            <div class="cbmodal-body">
                <div class="cbdelete-warning">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <p>Are you sure you want to delete <strong id="delete-barangay-name"></strong>? This will also remove all associated pins and cannot be undone.</p>
                </div>
            </div>
            <div class="cbmodal-footer">
                <button type="button" class="cbmodal-btn cbmodal-btn--cancel" id="cbdeletemodal-cancel">Cancel</button>
                <button type="button" class="cbmodal-btn cbmodal-btn--danger" id="cbdeletemodal-confirm">
                    <span class="cbmodal-btn-text">Delete</span>
                    <span class="cbmodal-btn-spinner" hidden>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                    </span>
                </button>
            </div>
        </div>
    </div>

    {{-- Create Barangay Modal --}}
    <div class="cbmodal-overlay" id="create-modal" aria-hidden="true">
        <div class="cbmodal" role="dialog" aria-labelledby="cbcreatemodal-title">
            <div class="cbmodal-header">
                <h2 class="cbmodal-title" id="cbcreatemodal-title">Add Barangay</h2>
                <button class="cbmodal-close" id="cbcreatemodal-close" aria-label="Close">&times;</button>
            </div>
            <form id="create-barangay-form" method="POST" data-action="{{ route('admin.community.store') }}">
                @csrf
                <div class="cbmodal-body">
                    <div class="cbfield">
                        <label class="cbfield-label" for="create-name">Barangay Name</label>
                        <input class="cbfield-input" type="text" id="create-name" name="name" required maxlength="255" placeholder="e.g. Barangay Ugac Norte">
                    </div>
                    <div class="cbfield-row">
                        <div class="cbfield">
                            <label class="cbfield-label" for="create-city">City</label>
                            <input class="cbfield-input" type="text" id="create-city" name="city" required maxlength="255" value="Tuguegarao City">
                        </div>
                        <div class="cbfield">
                            <label class="cbfield-label" for="create-province">Province</label>
                            <input class="cbfield-input" type="text" id="create-province" name="province" required maxlength="255" value="Cagayan">
                        </div>
                    </div>
                    <div class="cbfield">
                        <label class="cbfield-label" for="create-coordinates">
                            Coordinates
                            <span class="cbfield-optional">optional</span>
                        </label>
                        <input class="cbfield-input" type="text" id="create-coordinates" name="coordinates" maxlength="255" placeholder='{"lat": 17.6132, "lng": 121.7270}'>
                        <span class="cbfield-hint">Valid JSON only, e.g. {"lat": 17.6132, "lng": 121.7270}</span>
                    </div>
                    <div class="cbmodal-error" id="cbcreatemodal-error" hidden></div>
                </div>
                <div class="cbmodal-footer">
                    <button type="button" class="cbmodal-btn cbmodal-btn--cancel" id="cbcreatemodal-cancel">Cancel</button>
                    <button type="submit" class="cbmodal-btn cbmodal-btn--save" id="cbcreatemodal-save">
                        <span class="cbmodal-btn-text">Add Barangay</span>
                        <span class="cbmodal-btn-spinner" hidden>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                        </span>
                    </button>
                </div>
            </form>
        </div>
    </div>

    {{-- Edit Barangay Modal --}}
    <div class="cbmodal-overlay" id="edit-modal" aria-hidden="true">
        <div class="cbmodal" role="dialog" aria-labelledby="cbmodal-title">
            <div class="cbmodal-header">
                <h2 class="cbmodal-title" id="cbmodal-title">Edit Barangay</h2>
                <button class="cbmodal-close" id="cbmodal-close" aria-label="Close">&times;</button>
            </div>
            <form id="edit-barangay-form" method="POST">
                @csrf
                @method('PUT')
                <div class="cbmodal-body">
                    <div class="cbfield">
                        <label class="cbfield-label" for="edit-name">Barangay Name</label>
                        <input class="cbfield-input" type="text" id="edit-name" name="name" required maxlength="255">
                    </div>
                    <div class="cbfield-row">
                        <div class="cbfield">
                            <label class="cbfield-label" for="edit-city">City</label>
                            <input class="cbfield-input" type="text" id="edit-city" name="city" required maxlength="255">
                        </div>
                        <div class="cbfield">
                            <label class="cbfield-label" for="edit-province">Province</label>
                            <input class="cbfield-input" type="text" id="edit-province" name="province" required maxlength="255">
                        </div>
                    </div>
                    <div class="cbmodal-error" id="cbmodal-error" hidden></div>
                </div>
                <div class="cbmodal-footer">
                    <button type="button" class="cbmodal-btn cbmodal-btn--cancel" id="cbmodal-cancel">Cancel</button>
                    <button type="submit" class="cbmodal-btn cbmodal-btn--save" id="cbmodal-save">
                        <span class="cbmodal-btn-text">Save Changes</span>
                        <span class="cbmodal-btn-spinner" hidden>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                        </span>
                    </button>
                </div>
            </form>
        </div>
    </div>

    {{-- View Barangay Modal --}}
    <div class="cbmodal-overlay" id="view-modal" aria-hidden="true">
    <div class="cbmodal" role="dialog" aria-labelledby="cbviewmodal-title">
        <div class="cbmodal-header">
            <h2 class="cbmodal-title" id="cbviewmodal-title">Barangay Details</h2>
            <button class="cbmodal-close" id="cbviewmodal-close" aria-label="Close">&times;</button>
        </div>
        <div class="cbmodal-body">
            <div class="cbview-hero">
                <span class="cbview-name" id="view-name"></span>
                <span class="cbview-pin-badge" id="view-pins"></span>
            </div>
            <div class="cbview-fields">
                <div class="cbview-field">
                    <span class="cbview-field-label">City</span>
                    <span class="cbview-field-value" id="view-city"></span>
                </div>
                <div class="cbview-field">
                    <span class="cbview-field-label">Province</span>
                    <span class="cbview-field-value" id="view-province"></span>
                </div>
                <div class="cbview-field">
                    <span class="cbview-field-label">Total Pins</span>
                    <span class="cbview-field-value" id="view-pins-label"></span>
                </div>
            </div>
        </div>
        <div class="cbmodal-footer">
            <button type="button" class="cbmodal-btn cbmodal-btn--cancel" id="cbviewmodal-cancel">Close</button>
        </div>
    </div>
</div>
@endsection

@push('scripts')
    <script src="{{ asset('js/admin/community.js') }}" defer></script>
@endpush