/**
 * BloodConnect - Donors Controller (donors.js)
 * Implements:
 * - Module 12: Find Donors with Map Integration (find-donors.html)
 * - Module 13: Donation Interest (donation-interest.html)
 * - Donor Profile (donor-profile.html)
 */

document.addEventListener('DOMContentLoaded', () => {
  setupFindDonorsPage();
  setupDonationInterestPage();
  setupDonorProfilePage();
});

/* ==========================================================================
   Module 12: Find Donors with Interactive Map
   ========================================================================== */
function setupFindDonorsPage() {
  const container = document.getElementById('donors-grid');
  if (!container) return;

  const bloodFilter = document.getElementById('donor-filter-blood');
  const cityFilter = document.getElementById('donor-filter-city');
  const availFilter = document.getElementById('donor-filter-avail');
  const searchInput = document.getElementById('donor-search');

  function render() {
    let donors = storage.getDonors();
    const blood = bloodFilter ? bloodFilter.value : '';
    const city = cityFilter ? cityFilter.value.toLowerCase().trim() : '';
    const avail = availFilter ? availFilter.value : '';
    const search = searchInput ? searchInput.value.toLowerCase().trim() : '';

    donors = donors.filter(d => {
      if (blood && d.bloodGroup !== blood) return false;
      if (avail && d.availabilityStatus !== avail) return false;
      if (city && !d.city.toLowerCase().includes(city)) return false;
      if (search) {
        const full = `${d.name} ${d.city} ${d.bloodGroup}`.toLowerCase();
        if (!full.includes(search)) return false;
      }
      return true;
    });

    const countEl = document.getElementById('donors-count');
    if (countEl) countEl.textContent = donors.length;

    if (donors.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; background:white; padding: 40px; border-radius:12px; text-align:center; border:1px solid var(--color-border);">
          <div style="font-size:36px; margin-bottom:10px;">🔍</div>
          <h3>No available donors found matching your criteria</h3>
          <p style="color:var(--color-text-muted); margin-top:6px;">Try expanding your search parameters.</p>
        </div>
      `;
      renderMap([]);
      return;
    }

    container.innerHTML = donors.map(d => `
      <div class="dash-card" style="display:flex; flex-direction:column; margin-bottom:0;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:14px;">
          <div style="display:flex; gap:12px; align-items:center;">
            <div class="sidebar-avatar" style="width:48px; height:48px; font-size:20px;">${d.name.charAt(0)}</div>
            <div>
              <h3 style="font-size:17px; margin-bottom:2px;">${d.name}</h3>
              <div style="font-size:12.5px; color:var(--color-text-muted);">📍 ${d.city}, ${d.state}</div>
            </div>
          </div>
          <span class="badge badge-blood">${d.bloodGroup}</span>
        </div>

        <div style="background:var(--color-bg); padding:10px 14px; border-radius:var(--radius-md); font-size:12.5px; margin-bottom:14px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span style="color:var(--color-text-muted);">Availability:</span>
            <strong style="color:${d.availabilityStatus === 'Available' ? 'var(--color-success)' : '#757575'};">
              ${d.availabilityStatus === 'Available' ? '🟢 Available' : '⚪ Unavailable'}
            </strong>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color:var(--color-text-muted);">Donations:</span>
            <strong>${d.totalDonations || 0} times</strong>
          </div>
        </div>

        <div style="margin-top:auto; display:flex; gap:8px;">
          <a href="donor-profile.html?id=${d.id}" class="btn btn-outline btn-sm" style="flex:1;">View Profile</a>
          <button onclick="startChatWithUser('${d.userId}')" class="btn btn-primary btn-sm" style="flex:1;">Contact</button>
        </div>
      </div>
    `).join('');

    renderMap(donors);
  }

  [bloodFilter, cityFilter, availFilter, searchInput].forEach(el => {
    if (el) el.addEventListener('input', render);
  });

  render();
}

function renderMap(donors) {
  const mapContainer = document.getElementById('donors-map-canvas');
  if (!mapContainer) return;

  // Render an interactive SVG map visualization representing donor locations
  mapContainer.innerHTML = `
    <div style="position:relative; width:100%; height:320px; background:linear-gradient(180deg, #E8F4F8 0%, #D1E9F1 100%); border-radius:var(--radius-md); overflow:hidden; border:1px solid #B0BEC5;">
      <!-- Simulated city map grid lines -->
      <svg width="100%" height="100%" style="position:absolute; top:0; left:0; opacity:0.3;">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#90A4AE" stroke-width="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      
      <!-- Center Radar wave animation -->
      <div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); width:120px; height:120px; border-radius:50%; border:2px dashed rgba(229, 57, 53, 0.4); pointer-events:none;"></div>

      <!-- Map Labels & Pins -->
      ${donors.map((d, idx) => {
        // Place pins pseudo-geographically across canvas
        const leftPercent = 25 + ((idx * 28 + (d.name.length * 7)) % 60);
        const topPercent = 20 + ((idx * 23 + (d.city.length * 9)) % 60);

        return `
          <div style="position:absolute; left:${leftPercent}%; top:${topPercent}%; transform:translate(-50%, -100%); cursor:pointer; text-align:center; z-index:10;" onclick="showToast('Donor: ${d.name} (${d.bloodGroup}) in ${d.city}', 'info')" title="${d.name} (${d.bloodGroup})">
            <div style="background:var(--color-primary); color:white; font-size:11px; font-weight:800; padding:3px 7px; border-radius:var(--radius-pill); box-shadow:0 3px 8px rgba(0,0,0,0.3); display:inline-flex; align-items:center; gap:3px;">
              <span>🩸</span> ${d.bloodGroup}
            </div>
            <div style="width:10px; height:10px; background:var(--color-primary); margin:0 auto; border-radius:50%; border:2px solid white; box-shadow:0 2px 4px rgba(0,0,0,0.2);"></div>
            <div style="font-size:11px; font-weight:700; color:var(--color-text); text-shadow:0 1px 2px white; margin-top:2px;">${d.name.split(' ')[0]}</div>
          </div>
        `;
      }).join('')}

      <div style="position:absolute; bottom:12px; left:16px; background:rgba(255,255,255,0.9); padding:6px 12px; border-radius:var(--radius-pill); font-size:11.5px; font-weight:600; color:var(--color-text); box-shadow:var(--shadow-sm);">
        🗺️ Interactive Donor Geographic Radar (Pins show nearby donors)
      </div>
    </div>
  `;
}

/* ==========================================================================
   Module 13: Donation Interest
   ========================================================================== */
function setupDonationInterestPage() {
  const form = document.getElementById('donation-interest-form');
  const feed = document.getElementById('donation-interest-feed');
  const currentUser = storage.getCurrentUser();

  if (form) {
    if (currentUser && currentUser.bloodGroup) {
      const bloodInput = document.getElementById('int-blood-group');
      if (bloodInput) bloodInput.value = currentUser.bloodGroup;
      const cityInput = document.getElementById('int-location');
      if (cityInput && currentUser.city) cityInput.value = currentUser.city;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!currentUser) {
        showToast('Please log in to publish donation interest.', 'danger');
        return;
      }

      const bloodGroup = document.getElementById('int-blood-group').value;
      const preferredLocation = document.getElementById('int-location').value.trim();
      const availabilityDate = document.getElementById('int-date').value;
      const contactPreference = document.getElementById('int-contact-pref').value;
      const additionalInfo = document.getElementById('int-notes').value.trim();

      if (!bloodGroup || !preferredLocation || !availabilityDate) {
        showToast('Please fill out all required fields.', 'danger');
        return;
      }

      storage.saveInterest({
        userId: currentUser.id,
        donorName: currentUser.name,
        bloodGroup,
        city: currentUser.city || 'Mumbai',
        preferredLocation,
        availabilityDate,
        contactPreference,
        additionalInfo
      });

      showToast('Your donation availability has been posted successfully!', 'success');
      form.reset();
      renderInterests();
    });
  }

  function renderInterests() {
    if (!feed) return;
    const list = storage.getInterests();

    if (list.length === 0) {
      feed.innerHTML = `<p style="text-align:center; padding:30px; color:var(--color-text-muted);">No active donation interest posts at the moment.</p>`;
      return;
    }

    feed.innerHTML = list.map(item => `
      <div class="dash-card" style="margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <h3 style="font-size:17px; margin-bottom:4px;">${item.donorName}</h3>
            <div style="font-size:13px; color:var(--color-text-muted);">📍 Preferred Area: <strong>${item.preferredLocation}</strong></div>
          </div>
          <span class="badge badge-blood">${item.bloodGroup}</span>
        </div>

        <div style="margin:12px 0; font-size:13.5px; color:var(--color-text);">
          <div>📅 Available on/from: <strong>${formatDate(item.availabilityDate)}</strong></div>
          <div>📞 Contact Preference: <strong>${item.contactPreference}</strong></div>
          ${item.additionalInfo ? `<div style="margin-top:6px; color:var(--color-text-muted); font-size:13px;"><em>"${item.additionalInfo}"</em></div>` : ''}
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--color-border-light); padding-top:10px; font-size:11.5px; color:var(--color-text-light);">
          <span>Posted ${timeAgo(item.createdAt)}</span>
          <button onclick="startChatWithUser('${item.userId}')" class="btn btn-outline btn-sm">Message Donor</button>
        </div>
      </div>
    `).join('');
  }

  if (feed) renderInterests();
}

/* ==========================================================================
   Donor Profile View (donor-profile.html)
   ========================================================================== */
function setupDonorProfilePage() {
  const container = document.getElementById('donor-profile-container');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const donorId = urlParams.get('id') || 'dnr_1';
  const donor = storage.getDonorById(donorId) || storage.getDonors()[0];

  if (!donor) {
    container.innerHTML = `<p>Donor profile not found.</p>`;
    return;
  }

  const history = storage.getDonationHistory(donor.userId);

  container.innerHTML = `
    <div style="max-width:800px; margin:0 auto;">
      <div class="dash-card" style="text-align:center; padding:36px 24px; margin-bottom:24px;">
        <div class="sidebar-avatar" style="width:72px; height:72px; font-size:30px; margin:0 auto 16px;">
          ${donor.name.charAt(0)}
        </div>
        <h2 style="font-size:24px; margin-bottom:4px;">${donor.name}</h2>
        <p style="color:var(--color-text-muted); margin-bottom:16px;">📍 ${donor.city}, ${donor.state}</p>

        <div style="display:inline-flex; gap:12px; margin-bottom:24px;">
          <span class="badge badge-blood" style="font-size:16px; padding:6px 18px;">${donor.bloodGroup}</span>
          <span class="badge ${donor.availabilityStatus === 'Available' ? 'urgency-normal' : 'status-cancelled'}" style="font-size:14px; padding:6px 14px;">
            ${donor.availabilityStatus === 'Available' ? '🟢 Available to Donate' : '⚪ Busy / Unavailable'}
          </span>
        </div>

        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:16px; max-width:400px; margin:0 auto 24px;">
          <div style="background:var(--color-bg); padding:14px; border-radius:var(--radius-md);">
            <div style="font-size:22px; font-weight:800; color:var(--color-primary);">${donor.totalDonations || 0}</div>
            <div style="font-size:12px; color:var(--color-text-muted);">Total Blood Donations</div>
          </div>
          <div style="background:var(--color-bg); padding:14px; border-radius:var(--radius-md);">
            <div style="font-size:16px; font-weight:800;">${donor.lastDonationDate ? formatDate(donor.lastDonationDate) : 'Not recorded'}</div>
            <div style="font-size:12px; color:var(--color-text-muted);">Last Donation Date</div>
          </div>
        </div>

        <div>
          <button onclick="startChatWithUser('${donor.userId}')" class="btn btn-primary btn-lg">
            💬 Contact This Donor
          </button>
        </div>
      </div>

      <!-- Past Donation History -->
      <div class="dash-card">
        <h3 class="dash-card-title">Verified Donation History</h3>
        ${history.length === 0 ? `
          <p style="color:var(--color-text-muted); padding:16px 0; font-size:13.5px;">No recorded public donation records yet.</p>
        ` : `
          <div class="table-responsive">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Hospital / Camp</th>
                  <th>Date</th>
                  <th>Units</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${history.map(h => `
                  <tr>
                    <td><strong>${h.hospitalName}</strong></td>
                    <td>${formatDate(h.date)}</td>
                    <td>${h.units} Unit</td>
                    <td><span class="badge status-completed">${h.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;
}
