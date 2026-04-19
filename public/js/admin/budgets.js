(function () {
    'use strict';

    const programs   = window.BUDGET_PROGRAMS  || [];
    const cats       = window.CATEGORIES_DATA  || {};
    const storeUrl   = window.BUDGET_STORE_URL;
    const updateBase = window.BUDGET_UPDATE_URL;
    const csrf       = window.CSRF_TOKEN;
    const isSuperAdmin = window.IS_SUPER_ADMIN || false;

    let activeProgramId = null;
    let activeBudgetId  = null;

    // ── Toast ────────────────────────────────────────────────────
    let toastTimer = null;
    function showToast(message, type = 'success') {
        let toast = document.getElementById('bg-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'bg-toast';
            toast.className = 'pgtoast';
            toast.setAttribute('role', 'status');
            document.body.appendChild(toast);
        }
        let icon;
        if (type === 'success') {
            icon = `<svg class="pgtoast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
        } else if (type === 'warning') {
            icon = `<svg class="pgtoast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
        } else {
            icon = `<svg class="pgtoast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
        }
        toast.className = `pgtoast pgtoast--${type}`;
        toast.innerHTML = `${icon}<span>${message}</span>`;
        clearTimeout(toastTimer);
        requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add('is-visible')));
        toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3500);
    }

    // ── Format currency ──────────────────────────────────────────
    function fmt(val) {
        return '₱' + Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // ── Render program sidebar list ──────────────────────────────
    function renderProgramList() {
        const container = document.getElementById('budget-program-list');
        if (!container) return;

        if (programs.length === 0) {
            container.innerHTML = `<span class="budget-empty-list">No approved programs yet.</span>`;
            return;
        }

        container.innerHTML = programs.map(p => {
            const cat   = cats[p.category] || {};
            const color = cat.color || '#888';
            const start = new Date(p.start_at);
            const dateStr = start.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
            const hasBudget = !!p.budget;

            return `
                <div class="budget-program-card ${activeProgramId === p.id ? 'is-active' : ''}"
                    data-id="${p.id}">
                    <span class="budget-program-card-title">${p.title}</span>
                    <div class="budget-program-card-meta">
                        <span class="budget-program-cat-dot" style="background:${color}"></span>
                        <span class="budget-program-card-date">${dateStr}</span>
                    </div>
                    <span class="budget-program-card-badge ${hasBudget ? 'budget-program-card-badge--has' : 'budget-program-card-badge--none'}">
                        ${hasBudget ? 'Has Budget' : 'No Budget'}
                    </span>
                </div>`;
        }).join('');

        container.querySelectorAll('.budget-program-card').forEach(card => {
            card.addEventListener('click', function () {
                const prog = programs.find(p => p.id == this.dataset.id);
                if (prog) selectProgram(prog);
            });
        });
    }

    // ── Select a program ─────────────────────────────────────────
    function selectProgram(prog) {
        activeProgramId = prog.id;
        activeBudgetId  = prog.budget ? prog.budget.id : null;

        renderProgramList();

        // Program bar
        const cat   = cats[prog.category] || {};
        const color = cat.color || '#888';
        const fmt2  = iso => new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
        document.getElementById('budget-program-bar').innerHTML = `
            <span class="budget-program-bar-title">${prog.title}</span>
            <span class="budget-program-bar-cat"
                style="background:${color}22; color:${color}">${cat.label || prog.category}</span>
            <span class="budget-program-bar-dates">${fmt2(prog.start_at)} – ${fmt2(prog.end_at)}</span>`;

        // Program details
        const detailsHtml = `
            <div class="budget-program-details-item">
                <span class="budget-program-details-label">Description</span>
                <span class="budget-program-details-value">${prog.description || 'N/A'}</span>
            </div>
            <div class="budget-program-details-item">
                <span class="budget-program-details-label">Location</span>
                <span class="budget-program-details-value">${prog.location || 'N/A'}</span>
            </div>
            ${prog.pin ? `
            <div class="budget-program-details-item">
                <span class="budget-program-details-label">Barangay</span>
                <span class="budget-program-details-value">${prog.pin.barangay || 'N/A'}</span>
            </div>` : ''}
        `;
        document.getElementById('budget-program-details').innerHTML = detailsHtml;

        // Last edited info
        if (prog.budget && prog.budget.updated_by) {
            const updatedDate = new Date(prog.budget.updated_at);
            const dateStr = updatedDate.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
            const timeStr = updatedDate.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
            document.getElementById('budget-last-edited').innerHTML = 
                `<strong>Last edited:</strong> ${prog.budget.updated_by.name} on ${dateStr} at ${timeStr}`;
            document.getElementById('budget-last-edited').hidden = false;
        } else {
            document.getElementById('budget-last-edited').hidden = true;
        }

        // Allocated amount
        document.getElementById('budget-allocated').value = prog.budget
            ? prog.budget.allocated_amount
            : '';

        // Notes
        document.getElementById('budget-notes').value = prog.budget && prog.budget.notes ? prog.budget.notes : '';

        // Items
        const tbody = document.getElementById('budget-items-body');
        tbody.innerHTML = '';

        const items = prog.budget ? prog.budget.items : [];
        const defaultCount = 3;

        if (items.length > 0) {
            items.forEach(item => addRow(item));
        } else {
            for (let i = 0; i < defaultCount; i++) addRow();
        }

        // Delete button — Super Admin only, only if budget exists
        const deleteBtn = document.getElementById('budget-delete-btn');
        deleteBtn.hidden = !(isSuperAdmin && !!prog.budget);

        // Show form
        document.getElementById('budget-empty').hidden    = true;
        document.getElementById('budget-form-wrap').hidden = false;

        updateTotals();
    }

    // ── Add a row ────────────────────────────────────────────────
    let rowCounter = 0;

    function addRow(item = null) {
        const id    = ++rowCounter;
        const tbody = document.getElementById('budget-items-body');
        const tr    = document.createElement('tr');
        tr.dataset.rowId = id;

        tr.innerHTML = `
            <td class="budget-td">
                <input class="budget-cell-input budget-cell-input--name"
                    type="text" placeholder="Item name"
                    value="${item ? escHtml(item.name) : ''}"
                    data-field="name">
            </td>
            <td class="budget-td budget-td--qty">
                <input class="budget-cell-input budget-cell-input--num"
                    type="number" min="1" placeholder="1"
                    value="${item ? item.quantity : ''}"
                    data-field="quantity"
                    oninput="if(this.value < 1 && this.value !== '') this.value = 1;">
            </td>
            <td class="budget-td budget-td--price">
                <input class="budget-cell-input budget-cell-input--num"
                    type="number" min="0" step="0.01" placeholder="0.00"
                    value="${item ? item.unit_price : ''}"
                    data-field="unit_price"
                    oninput="if(this.value < 0) this.value = 0;">
            </td>
            <td class="budget-td budget-td--total">
                <span class="budget-td-total-value" data-row-total="${id}">
                    ${item ? fmt(item.total) : '₱0.00'}
                </span>
            </td>
            <td class="budget-td budget-td--action">
                <button class="budget-remove-btn" data-remove="${id}" title="Remove row">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </td>`;

        // Live calculation
        const qtyInput   = tr.querySelector('[data-field="quantity"]');
        const priceInput = tr.querySelector('[data-field="unit_price"]');

        function recalcRow() {
            const qty   = parseFloat(qtyInput.value)   || 0;
            const price = parseFloat(priceInput.value) || 0;
            const total = qty * price;
            tr.querySelector(`[data-row-total="${id}"]`).textContent = fmt(total);
            updateTotals();
        }

        qtyInput.addEventListener('input', recalcRow);
        priceInput.addEventListener('input', recalcRow);

        tr.querySelector(`[data-remove="${id}"]`).addEventListener('click', function () {
            const allRows = document.getElementById('budget-items-body').querySelectorAll('tr');
            if (allRows.length === 1) {
                showToast('At least one item is required.', 'error');
                return;
            }
            tr.remove();
            updateTotals();
        });

        tbody.appendChild(tr);
    }

    // ── Update grand total & remaining ───────────────────────────
    let overBudgetWarningShown = false;

    function updateTotals() {
        const rows = document.getElementById('budget-items-body').querySelectorAll('tr');
        let grandTotal = 0;

        rows.forEach(tr => {
            const qty   = parseFloat(tr.querySelector('[data-field="quantity"]')?.value)   || 0;
            const price = parseFloat(tr.querySelector('[data-field="unit_price"]')?.value) || 0;
            grandTotal += qty * price;
        });

        const allocated  = parseFloat(document.getElementById('budget-allocated').value) || 0;
        const remaining  = allocated - grandTotal;
        const isOver     = remaining < 0;

        document.getElementById('budget-grand-total').textContent = fmt(grandTotal);
        const remEl = document.getElementById('budget-remaining');
        remEl.textContent = fmt(remaining);
        remEl.classList.toggle('budget-summary-value--over', isOver);

        // Show over-budget warning toast
        if (isOver && !overBudgetWarningShown) {
            showToast('Budget exceeded! You are going over the allocated amount.', 'warning');
            overBudgetWarningShown = true;
        } else if (!isOver && overBudgetWarningShown) {
            overBudgetWarningShown = false;
        }
    }

    document.getElementById('budget-allocated').addEventListener('input', function () {
        if (this.value < 0) this.value = 0;
        updateTotals();
    });
    document.getElementById('budget-add-row').addEventListener('click', () => addRow());

    // ── Cancel ───────────────────────────────────────────────────
    document.getElementById('budget-cancel-btn').addEventListener('click', () => {
        activeProgramId = null;
        activeBudgetId  = null;
        document.getElementById('budget-empty').hidden     = false;
        document.getElementById('budget-form-wrap').hidden = true;
        renderProgramList();
    });

    // ── Clear ────────────────────────────────────────────────────
    const clearModal        = document.getElementById('budget-clear-modal');
    const clearModalConfirm = document.getElementById('budget-clear-modal-confirm');

    function openClearModal() {
        clearModal.classList.add('is-open');
        clearModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }
    function closeClearModal() {
        clearModal.classList.remove('is-open');
        clearModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    document.getElementById('budget-clear-btn').addEventListener('click', openClearModal);
    document.getElementById('budget-clear-modal-close').addEventListener('click', closeClearModal);
    document.getElementById('budget-clear-modal-cancel').addEventListener('click', closeClearModal);

    clearModal.addEventListener('click', function (e) {
        if (e.target === clearModal) closeClearModal();
    });

    clearModalConfirm.addEventListener('click', function () {
        document.getElementById('budget-allocated').value = '';
        document.getElementById('budget-notes').value = '';

        const tbody = document.getElementById('budget-items-body');
        tbody.innerHTML = '';
        for (let i = 0; i < 3; i++) addRow();

        overBudgetWarningShown = false;
        updateTotals();
        closeClearModal();
        showToast('Form cleared successfully.');
    });

    // ── Save ─────────────────────────────────────────────────────
    const saveBtn    = document.getElementById('budget-save-btn');
    const saveBtnTxt = saveBtn.querySelector('.budget-btn-text');
    const saveSpinner = saveBtn.querySelector('.budget-btn-spinner');
    const formError  = document.getElementById('budget-form-error');

    function setSaveLoading(loading) {
        saveBtn.disabled   = loading;
        saveBtnTxt.hidden  = loading;
        saveSpinner.hidden = !loading;
    }

    saveBtn.addEventListener('click', async function () {
        formError.hidden = true;

        const allocated = parseFloat(document.getElementById('budget-allocated').value);
        if (isNaN(allocated) || allocated < 0) {
            formError.textContent = 'Please enter a valid allocated budget.';
            formError.hidden = false;
            return;
        }

        const rows  = document.getElementById('budget-items-body').querySelectorAll('tr');
        const items = [];
        let hasError = false;

        rows.forEach(tr => {
            const nameInput  = tr.querySelector('[data-field="name"]');
            const qtyInput   = tr.querySelector('[data-field="quantity"]');
            const priceInput = tr.querySelector('[data-field="unit_price"]');

            const name  = nameInput.value.trim();
            const qty   = parseInt(qtyInput.value);
            const price = parseFloat(priceInput.value);

            if (!name) { nameInput.classList.add('is-invalid'); hasError = true; }
            else nameInput.classList.remove('is-invalid');

            if (!qty || qty < 1) { qtyInput.classList.add('is-invalid'); hasError = true; }
            else qtyInput.classList.remove('is-invalid');

            if (isNaN(price) || price < 0) { priceInput.classList.add('is-invalid'); hasError = true; }
            else priceInput.classList.remove('is-invalid');

            items.push({ name, quantity: qty, unit_price: price });
        });

        if (hasError) {
            formError.textContent = 'Please fill in all item fields correctly.';
            formError.hidden = false;
            return;
        }

        setSaveLoading(true);

        try {
            const isEdit = !!activeBudgetId;
            const url    = isEdit ? `${updateBase}${activeBudgetId}` : storeUrl;
            const notes  = document.getElementById('budget-notes').value.trim();
            
            const body   = new FormData();
            body.append('_token', csrf);
            if (isEdit) body.append('_method', 'PUT');
            if (!isEdit) body.append('program_id', activeProgramId);
            body.append('allocated_amount', allocated);
            body.append('notes', notes);
            items.forEach((item, i) => {
                body.append(`items[${i}][name]`,       item.name);
                body.append(`items[${i}][quantity]`,   item.quantity);
                body.append(`items[${i}][unit_price]`, item.unit_price);
            });

            const res  = await fetch(url, {
                method: 'POST',
                headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
                body,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Something went wrong.');

            // Update local programs data
            const idx = programs.findIndex(p => p.id === activeProgramId);
            if (idx !== -1) {
                programs[idx].budget = data.budget;
                activeBudgetId = data.budget.id;
            }

            overBudgetWarningShown = false;
            renderProgramList();
            document.getElementById('budget-delete-btn').hidden = !(isSuperAdmin);
            showToast(isEdit ? 'Budget updated successfully.' : 'Budget saved successfully.');
            // Re-select the program to refresh the display
            selectProgram(programs[idx]);

        } catch (err) {
            formError.textContent = err.message;
            formError.hidden = false;
            showToast(err.message, 'error');
        } finally {
            setSaveLoading(false);
        }
    });

    // ── Delete ───────────────────────────────────────────────────
    const deleteBtn   = document.getElementById('budget-delete-btn');
    const delModal    = document.getElementById('budget-delete-modal');
    const delConfirm  = document.getElementById('budget-del-modal-confirm');
    const delBtnTxt   = delConfirm.querySelector('.pgmodal-btn-text');
    const delSpinner  = delConfirm.querySelector('.pgmodal-btn-spinner');

    function openDelModal() {
        const prog = programs.find(p => p.id === activeProgramId);
        document.getElementById('budget-del-program-name').textContent = prog?.title || '';
        delModal.classList.add('is-open');
        delModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeDelModal() {
        delModal.classList.remove('is-open');
        delModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    deleteBtn.addEventListener('click', openDelModal);
    document.getElementById('budget-del-modal-close').addEventListener('click', closeDelModal);
    document.getElementById('budget-del-modal-cancel').addEventListener('click', closeDelModal);

    delModal.addEventListener('click', function (e) {
        if (e.target === delModal) closeDelModal();
    });

    delConfirm.addEventListener('click', async function () {
        delConfirm.disabled = true;
        delBtnTxt.hidden    = true;
        delSpinner.hidden   = false;

        try {
            const res  = await fetch(`${updateBase}${activeBudgetId}`, {
                method: 'POST',
                headers: { 'X-Requested-With': 'XMLHttpRequest', 'Accept': 'application/json' },
                body: (() => {
                    const f = new FormData();
                    f.append('_method', 'DELETE');
                    f.append('_token', csrf);
                    return f;
                })(),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Something went wrong.');

            const idx = programs.findIndex(p => p.id === activeProgramId);
            if (idx !== -1) programs[idx].budget = null;
            activeBudgetId = null;

            closeDelModal();
            
            // Clear form and close
            document.getElementById('budget-empty').hidden     = false;
            document.getElementById('budget-form-wrap').hidden = true;
            activeProgramId = null;
            overBudgetWarningShown = false;
            
            renderProgramList();
            showToast('Budget deleted successfully.');

        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            delConfirm.disabled = false;
            delBtnTxt.hidden    = false;
            delSpinner.hidden   = true;
        }
    });

    // ── Escape closes delete modal ────────────────────────────────
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') { closeDelModal(); closeClearModal(); }
    });

    // ── Helpers ──────────────────────────────────────────────────
    function escHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ── Init ─────────────────────────────────────────────────────
    renderProgramList();

})();