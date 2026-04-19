const bounds = L.latLngBounds( // Double check if these are correct
  [17.5200, 121.6200],
  [17.7200, 121.8500]
);

const map = L.map('map', {
  maxBounds: bounds,
  maxBoundsViscosity: 1.0,
  minZoom: 12,
  maxZoom: 19,
}).setView([17.6132, 121.7270], 14);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

let tempMarker = null;
let pendingLatLng = null;

document.getElementById('map').addEventListener('click', function (e) {
  const id = e.target.id;

  if (id === 'confirm-yes') {
    openForm();
  } else if (id === 'confirm-no' || id === 'cancel-marker') {
    cancelMarker();
  } else if (id === 'save-marker') {
    saveMarker();
  }
});

// Note: Doesn't save markers across page reloads. Would need a local storage. Gawan ko mamaya. 
// To-do: Create custom marker icons (categories)
// To-do: Improve forms. The form is too long. 
// To-do: Add photo upload (optional). 
// To-do Add edit/delete marker functionality. Likely for both the sidebar and the marker popup.

// Click map → confirmation popup
map.on('click', function (e) {
  if (e.originalEvent.target.tagName === 'BUTTON') return;

  if (tempMarker) {
    map.removeLayer(tempMarker);
    tempMarker = null;
  }

  pendingLatLng = e.latlng;
  const { lat, lng } = e.latlng;

  tempMarker = L.marker([lat, lng]).addTo(map);

  tempMarker.bindPopup(`
    <div style="text-align:center; min-height: 100px; min-width:180px;">
      <p style="margin-bottom:8px;"><strong>Add a marker here?</strong></p>
      <small style="color:#666;">${lat.toFixed(5)}, ${lng.toFixed(5)}</small><br/><br/>
      <button id="confirm-yes" style="margin-right:6px; padding:4px 12px;">Yes</button>
      <button id="confirm-no" style="padding:4px 12px;">Cancel</button>
    </div>
  `, { closeOnClick: false, autoClose: false }).openPopup();
});

// Open form popup after confirmation
function openForm() {
  if (!tempMarker) return;

  tempMarker.getPopup().setContent(`
    <div style="min-width:280px; padding:20px 24px; font-family:'Outfit',sans-serif;">
      <strong style="font-size:15px; color:#1a3320; font-family:'Playfair Display',serif;">New Marker</strong>

      <div style="margin-top:16px; margin-bottom:10px;">
        <label style="display:block; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.8px; color:#666; margin-bottom:4px;">Site Name</label>
        <input id="marker-label" type="text" placeholder="e.g. Barangay Health Center"
          style="width:100%; padding:8px 10px; border:1.5px solid #ddd; border-radius:6px; font-family:'Outfit',sans-serif; font-size:13px; box-sizing:border-box; outline:none;"/>
      </div>

      <div style="margin-bottom:10px;">
        <label style="display:block; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.8px; color:#666; margin-bottom:4px;">Category</label>
        <select id="marker-category"
          style="width:100%; padding:8px 10px; border:1.5px solid #ddd; border-radius:6px; font-family:'Outfit',sans-serif; font-size:13px; box-sizing:border-box; outline:none; background:#fff;">
          <option value="health">Health</option>
          <option value="education">Education</option>
          <option value="infrastructure">Infrastructure</option>
          <option value="livelihood">Livelihood</option>
          <option value="disaster-risk">Disaster Risk</option>
          <option value="social-services">Social Services</option>
        </select>
      </div>

      <div style="margin-bottom:10px;">
        <label style="display:block; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.8px; color:#666; margin-bottom:4px;">Barangay</label>
        <input id="marker-barangay" type="text" placeholder="e.g. Ugac Sur"
          style="width:100%; padding:8px 10px; border:1.5px solid #ddd; border-radius:6px; font-family:'Outfit',sans-serif; font-size:13px; box-sizing:border-box; outline:none;"/>
      </div>

      <div style="margin-bottom:10px;">
        <label style="display:block; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.8px; color:#666; margin-bottom:4px;">Status</label>
        <select id="marker-status"
          style="width:100%; padding:8px 10px; border:1.5px solid #ddd; border-radius:6px; font-family:'Outfit',sans-serif; font-size:13px; box-sizing:border-box; outline:none; background:#fff;">
          <option value="active">Active / Operational</option>
          <option value="proposed">Proposed</option>
          <option value="under-construction">Under Construction</option>
          <option value="needs-assessment">Needs Assessment</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div style="margin-bottom:10px;">
        <label style="display:block; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.8px; color:#666; margin-bottom:4px;">Condition</label>
        <select id="marker-condition"
          style="width:100%; padding:8px 10px; border:1.5px solid #ddd; border-radius:6px; font-family:'Outfit',sans-serif; font-size:13px; box-sizing:border-box; outline:none; background:#fff;">
          <option value="">— Select —</option>
          <option value="good">Good</option>
          <option value="fair">Fair</option>
          <option value="poor">Poor</option>
        </select>
      </div>

      <div style="margin-bottom:10px;">
        <label style="display:block; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.8px; color:#666; margin-bottom:4px;">Reported By</label>
        <input id="marker-reporter" type="text" placeholder="Your name"
          style="width:100%; padding:8px 10px; border:1.5px solid #ddd; border-radius:6px; font-family:'Outfit',sans-serif; font-size:13px; box-sizing:border-box; outline:none;"/>
      </div>

      <div style="margin-bottom:16px;">
        <label style="display:block; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:0.8px; color:#666; margin-bottom:4px;">Description</label>
        <textarea id="marker-notes" rows="3" placeholder="Describe this site..."
          style="width:100%; padding:8px 10px; border:1.5px solid #ddd; border-radius:6px; font-family:'Outfit',sans-serif; font-size:13px; box-sizing:border-box; outline:none; resize:vertical;"></textarea>
      </div>

      <button id="save-marker"
        style="width:100%; padding:9px; margin-bottom:6px; background:#1a3320; color:#fff; border:none; border-radius:6px; font-family:'Outfit',sans-serif; font-size:13px; font-weight:600; cursor:pointer;">
        Save Marker
      </button>
      <button id="cancel-marker"
        style="width:100%; padding:9px; background:#f0f0f0; color:#555; border:none; border-radius:6px; font-family:'Outfit',sans-serif; font-size:13px; font-weight:500; cursor:pointer;">
        Cancel
      </button>
    </div>
  `);
}

// Save and place final marker 
function saveMarker() {
  if (!tempMarker || !pendingLatLng) return;

  const label     = document.getElementById('marker-label').value.trim() || 'Untitled';
  const category  = document.getElementById('marker-category').value;
  const barangay  = document.getElementById('marker-barangay').value.trim();
  const status    = document.getElementById('marker-status').value;
  const condition = document.getElementById('marker-condition').value;
  const reporter  = document.getElementById('marker-reporter').value.trim();
  const notes     = document.getElementById('marker-notes').value.trim();
  const { lat, lng } = pendingLatLng;

  map.removeLayer(tempMarker);
  tempMarker = null;
  pendingLatLng = null;

  placeMarker(lat, lng, { label, category, barangay, status, condition, reporter, notes });
}

function cancelMarker() {
  if (tempMarker) {
    map.removeLayer(tempMarker);
    tempMarker = null;
  }
  pendingLatLng = null;
}

// Category colors. Adjust as needed.
const CATEGORY_COLORS = {
  'health':          'crimson',
  'education':       'steelblue',
  'infrastructure':  'darkorange',
  'livelihood':      'seagreen',
  'disaster-risk':   'purple',
  'social-services': 'teal',
};

function placeMarker(lat, lng, data) {
  const { label, category, barangay, status, condition, reporter, notes } = data;
  const color = CATEGORY_COLORS[category] || 'gray';

  const marker = L.circleMarker([lat, lng], {
    radius: 10,
    fillColor: color,
    color: '#fff',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.9
  }).addTo(map);

  marker.bindPopup(`
    <div style="padding:14px 16px; font-family:'Outfit',sans-serif; min-width:200px;">
      <strong style="font-size:14px; font-family:'Playfair Display',serif; color:#1a3320;">${label}</strong><br/>
      <small style="color:#888;">${lat.toFixed(5)}, ${lng.toFixed(5)}</small>
      <div style="margin-top:10px; font-size:12.5px; line-height:1.8; color:#444;">
        <div><strong>Category:</strong> ${category}</div>
        ${barangay  ? `<div><strong>Barangay:</strong> ${barangay}</div>`   : ''}
        <div><strong>Status:</strong> ${status}</div>
        ${condition ? `<div><strong>Condition:</strong> ${condition}</div>` : ''}
        ${reporter  ? `<div><strong>Reported by:</strong> ${reporter}</div>` : ''}
        ${notes     ? `<div style="margin-top:6px;">${notes}</div>`          : ''}
      </div>
    </div>
  `);

  const sidebar = document.getElementById('sidebar');
  const item = document.createElement('div');
  item.style.cssText = 'padding:14px 16px; border-bottom:1px solid #eee;';
  item.innerHTML = `
    <div style="font-weight:600; font-size:14px; margin-bottom:2px; font-family:'Playfair Display',serif; color:#1a3320;">${label}</div>
    <div style="font-size:12px; color:#888; margin-bottom:8px;">${barangay || ''} · ${category}</div>
    <div style="font-size:12px; color:#aaa; margin-bottom:10px;">${lat.toFixed(5)}, ${lng.toFixed(5)}</div>

    <div style="display:flex; gap:6px;">
      <!-- View -->
      <button class="sidebar-btn" data-action="view"
        style="display:flex; align-items:center; gap:5px; padding:5px 10px; border:none; border-radius:5px; background:#e8f0e8; color:#1a3320; font-family:'Outfit',sans-serif; font-size:12px; font-weight:500; cursor:pointer;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
        </svg>
        View
      </button>

      <!-- Edit -->
      <button class="sidebar-btn" data-action="edit"
        style="display:flex; align-items:center; gap:5px; padding:5px 10px; border:none; border-radius:5px; background:#fff8e8; color:#a67c00; font-family:'Outfit',sans-serif; font-size:12px; font-weight:500; cursor:pointer;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
        Edit
      </button>

      <!-- Delete -->
      <button class="sidebar-btn" data-action="delete"
        style="display:flex; align-items:center; gap:5px; padding:5px 10px; border:none; border-radius:5px; background:#fdecea; color:#c0392b; font-family:'Outfit',sans-serif; font-size:12px; font-weight:500; cursor:pointer;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
          <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
        </svg>
        Delete
      </button>
    </div>
  `;

  item.querySelector('[data-action="view"]').addEventListener('click', () => {
    map.flyTo([lat, lng], 16, { duration: 0.8 });
    setTimeout(() => marker.openPopup(), 900);
  });

  item.querySelector('[data-action="edit"]').addEventListener('click', () => {
  });

  item.querySelector('[data-action="delete"]').addEventListener('click', () => {
  });

  sidebar.appendChild(item);
}