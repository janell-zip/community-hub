<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Program;
use App\Models\ProgramRequest;
use Illuminate\Http\Request;

class ProgramRequestController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'program_id' => 'required|exists:programs,id',
            'type'       => 'required|in:approve,delete',
            'notes'      => 'nullable|string|max:500',
        ]);

        $program         = Program::findOrFail($validated['program_id']);
        $lockedStatuses  = ['completed', 'cancelled'];

        // Admins cannot request anything on completed or cancelled programs
        if (in_array($program->status, $lockedStatuses)) {
            return response()->json([
                'message' => 'Requests cannot be made on completed or cancelled programs.',
            ], 422);
        }

        // Only proposed programs can be sent for approval
        if ($validated['type'] === 'approve' && $program->status !== 'proposed') {
            return response()->json([
                'message' => 'Only proposed programs can be submitted for approval.',
            ], 422);
        }

        // Admins can only request deletion of their own proposed programs
        if ($validated['type'] === 'delete' && $program->status !== 'proposed') {
            return response()->json([
                'message' => 'Only proposed programs can be submitted for deletion.',
            ], 422);
        }

        // One pending request per program at a time??
        $existing = ProgramRequest::where('program_id', $validated['program_id'])
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'A pending request already exists for this program.',
            ], 422);
        }

        $programRequest = ProgramRequest::create([
            'program_id'   => $validated['program_id'],
            'requested_by' => auth()->id(),
            'type'         => $validated['type'],
            'notes'        => $validated['notes'] ?? null,
            'status'       => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'request' => $this->formatRequest($programRequest->load(['requester', 'program'])),
        ], 201);
    }

    public function withdraw(Request $request, ProgramRequest $programRequest)
    {
        if ($programRequest->requested_by !== auth()->id()) {
            return response()->json(['message' => 'You can only withdraw your own requests.'], 403);
        }

        if ($programRequest->status !== 'pending') {
            return response()->json(['message' => 'Only pending requests can be withdrawn.'], 422);
        }

        $programRequest->delete();

        return response()->json(['success' => true]);
    }

    public function action(Request $request, ProgramRequest $programRequest)
    {
        $validated = $request->validate([
            'decision'         => 'required|in:approved,rejected',
            'rejection_reason' => 'nullable|string|max:500',
        ]);

        if ($programRequest->status !== 'pending') {
            return response()->json(['message' => 'This request has already been actioned.'], 422);
        }

        $program = $programRequest->program;

        if ($validated['decision'] === 'approved') {
            if ($programRequest->type === 'approve') {
                $program->update(['status' => 'approved']);
            } elseif ($programRequest->type === 'delete') {
                // Cascade delete all other pending requests for this program first
                ProgramRequest::where('program_id', $program->id)
                    ->where('status', 'pending')
                    ->where('id', '!=', $programRequest->id)
                    ->delete();

                $program->delete();

                $programRequest->update([
                    'status'      => 'approved',
                    'actioned_by' => auth()->id(),
                    'actioned_at' => now(),
                ]);
                return response()->json(['success' => true, 'program_deleted' => true]);
            }
        }

        $programRequest->update([
            'status'           => $validated['decision'],
            'actioned_by'      => auth()->id(),
            'actioned_at'      => now(),
            'rejection_reason' => $validated['rejection_reason'] ?? null,
        ]);

        return response()->json([
            'success'          => true,
            'program_deleted'  => false,
            'program'          => [
                'id'     => $program->id,
                'status' => $program->fresh()->status,
            ],
            'request_status'   => $validated['decision'],
            'rejection_reason' => $validated['rejection_reason'] ?? null,
        ]);
    }

    public function pending()
    {
        $requests = ProgramRequest::with(['program', 'requester'])
            ->where('status', 'pending')
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($r) => $this->formatRequest($r));

        return response()->json($requests);
    }

    private function formatRequest(ProgramRequest $r): array
    {
        return [
            'id'               => $r->id,
            'program_id'       => $r->program_id,
            'program_title'    => $r->program?->title ?? 'Deleted Program',
            'type'             => $r->type,
            'status'           => $r->status,
            'notes'            => $r->notes,
            'rejection_reason' => $r->rejection_reason,
            'requested_by'     => $r->requester?->name ?? 'Unknown',
            'requested_at'     => $r->created_at->format('M d, Y'),
        ];
    }
}