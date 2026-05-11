@extends('layouts.admin')

@section('title', 'Map - SPUP-CDCFI Admin')

@push('styles')
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">
    <link rel="stylesheet" href="{{ asset('css/admin/map.css') }}">
@endpush

@section('content')

<div class="map-page">

    <aside class="map-sidebar" id="map-sidebar">
    <div class="sidebar-stats" id="sidebar-stats">
        <div class="stat-item">
            <span class="stat-value" id="stat-total">0</span>
            <span class="stat-label">Pins</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
            <span class="stat-value" id="stat-barangays">0</span>
            <span class="stat-label">Barangays</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
            <span class="stat-value" id="stat-programs">0</span>
            <span class="stat-label">Categories</span>
        </div>
    </div>

    <div class="sidebar-section">
    <p class="sidebar-section-label">Search for Barangay</p>
    <div class="filter-group">
        <input
            type="text"
            id="filter-barangay-search"
            class="form-input"
            placeholder="Search barangay..."
            autocomplete="off"
        >
        <p class="barangay-search-hint" id="barangay-search-hint"></p>
        </div>
    </div>

    <div class="sidebar-section">
        <p class="sidebar-section-label">Filter by Program Component</p>
        <div class="filter-group" id="filter-program">
            <button class="filter-chip active" data-filter="all">All</button>
            <button class="filter-chip" data-filter="spiritual-values">
                <span class="chip-dot" style="background:#16a085"></span>Spiritual & Values Formation
            </button>
            <button class="filter-chip" data-filter="health">
                <span class="chip-dot" style="background:#c0392b"></span>Health & Well-Being
            </button>
            <button class="filter-chip" data-filter="livelihood">
                <span class="chip-dot" style="background:#27ae60"></span>Livelihood & Enterprise
            </button>
            <button class="filter-chip" data-filter="education">
                <span class="chip-dot" style="background:#2980b9"></span>Education & Culture
            </button>
            <button class="filter-chip" data-filter="digital-inclusion">
                <span class="chip-dot" style="background:#e67e22"></span>Digital Inclusion & Innovation
            </button>
            <button class="filter-chip" data-filter="environment">
                <span class="chip-dot" style="background:#1a9e6e"></span>Environmental Stewardship
            </button>
            <button class="filter-chip" data-filter="disaster-risk">
                <span class="chip-dot" style="background:#8e44ad"></span>DRRM & Emergency Preparedness
            </button>
        </div>
    </div>

    <div class="sidebar-section pin-detail" id="pin-detail" style="display:none;">
        <div class="pin-detail-header">
            <p class="sidebar-section-label">Selected Pin</p>
            <button class="pin-detail-close" id="pin-detail-close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
        <div class="pin-detail-body" id="pin-detail-body"></div>
    </div>

    <div class="sidebar-section" id="sidebar-list-section" style="display:none;">
        <p class="sidebar-section-label">All Pins</p>
        <div id="sidebar-list"></div>
    </div>

    <div class="sidebar-empty" id="sidebar-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        <p>No pins yet. Click <strong>Add Pin</strong> then click anywhere on the map.</p>
    </div>

    <div class="sidebar-section sidebar-form-section" id="sidebar-form-section" style="display:none;">
        <div class="sidebar-form-header">
            <h3 class="sidebar-form-title" id="sidebar-form-title">Add New Pin</h3>
            <button class="sidebar-form-close" id="sidebar-form-close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        </div>
        <div class="sidebar-form-body">
            <div class="form-group">
                <label class="form-label">Site Name</label>
                <input type="text" class="form-input" id="pin-name" placeholder="e.g. Barangay Health Center">
            </div>

            <div class="form-group">
                <label class="form-label">Program Component</label>
                <select class="form-input" id="pin-program">
                    <option value="">Select component</option>
                    <option value="spiritual-values">Spiritual & Values Formation</option>
                    <option value="health">Health & Well-Being</option>
                    <option value="livelihood">Livelihood & Enterprise</option>
                    <option value="education">Education & Culture</option>
                    <option value="digital-inclusion">Digital Inclusion & Innovation</option>
                    <option value="environment">Environmental Stewardship</option>
                    <option value="disaster-risk">DRRM & Emergency Preparedness</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">
                    Barangay
                    <span class="form-optional">(auto-filled from coordinates)</span>
                </label>
                <input type="text" class="form-input" id="pin-barangay" placeholder="e.g. Ugac Sur">
            </div>

            <div class="form-group">
                <label class="form-label">Status</label>
                <select class="form-input" id="pin-status">
                    <option value="active">Active / Operational</option>
                    <option value="proposed">Proposed</option>
                    <option value="under-construction">Under Construction</option>
                    <option value="needs-assessment">Needs Assessment</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>

            <div class="form-group">
                <label class="form-label">Description <span class="form-optional">(optional)</span></label>
                <textarea class="form-input form-textarea" id="pin-notes" placeholder="Additional details about this location..."></textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Latitude</label>
                    <input type="text" class="form-input" id="pin-lat" readonly>
                </div>
                <div class="form-group">
                    <label class="form-label">Longitude</label>
                    <input type="text" class="form-input" id="pin-lng" readonly>
                </div>
            </div>
        </div>
        <div class="sidebar-form-footer">
            <button class="sidebar-form-btn sidebar-form-btn--ghost" id="sidebar-form-cancel">Cancel</button>
            <button class="sidebar-form-btn sidebar-form-btn--primary" id="sidebar-form-save">Save Pin</button>
        </div>
    </div>
</aside>

    <div class="map-area">
        <div class="map-toolbar">
            <div class="map-toolbar-left">
                <div class="map-toolbar-title-row">
                    <span class="map-toolbar-title">Community Map</span>
                    <span class="map-beta-tag" title="This feature is a work in progress. Map data accuracy and pin placement may vary.">Beta</span>
                </div>
            <span class="map-toolbar-sub" id="map-active-filter">Showing all locations</span>
            </div>
            <div class="map-toolbar-right">
                <button class="map-tool-btn" id="btn-add-pin" title="Add new pin">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                    </svg>
                    Add Pin
                </button>
                <button class="map-tool-btn map-tool-btn--ghost" id="btn-reset-view" title="Reset map view">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
                    </svg>
                    Reset View
                </button>
            </div>
        </div>

        <div id="map-toast" class="map-toast" style="display:none;">
            <span id="map-toast-icon"></span>
            <span id="map-toast-message"></span>
        </div>

        <div class="map-adding-notice" id="map-adding-notice" style="display:none;">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Click anywhere on the map to place a pin.
            <button id="btn-cancel-add">Cancel</button>
        </div>

        <div id="map"></div>

        <div class="delete-modal-overlay" id="delete-modal-overlay" style="display:none;">
            <div class="delete-modal">
                <div class="delete-modal-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                    </svg>
                </div>
                <h3 class="delete-modal-title">Delete Pin</h3>
                <p class="delete-modal-message">Are you sure you want to delete <strong id="delete-modal-pin-name"></strong>? This action cannot be undone.</p>
                <div class="delete-modal-actions">
                    <button class="delete-modal-btn delete-modal-btn--ghost" id="delete-modal-cancel">Cancel</button>
                    <button class="delete-modal-btn delete-modal-btn--danger" id="delete-modal-confirm">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                        </svg>
                        Delete Pin
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div class="nlm-overlay" id="new-location-modal-overlay" style="display:none;" aria-hidden="true">
        <div class="nlm" role="dialog" aria-labelledby="nlm-title">
            <div class="nlm-header">
                <div class="nlm-header-left">
                    <div class="nlm-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                        </svg>
                    </div>
                    <div>
                        <h3 class="nlm-title" id="nlm-title">New Location Detected</h3>
                        <p class="nlm-subtitle">This barangay isn't in your community list yet.</p>
                    </div>
                </div>
                <button class="nlm-close" id="nlm-close" aria-label="Close">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
            <div class="nlm-body">
                <p class="nlm-description" id="nlm-description"></p>
                <div class="nlm-field">
                    <label class="nlm-label" for="nlm-name">Barangay Name</label>
                    <input class="nlm-input" type="text" id="nlm-name" placeholder="e.g. Barangay Ugac Norte" maxlength="255">
                </div>
                <div class="nlm-field-row">
                    <div class="nlm-field">
                        <label class="nlm-label" for="nlm-city">City</label>
                        <input class="nlm-input" type="text" id="nlm-city" placeholder="Tuguegarao City" maxlength="255">
                    </div>
                    <div class="nlm-field">
                        <label class="nlm-label" for="nlm-province">Province</label>
                        <input class="nlm-input" type="text" id="nlm-province" placeholder="Cagayan" maxlength="255">
                    </div>
                </div>
                <div class="nlm-error" id="nlm-error" hidden></div>
            </div>
            <div class="nlm-footer">
                <button class="nlm-btn nlm-btn--ghost" id="nlm-cancel">Cancel</button>
                <button class="nlm-btn nlm-btn--skip" id="nlm-skip">Skip, place pin anyway</button>
                <button class="nlm-btn nlm-btn--primary" id="nlm-save">
                    <span class="nlm-btn-text">Add & Continue</span>
                    <span class="nlm-btn-spinner" hidden>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                        </svg>
                    </span>
                </button>
            </div>
        </div>
    </div>
</div>

@endsection

@push('scripts')
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    <script src="{{ asset('js/admin/map.js') }}" defer></script>
@endpush