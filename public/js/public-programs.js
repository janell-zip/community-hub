(function () {
    'use strict';

    // ── Data ────────────────────────────────────────────────────
    let programs   = window.PROGRAMS_DATA || [];
    const cats     = window.CATEGORIES_DATA || {};
    const statuses = window.STATUSES_DATA || {};

    let currentYear  = new Date().getFullYear();
    let currentMonth = new Date().getMonth();
    let detailTarget = null;

    // ── Calendar ─────────────────────────────────────────────────
    const MONTHS = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];

    function renderCalendar() {
        const label    = document.getElementById('cal-month-label');
        const grid     = document.getElementById('cal-grid');
        label.textContent = `${MONTHS[currentMonth]} ${currentYear}`;
        grid.innerHTML = '';

        const firstDay  = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const prevDays  = new Date(currentYear, currentMonth, 0).getDate();
        const today     = new Date();

        // Programs indexed by date string YYYY-MM-DD
        const byDate = {};
        programs.forEach(p => {
            const start = new Date(p.start_at);
            const end   = new Date(p.end_at);
            // Span all days from start to end
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                if (!byDate[key]) byDate[key] = [];
                if (!byDate[key].find(x => x.id === p.id)) byDate[key].push(p);
            }
        });

        const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

        for (let i = 0; i < totalCells; i++) {
            const cell   = document.createElement('div');
            cell.className = 'pub-cal-cell';

            let day, isOutside = false, dateObj;

            if (i < firstDay) {
                day = prevDays - firstDay + i + 1;
                isOutside = true;
                dateObj = new Date(currentYear, currentMonth - 1, day);
            } else if (i >= firstDay + daysInMonth) {
                day = i - firstDay - daysInMonth + 1;
                isOutside = true;
                dateObj = new Date(currentYear, currentMonth + 1, day);
            } else {
                day = i - firstDay + 1;
                dateObj = new Date(currentYear, currentMonth, day);
            }

            if (isOutside) cell.classList.add('pub-cal-cell--outside');

            const isToday = !isOutside &&
                day === today.getDate() &&
                currentMonth === today.getMonth() &&
                currentYear  === today.getFullYear();

            if (isToday) cell.classList.add('pub-cal-cell--today');

            const dayEl = document.createElement('span');
            dayEl.className = 'pub-cal-day';
            dayEl.textContent = day;
            cell.appendChild(dayEl);

            // Add events for this cell
            if (!isOutside) {
                const key = `${currentYear}-${String(currentMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                const cellPrograms = byDate[key] || [];
                const maxShow = 2;

                cellPrograms.slice(0, maxShow).forEach(p => {
                    const cat   = cats[p.category] || {};
                    const color = cat.color || '#888';
                    const ev    = document.createElement('div');
                    ev.className = 'pub-cal-event';
                    ev.textContent = p.title;
                    ev.style.background = color + '22';
                    ev.style.color      = color;
                    ev.dataset.id = p.id;
                    cell.appendChild(ev);
                });

                if (cellPrograms.length > maxShow) {
                    const more = document.createElement('div');
                    more.className = 'pub-cal-more';
                    more.textContent = `+${cellPrograms.length - maxShow} more`;
                    more.addEventListener('click', function (e) {
                        e.stopPropagation();
                        openDayPopover(cellPrograms, dateObj, cell);
                    });
                    cell.appendChild(more);
                }
            }

            grid.appendChild(cell);
        }

        // Event clicks
        grid.querySelectorAll('.pub-cal-event').forEach(el => {
            el.addEventListener('click', function (e) {
                e.stopPropagation();
                const prog = programs.find(p => p.id == this.dataset.id);
                if (prog) openDetailModal(prog);
            });
        });
    }

    document.getElementById('cal-prev').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        renderCalendar();
    });

    document.getElementById('cal-next').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        renderCalendar();
    });

    document.getElementById('cal-today').addEventListener('click', () => {
        currentMonth = new Date().getMonth();
        currentYear  = new Date().getFullYear();
        renderCalendar();
    });

    renderCalendar();

    // ── Day Popover ──────────────────────────────────────────────
    const dayPopover     = document.getElementById('day-popover');
    const dayPopoverDate = document.getElementById('day-popover-date');
    const dayPopoverList = document.getElementById('day-popover-list');

    function openDayPopover(cellPrograms, dateObj, anchorEl) {
        const months  = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const days    = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        dayPopoverDate.textContent = `${days[dateObj.getDay()]}, ${months[dateObj.getMonth()]} ${dateObj.getDate()}, ${dateObj.getFullYear()}`;

        dayPopoverList.innerHTML = cellPrograms.map(p => {
            const cat    = cats[p.category]   || {};
            const status = statuses[p.status] || {};
            const color  = cat.color    || '#888';
            const scolor = status.color || '#888';

            const [, timePart] = p.start_at.split('T');
            const [h, mi]      = (timePart || '00:00').split(':').map(Number);
            const period       = h >= 12 ? 'PM' : 'AM';
            const hour12       = h % 12 === 0 ? 12 : h % 12;
            const timeStr      = `${hour12}:${String(mi).padStart(2,'0')} ${period}`;

            return `
                <div class="pub-day-popover-item" data-id="${p.id}">
                    <span class="pub-day-popover-item-title">${p.title}</span>
                    <div class="pub-day-popover-item-meta">
                        <span class="pub-day-popover-item-dot" style="background:${color}"></span>
                        <span class="pub-day-popover-item-time">${timeStr}</span>
                        <span class="pub-day-popover-item-status"
                            style="background:${scolor}22; color:${scolor}">
                            ${status.label || p.status}
                        </span>
                    </div>
                </div>`;
        }).join('');

        // Position relative to the anchor cell
        const rect = anchorEl.getBoundingClientRect();
        const popW = 260;
        const popH = 320;

        let top  = rect.bottom + window.scrollY + 4;
        let left = rect.left   + window.scrollX;

        // Flip left if overflowing right edge
        if (left + popW > window.innerWidth - 16) {
            left = rect.right + window.scrollX - popW;
        }

        // Flip up if overflowing bottom edge
        if (top + popH > window.innerHeight + window.scrollY) {
            top = rect.top + window.scrollY - popH - 4;
        }

        dayPopover.style.top  = `${top}px`;
        dayPopover.style.left = `${left}px`;
        dayPopover.hidden = false;

        // Item clicks open detail modal
        dayPopoverList.querySelectorAll('.pub-day-popover-item').forEach(item => {
            item.addEventListener('click', function () {
                const prog = programs.find(p => p.id == this.dataset.id);
                if (prog) {
                    closeDayPopover();
                    openDetailModal(prog);
                }
            });
        });
    }

    function closeDayPopover() {
        dayPopover.hidden = true;
    }

    document.getElementById('day-popover-close').addEventListener('click', closeDayPopover);

    document.addEventListener('click', function (e) {
        if (!dayPopover.hidden && !dayPopover.contains(e.target)) {
            closeDayPopover();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeDayPopover();
    });

    // ── Modal helpers ────────────────────────────────────────────
    function openOverlay(id) {
        const el = document.getElementById(id);
        el.setAttribute('aria-hidden', 'false');
        el.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }

    function closeOverlay(id) {
        const el = document.getElementById(id);
        el.classList.remove('is-open');
        el.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    document.querySelectorAll('.pub-modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeOverlay(overlay.id);
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeOverlay('program-detail-modal');
        }
    });

    // ── Detail Modal ─────────────────────────────────────────────
    function openDetailModal(prog) {
        detailTarget = prog;

        const cat    = cats[prog.category]    || {};
        const status = statuses[prog.status]  || {};

        const catPill = document.getElementById('pub-detail-category');
        catPill.textContent = cat.label || prog.category;
        catPill.style.background = (cat.color || '#888') + '22';
        catPill.style.color      = cat.color || '#888';

        const stPill = document.getElementById('pub-detail-status');
        stPill.textContent = status.label || prog.status;
        stPill.style.background = (status.color || '#888') + '22';
        stPill.style.color      = status.color || '#888';

        document.getElementById('pub-detail-title').textContent = prog.title;

        // Dates
        const fmt = iso => {
            const d = new Date(iso);
            return d.toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
        };
        document.getElementById('pub-detail-dates').textContent = `${fmt(prog.start_at)} – ${fmt(prog.end_at)}`;

        // Location
        const locRow = document.getElementById('pub-detail-location-row');
        const locEl  = document.getElementById('pub-detail-location');
        locEl.textContent = prog.location || '';
        locRow.hidden = !prog.location;

        // Description
        const descRow = document.getElementById('pub-detail-desc-row');
        const descEl  = document.getElementById('pub-detail-description');
        descEl.textContent = prog.description || '';
        descRow.hidden = !prog.description;

        openOverlay('program-detail-modal');
    }

    function closeDetailModal() {
        closeOverlay('program-detail-modal');
    }

    document.getElementById('pub-detail-close').addEventListener('click', closeDetailModal);
})();
