<?php

namespace App\Models;

use App\Models\Sdg;
use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    protected $fillable = [
        'title',
        'description',
        'location',
        'pin_id',
        'category',
        'activity_type',
        'reach',
        'target_beneficiaries',
        'status',
        'start_at',
        'end_at',
    ];

    protected $casts = [
        'target_beneficiaries' => 'array',
        'start_at' => 'datetime',
        'end_at'   => 'datetime',
    ];

    public static array $categories = [
        'spiritual-values'  => ['label' => 'Spiritual & Values Formation',   'color' => '#16a085'],
        'health'            => ['label' => 'Health & Well-Being',            'color' => '#c0392b'],
        'livelihood'        => ['label' => 'Livelihood & Enterprise',        'color' => '#27ae60'],
        'education'         => ['label' => 'Education & Culture',            'color' => '#2980b9'],
        'digital-inclusion' => ['label' => 'Digital Inclusion & Innovation', 'color' => '#e67e22'],
        'environment'       => ['label' => 'Environmental Stewardship',      'color' => '#1a9e6e'],
        'disaster-risk'     => ['label' => 'DRRM & Emergency Preparedness',  'color' => '#8e44ad'],
    ];

    public static array $activityTypes = [
        'spiritual-values' => [
            'values-education'  => 'Values Education Session',
            'catechism'         => 'Catechism',
        ],
        'health' => [
            'medical-dental'    => 'Medical/Dental Mission',
            'health-education'  => 'Health Education and Promotion',
            'protection'        => 'Protection Sessions (Child Rights and GBV)',
            'mental-health'     => 'Mental Health and Psychosocial Support',
            'pfa'               => 'Psychological First Aid (PFA)',
            'sanitation'        => 'Sanitation and Hygiene',
        ],
        'livelihood' => [
            'skills-training'   => 'Livelihood and Skills Training',
            'financial-literacy'=> 'Financial Literacy',
        ],
        'education' => [
            'remediation'       => 'Remediation and Tutorial Activities',
            'literacy-numeracy' => 'Literacy and Numeracy',
        ],
        'digital-inclusion' => [
            'computer-literacy' => 'Computer Literacy',
            'mobile-tech'       => 'Mobile Technology Skills Development',
        ],
        'environment' => [
            'waste-management'  => 'Waste Management Education and Advocacy',
            'tree-planting'     => 'Tree Planting / Tree Growing',
            'coastal-cleanup'   => 'Coastal Clean-up',
        ],
        'disaster-risk' => [
            'drrm'              => 'Disaster Risk Reduction and Management',
            'relief'            => 'Relief Operation',
        ],
    ];

    public static array $sdgMap = [
        'spiritual-values'  => [3, 4, 10, 16],
        'health'            => [3, 5, 10],
        'livelihood'        => [1, 2, 8, 10],
        'education'         => [4, 5, 10],
        'digital-inclusion' => [4, 8, 9, 10, 17],
        'environment'       => [11, 12, 13, 14, 15],
        'disaster-risk'     => [1, 11, 13, 17],
    ];

    public static array $beneficiaries = [
        'barangay-officials'  => 'Barangay Officials/Leaders',
        'women'               => 'Women',
        'children'            => 'Children',
        'pwd'                 => 'Person with Disability',
        'elderly'             => 'Elderly',
        'vulnerable-sectors'  => 'Other Vulnerable Sectors',
    ];

    public function pin()
    {
        return $this->belongsTo(Pin::class);
    }
    
    public function budget()
    {
        return $this->hasOne(Budget::class);
    }

    public function requests()
    {
        return $this->hasMany(ProgramRequest::class);
    }

    public function pendingRequests()
    {
        return $this->hasMany(ProgramRequest::class)->where('status', 'pending');
    }

    public function sdgs()
    {
        return $this->belongsToMany(Sdg::class, 'program_sdg');
    }
    
    public static array $statuses = [
        'proposed'  => ['label' => 'Proposed',  'color' => '#b5830a'],
        'approved'  => ['label' => 'Approved',  'color' => '#2980b9'],
        'ongoing'   => ['label' => 'Ongoing',   'color' => '#27ae60'],
        'completed' => ['label' => 'Completed', 'color' => '#16a085'],
        'cancelled' => ['label' => 'Cancelled', 'color' => '#c0392b'],
    ];
}