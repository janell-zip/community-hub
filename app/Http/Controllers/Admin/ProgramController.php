<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Pin;
use App\Models\Program;
use App\Models\Sdg;
use Illuminate\Http\Request;

class ProgramController extends Controller
{
    public function index(Request $request)
    {
        $programs = Program::with(['pendingRequests.requester', 'requests', 'sdgs'])->get()->map(function ($p) {
            $pending = $p->pendingRequests->first();

            $lastRejection = $p->requests
                ->where('type', 'approve')
                ->where('status', 'rejected')
                ->sortByDesc('updated_at')
                ->first();

            return [
                'id'                    => $p->id,
                'title'                 => $p->title,
                'description'           => $p->description,
                'location'              => $p->location,
                'pin_id'                => $p->pin_id,
                'category'              => $p->category,
                'activity_type'         => $p->activity_type,
                'reach'                 => $p->reach,
                'target_beneficiaries'  => $p->target_beneficiaries,
                'status'                => $p->status,
                'start_at'              => $p->start_at->toIso8601String(),
                'end_at'                => $p->end_at->toIso8601String(),
                'sdgs'                  => $p->sdgs->pluck('id'),
                'pending_request'       => $pending ? [
                    'id'           => $pending->id,
                    'type'         => $pending->type,
                    'requested_by' => $pending->requester?->name ?? 'Unknown',
                ] : null,
                'last_rejection_reason' => $lastRejection?->rejection_reason ?? null,
            ];
        });

        $pins = Pin::with(['category', 'barangay'])
            ->orderBy('site_name')
            ->get()
            ->map(fn($pin) => [
                'id'       => $pin->id,
                'label'    => $pin->site_name,
                'barangay' => $pin->barangay?->name ?? '',
                'category' => $pin->category->slug,
                'location' => trim(($pin->site_name) . ($pin->barangay ? ', ' . $pin->barangay->name : '')),
            ]);

        return view('admin.programs.index', [
            'programs'      => $programs,
            'categories'    => Program::$categories,
            'statuses'      => Program::$statuses,
            'pins'          => $pins,
            'sdgs'          => Sdg::orderBy('number')->get()->map(fn($s) => [  
                'id'     => $s->id,
                'number' => $s->number,
                'title'  => $s->title,
                'color'  => $s->color,
            ]),
            'activityTypes' => Program::$activityTypes,
            'sdgMap'        => Program::$sdgMap,
            'beneficiaries' => Program::$beneficiaries,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'         => 'required|string|max:255',
            'description'   => 'nullable|string',
            'location'      => 'nullable|string|max:255',
            'pin_id'        => 'nullable|exists:pins,id',
            'category'      => 'required|in:' . implode(',', array_keys(Program::$categories)),
            'status'        => 'required|in:' . implode(',', array_keys(Program::$statuses)),
            'start_at'      => 'required|date|after_or_equal:today',
            'end_at'        => 'required|date|after_or_equal:start_at',
            'activity_type' => 'nullable|string',
            'sdg_ids'       => 'nullable|array',
            'sdg_ids.*'     => 'exists:sdgs,id',
            'reach'                  => 'required|integer|min:1',
            'target_beneficiaries'   => 'required|array|min:1',
            'target_beneficiaries.*' => 'in:' . implode(',', array_keys(Program::$beneficiaries)),
        ]);

        if (empty($validated['location']) && !empty($validated['pin_id'])) {
            $pin = Pin::with(['barangay'])->find($validated['pin_id']);
            if ($pin) {
                $validated['location'] = trim($pin->site_name . ($pin->barangay ? ', ' . $pin->barangay->name : ''));
            }
        }

        $program = Program::create($validated);

        if (!empty($validated['sdg_ids'])) {
            $program->sdgs()->sync($validated['sdg_ids']);
        }

        return response()->json([
            'success' => true,
            'program' => [
                'id'            => $program->id,
                'title'         => $program->title,
                'description'   => $program->description,
                'location'      => $program->location,
                'pin_id'        => $program->pin_id,
                'category'      => $program->category,
                'activity_type' => $program->activity_type,
                'status'        => $program->status,
                'start_at'      => $program->start_at->toIso8601String(),
                'end_at'        => $program->end_at->toIso8601String(),
                'sdgs'          => $program->sdgs->pluck('id'),
                'reach'         => $program->reach,
                'target_beneficiaries' => $program->target_beneficiaries ?? [],
            ],
        ], 201);
    }

    public function update(Request $request, Program $program)
    {
        $isSuperAdmin   = auth()->user()->isSuperAdmin();
        $lockedStatuses = ['completed', 'cancelled'];
        $frozenStatuses = ['ongoing', 'completed'];

        if (!$isSuperAdmin && in_array($program->status, $lockedStatuses)) {
            return response()->json(['message' => 'You do not have permission to edit this program.'], 403);
        }

        if (!$isSuperAdmin) {
            $hasPendingApproval = $program->pendingRequests()
                ->where('type', 'approve')
                ->exists();
            if ($hasPendingApproval) {
                return response()->json(['message' => 'This program has a pending approval request and cannot be edited until it is resolved.'], 422);
            }
        }

        if ($isSuperAdmin && in_array($program->status, $lockedStatuses)) {
            $validated = $request->validate([
                'description' => 'nullable|string',
                'status'      => 'required|in:' . implode(',', array_keys(Program::$statuses)),
            ]);
            $program->update($validated);

            return response()->json([
                'success' => true,
                'program' => [
                    'id'            => $program->id,
                    'title'         => $program->title,
                    'description'   => $program->description,
                    'location'      => $program->location,
                    'pin_id'        => $program->pin_id,
                    'category'      => $program->category,
                    'activity_type' => $program->activity_type,
                    'status'        => $program->status,
                    'start_at'      => $program->start_at->toIso8601String(),
                    'end_at'        => $program->end_at->toIso8601String(),
                    'sdgs'          => $program->sdgs->pluck('id'),
                    'reach'         => $program->reach,
                    'target_beneficiaries' => $program->target_beneficiaries ?? [],
                ],
            ]);
        }

        $dateRules = in_array($program->status, $frozenStatuses)
            ? ['start_at' => 'prohibited', 'end_at' => 'prohibited']
            : ['start_at' => 'required|date', 'end_at' => 'required|date|after_or_equal:start_at'];

        $validated = $request->validate(array_merge([
            'title'         => 'required|string|max:255',
            'description'   => 'nullable|string',
            'location'      => 'nullable|string|max:255',
            'pin_id'        => 'nullable|exists:pins,id',
            'category'      => 'required|in:' . implode(',', array_keys(Program::$categories)),
            'status'        => $isSuperAdmin
                                ? 'required|in:' . implode(',', array_keys(Program::$statuses))
                                : 'sometimes|in:proposed',
            'activity_type' => 'nullable|string',
            'sdg_ids'       => 'nullable|array',
            'sdg_ids.*'     => 'exists:sdgs,id',
            'reach'                  => 'nullable|integer|min:0',
            'target_beneficiaries'   => 'nullable|array',
            'target_beneficiaries.*' => 'in:' . implode(',', array_keys(Program::$beneficiaries)),
                    ], $dateRules));

        if (!$isSuperAdmin) {
            $validated['status'] = 'proposed';
        }

        if (empty($validated['location']) && !empty($validated['pin_id'])) {
            $pin = Pin::with(['barangay'])->find($validated['pin_id']);
            if ($pin) {
                $validated['location'] = trim($pin->site_name . ($pin->barangay ? ', ' . $pin->barangay->name : ''));
            }
        }

        $program->update($validated);
        $program->sdgs()->sync($validated['sdg_ids'] ?? []);

        return response()->json([
            'success' => true,
            'program' => [
                'id'            => $program->id,
                'title'         => $program->title,
                'description'   => $program->description,
                'location'      => $program->location,
                'pin_id'        => $program->pin_id,
                'category'      => $program->category,
                'activity_type' => $program->activity_type,
                'status'        => $program->status,
                'start_at'      => $program->start_at->toIso8601String(),
                'end_at'        => $program->end_at->toIso8601String(),
                'sdgs'          => $program->sdgs->pluck('id'),
                'reach'         => $program->reach,
                'target_beneficiaries' => $program->target_beneficiaries ?? [],
            ],
        ]);
    }

    public function destroy(Program $program)
    {
        if (!auth()->user()->isSuperAdmin()) {
            return response()->json(['message' => 'You do not have permission to delete programs.'], 403);
        }

        $program->delete();
        return response()->json(['success' => true]);
    }

    public function publicIndex()
    {
        $programs = Program::whereIn('status', ['approved', 'ongoing', 'completed'])
            ->get()
            ->map(function ($p) {
                return [
                    'id'          => $p->id,
                    'title'       => $p->title,
                    'description' => $p->description,
                    'location'    => $p->location,
                    'category'    => $p->category,
                    'activity_type' => $p->activity_type,
                    'reach'       => $p->reach,
                    'target_beneficiaries' => $p->target_beneficiaries,
                    'sdgs'                 => $p->sdgs->map(fn($s) => [  
                        'number' => $s->number,
                        'title'  => $s->title,
                        'color'  => $s->color,
                    ]),
                    'status'      => $p->status,
                    'start_at'    => $p->start_at->toIso8601String(),
                    'end_at'      => $p->end_at->toIso8601String(),
                ];
            });

        return view('pages.programs.index', [
            'programs'   => $programs,
            'categories' => Program::$categories,
            'activityTypes' => Program::$activityTypes,
            'beneficiaries' => Program::$beneficiaries,
            'statuses'   => array_filter(
                Program::$statuses,
                fn($key) => in_array($key, ['approved', 'ongoing', 'completed']),
                ARRAY_FILTER_USE_KEY
            ),
        ]);
    }
}