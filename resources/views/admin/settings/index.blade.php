@extends('layouts.admin')

@section('title', 'Account Settings - SPUP-CDCFI Admin')

@push('styles')
    <link rel="stylesheet" href="{{ asset('css/admin/settings.css') }}">
@endpush

@section('content')
<div class="settings-page">

    <div class="settings-header">
        <h1 class="settings-title">Account Settings</h1>
        <p class="settings-subtitle">Manage your account information and security</p>
    </div>

    <div class="settings-body">

        {{-- Profile Card --}}
        <div class="settings-card">
            <div class="settings-card-header">
                <div class="settings-card-icon settings-card-icon--profile">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                </div>
                <div>
                    <h2 class="settings-card-title">Profile Information</h2>
                    <p class="settings-card-subtitle">Update your name and email address</p>
                </div>
            </div>
            <form id="profile-form" class="settings-form">
                @csrf
                <div class="stfield-row">
                    <div class="stfield">
                        <label class="stfield-label" for="st-name">Full Name</label>
                        <input class="stfield-input" type="text" id="st-name" name="name"
                            value="{{ $user->name }}" required maxlength="255">
                    </div>
                    <div class="stfield">
                        <label class="stfield-label" for="st-email">Email Address</label>
                        <input class="stfield-input" type="email" id="st-email" name="email"
                            value="{{ $user->email }}" required>
                    </div>
                </div>
                <div class="stfield-meta">
                    <span class="stfield-role-pill stfield-role-pill--{{ $user->role }}">
                        {{ $user->role === 'super_admin' ? 'Super Admin' : 'Admin' }}
                    </span>
                    <span class="stfield-joined">Member since {{ $user->created_at->format('F d, Y') }}</span>
                </div>
                <div class="settings-error" id="profile-error" hidden></div>
                <div class="settings-form-footer">
                    <button type="submit" class="stbtn stbtn--save" id="profile-save-btn">
                        <span class="stbtn-text">Save Changes</span>
                        <span class="stbtn-spinner" hidden>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                        </span>
                    </button>
                </div>
            </form>
        </div>

        {{-- Password Card --}}
        <div class="settings-card">
            <div class="settings-card-header">
                <div class="settings-card-icon settings-card-icon--password">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                </div>
                <div>
                    <h2 class="settings-card-title">Change Password</h2>
                    <p class="settings-card-subtitle">Update your password to keep your account secure</p>
                </div>
            </div>
            <form id="password-form" class="settings-form">
                @csrf
                <div class="stfield">
                    <label class="stfield-label" for="st-current-password">Current Password</label>
                    <div class="stfield-password-wrap">
                        <input class="stfield-input" type="password" id="st-current-password"
                            name="current_password" required placeholder="Enter current password">
                        <button type="button" class="stfield-toggle st-pw-toggle"
                            data-target="st-current-password" data-icon="st-eye-current">
                            <svg id="st-eye-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="stfield-row">
                    <div class="stfield">
                        <label class="stfield-label" for="st-new-password">New Password</label>
                        <div class="stfield-password-wrap">
                            <input class="stfield-input" type="password" id="st-new-password"
                                name="password" required placeholder="Min. 8 chars, mixed case & numbers">
                            <button type="button" class="stfield-toggle st-pw-toggle"
                                data-target="st-new-password" data-icon="st-eye-new">
                                <svg id="st-eye-new" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div class="stfield">
                        <label class="stfield-label" for="st-confirm-password">Confirm New Password</label>
                        <div class="stfield-password-wrap">
                            <input class="stfield-input" type="password" id="st-confirm-password"
                                name="password_confirmation" required placeholder="Re-enter new password">
                            <button type="button" class="stfield-toggle st-pw-toggle"
                                data-target="st-confirm-password" data-icon="st-eye-confirm">
                                <svg id="st-eye-confirm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="settings-error" id="password-error" hidden></div>
                <div class="settings-form-footer">
                    <button type="submit" class="stbtn stbtn--save" id="password-save-btn">
                        <span class="stbtn-text">Update Password</span>
                        <span class="stbtn-spinner" hidden>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                        </span>
                    </button>
                </div>
            </form>
        </div>

    </div>

</div>
@endsection

@push('scripts')
<script>
    window.SETTINGS_PROFILE_URL  = "{{ route('admin.settings.profile') }}";
    window.SETTINGS_PASSWORD_URL = "{{ route('admin.settings.password') }}";
    window.CSRF_TOKEN = "{{ csrf_token() }}";
</script>
<script src="{{ asset('js/admin/settings.js') }}" defer></script>
@endpush