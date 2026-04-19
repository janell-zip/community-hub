<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Barangay;
use App\Models\Category;
use App\Models\Pin;

class CommunityController extends Controller
{
    public function check(Request $request)
    {
        $name   = $request->query('name', '');
        $exists = Barangay::whereRaw('LOWER(name) = ?', [strtolower(trim($name))])->exists();
        return response()->json(['exists' => $exists]);
    }

    public function index(Request $request)
    {
        $categories = Category::orderBy('label')->get();
        $search     = $request->input('search');
        $categoryFilter = $request->input('category');

        $barangays = Barangay::withCount('pins')
            ->with(['pins.category'])
            ->when($search, fn($q) => $q->where('name', 'like', "%{$search}%"))
            ->when($categoryFilter, fn($q) => $q->whereHas('pins.category', fn($q2) => $q2->where('slug', $categoryFilter)))
            ->orderBy('name')
            ->paginate(10)
            ->withQueryString();

        $barangays->each(function ($barangay) {
            $barangay->pins_by_category = $barangay->pins
                ->groupBy('category.slug')
                ->map(fn($pins) => $pins->count());
        });

        $totalPins        = Pin::count();
        $totalBarangays   = Barangay::count();
        $coveredBarangays = Barangay::withCount('pins')->get()->where('pins_count', '>', 0)->count();

        return view('admin.community.index', compact(
            'barangays',
            'categories',
            'totalPins',
            'totalBarangays',
            'coveredBarangays'
        ));
    }

    public function destroy(Barangay $barangay)
    {
        $barangay->delete();

        return response()->json(['success' => true]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'city'        => 'required|string|max:255',
            'province'    => 'required|string|max:255',
            'coordinates' => 'nullable|json',
        ]);

        $barangay = Barangay::create([
            'name'        => $validated['name'],
            'city'        => $validated['city'],
            'province'    => $validated['province'],
            'coordinates' => isset($validated['coordinates'])
                                ? json_decode($validated['coordinates'], true)
                                : null,
        ]);

        return response()->json([
            'success'  => true,
            'barangay' => $barangay->loadCount('pins'),
        ], 201);
    }

    public function update(Request $request, Barangay $barangay)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'city'     => 'required|string|max:255',
            'province' => 'required|string|max:255',
        ]);

        $barangay->update($validated);

        return response()->json([
            'success'  => true,
            'barangay' => $barangay->fresh(),
        ]);
    }

    public function show(Barangay $barangay)
    {
        $barangay->loadCount('pins');
        $pins = $barangay->pins()->with('category')->get();

        return view('admin.community.show', compact('barangay', 'pins'));
    }
}