<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Barangay;
use App\Models\Category;
use App\Models\Pin;
use Illuminate\Http\Request;

class PinController extends Controller
{
    public function index()
    {
        $pins = Pin::with(['category', 'barangay'])->get()->map(function ($pin) {
            return [
                'id'          => $pin->id,
                'site_name'   => $pin->site_name,
                'category'    => $pin->category->slug,
                'category_label' => $pin->category->label,
                'category_color' => $pin->category->color,
                'barangay'    => $pin->barangay?->name ?? '',
                'barangay_id' => $pin->barangay_id,
                'status'      => $pin->status,
                'description' => $pin->description,
                'latitude'    => (float) $pin->latitude,
                'longitude'   => (float) $pin->longitude,
            ];
        });

        return response()->json($pins);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'site_name'   => 'required|string|max:255',
            'category'    => 'required|string|exists:categories,slug',
            'barangay'    => 'nullable|string',
            'status'      => 'required|in:active,proposed,under-construction,needs-assessment,inactive',
            'description' => 'nullable|string',
            'latitude'    => 'required|numeric|between:-90,90',
            'longitude'   => 'required|numeric|between:-180,180',
        ]);

        $category = Category::where('slug', $validated['category'])->firstOrFail();

        $barangayId = null;
        if (!empty($validated['barangay'])) {
            $barangay   = Barangay::where('name', $validated['barangay'])->first();
            $barangayId = $barangay?->id;
        }

        $pin = Pin::create([
            'site_name'   => $validated['site_name'],
            'category_id' => $category->id,
            'barangay_id' => $barangayId,
            'status'      => $validated['status'],
            'description' => $validated['description'] ?? null,
            'latitude'    => $validated['latitude'],
            'longitude'   => $validated['longitude'],
        ]);

        return response()->json([
            'id'             => $pin->id,
            'site_name'      => $pin->site_name,
            'category'       => $category->slug,
            'category_label' => $category->label,
            'category_color' => $category->color,
            'barangay'       => $pin->barangay?->name ?? '',
            'barangay_id'    => $pin->barangay_id,
            'status'         => $pin->status,
            'description'    => $pin->description,
            'latitude'       => (float) $pin->latitude,
            'longitude'      => (float) $pin->longitude,
        ], 201);
    }

    public function update(Request $request, Pin $pin)
    {
        $validated = $request->validate([
            'site_name'   => 'required|string|max:255',
            'category'    => 'required|string|exists:categories,slug',
            'barangay'    => 'nullable|string',
            'status'      => 'required|in:active,proposed,under-construction,needs-assessment,inactive',
            'description' => 'nullable|string',
            'latitude'    => 'required|numeric|between:-90,90',
            'longitude'   => 'required|numeric|between:-180,180',
        ]);

        $category = Category::where('slug', $validated['category'])->firstOrFail();

        $barangayId = null;
        if (!empty($validated['barangay'])) {
            $barangay   = Barangay::where('name', $validated['barangay'])->first();
            $barangayId = $barangay?->id;
        }

        $pin->update([
            'site_name'   => $validated['site_name'],
            'category_id' => $category->id,
            'barangay_id' => $barangayId,
            'status'      => $validated['status'],
            'description' => $validated['description'] ?? null,
            'latitude'    => $validated['latitude'],
            'longitude'   => $validated['longitude'],
        ]);

        return response()->json([
            'id'             => $pin->id,
            'site_name'      => $pin->site_name,
            'category'       => $category->slug,
            'category_label' => $category->label,
            'category_color' => $category->color,
            'barangay'       => $pin->barangay?->name ?? '',
            'barangay_id'    => $pin->barangay_id,
            'status'         => $pin->status,
            'description'    => $pin->description,
            'latitude'       => (float) $pin->latitude,
            'longitude'      => (float) $pin->longitude,
        ]);
    }

    public function destroy(Pin $pin)
    {
        $pin->delete();
        return response()->json(['message' => 'Pin deleted successfully.']);
    }
}