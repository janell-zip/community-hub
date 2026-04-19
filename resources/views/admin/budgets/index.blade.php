@extends('layouts.admin')

@section('title', 'Budget - SPUP-CDCFI Admin')

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/admin/budgets.css') }}">
@endpush

@section('content')
<div class="budget-page">

    {{-- Header --}}
    <div class="budget-header">
        <div>
            <h1 class="budget-title">Budget Planning</h1>
            <p class="budget-subtitle">Manage budgets for approved programs</p>
        </div>
    </div>

    <div class="budget-body">

        {{-- Program List --}}
        <aside class="budget-sidebar">
            <span class="budget-sidebar-label">Approved Programs</span>
            <div class="budget-program-list" id="budget-program-list"></div>
        </aside>

        {{-- Budget Form --}}
        <div class="budget-main" id="budget-main">
            <div class="budget-empty" id="budget-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                </svg>
                <span>Select a program to manage its budget</span>
            </div>

            <div class="budget-form-wrap" id="budget-form-wrap" hidden>

                {{-- Program Info Bar --}}
                <div class="budget-program-bar" id="budget-program-bar"></div>

                {{-- Program Details --}}
                <div class="budget-program-details" id="budget-program-details"></div>

                {{-- Allocated Budget --}}
                <div class="budget-allocated-wrap">
                    <div class="budget-allocated-field">
                        <label class="budget-field-label">Allocated Budget</label>
                        <div class="budget-amount-input-wrap">
                            <span class="budget-currency">₱</span>
                            <input class="budget-amount-input" type="number" id="budget-allocated"
                                min="0" step="0.01" placeholder="0.00">
                        </div>
                    </div>
                    <div class="budget-summary-cards">
                        <div class="budget-summary-card">
                            <span class="budget-summary-label">Grand Total</span>
                            <span class="budget-summary-value" id="budget-grand-total">₱0.00</span>
                        </div>
                        <div class="budget-summary-card" id="budget-remaining-card">
                            <span class="budget-summary-label">Remaining</span>
                            <span class="budget-summary-value" id="budget-remaining">₱0.00</span>
                        </div>
                    </div>
                </div>

                {{-- Items Table --}}
                <div class="budget-table-wrap">
                    <table class="budget-table">
                        <thead>
                            <tr>
                                <th class="budget-th budget-th--name">Item Name</th>
                                <th class="budget-th budget-th--qty">Quantity</th>
                                <th class="budget-th budget-th--price">Unit Price</th>
                                <th class="budget-th budget-th--total">Total</th>
                                <th class="budget-th budget-th--action"></th>
                            </tr>
                        </thead>
                        <tbody id="budget-items-body"></tbody>
                    </table>
                </div>

                {{-- Add Row --}}
                <button class="budget-add-row-btn" id="budget-add-row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Add Item
                </button>

                {{-- Last Edited --}}
                <div class="budget-last-edited" id="budget-last-edited" hidden></div>

                {{-- Notes --}}
                <div class="budget-notes-wrap">
                    <label class="budget-field-label">Notes</label>
                    <textarea class="budget-notes-textarea" id="budget-notes" placeholder="Add any additional information or notes about this budget..."></textarea>
                </div>

                {{-- Footer --}}
                <div class="budget-form-footer">
                    <button class="budget-btn budget-btn--delete" id="budget-delete-btn" hidden>Delete Budget</button>
                    <div class="budget-form-footer-right">
                        <button class="budget-btn budget-btn--cancel" id="budget-cancel-btn">Cancel</button>
                        <button class="budget-btn budget-btn--clear" id="budget-clear-btn">Clear</button>
                        <button class="budget-btn budget-btn--save" id="budget-save-btn">
                            <span class="budget-btn-text">Save Budget</span>
                            <span class="budget-btn-spinner" hidden>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                                </svg>
                            </span>
                        </button>
                    </div>
                </div>

                <div class="budget-form-error" id="budget-form-error" hidden></div>
            </div>
        </div>
    </div>
</div>

{{-- Clear Confirmation Modal --}}
<div class="pgmodal-overlay" id="budget-clear-modal" aria-hidden="true">
    <div class="pgmodal pgmodal--sm" role="dialog">
        <div class="pgmodal-header">
            <h2 class="pgmodal-title">Clear Form</h2>
            <button class="pgmodal-close" id="budget-clear-modal-close">&times;</button>
        </div>
        <div class="pgmodal-body">
            <div class="pgdelete-warning" style="border-color:rgba(154,95,26,0.2); background:rgba(154,95,26,0.04);">
                <svg viewBox="0 0 24 24" fill="none" stroke="#9a5f1a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <p>This will reset all fields and items. Any unsaved changes will be lost.</p>
            </div>
        </div>
        <div class="pgmodal-footer">
            <button type="button" class="pgmodal-btn pgmodal-btn--cancel" id="budget-clear-modal-cancel">Cancel</button>
            <button type="button" class="pgmodal-btn pgmodal-btn--warning" id="budget-clear-modal-confirm">Clear Form</button>
        </div>
    </div>
</div>

{{-- Delete Confirmation Modal --}}
<div class="pgmodal-overlay" id="budget-delete-modal" aria-hidden="true">
    <div class="pgmodal pgmodal--sm" role="dialog">
        <div class="pgmodal-header">
            <h2 class="pgmodal-title pgmodal-title--danger">Delete Budget</h2>
            <button class="pgmodal-close" id="budget-del-modal-close">&times;</button>
        </div>
        <div class="pgmodal-body">
            <div class="pgdelete-warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <p>Are you sure you want to delete the budget for <strong id="budget-del-program-name"></strong>? This cannot be undone.</p>
            </div>
        </div>
        <div class="pgmodal-footer">
            <button type="button" class="pgmodal-btn pgmodal-btn--cancel" id="budget-del-modal-cancel">Cancel</button>
            <button type="button" class="pgmodal-btn pgmodal-btn--danger" id="budget-del-modal-confirm">
                <span class="pgmodal-btn-text">Delete</span>
                <span class="pgmodal-btn-spinner" hidden>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                </span>
            </button>
        </div>
    </div>
</div>

@endsection

@push('scripts')
<script>
    window.BUDGET_PROGRAMS  = @json($programs);
    window.CATEGORIES_DATA  = @json($categories);
    window.BUDGET_STORE_URL = "{{ route('admin.budget.store') }}";
    window.BUDGET_UPDATE_URL = "/admin/budget/";
    window.CSRF_TOKEN       = "{{ csrf_token() }}";
    window.IS_SUPER_ADMIN   = {{ auth()->user()->isSuperAdmin() ? 'true' : 'false' }};
</script>
<script src="{{ asset('js/admin/budgets.js') }}" defer></script>
@endpush