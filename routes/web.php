<?php
use App\Http\Controllers\AboutController;
use App\Http\Controllers\Admin\AuthController;
use App\Http\Controllers\Admin\CommunityController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\ProgramController;
use App\Http\Controllers\Admin\ProgramRequestController;
use App\Http\Controllers\Admin\SettingsController;
use Illuminate\Support\Facades\Route;

/*
Route::get('/', function () {
    return view('welcome');
});

Route::get('/map', function () {
    return view('map.index');
});
*/



Route::get('/hero', function () {
    return view('layout.hero');
});


Route::get('/', function () {
    return view('pages.home.index');
})->name('home');

Route::get('/about', [AboutController::class, 'index'])->name('about');
Route::get('/programs', [ProgramController::class, 'publicIndex'])->name('programs');

// Will update soon
Route::get('/admin/login', [AuthController::class, 'showLogin'])->name('admin.login');
Route::post('/admin/login', [AuthController::class, 'login'])->name('admin.login.post');
Route::post('/admin/logout', [AuthController::class, 'logout'])->name('admin.logout');

// Protected admin routes
Route::prefix('admin')->middleware('admin')->group(function () {
    Route::get('/admin', fn() => redirect()->route('admin.dashboard'));
    Route::get('/admin/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');
    
    Route::get('/map',     fn() => view('admin.map.index'))->name('admin.map');

    Route::get('/community', [CommunityController::class, 'index'])->name('admin.community');
    Route::get('community/check', [CommunityController::class, 'check'])->name('admin.community.check');
    Route::get('/community/{barangay}', [CommunityController::class, 'show'])->name('admin.community.show');
    Route::put('/community/{barangay}', [CommunityController::class, 'update'])->name('admin.community.update');
    Route::post('/community', [CommunityController::class, 'store'])->name('admin.community.store');
    Route::delete('/community/{barangay}', [CommunityController::class, 'destroy'])->middleware('super_admin')->name('admin.community.destroy');

    Route::get('/projects', fn() => view('admin.map.index'))->name('admin.projects');

    Route::post('/program-requests', [App\Http\Controllers\Admin\ProgramRequestController::class, 'store'])->name('admin.program-requests.store');
    Route::delete('/program-requests/{programRequest}/withdraw', [App\Http\Controllers\Admin\ProgramRequestController::class, 'withdraw'])->name('admin.program-requests.withdraw');
    Route::patch('/program-requests/{programRequest}/action', [App\Http\Controllers\Admin\ProgramRequestController::class, 'action'])->name('admin.program-requests.action');
    Route::get('/program-requests/pending', [ProgramRequestController::class, 'pending'])->name('admin.program-requests.pending');
    
    Route::get('/programs', [ProgramController::class, 'index'])->name('admin.programs');
    Route::post('/programs', [ProgramController::class, 'store'])->name('admin.programs.store');
    Route::put('/programs/{program}', [ProgramController::class, 'update'])->name('admin.programs.update');
    Route::delete('/programs/{program}', [ProgramController::class, 'destroy'])->name('admin.programs.destroy');

    Route::get('/budget', [App\Http\Controllers\Admin\BudgetController::class, 'index'])->name('admin.budget');
    Route::post('/budget', [App\Http\Controllers\Admin\BudgetController::class, 'store'])->name('admin.budget.store');
    Route::put('/budget/{budget}', [App\Http\Controllers\Admin\BudgetController::class, 'update'])->name('admin.budget.update');
    Route::delete('/budget/{budget}', [App\Http\Controllers\Admin\BudgetController::class, 'destroy'])->name('admin.budget.destroy');
    Route::middleware('super_admin')->group(function () {
        Route::get('/accounts', [App\Http\Controllers\Admin\AccountController::class, 'index'])->name('admin.accounts');
        Route::post('/accounts', [App\Http\Controllers\Admin\AccountController::class, 'store'])->name('admin.accounts.store');
        Route::patch('/accounts/{user}/toggle', [App\Http\Controllers\Admin\AccountController::class, 'toggle'])->name('admin.accounts.toggle');
        Route::patch('/accounts/password', [App\Http\Controllers\Admin\AccountController::class, 'updatePassword'])->name('admin.accounts.password');
    });
    
    Route::get('/settings', [SettingsController::class, 'index'])->name('admin.settings');
    Route::patch('/settings/profile', [App\Http\Controllers\Admin\SettingsController::class, 'updateProfile'])->name('admin.settings.profile');
    Route::patch('/settings/password', [App\Http\Controllers\Admin\SettingsController::class, 'updatePassword'])->name('admin.settings.password');

    Route::get('/pins', [App\Http\Controllers\Admin\PinController::class, 'index']);
    Route::post('/pins', [App\Http\Controllers\Admin\PinController::class, 'store']);
    Route::put('/pins/{pin}', [App\Http\Controllers\Admin\PinController::class, 'update']);
    Route::delete('/pins/{pin}', [App\Http\Controllers\Admin\PinController::class, 'destroy']);
});

// Route::get('/about', [AboutController::class, 'index'])->name('about');