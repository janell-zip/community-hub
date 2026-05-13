(function () {
    'use strict';

    const data = window.DASH_DATA || {};

    Chart.defaults.font.family = 'Manrope, sans-serif';
    Chart.defaults.color = '#6b7280';

    const GRID_COLOR = '#f0f0f0';

    function buildLegend(containerId, labels, colors, counts) {
        const el = document.getElementById(containerId);
        if (!el) return;
        el.innerHTML = labels.map((label, i) => `
            <div class="dash-legend-item">
                <span class="dash-legend-dot" style="background:${colors[i] || '#888'}"></span>
                <span class="dash-legend-label">${label}</span>
                <span class="dash-legend-count">${counts[i] ?? 0}</span>
            </div>`).join('');
    }

    // ── Status Donut ──
    const statusEntries = Object.values(data.status || {});
    new Chart(document.getElementById('chart-status'), {
        type: 'doughnut',
        data: {
            labels: statusEntries.map(s => s.label),
            datasets: [{
                data: statusEntries.map(s => s.count),
                backgroundColor: statusEntries.map(s => s.color),
                borderWidth: 3,
                borderColor: '#fff',
                hoverOffset: 6,
            }]
        },
        options: {
            cutout: '70%',
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw}` } }
            }
        }
    });
    buildLegend('legend-status',
        statusEntries.map(s => s.label),
        statusEntries.map(s => s.color),
        statusEntries.map(s => s.count)
    );

    // ── Timeline Line ──
    const tl = data.timeline || [];
    new Chart(document.getElementById('chart-timeline'), {
        type: 'line',
        data: {
            labels: tl.map(t => t.label),
            datasets: [{
                label: 'Programs Added',
                data: tl.map(t => t.count),
                borderColor: '#1a3a2a',
                backgroundColor: 'rgba(26,58,42,0.08)',
                borderWidth: 2.5,
                pointBackgroundColor: '#1a3a2a',
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.4,
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 },
                    grid: { color: GRID_COLOR }
                },
                x: { grid: { display: false } }
            }
        }
    });

    // Stacked Bar: Component + Status
    const catEntries = Object.values(data.category || {});
    const statusList = Object.entries(data.status || {});

    // Build stacked from raw status+category breakdown
    const stackedCounts = data.stackedByCategory || {};
    const stackedDatasetsFinal = statusList.map(([key, s]) => ({
        label: s.label,
        data: catEntries.map(c => {
            const catKey = Object.keys(data.category || {}).find(k => data.category[k].label === c.label);
            return stackedCounts[catKey]?.[key] ?? 0;
        }),
        backgroundColor: s.color + 'cc',
        borderColor: s.color,
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
    }));

    new Chart(document.getElementById('chart-stacked'), {
        type: 'bar',
        data: {
            labels: catEntries.map(c => c.label),
            datasets: stackedDatasetsFinal,
        },
        options: {
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: { size: 11 },
                        boxWidth: 12,
                        padding: 16,
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    beginAtZero: true,
                    ticks: { stepSize: 1 },
                    grid: { color: GRID_COLOR }
                },
                y: {
                    stacked: true,
                    grid: { display: false }
                }
            }
        }
    });

    // Radar: Component Overview
    const radarCats = Object.keys(data.category || {});
    const radarLabels = radarCats.map(k => data.category[k].label);
    const radarReach  = radarCats.map(k => data.reachByCategory?.[k]?.reach ?? 0);
    const radarCount  = radarCats.map(k => data.category[k].count ?? 0);

    // Normalize to 0-10 scale for readability
    const maxReach = Math.max(...radarReach, 1);
    const maxCount = Math.max(...radarCount, 1);
    const normalizedReach = radarReach.map(v => parseFloat(((v / maxReach) * 10).toFixed(1)));
    const normalizedCount = radarCount.map(v => parseFloat(((v / maxCount) * 10).toFixed(1)));

    new Chart(document.getElementById('chart-radar'), {
        type: 'radar',
        data: {
            labels: radarLabels,
            datasets: [
                {
                    label: 'Reach (normalized)',
                    data: normalizedReach,
                    borderColor: '#2980b9',
                    backgroundColor: 'rgba(41,128,185,0.12)',
                    borderWidth: 2,
                    pointBackgroundColor: '#2980b9',
                    pointRadius: 3,
                },
                {
                    label: 'Program Count (normalized)',
                    data: normalizedCount,
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39,174,96,0.12)',
                    borderWidth: 2,
                    pointBackgroundColor: '#27ae60',
                    pointRadius: 3,
                }
            ]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: { font: { size: 11 }, boxWidth: 12, padding: 12 }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 10,
                    ticks: { stepSize: 2, font: { size: 10 } },
                    grid: { color: GRID_COLOR },
                    pointLabels: { font: { size: 10 } }
                }
            }
        }
    });

    // Polar Area: Beneficiaries 
    const benLabels = data.beneficiaryLabels || [];
    const benCounts = Object.values(data.beneficiaryCounts || {});
    const benColors = [
        '#16a085','#c0392b','#27ae60','#2980b9',
        '#e67e22','#8e44ad','#1a9e6e'
    ];
    new Chart(document.getElementById('chart-beneficiaries'), {
        type: 'polarArea',
        data: {
            labels: benLabels,
            datasets: [{
                data: benCounts,
                backgroundColor: benColors.slice(0, benLabels.length).map(c => c + 'bb'),
                borderColor: benColors.slice(0, benLabels.length),
                borderWidth: 1.5,
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw}` } }
            },
            scales: {
                r: {
                    ticks: { display: false },
                    grid: { color: GRID_COLOR }
                }
            }
        }
    });
    buildLegend('legend-beneficiaries', benLabels, benColors, benCounts);

    // SDG Coverage Bar
    const sdg = data.sdgCoverage || [];
    new Chart(document.getElementById('chart-sdg'), {
        type: 'bar',
        data: {
            labels: sdg.map(s => `SDG ${s.number}: ${s.title}`),
            datasets: [{
                data: sdg.map(s => s.count),
                backgroundColor: sdg.map(s => s.color + 'cc'),
                borderColor: sdg.map(s => s.color),
                borderWidth: 1.5,
                borderRadius: 6,
                borderSkipped: false,
            }]
        },
        options: {
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 },
                    grid: { color: GRID_COLOR }
                },
                y: {
                    grid: { display: false },
                    ticks: { font: { size: 11 } }
                }
            }
        }
    });

    // Activity Types Bar
    const actData = data.activity || [];
    new Chart(document.getElementById('chart-activity'), {
        type: 'bar',
        data: {
            labels: actData.map(a => a.activity),
            datasets: [{
                data: actData.map(a => a.count),
                backgroundColor: actData.map(a => a.color + 'cc'),
                borderColor: actData.map(a => a.color),
                borderWidth: 1.5,
                borderRadius: 6,
                borderSkipped: false,
            }]
        },
        options: {
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 },
                    grid: { color: GRID_COLOR }
                },
                y: {
                    grid: { display: false },
                    ticks: { font: { size: 11 } }
                }
            }
        }
    });

})();