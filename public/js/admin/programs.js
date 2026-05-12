(function () {
    'use strict';

    // Data
    let programs   = window.PROGRAMS_DATA   || [];
    const cats     = window.CATEGORIES_DATA || {};
    const statuses = window.STATUSES_DATA   || {};
    const storeUrl = window.PROGRAMS_STORE_URL;
    const csrf     = window.CSRF_TOKEN;
    const allSdgs      = window.SDGS_DATA       || [];
    const activityTypes = window.ACTIVITY_TYPES_DATA || {};
    const sdgMap       = window.SDG_MAP_DATA    || {};
    const beneficiaries = window.BENEFICIARIES_DATA || {};

    let currentYear  = new Date().getFullYear();
    let currentMonth = new Date().getMonth();
    let activeFilters = { category: '', status: '' };
    let editingId     = null;
    let deleteTarget  = null;
    let detailTarget  = null;
    
    const isSuperAdmin  = window.IS_SUPER_ADMIN || false;
    let pendingRequests  = [];

    // Toast
    let toastTimer = null;

    function showToast(message, type = 'success') {
        let toast = document.getElementById('pg-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'pg-toast';
            toast.className = 'pgtoast';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            document.body.appendChild(toast);
        }

        const icon = type === 'success'
            ? `<svg class="pgtoast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`
            : `<svg class="pgtoast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

        toast.className = `pgtoast pgtoast--${type}`;
        toast.innerHTML = `${icon}<span>${message}</span>`;

        clearTimeout(toastTimer);
        requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('is-visible')));
        toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3500);
    }

    function checkDateConflicts() {
        const startVal = document.getElementById('pg-start').value;
        const endVal   = document.getElementById('pg-end').value;

        // Clean up any existing warning first
        document.getElementById('pgmodal-date-conflict')?.remove();

        if (!startVal || !endVal) return;

        const start = new Date(startVal);
        const end   = new Date(endVal);

        const conflicts = programs.filter(p => {
            if (p.status !== 'approved') return false;
            if (editingId && p.id === editingId) return false;
            const pStart = new Date(p.start_at);
            const pEnd   = new Date(p.end_at);
            return start <= pEnd && end >= pStart;
        });

        if (conflicts.length > 0) {
            const names = conflicts.map(p => `<strong>${p.title}</strong>`).join(', ');
            const div = document.createElement('div');
            div.id        = 'pgmodal-date-conflict';
            div.className = 'pgmodal-conflict-warning';
            div.innerHTML = `This date overlaps with approved program(s): ${names}. It can still be proposed but may conflict.`;
            errorBox.insertAdjacentElement('beforebegin', div);
        }
    }

    // ── Stats ────────────────────────────────────────────────────
    function updateStats() {
        Object.keys(statuses).forEach(key => {
            const el = document.getElementById(`stat-${key}`);
            if (el) el.textContent = programs.filter(p => p.status === key).length;
        });
    }

    // Filtering 
    function filteredPrograms() {
        return programs.filter(p => {
            if (activeFilters.category && p.category !== activeFilters.category) return false;
            if (activeFilters.status   && p.status   !== activeFilters.status)   return false;
            return true;
        });
    }

    // Calendar
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
        const visible   = filteredPrograms();

        // Programs indexed by date string YYYY-MM-DD
        const byDate = {};
        visible.forEach(p => {
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
            cell.className = 'cal-cell';

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

            if (isOutside) cell.classList.add('cal-cell--outside');

            const isToday = !isOutside &&
                day === today.getDate() &&
                currentMonth === today.getMonth() &&
                currentYear  === today.getFullYear();

            if (isToday) cell.classList.add('cal-cell--today');

            const dayEl = document.createElement('span');
            dayEl.className = 'cal-day';
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
                    ev.className = 'cal-event';
                    ev.textContent = p.title;
                    ev.style.background = color + '22';
                    ev.style.color      = color;
                    ev.dataset.id = p.id;
                    if (p.pending_request) {
                        const dot = document.createElement('span');
                        dot.className = 'cal-event-request-dot';
                        ev.appendChild(dot);
                    }
                    cell.appendChild(ev);
                });

                if (cellPrograms.length > maxShow) {
                    const more = document.createElement('div');
                    more.className = 'cal-more';
                    more.textContent = `+${cellPrograms.length - maxShow} more`;
                    more.addEventListener('click', function (e) {
                        e.stopPropagation();
                        openDayPopover(cellPrograms, dateObj, cell);
                    });
                    cell.appendChild(more);
                }

                // Click cell (empty area) to create on that date
                cell.addEventListener('click', function (e) {
                    if (e.target.closest('.cal-event')) return;
                    openCreateModal(dateObj);
                });
            }

            grid.appendChild(cell);
        }

        // Event clicks
        grid.querySelectorAll('.cal-event').forEach(el => {
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
                <div class="pg-day-popover-item" data-id="${p.id}">
                    <span class="pg-day-popover-item-title">${p.title}</span>
                    <div class="pg-day-popover-item-meta">
                        <span class="pg-day-popover-item-dot" style="background:${color}"></span>
                        <span class="pg-day-popover-item-time">${timeStr}</span>
                        ${p.activity_type ? `<span class="pg-day-popover-item-activity">${activityTypes[p.category]?.[p.activity_type] || p.activity_type}</span>` : ''}
                        <span class="pg-day-popover-item-status"
                            style="background:${scolor}22; color:${scolor}">
                            ${status.label || p.status}
                        </span>
                    </div>
                </div>`;
        }).join('');

        // Position relative to the anchor cell
        const rect = anchorEl.getBoundingClientRect();
        const popW = 240;
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
        dayPopoverList.querySelectorAll('.pg-day-popover-item').forEach(item => {
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
     
    // ── Filter buttons ───────────────────────────────────────────
    document.querySelectorAll('.pgfbtn').forEach(btn => {
        btn.addEventListener('click', function () {
            const filter = this.dataset.filter;
            const value  = this.dataset.value;
            activeFilters[filter] = value;

            this.closest('.pg-filter-btns').querySelectorAll('.pgfbtn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderCalendar();
        });
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

    document.querySelectorAll('.pgmodal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay) closeOverlay(overlay.id);
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            ['program-modal', 'program-delete-modal', 'program-detail-modal'].forEach(closeOverlay);
        }
    });

    // Form Modal (Create / Edit)
    const form       = document.getElementById('program-form');
    const errorBox   = document.getElementById('pgmodal-error');
    const saveBtn    = document.getElementById('pgmodal-save');
    const btnText    = saveBtn.querySelector('.pgmodal-btn-text');
    const btnSpinner = saveBtn.querySelector('.pgmodal-btn-spinner');

    function resetForm() {
        document.getElementById('pgmodal-date-conflict')?.remove();
        form.reset();
        errorBox.hidden = true;
        form.querySelectorAll('.pgfield-input').forEach(i => i.classList.remove('is-invalid'));
        editingId = null;
        pinSearch.value   = '';
        pinIdInput.value  = '';
        pinLocInput.value = '';
        pinHint.hidden    = true;
        pinDropdown.hidden = true;
        document.getElementById('pg-activity-type').value = '';
        document.getElementById('pg-activity-type-wrap').style.display = 'none';
        renderSdgPicker([]);
        document.getElementById('pg-reach').value = '';
        renderBeneficiaryPicker([]);

        const now    = new Date();
        const pad    = n => String(n).padStart(2, '0');
        const minVal = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
        document.getElementById('pg-start').min = minVal;
        document.getElementById('pg-end').min   = minVal;

        // If admin, status is fixed — reset hidden input to proposed
        const statusInput = document.getElementById('pg-status');
        if (statusInput && statusInput.type === 'hidden') {
            statusInput.value = 'proposed';
        }
    }

    function setFormLoading(loading) {
        saveBtn.disabled  = loading;
        btnText.hidden    = loading;
        btnSpinner.hidden = !loading;
    }

    function openCreateModal(dateObj) {
        resetForm();
        document.getElementById('pgmodal-title').textContent = 'Add Program';
        btnText.textContent = 'Save Program';

        if (dateObj) {
            const pad = n => String(n).padStart(2, '0');
            const y   = dateObj.getFullYear();
            const mo  = pad(dateObj.getMonth() + 1);
            const d   = pad(dateObj.getDate());
            document.getElementById('pg-start').value = `${y}-${mo}-${d}T08:00`;
            document.getElementById('pg-end').value   = `${y}-${mo}-${d}T17:00`;
        }

        openOverlay('program-modal');
        document.getElementById('pg-title').focus();
        checkDateConflicts();
    }

    function openEditModal(prog) {  
        resetForm();

        document.getElementById('pg-start').min = '';
        document.getElementById('pg-end').min   = '';
        editingId = prog.id;
        document.getElementById('pgmodal-title').textContent = 'Edit Program';
        btnText.textContent = 'Save Changes';

        document.getElementById('pg-title').value       = prog.title;
        document.getElementById('pg-description').value = prog.description || '';
        const matchedPin = prog.pin_id ? pins.find(p => p.id === prog.pin_id) : null;
        if (matchedPin) {
            pinSearch.value     = matchedPin.location;
            pinIdInput.value    = matchedPin.id;
            pinLocInput.value   = '';
            pinHint.textContent = `Linked to pin: ${matchedPin.label}`;
            pinHint.hidden      = false;
        } else if (prog.location) {
            pinSearch.value     = prog.location;
            pinLocInput.value   = prog.location;
            pinHint.textContent = 'Custom location (not linked to a pin)';
            pinHint.hidden      = false;
        }

        pinDropdown.hidden = true;
        document.getElementById('pg-status').value   = prog.status;
        document.getElementById('pg-category').value = prog.category;
        populateActivityTypes(prog.category);
        document.getElementById('pg-activity-type').value = prog.activity_type || '';

        renderSdgPicker(prog.sdgs || []);

        document.getElementById('pg-reach').value = prog.reach || '';
        renderBeneficiaryPicker(prog.target_beneficiaries || []);

        const toLocal = iso => {
            const d = new Date(iso);
            const pad = n => String(n).padStart(2,'0');
            return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        };

        document.getElementById('pg-start').value = toLocal(prog.start_at);
        document.getElementById('pg-end').value   = toLocal(prog.end_at);

        // Super Admin editing completed/cancelled: lock all fields except description & status
        const lockedStatuses = ['completed', 'cancelled'];
        const isLocked = isSuperAdmin && lockedStatuses.includes(prog.status);

        const lockedFields = [
            document.getElementById('pg-title'),
            document.getElementById('pg-category'),
            document.getElementById('pg-start'),
            document.getElementById('pg-end'),
            pinSearch,
        ];

        lockedFields.forEach(el => {
            if (!el) return;
            el.disabled = isLocked;
            el.style.opacity = isLocked ? '0.45' : '';
            el.style.cursor  = isLocked ? 'not-allowed' : '';
            if (isLocked) {
                el.addEventListener('focus', _lockedFieldToast, { once: false });
                el.addEventListener('click', _lockedFieldToast, { once: false });
            } else {
                el.removeEventListener('focus', _lockedFieldToast);
                el.removeEventListener('click', _lockedFieldToast);
            }
        });

        openOverlay('program-modal');

        if (isLocked) {
            document.getElementById('pg-description').focus();
        } else {
            document.getElementById('pg-title').focus();
        }

        checkDateConflicts();
    }

    function _lockedFieldToast() {
        showToast('Only description and status can be edited for completed or cancelled programs.', 'error');
    }

    // ── Pin Dropdown ─────────────────────────────────────────────
    const pins         = window.PINS_DATA || [];
    const pinSearch    = document.getElementById('pg-pin-search');
    const pinDropdown  = document.getElementById('pg-pin-dropdown');
    const pinIdInput   = document.getElementById('pg-pin-id');
    const pinLocInput  = document.getElementById('pg-location');
    const pinHint      = document.getElementById('pg-pin-hint');
    let focusedIndex   = -1;

    function renderPinDropdown(query) {
        const q           = query.toLowerCase().trim();
        const selectedCat = document.getElementById('pg-category').value;
        const filtered    = selectedCat
            ? pins.filter(p => p.category === selectedCat)
            : pins;
        const matches     = q
            ? filtered.filter(p => p.label.toLowerCase().includes(q) || p.barangay.toLowerCase().includes(q))
            : filtered;

        pinDropdown.innerHTML = '';
        focusedIndex = -1;

        matches.slice(0, 10).forEach((pin, i) => {
            const cat   = cats[pin.category] || {};
            const color = cat.color || '#888';
            const div   = document.createElement('div');
            div.className = 'pgpin-option';
            div.dataset.index = i;
            div.innerHTML = `
                <span class="pgpin-option-name">${pin.label}</span>
                <div class="pgpin-option-meta">
                    <span class="pgpin-option-dot" style="background:${color}"></span>
                    <span class="pgpin-option-barangay">${pin.barangay || 'No barangay'}</span>
                </div>`;
            div.addEventListener('mousedown', function (e) {
                e.preventDefault();
                selectPin(pin);
            });
            pinDropdown.appendChild(div);
        });

        // Free-text fallback option
        if (q) {
            const custom = document.createElement('div');
            custom.className = 'pgpin-custom';
            custom.innerHTML = `Use "<strong>${query}</strong>" as custom location`;
            custom.addEventListener('mousedown', function (e) {
                e.preventDefault();
                selectCustom(query);
            });
            pinDropdown.appendChild(custom);
        }

        pinDropdown.hidden = pinDropdown.children.length === 0;
    }

    function selectPin(pin) {
        pinSearch.value    = pin.location;
        pinIdInput.value   = pin.id;
        pinLocInput.value  = '';          // clear any custom location
        pinDropdown.hidden = true;

        // Auto-suggest category — applies on create; on edit, always update to match pin
        const catSelect = document.getElementById('pg-category');
        if (pin.category) {
            catSelect.value = pin.category;
        }

        pinHint.textContent = `Linked to pin: ${pin.label}`;
        pinHint.hidden = false;
    }

    function selectCustom(text) {
        pinSearch.value    = text;
        pinIdInput.value   = '';
        pinLocInput.value  = text;
        pinDropdown.hidden = true;
        pinHint.textContent = 'Custom location (not linked to a pin)';
        pinHint.hidden = false;
    }

    function clearPinSelection() {
        pinIdInput.value   = '';
        pinLocInput.value  = '';
        pinHint.hidden     = true;
        pinDropdown.hidden = true;
    }

    pinSearch.addEventListener('input', function () {
        clearPinSelection();
        renderPinDropdown(this.value);
    });

    pinSearch.addEventListener('focus', function () {
        renderPinDropdown(this.value);
    });

    document.getElementById('pg-category').addEventListener('change', function () {
        pinSearch.value = '';
        clearPinSelection();
        pinDropdown.hidden = true;
        populateActivityTypes(this.value);
        document.getElementById('pg-activity-type').value = '';
        autoSuggestSdgs(this.value);
    });

    // Activity Type Dropdown
    function populateActivityTypes(categorySlug) {
        const select  = document.getElementById('pg-activity-type');
        const wrapper = document.getElementById('pg-activity-type-wrap');
        const types   = activityTypes[categorySlug] || {};
        const entries = Object.entries(types);

        select.innerHTML = '<option value="" disabled selected>Select activity type</option>';
        entries.forEach(([slug, label]) => {
            const opt = document.createElement('option');
            opt.value = slug;
            opt.textContent = label;
            select.appendChild(opt);
        });

        wrapper.style.display = entries.length > 0 ? 'flex' : 'none';
    }

    // SDG Picker
    function renderSdgPicker(selectedIds) {
        const container = document.getElementById('pg-sdg-picker');
        if (!container) return;

        container.innerHTML = allSdgs.map(sdg => {
            const isSelected = selectedIds.includes(sdg.id);
            return `
                <button type="button"
                    class="sdg-chip ${isSelected ? 'sdg-chip--selected' : ''}"
                    data-sdg-id="${sdg.id}"
                    style="--sdg-color: ${sdg.color}">
                    <span class="sdg-chip-num">${sdg.number}</span>
                    <span class="sdg-chip-label">${sdg.title}</span>
                </button>`;
        }).join('');

        container.querySelectorAll('.sdg-chip').forEach(chip => {
            chip.addEventListener('click', function () {
                this.classList.toggle('sdg-chip--selected');
                syncSdgHiddenInputs();
            });
        });

        syncSdgHiddenInputs();
    }

    function syncSdgHiddenInputs() {
        const container  = document.getElementById('pg-sdg-picker');
        const hiddenWrap = document.getElementById('pg-sdg-hidden');
        if (!container || !hiddenWrap) return;

        hiddenWrap.innerHTML = '';
        container.querySelectorAll('.sdg-chip--selected').forEach(chip => {
            const input = document.createElement('input');
            input.type  = 'hidden';
            input.name  = 'sdg_ids[]';
            input.value = chip.dataset.sdgId;
            hiddenWrap.appendChild(input);
        });
    }

    function renderBeneficiaryPicker(selectedValues) {
        const dropdown = document.getElementById('pg-beneficiary-dropdown');
        if (!dropdown) return;
        dropdown.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = selectedValues.includes(cb.value);
        });
        updateBeneficiaryLabel();
    }

    function updateBeneficiaryLabel() {
        const dropdown = document.getElementById('pg-beneficiary-dropdown');
        const label    = document.getElementById('pg-beneficiary-label');
        if (!dropdown || !label) return;
        const checked = [...dropdown.querySelectorAll('input:checked')].map(cb => {
            return beneficiaries[cb.value] || cb.value;
        });
        label.textContent = checked.length > 0
            ? checked.length === 1 ? checked[0] : `${checked.length} selected`
            : 'Select beneficiaries...';
    }

    function syncBeneficiaryHiddenInputs() {
        const container  = document.getElementById('pg-beneficiary-picker');
        const hiddenWrap = document.getElementById('pg-beneficiary-hidden');
        if (!container || !hiddenWrap) return;

        hiddenWrap.innerHTML = '';
        container.querySelectorAll('.beneficiary-chip--selected').forEach(chip => {
            const input = document.createElement('input');
            input.type  = 'hidden';
            input.name  = 'target_beneficiaries[]';
            input.value = chip.dataset.value;
            hiddenWrap.appendChild(input);
        });
    }

    document.getElementById('pg-beneficiary-trigger')?.addEventListener('click', function () {
        const dropdown = document.getElementById('pg-beneficiary-dropdown');
        if (!dropdown) return;
        dropdown.hidden = !dropdown.hidden;
        this.classList.toggle('is-open', !dropdown.hidden);
    });

    document.getElementById('pg-beneficiary-dropdown')?.addEventListener('change', function () {
        updateBeneficiaryLabel();
    });

    document.addEventListener('click', function (e) {
        const wrap = document.getElementById('pg-beneficiary-wrap');
        if (wrap && !wrap.contains(e.target)) {
            const dropdown = document.getElementById('pg-beneficiary-dropdown');
            if (dropdown) dropdown.hidden = true;
            document.getElementById('pg-beneficiary-trigger')?.classList.remove('is-open');
        }
    });

    function autoSuggestSdgs(categorySlug) {
        const suggested = sdgMap[categorySlug] || [];
        const sdgIds    = allSdgs
            .filter(s => suggested.includes(s.number))
            .map(s => s.id);
        renderSdgPicker(sdgIds);
    }

    pinSearch.addEventListener('blur', function () {
        setTimeout(() => { pinDropdown.hidden = true; }, 150);

        // If no pin selected and text exists, treat as custom
        if (!pinIdInput.value && this.value.trim()) {
            pinLocInput.value = this.value.trim();
            pinHint.textContent = 'Custom location (not linked to a pin)';
            pinHint.hidden = false;
        }
    });

    pinSearch.addEventListener('keydown', function (e) {
        const options = pinDropdown.querySelectorAll('.pgpin-option, .pgpin-custom');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            focusedIndex = Math.min(focusedIndex + 1, options.length - 1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            focusedIndex = Math.max(focusedIndex - 1, 0);
        } else if (e.key === 'Enter' && focusedIndex >= 0) {
            e.preventDefault();
            options[focusedIndex]?.dispatchEvent(new Event('mousedown'));
            return;
        } else if (e.key === 'Escape') {
            pinDropdown.hidden = true;
            return;
        }
        options.forEach((o, i) => o.classList.toggle('is-focused', i === focusedIndex));
    });

    document.getElementById('pg-start').addEventListener('change', function () {
        if (editingId === null) {
            document.getElementById('pg-end').min = this.value;
        }
        checkDateConflicts();
    });

    document.getElementById('pg-end').addEventListener('change', function () {
        checkDateConflicts();
    });
    document.getElementById('open-program-create').addEventListener('click', () => openCreateModal(null));
    document.getElementById('pgmodal-close').addEventListener('click',  () => closeOverlay('program-modal'));
    document.getElementById('pgmodal-cancel').addEventListener('click', () => closeOverlay('program-modal'));

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        setFormLoading(true);
        errorBox.hidden = true;
        form.querySelectorAll('.pgfield-input').forEach(i => i.classList.remove('is-invalid'));

        const isEdit = editingId !== null;
        const url    = isEdit ? `${window.PROGRAMS_UPDATE_URL}${editingId}` : storeUrl;
        const body   = new FormData(form);
        if (isEdit) body.append('_method', 'PUT');

        try {
            const res  = await fetch(url, {
                method: 'POST',
                headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
                body,
            });
            const data = await res.json();

            if (!res.ok) {
                if (res.status === 422 && data.errors) {
                    const fieldMap = {
                        title: 'pg-title', description: 'pg-description',
                        location: 'pg-location', category: 'pg-category',
                        status: 'pg-status', start_at: 'pg-start', end_at: 'pg-end',
                        activity_type: 'pg-activity-type',
                        reach: 'pg-reach',
                    };
                    const messages = [];
                    for (const [field, errs] of Object.entries(data.errors)) {
                        messages.push(...errs);
                        if (fieldMap[field]) document.getElementById(fieldMap[field]).classList.add('is-invalid');
                    }
                    errorBox.textContent = messages.join(' ');
                    errorBox.hidden = false;
                } else {
                    throw new Error(data.message || 'Something went wrong.');
                }
                setFormLoading(false);
                return;
            }

            if (isEdit) {
                programs = programs.map(p => p.id === data.program.id ? data.program : p);
                showToast('Program updated successfully.');
            } else {
                programs.push(data.program);
                showToast('Program added successfully.');
            }

            closeOverlay('program-modal');
            updateStats();
            renderSidebar();
            renderCalendar();
            loadPendingRequests();

        } catch (err) {
            errorBox.textContent = err.message;
            errorBox.hidden = false;
            showToast(err.message, 'error');
        } finally {
            setFormLoading(false);
        }
    });

    // Detail Modal
    function openDetailModal(prog) {
        detailTarget = prog;

        const cat    = cats[prog.category]    || {};
        const status = statuses[prog.status]  || {};

        const catPill = document.getElementById('pgdetail-category');
        catPill.textContent = cat.label || prog.category;
        catPill.style.background = (cat.color || '#888') + '22';
        catPill.style.color      = cat.color || '#888';

        const stPill = document.getElementById('pgdetail-status');
        stPill.textContent = status.label || prog.status;
        stPill.style.background = (status.color || '#888') + '22';
        stPill.style.color      = status.color || '#888';

        document.getElementById('pgdetail-title').textContent = prog.title;

        // Dates
        const fmt = iso => {
            const d = new Date(iso);
            return d.toLocaleString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
        };
        document.getElementById('pgdetail-dates').textContent = `${fmt(prog.start_at)} – ${fmt(prog.end_at)}`;

        // Location
        const locRow = document.getElementById('pgdetail-location-row');
        const locEl  = document.getElementById('pgdetail-location');
        locEl.textContent = prog.location || '';
        locRow.hidden = !prog.location;

        // Description
        const descRow = document.getElementById('pgdetail-desc-row');
        const descEl  = document.getElementById('pgdetail-description');
        descEl.textContent = prog.description || '';
        descRow.hidden = !prog.description;

        const actTypeRow = document.getElementById('pgdetail-activity-row');
        const actTypeEl  = document.getElementById('pgdetail-activity-type');
        if (actTypeRow && actTypeEl) {
            const typeLabel = activityTypes[prog.category]?.[prog.activity_type] || prog.activity_type || '';
            actTypeEl.textContent = typeLabel;
            actTypeRow.hidden = !typeLabel;
        }

        const sdgRow = document.getElementById('pgdetail-sdg-row');
        const sdgEl  = document.getElementById('pgdetail-sdgs');
        if (sdgRow && sdgEl) {
            const progSdgs = allSdgs.filter(s => (prog.sdgs || []).includes(s.id));
            sdgEl.innerHTML = progSdgs.map(s => `
                <span class="sdg-detail-chip" style="--sdg-color:${s.color}">
                    <span class="sdg-chip-num">${s.number}</span>
                    <span class="sdg-chip-label">${s.title}</span>
                </span>`).join('');
            sdgRow.hidden = progSdgs.length === 0;
        }

        const reachRow = document.getElementById('pgdetail-reach-row');
        const reachEl  = document.getElementById('pgdetail-reach');
        if (reachRow && reachEl) {
            reachEl.textContent = prog.reach ? `${prog.reach.toLocaleString()} beneficiaries reached` : '';
            reachRow.hidden = !prog.reach;
        }

        const benRow = document.getElementById('pgdetail-beneficiaries-row');
        const benEl  = document.getElementById('pgdetail-beneficiaries');
        if (benRow && benEl) {
            const selected = prog.target_beneficiaries || [];
            benEl.innerHTML = selected.map(slug => `
                <span class="beneficiary-detail-chip">
                    ${beneficiaries[slug] || slug}
                </span>`).join('');
            benRow.hidden = selected.length === 0;
        }

        const existingBanner = document.getElementById('pgdetail-request-banner');
        if (existingBanner) existingBanner.remove();
        const existingRejection = document.getElementById('pgdetail-rejection-banner');
        if (existingRejection) existingRejection.remove();

        if (!isSuperAdmin && prog.last_rejection_reason && prog.status === 'proposed' && !prog.pending_request) {
            const rejBanner = document.createElement('div');
            rejBanner.id = 'pgdetail-rejection-banner';
            rejBanner.className = 'pgdetail-request-banner pgdetail-request-banner--delete';
            rejBanner.innerHTML = `
                <div class="pgdetail-request-banner-left">
                    <span>Last approval request was rejected</span>
                </div>
                <span style="font-size:0.75rem; opacity:0.85; margin-top:0.25rem; display:block; width:100%">
                    Reason: ${prog.last_rejection_reason}
                </span>`;
            document.querySelector('#program-detail-modal .pgmodal-body').appendChild(rejBanner);
        }

        const pending = prog.pending_request;

        if (pending) {
            const banner = document.createElement('div');
            banner.id = 'pgdetail-request-banner';
            banner.className = `pgdetail-request-banner pgdetail-request-banner--${pending.type}`;
            banner.innerHTML = `
                <div class="pgdetail-request-banner-left">
                    <span> ${pending.type === 'approve' ? 'Approval' : 'Deletion'} request pending</span>
                    <span style="font-weight:400; opacity:0.8">by ${pending.requested_by}</span>
                </div>
                ${!isSuperAdmin ? `<button class="pgmodal-btn--withdraw" id="pgdetail-withdraw" data-request-id="${pending.id}">Withdraw</button>` : ''}`;
            document.querySelector('#program-detail-modal .pgmodal-body').appendChild(banner);

            // Withdraw handler
            const withdrawBtn = banner.querySelector('#pgdetail-withdraw');
            if (withdrawBtn) {
                withdrawBtn.addEventListener('click', async function () {
                    const reqId = this.dataset.requestId;
                    try {
                        const res = await fetch(`/admin/program-requests/${reqId}/withdraw`, {
                            method: 'POST',
                            headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
                            body: (() => { const f = new FormData(); f.append('_method', 'DELETE'); f.append('_token', csrf); return f; })(),
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.message || 'Something went wrong.');

                        programs = programs.map(p => p.id === prog.id ? { ...p, pending_request: null } : p);
                        prog.pending_request = null;
                        banner.remove();

                        // Re-enable request buttons
                        const reqApproveBtn = document.getElementById('pgdetail-request-approve');
                        const reqDeleteBtn  = document.getElementById('pgdetail-request-delete');
                        if (reqApproveBtn) reqApproveBtn.disabled = false;
                        if (reqDeleteBtn)  reqDeleteBtn.disabled  = false;

                        showToast('Request withdrawn.');
                        renderCalendar();
                    } catch (err) {
                        showToast(err.message, 'error');
                    }
                });
            }

            // Disable request buttons if pending request exists
            if (!isSuperAdmin) {
                const reqApproveBtn = document.getElementById('pgdetail-request-approve');
                const reqDeleteBtn  = document.getElementById('pgdetail-request-delete');
                if (reqApproveBtn) reqApproveBtn.disabled = true;
                if (reqDeleteBtn)  reqDeleteBtn.disabled  = true;
            }
        } else {
            // Re-enable request buttons
            if (!isSuperAdmin) {
                const reqApproveBtn = document.getElementById('pgdetail-request-approve');
                const reqDeleteBtn  = document.getElementById('pgdetail-request-delete');
                if (reqApproveBtn) reqApproveBtn.disabled = false;
                if (reqDeleteBtn)  reqDeleteBtn.disabled  = false;
            }
        }

        openOverlay('program-detail-modal');
    }

    // Admin request buttons
    async function submitRequest(type) {
        if (!detailTarget) return;

        try {
            const body = new FormData();
            body.append('_token', csrf);
            body.append('program_id', detailTarget.id);
            body.append('type', type);

            const res  = await fetch(window.PROGRAM_REQUESTS_URL, {
                method: 'POST',
                headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
                body,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Something went wrong.');

            // Update local program data
            programs = programs.map(p => p.id === detailTarget.id
                ? { ...p, pending_request: data.request }
                : p);
            detailTarget = { ...detailTarget, pending_request: data.request };

            // Disable buttons and show banner
            const reqApproveBtn = document.getElementById('pgdetail-request-approve');
            const reqDeleteBtn  = document.getElementById('pgdetail-request-delete');
            if (reqApproveBtn) reqApproveBtn.disabled = true;
            if (reqDeleteBtn)  reqDeleteBtn.disabled  = true;

            // Re-render detail modal body to show banner
            openDetailModal(programs.find(p => p.id === detailTarget.id));

            showToast(`${type === 'approve' ? 'Approval' : 'Deletion'} request submitted.`);
            renderCalendar();

        } catch (err) {
            showToast(err.message, 'error');
        }
    }

    const reqApproveBtn = document.getElementById('pgdetail-request-approve');
    const reqDeleteBtn  = document.getElementById('pgdetail-request-delete');
    if (reqApproveBtn) reqApproveBtn.addEventListener('click', () => submitRequest('approve'));
    if (reqDeleteBtn)  reqDeleteBtn.addEventListener('click',  () => submitRequest('delete'));

    document.getElementById('pgdetailmodal-close').addEventListener('click', () => closeOverlay('program-detail-modal'));

    document.getElementById('pgdetail-edit').addEventListener('click', () => {
        closeOverlay('program-detail-modal');
        if (detailTarget) openEditModal(detailTarget);
    });

    document.getElementById('pgdetail-delete')?.addEventListener('click', () => {
        closeOverlay('program-detail-modal');
        if (detailTarget) openDeleteModal(detailTarget);
    });

    // Delete Modal
    const delConfirm    = document.getElementById('pgdelmodal-confirm');
    const delBtnText    = delConfirm.querySelector('.pgmodal-btn-text');
    const delBtnSpinner = delConfirm.querySelector('.pgmodal-btn-spinner');

    function openDeleteModal(prog) {
        deleteTarget = prog;
        document.getElementById('pgdelete-name').textContent = prog.title;
        openOverlay('program-delete-modal');
    }

    function setDeleteLoading(loading) {
        delConfirm.disabled    = loading;
        delBtnText.hidden      = loading;
        delBtnSpinner.hidden   = !loading;
    }

    document.getElementById('pgdelmodal-close').addEventListener('click',  () => closeOverlay('program-delete-modal'));
    document.getElementById('pgdelmodal-cancel').addEventListener('click', () => closeOverlay('program-delete-modal'));

    delConfirm.addEventListener('click', async function () {
        if (!deleteTarget) return;
        setDeleteLoading(true);

        try {
            const res = await fetch(`/admin/programs/${deleteTarget.id}`, {
                method: 'POST',
                headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
                body: (() => { const f = new FormData(); f.append('_method', 'DELETE'); f.append('_token', csrf); return f; })(),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Something went wrong.');

            const deletedName = deleteTarget.title;
            programs = programs.filter(p => p.id !== deleteTarget.id);
            deleteTarget = null;

            closeOverlay('program-delete-modal');
            showToast(`"${deletedName}" deleted successfully.`);
            updateStats();
            renderSidebar();
            renderCalendar();

        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setDeleteLoading(false);
        }
    });

    // ── Request helpers ──────────────────────────────────────────
    async function loadPendingRequests() {
        if (!isSuperAdmin) return;
        try {
            const res  = await fetch(window.PROGRAM_REQUESTS_PENDING_URL, {
                headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
            });
            pendingRequests = await res.json();
            renderSidebarRequests();
        } catch (e) {
            console.error('Failed to load requests', e);
        }
    }

    // ── Sidebar Requests ─────────────────────────────────────────
    function renderSidebarRequests() {
        if (!isSuperAdmin) return;
        const container = document.getElementById('sidebar-requests');
        const badge     = document.getElementById('sidebar-requests-badge');
        const viewAll   = document.getElementById('sidebar-requests-view-all');
        if (!container) return;

        const total   = pendingRequests.length;
        const showing = pendingRequests.slice(0, 5);

        if (badge) {
            badge.textContent = total;
            badge.hidden = total === 0;
        }

        if (viewAll) viewAll.hidden = total <= 5;

        if (total === 0) {
            container.innerHTML = `<span class="pgsidebar-empty-requests">No pending requests.</span>`;
            return;
        }

        container.innerHTML = showing.map(r => `
            <div class="pgsidebar-request-card" data-request-id="${r.id}">
                <span class="pgsidebar-request-title">${r.program_title}</span>
                <div class="pgsidebar-request-meta">
                    <span class="pgsidebar-request-type pgsidebar-request-type--${r.type}">
                        ${r.type === 'approve' ? 'Approval' : 'Deletion'}
                    </span>
                    <span class="pgsidebar-request-by">by ${r.requested_by}</span>
                </div>
                <div class="pgsidebar-request-actions">
                    <button class="pgsidebar-action-btn pgsidebar-action-btn--approve"
                        data-request-id="${r.id}" data-decision="approved">
                        ${r.type === 'approve' ? 'Approve' : 'Delete Program'}
                    </button>
                    <button class="pgsidebar-action-btn pgsidebar-action-btn--reject"
                        data-request-id="${r.id}">
                        Reject
                    </button>
                </div>
                <div class="pgsidebar-reject-expand" id="reject-expand-${r.id}" hidden>
                    <textarea class="pgsidebar-reject-textarea" id="reject-reason-${r.id}"
                        placeholder="Reason for rejection (required)..." rows="2"></textarea>
                    <div class="pgsidebar-reject-actions">
                        <button class="pgsidebar-action-btn pgsidebar-action-btn--reject-confirm"
                            data-request-id="${r.id}">Confirm Reject</button>
                        <button class="pgsidebar-action-btn pgsidebar-action-btn--reject-cancel"
                            data-request-id="${r.id}">Cancel</button>
                    </div>
                </div>
            </div>`).join('');

        // Approve buttons
        container.querySelectorAll('.pgsidebar-action-btn--approve').forEach(btn => {
            btn.addEventListener('click', async function () {
                await actionRequest(this.dataset.requestId, 'approved');
            });
        });

        // Reject — toggle inline expand
        container.querySelectorAll('.pgsidebar-action-btn--reject').forEach(btn => {
            btn.addEventListener('click', function () {
                const expand = document.getElementById(`reject-expand-${this.dataset.requestId}`);
                if (expand) {
                    expand.hidden = !expand.hidden;
                    if (!expand.hidden) {
                        expand.querySelector('textarea')?.focus();
                    }
                }
            });
        });

        // Confirm reject
        container.querySelectorAll('.pgsidebar-action-btn--reject-confirm').forEach(btn => {
            btn.addEventListener('click', async function () {
                const requestId = this.dataset.requestId;
                const textarea  = document.getElementById(`reject-reason-${requestId}`);
                const reason    = textarea?.value.trim() || '';
                if (!reason) {
                    textarea?.classList.add('is-invalid');
                    textarea?.focus();
                    showToast('Please enter a reason for rejection.', 'error');
                    return;
                }
                textarea?.classList.remove('is-invalid');
                await actionRequest(requestId, 'rejected', reason);
            });
        });

        // Cancel reject
        container.querySelectorAll('.pgsidebar-action-btn--reject-cancel').forEach(btn => {
            btn.addEventListener('click', function () {
                const expand = document.getElementById(`reject-expand-${this.dataset.requestId}`);
                if (expand) expand.hidden = true;
            });
        });
    }

    // ── All requests overlay ─────────────────────────────────────
    function renderRequestsOverlay() {
        const list = document.getElementById('requests-overlay-list');
        if (!list) return;

        if (pendingRequests.length === 0) {
            list.innerHTML = `<span class="pgsidebar-empty-requests">No pending requests.</span>`;
            return;
        }

        list.innerHTML = pendingRequests.map(r => `
            <div class="pg-requests-panel-item" data-request-id="${r.id}">
                <span class="pg-requests-panel-item-title">${r.program_title}</span>
                <div class="pg-requests-panel-item-meta">
                    <span class="pgsidebar-request-type pgsidebar-request-type--${r.type}">
                        ${r.type === 'approve' ? 'Approval Request' : 'Deletion Request'}
                    </span>
                    <span class="pgsidebar-request-by">by ${r.requested_by} · ${r.requested_at}</span>
                </div>
                <div class="pg-requests-panel-item-actions">
                    <button class="pgsidebar-action-btn pgsidebar-action-btn--approve"
                        data-request-id="${r.id}">
                        ${r.type === 'approve' ? 'Approve' : 'Delete Program'}
                    </button>
                    <button class="pgsidebar-action-btn pgsidebar-action-btn--reject"
                        data-request-id="${r.id}">
                        Reject
                    </button>
                </div>
                <div class="pgsidebar-reject-expand" id="reject-expand-overlay-${r.id}" hidden>
                    <textarea class="pgsidebar-reject-textarea" id="reject-reason-overlay-${r.id}"
                        placeholder="Reason for rejection (required)..." rows="2"></textarea>
                    <div class="pgsidebar-reject-actions">
                        <button class="pgsidebar-action-btn pgsidebar-action-btn--reject-confirm"
                            data-request-id="${r.id}" data-overlay="true">Confirm Reject</button>
                        <button class="pgsidebar-action-btn pgsidebar-action-btn--reject-cancel"
                            data-request-id="${r.id}" data-overlay="true">Cancel</button>
                    </div>
                </div>
            </div>`).join('');

        // Approve
        list.querySelectorAll('.pgsidebar-action-btn--approve').forEach(btn => {
            btn.addEventListener('click', async function () {
                await actionRequest(this.dataset.requestId, 'approved');
            });
        });

        // Reject toggle
        list.querySelectorAll('.pgsidebar-action-btn--reject').forEach(btn => {
            btn.addEventListener('click', function () {
                const expand = document.getElementById(`reject-expand-overlay-${this.dataset.requestId}`);
                if (expand) {
                    expand.hidden = !expand.hidden;
                    if (!expand.hidden) expand.querySelector('textarea')?.focus();
                }
            });
        });

        // Confirm reject
        list.querySelectorAll('.pgsidebar-action-btn--reject-confirm').forEach(btn => {
            btn.addEventListener('click', async function () {
                const requestId = this.dataset.requestId;
                const textarea  = document.getElementById(`reject-reason-overlay-${requestId}`);
                const reason    = textarea?.value.trim() || '';
                if (!reason) {
                    textarea?.classList.add('is-invalid');
                    textarea?.focus();
                    showToast('Please enter a reason for rejection.', 'error');
                    return;
                }
                textarea?.classList.remove('is-invalid');
                await actionRequest(requestId, 'rejected', reason);
            });
        });

        // Cancel reject
        list.querySelectorAll('.pgsidebar-action-btn--reject-cancel').forEach(btn => {
            btn.addEventListener('click', function () {
                const expand = document.getElementById(`reject-expand-overlay-${this.dataset.requestId}`);
                if (expand) expand.hidden = true;
            });
        });
    }

    const requestsOverlay = document.getElementById('requests-overlay');
    const viewAllBtn      = document.getElementById('sidebar-requests-view-all');

    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            renderRequestsOverlay();
            requestsOverlay.classList.add('is-open');
            document.body.style.overflow = 'hidden';
        });
    }

    const overlayCloseBtn = document.getElementById('requests-overlay-close');
    if (overlayCloseBtn) {
        overlayCloseBtn.addEventListener('click', () => {
            requestsOverlay.classList.remove('is-open');
            document.body.style.overflow = '';
        });
    }

    if (requestsOverlay) {
        requestsOverlay.addEventListener('click', function (e) {
            if (e.target === requestsOverlay) {
                requestsOverlay.classList.remove('is-open');
                document.body.style.overflow = '';
            }
        });
    }

    // ── Action a request (Super Admin) ───────────────────────────
    async function actionRequest(requestId, decision, rejectionReason = '') {
        try {
            const res  = await fetch(`/admin/program-requests/${requestId}/action`, {
                method: 'POST',
                headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
                body: (() => {
                    const f = new FormData();
                    f.append('_method', 'PATCH');
                    f.append('_token', csrf);
                    f.append('decision', decision);
                    if (rejectionReason) f.append('rejection_reason', rejectionReason);
                    return f;
                })(),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Something went wrong.');

            // Remove from pending list
            pendingRequests = pendingRequests.filter(r => r.id != requestId);

            if (data.program_deleted) {
                programs = programs.filter(p => p.id !== data.program?.id);
                closeOverlay('program-detail-modal');
                showToast('Program deleted successfully.');
            } else if (data.program) {
                programs = programs.map(p => {
                    if (p.id === data.program.id) {
                        return {
                            ...p,
                            status: data.program.status,
                            pending_request: null,
                            last_rejection_reason: decision === 'rejected' ? (data.rejection_reason || null) : null,
                        };
                    }
                    return p;
                });
                const action = decision === 'approved' ? 'approved' : 'rejected';
                showToast(`Request ${action}.`);
            }

            renderSidebarRequests();
            renderRequestsOverlay();
            updateStats();
            renderCalendar();

        } catch (err) {
            showToast(err.message, 'error');
        }
    }
    
    // ── Sidebar Recent ───────────────────────────────────────────
    function renderSidebar() {
        const container = document.getElementById('sidebar-recent');
        if (!container) return;

        const recent = [...programs]
            .sort((a, b) => b.id - a.id)
            .slice(0, 5);

        if (recent.length === 0) {
            container.innerHTML = `<span class="pgsidebar-empty">No programs yet.</span>`;
            return;
        }

        container.innerHTML = recent.map(p => {
            const cat   = cats[p.category] || {};
            const color = cat.color || '#888';
            const start = new Date(p.start_at);
            const dateStr = start.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

            return `
                <div class="pgsidebar-program-card" data-id="${p.id}">
                    <span class="pgsidebar-program-title">${p.title}</span>
                    <div class="pgsidebar-program-meta">
                        <span class="pgsidebar-cat-dot" style="background:${color}"></span>
                        <span class="pgsidebar-program-date">${dateStr}</span>
                    </div>
                </div>`;
        }).join('');

        container.querySelectorAll('.pgsidebar-program-card').forEach(card => {
            card.addEventListener('click', function () {
                const prog = programs.find(p => p.id == this.dataset.id);
                if (prog) openDetailModal(prog);
            });
        });
    }

    // ── Init ─────────────────────────────────────────────────────
    updateStats();
    renderSidebar();
    loadPendingRequests();
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            renderCalendar();
        });
    })

})();