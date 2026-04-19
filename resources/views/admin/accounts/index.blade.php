@extends('layouts.admin')

@section('title', 'Accounts - SPUP-CDCFI Admin')

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/admin/accounts.css') }}">
@endpush

@section('content')
<div class="accounts-page">

    <div class="accounts-header">
        <div class="accounts-header-left">
            <h1 class="accounts-title">Admin Accounts</h1>
            <p class="accounts-subtitle">Manage administrator access to the portal</p>
        </div>
        <button class="acbtn-add" id="open-create-account">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Admin
        </button>
    </div>

    <div class="accounts-table-wrap">
        <table class="accounts-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="accounts-tbody">
                @foreach ($accounts as $i => $account)
                <tr class="account-row" data-id="{{ $account['id'] }}">
                    <td class="col-num">{{ $i + 1 }}</td>
                    <td class="col-name">{{ $account['name'] }}</td>
                    <td class="col-email">{{ $account['email'] }}</td>
                    <td class="col-role">
                        <span class="role-pill role-pill--{{ $account['role'] }}">
                            {{ $account['role'] === 'super_admin' ? 'Super Admin' : 'Admin' }}
                        </span>
                    </td>
                    <td class="col-status">
                        <span class="status-pill {{ $account['is_active'] ? 'status-pill--active' : 'status-pill--inactive' }}">
                            {{ $account['is_active'] ? 'Active' : 'Inactive' }}
                        </span>
                    </td>
                    <td class="col-date">{{ $account['created_at'] }}</td>
                    <td class="col-action">
                        @if ($account['role'] === 'super_admin')
                        <a href="{{ route('admin.settings') }}" class="ac-toggle-btn ac-toggle-btn--settings">
                            Go to Account Settings
                        </a>
                        @else
                        <button class="ac-toggle-btn {{ $account['is_active'] ? 'ac-toggle-btn--deactivate' : 'ac-toggle-btn--activate' }}"
                            data-id="{{ $account['id'] }}"
                            data-active="{{ $account['is_active'] ? '1' : '0' }}"
                            data-name="{{ $account['name'] }}">
                            {{ $account['is_active'] ? 'Deactivate' : 'Activate' }}
                        </button>
                        @endif
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

</div>

{{-- Create Account Modal --}}
<div class="acmodal-overlay" id="create-account-modal" aria-hidden="true">
    <div class="acmodal" role="dialog" aria-labelledby="acmodal-title">
        <div class="acmodal-header">
            <h2 class="acmodal-title" id="acmodal-title">Add Admin Account</h2>
            <button class="acmodal-close" id="acmodal-close" aria-label="Close">&times;</button>
        </div>
        <form id="create-account-form" method="POST" data-action="{{ route('admin.accounts.store') }}">
            @csrf
            <div class="acmodal-body">
                <div class="acfield">
                    <label class="acfield-label" for="ac-name">Full Name</label>
                    <input class="acfield-input" type="text" id="ac-name" name="name" required maxlength="255" placeholder="e.g. Juan Dela Cruz">
                </div>
                <div class="acfield">
                    <label class="acfield-label" for="ac-email">Email</label>
                    <input class="acfield-input" type="email" id="ac-email" name="email" required placeholder="admin@spup-cdcfi.com">
                </div>
                <div class="acfield">
                    <label class="acfield-label" for="ac-password">Password</label>
                    <div class="acfield-password-wrap">
                        <input class="acfield-input" type="password" id="ac-password" name="password" required placeholder="Min. 8 chars, mixed case & numbers">
                        <button type="button" class="acfield-toggle" id="ac-toggle-password" aria-label="Toggle password">
                            <svg id="ac-eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                            </svg>
                        </button>
                    </div>
                    <span class="acfield-hint">Minimum 8 characters with uppercase, lowercase, and a number.</span>
                </div>
                <div class="acmodal-error" id="acmodal-error" hidden></div>
            </div>
            <div class="acmodal-footer">
                <button type="button" class="acmodal-btn acmodal-btn--cancel" id="acmodal-cancel">Cancel</button>
                <button type="submit" class="acmodal-btn acmodal-btn--save" id="acmodal-save">
                    <span class="acmodal-btn-text">Create Account</span>
                    <span class="acmodal-btn-spinner" hidden>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                    </span>
                </button>
            </div>
        </form>
    </div>
</div>

{{-- Deactivate Confirmation Modal --}}
<div class="acmodal-overlay" id="toggle-account-modal" aria-hidden="true">
    <div class="acmodal acmodal--sm" role="dialog">
        <div class="acmodal-header">
            <h2 class="acmodal-title" id="ac-toggle-modal-title">Deactivate Account</h2>
            <button class="acmodal-close" id="ac-togglemodal-close" aria-label="Close">&times;</button>
        </div>
        <div class="acmodal-body">
            <div class="acmodal-warning" id="ac-toggle-warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <p id="ac-toggle-message"></p>
            </div>
        </div>
        <div class="acmodal-footer">
            <button type="button" class="acmodal-btn acmodal-btn--cancel" id="ac-togglemodal-cancel">Cancel</button>
            <button type="button" class="acmodal-btn acmodal-btn--danger" id="ac-togglemodal-confirm">
                <span class="acmodal-btn-text" id="ac-togglemodal-confirm-text">Deactivate</span>
                <span class="acmodal-btn-spinner" hidden>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                </span>
            </button>
        </div>
    </div>
</div>

@endsection

@push('scripts')
<script>
    window.ACCOUNTS_STORE_URL  = "{{ route('admin.accounts.store') }}";
    window.ACCOUNTS_TOGGLE_URL = "/admin/accounts/";
    window.CSRF_TOKEN          = "{{ csrf_token() }}";
</script>
<script src="{{ asset('js/admin/accounts.js') }}" defer></script>
@endpush