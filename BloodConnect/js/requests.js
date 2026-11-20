/**
 * BloodConnect - Requests Controller (requests.js)
 * Implements:
 * - Module 6: Create Blood Request (create-request.html)
 * - Module 7: View Blood Requests (blood-requests.html)
 * - Module 8: Request Details and Acceptance (request-details.html)
 * - Module 9: My Requests (my-requests.html)
 * - Module 10: Accepted Requests (accepted-requests.html)
 * - Module 11: Donor Selection
 */

document.addEventListener('DOMContentLoaded', () => {
  setupCreateRequestForm();
  setupBloodRequestsFeed();
  setupRequestDetailsPage();
  setupMyRequestsPage();
  setupAcceptedRequestsPage();
});

/* ==========================================================================
   Module 6: Create Blood Request
   ========================================================================== */
function setupCreateRequestForm() {
  const form = document.getElementById('create-request-form');
  if (!form) return;

  const currentUser = storage.getCurrentUser();
  if (!currentUser) {
    showToast('Please log in to submit a blood request.', 'danger');
    setTimeout(() => window.location.href = 'login.html', 1000);
    return;
  }

  // Pre-fill contact phone
  const phoneInput = document.getElementById('req-contact-phone');
  if (phoneInput && currentUser.phone) {
    phoneInput.value = currentUser.phone;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const patientName = document.getElementById('req-patient-name').value.trim();
    const bloodGroup = document.getElementById('req-blood-group').value;
    const units = parseInt(document.getElementById('req-units').value, 10);
    const hospitalName = document.getElementById('req-hospital-name').value.trim();
    const hospitalAddress = document.getElementById('req-hospital-address').value.trim();
    const district = document.getElementById('req-district').value.trim();
    const city = document.getElementById('req-city').value.trim();
    const requiredDate = document.getElementById('req-date').value;
    const contactNumber = document.getElementById('req-contact-phone').value.trim();
    const urgency = document.querySelector('input[name="urgency"]:checked')?.value || 'Urgent';
    const description = document.getElementById('req-description').value.trim();

    if (!patientName || !bloodGroup || !units || !hospitalName || !city || !requiredDate || !contactNumber) {
      showToast('Please fill out all required fields.', 'danger');
      return;
    }

    const newRequest = {
      requesterId: currentUser.id,
      patientName,
      bloodGroup,
      units,
      hospitalName,
      hospitalAddress,
      district,
      city,
      requiredDate,
      contactNumber,
      urgency,
      description,
      status: 'Open'
    };

    const created = storage.saveRequest(newRequest);

    // Notify matching donors
    const donors = storage.getDonors().filter(d => d.bloodGroup === bloodGroup && d.city.toLowerCase() === city.toLowerCase());
    donors.forEach(donor => {
      storage.addNotification({
        userId: donor.userId,
        title: `URGENT: ${bloodGroup} Blood Needed!`,
        message: `${units} unit(s) of ${bloodGroup} required for ${patientName} at ${hospitalName}, ${city}.`,
        link: `request-details.html?id=${created.id}`,
        type: 'matching_request'
      });
    });

    showToast(`Request ${created.id} published successfully!`, 'success');
    setTimeout(() => {
      window.location.href = 'my-requests.html';
    }, 600);
  });
}

/* ==========================================================================
   Module 7: View Blood Requests
   ========================================================================== */
function setupBloodRequestsFeed() {
  const container = document.getElementById('blood-requests-grid');
  if (!container) return;

  const searchInput = document.getElementById('filter-search');
  const bloodFilter = document.getElementById('filter-blood-group');
  const urgencyFilter = document.getElementById('filter-urgency');
  const statusFilter = document.getElementById('filter-status');
  const cityFilter = document.getElementById('filter-city');

  function render() {
    let requests = storage.getRequests();
    const currentUser = storage.getCurrentUser();

    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const blood = bloodFilter ? bloodFilter.value : '';
    const urgency = urgencyFilter ? urgencyFilter.value : '';
    const status = statusFilter ? statusFilter.value : '';
    const city = cityFilter ? cityFilter.value.toLowerCase().trim() : '';

    requests = requests.filter(r => {
      if (blood && r.bloodGroup !== blood) return false;
      if (urgency && r.urgency !== urgency) return false;
      if (status && r.status !== status) return false;
      if (city && !r.city.toLowerCase().includes(city)) return false;
      if (searchTerm) {
        const full = `${r.patientName} ${r.hospitalName} ${r.city} ${r.bloodGroup} ${r.id} ${r.description}`.toLowerCase();
        if (!full.includes(searchTerm)) return false;
      }
      return true;
    });

    const countEl = document.getElementById('requests-found-count');
    if (countEl) countEl.textContent = requests.length;

    if (requests.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; background:white; padding: 40px; border-radius:12px; text-align:center; border:1px solid var(--color-border);">
          <div style="font-size:36px; margin-bottom:10px;">🔍</div>
          <h3>No matching blood requests found</h3>
          <p style="color:var(--color-text-muted); margin-top:6px;">Try adjusting your filters or search keywords.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = requests.map(req => {
      const urgencyClass = req.urgency === 'Critical' ? 'urgency-critical' : req.urgency === 'Urgent' ? 'urgency-urgent' : 'urgency-normal';
      const statusClass = getStatusClass(req.status);
      const isOwner = currentUser && currentUser.id === req.requesterId;
      const acceptances = storage.getAcceptancesForRequest(req.id);
      const userAccepted = currentUser ? acceptances.some(a => a.donorUserId === currentUser.id) : false;

      return `
        <div class="request-card">
          <div class="req-card-top">
            <div>
              <span class="req-id">${req.id}</span>
              <h3 class="req-patient-name">${req.patientName}</h3>
              <div class="req-hospital">
                <span>🏥</span> ${req.hospitalName}, ${req.city}
              </div>
            </div>
            <div style="text-align:right;">
              <span class="badge badge-blood">${req.bloodGroup}</span>
            </div>
          </div>

          <div class="req-meta-row">
            <div class="req-meta-item">
              <span>🩸</span> <strong>${req.units}</strong> Unit(s)
            </div>
            <div class="req-meta-item">
              <span>📅</span> Needed: <strong>${formatDate(req.requiredDate)}</strong>
            </div>
            <div class="req-meta-item">
              <span>👥</span> <strong>${acceptances.length}</strong> Interested Donor(s)
            </div>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin: 8px 0 14px;">
            <span class="badge ${urgencyClass}">${req.urgency} Urgency</span>
            <span class="badge ${statusClass}">${req.status}</span>
          </div>

          <p style="font-size:13px; color:var(--color-text-muted); line-height:1.5; margin-bottom:14px; flex-grow:1;">
            ${req.description.length > 110 ? req.description.slice(0, 110) + '...' : req.description}
          </p>

          <div class="req-actions">
            <a href="request-details.html?id=${req.id}" class="btn btn-outline btn-sm" style="flex:1;">View Details</a>
            ${!isOwner && req.status !== 'Completed' && req.status !== 'Cancelled' ? `
              <button onclick="handleQuickAccept('${req.id}')" class="btn ${userAccepted ? 'btn-secondary' : 'btn-primary'} btn-sm" style="flex:1;">
                ${userAccepted ? '✓ Accepted' : 'Accept Request'}
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  [searchInput, bloodFilter, urgencyFilter, statusFilter, cityFilter].forEach(el => {
    if (el) el.addEventListener('input', render);
  });

  render();
}

/* ==========================================================================
   Module 8 & 11: Request Details, Acceptance Workflow, Donor Selection
   ========================================================================== */
function setupRequestDetailsPage() {
  const container = document.getElementById('request-details-container');
  if (!container) return;

  const urlParams = new URLSearchParams(window.location.search);
  const reqId = urlParams.get('id') || 'REQ-101';
  const req = storage.getRequestById(reqId);
  const currentUser = storage.getCurrentUser();

  if (!req) {
    container.innerHTML = `<div class="dash-card"><p>Request not found.</p><a href="blood-requests.html" class="btn btn-primary btn-sm">Browse Requests</a></div>`;
    return;
  }

  const requester = storage.getUserById(req.requesterId);
  const isOwner = currentUser && currentUser.id === req.requesterId;
  const acceptances = storage.getAcceptancesForRequest(req.id);
  const userAccepted = currentUser ? acceptances.some(a => a.donorUserId === currentUser.id) : false;
  const urgencyClass = req.urgency === 'Critical' ? 'urgency-critical' : req.urgency === 'Urgent' ? 'urgency-urgent' : 'urgency-normal';
  const statusClass = getStatusClass(req.status);

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
      <!-- Left Column: Details -->
      <div class="dash-card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
          <div>
            <span class="badge status-open" style="margin-bottom:8px;">Request ID: ${req.id}</span>
            <h1 style="font-size:28px;">${req.patientName}</h1>
            <p style="color:var(--color-text-muted); font-size:14.5px;">🏥 ${req.hospitalName}</p>
          </div>
          <div style="text-align:right;">
            <span class="badge badge-blood" style="font-size:20px; padding:6px 16px;">${req.bloodGroup}</span>
            <div style="margin-top:6px;"><span class="badge ${urgencyClass}">${req.urgency} Urgency</span></div>
          </div>
        </div>

        <div style="background:var(--color-bg); border-radius:var(--radius-md); padding:18px; margin: 20px 0; display:grid; grid-template-columns: repeat(3, 1fr); gap:16px;">
          <div>
            <div style="font-size:12px; color:var(--color-text-muted); text-transform:uppercase;">Units Required</div>
            <div style="font-size:18px; font-weight:800; color:var(--color-primary);">${req.units} Unit(s)</div>
          </div>
          <div>
            <div style="font-size:12px; color:var(--color-text-muted); text-transform:uppercase;">Required By Date</div>
            <div style="font-size:16px; font-weight:700;">${formatDate(req.requiredDate)}</div>
          </div>
          <div>
            <div style="font-size:12px; color:var(--color-text-muted); text-transform:uppercase;">Current Status</div>
            <div><span class="badge ${statusClass}">${req.status}</span></div>
          </div>
        </div>

        <h3 style="font-size:17px; margin-bottom:8px;">Hospital & Location Details</h3>
        <p style="font-size:14px; margin-bottom:16px; color:var(--color-text);">
          <strong>Address:</strong> ${req.hospitalAddress}<br>
          <strong>City / District:</strong> ${req.city}, ${req.district}
        </p>

        <h3 style="font-size:17px; margin-bottom:8px;">Case Description</h3>
        <p style="font-size:14.5px; line-height:1.6; color:var(--color-text-muted); margin-bottom:24px;">
          ${req.description || 'No additional details provided.'}
        </p>

        <!-- Donor Acceptance Section -->
        <div style="border-top:1px solid var(--color-border); padding-top:20px;">
          ${!isOwner ? `
            ${userAccepted ? `
              <div style="background:#E8F5E9; border:1px solid #A5D6A7; padding:14px 18px; border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <strong style="color:var(--color-success);">✓ You have accepted this blood request</strong>
                  <p style="font-size:13px; color:var(--color-text-muted); margin-top:2px;">The requester has been notified and can select you.</p>
                </div>
                <a href="messages.html" class="btn btn-outline btn-sm">Open Chat</a>
              </div>
            ` : `
              <button onclick="openAcceptModal('${req.id}')" class="btn btn-primary btn-lg btn-block">
                🩸 Accept This Blood Request
              </button>
            `}
          ` : `
            <div style="background:#FFF9C4; border:1px solid #FFF59D; padding:14px; border-radius:var(--radius-md); font-size:13.5px; color:#5D4037;">
              ℹ You created this blood request. You can review interested donors on the right and select a suitable donor.
            </div>
          `}
        </div>
      </div>

      <!-- Right Column: Interested Donors & Contact Info -->
      <div>
        <!-- Requester Contact Card -->
        <div class="dash-card" style="margin-bottom:20px;">
          <h3 class="dash-card-title">Requester Information</h3>
          <div style="margin-top:12px; font-size:14px;">
            <p><strong>Name:</strong> ${requester ? requester.name : 'Verified Requester'}</p>
            <p style="margin:6px 0;"><strong>Contact Phone:</strong> 
              ${currentUser ? `<a href="tel:${req.contactNumber}">${req.contactNumber}</a>` : '<span style="color:var(--color-text-light);">Log in to view contact</span>'}
            </p>
            <p><strong>Location:</strong> ${req.city}, ${req.district}</p>
            ${!isOwner && currentUser ? `
              <div style="margin-top:14px;">
                <button onclick="startChatWithUser('${req.requesterId}', '${req.id}')" class="btn btn-outline btn-sm btn-block">💬 Message Requester</button>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Interested Donors List (For Requester or Viewers) -->
        <div class="dash-card">
          <div class="dash-card-header">
            <h3 class="dash-card-title">Interested Donors (${acceptances.length})</h3>
          </div>
          ${acceptances.length === 0 ? `
            <p style="font-size:13px; color:var(--color-text-muted); text-align:center; padding:16px;">
              No donors have accepted this request yet.
            </p>
          ` : `
            <div style="display:flex; flex-direction:column; gap:12px;">
              ${acceptances.map(a => `
                <div style="border:1px solid var(--color-border); border-radius:var(--radius-md); padding:12px; background:${a.status === 'Selected' ? '#F1F8E9' : 'white'};">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong>${a.donorName}</strong>
                    <span class="badge badge-blood" style="font-size:11px;">${a.donorBlood}</span>
                  </div>
                  <div style="font-size:12px; color:var(--color-text-muted); margin:4px 0;">${a.note || 'Ready to donate'}</div>
                  <div style="font-size:11px; color:var(--color-text-light); margin-bottom:8px;">Accepted ${timeAgo(a.acceptedAt)}</div>
                  
                  <div style="display:flex; gap:6px;">
                    ${isOwner && req.status !== 'Completed' ? `
                      <button onclick="handleSelectDonor('${req.id}', '${a.donorUserId}')" class="btn ${a.status === 'Selected' ? 'btn-success' : 'btn-outline'} btn-sm" style="flex:1; font-size:11px; padding:4px 6px;">
                        ${a.status === 'Selected' ? '✓ Selected' : 'Select Donor'}
                      </button>
                    ` : ''}
                    <button onclick="startChatWithUser('${a.donorUserId}', '${req.id}')" class="btn btn-secondary btn-sm" style="font-size:11px; padding:4px 6px;">
                      💬 Chat
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}

window.handleQuickAccept = function(reqId) {
  openAcceptModal(reqId);
};

window.openAcceptModal = function(reqId) {
  const currentUser = storage.getCurrentUser();
  if (!currentUser) {
    showToast('Please log in to accept blood requests.', 'danger');
    setTimeout(() => window.location.href = 'login.html', 800);
    return;
  }

  const req = storage.getRequestById(reqId);
  if (!req) return;

  if (req.requesterId === currentUser.id) {
    showToast('You cannot accept your own blood request.', 'danger');
    return;
  }

  let modal = document.getElementById('accept-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'accept-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-dialog">
      <div class="modal-header">
        <h3 class="modal-title">Confirm Blood Donation Acceptance</h3>
        <button class="modal-close" onclick="closeModal('accept-modal')">&times;</button>
      </div>
      <div class="modal-body">
        <p style="margin-bottom:14px; font-size:14.5px;">
          You are confirming your availability to donate blood for <strong>${req.patientName}</strong> (${req.bloodGroup}) at <strong>${req.hospitalName}</strong>.
        </p>
        <div class="form-group">
          <label class="form-label">Availability / Note to Requester</label>
          <textarea id="accept-note" class="form-control" rows="3" placeholder="e.g. I am available tomorrow at 9:00 AM. Contact me anytime."></textarea>
        </div>
        <div class="form-group">
          <label class="checkbox-label">
            <input type="checkbox" id="accept-eligibility-check" checked>
            <span>I confirm I am medically eligible to donate blood (weight 50kg+, good health, no recent illness).</span>
          </label>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary btn-sm" onclick="closeModal('accept-modal')">Cancel</button>
        <button class="btn btn-primary btn-sm" onclick="confirmAcceptance('${req.id}')">Confirm Acceptance</button>
      </div>
    </div>
  `;

  modal.classList.add('active');
};

window.confirmAcceptance = function(reqId) {
  const currentUser = storage.getCurrentUser();
  const note = document.getElementById('accept-note')?.value.trim();
  const check = document.getElementById('accept-eligibility-check')?.checked;

  if (!check) {
    showToast('Please confirm medical eligibility.', 'danger');
    return;
  }

  const donorProfile = storage.getDonorByUserId(currentUser.id) || {
    userId: currentUser.id,
    name: currentUser.name,
    bloodGroup: currentUser.bloodGroup,
    phone: currentUser.phone
  };

  const res = storage.addAcceptance(reqId, donorProfile, note);
  if (!res.success) {
    showToast(res.message, 'danger');
    return;
  }

  closeModal('accept-modal');
  showToast('You have accepted this request! Requester notified.', 'success');
  setTimeout(() => window.location.reload(), 600);
};

window.handleSelectDonor = function(reqId, donorUserId) {
  storage.selectDonorForRequest(reqId, donorUserId);
  showToast('Donor selected successfully! Notification sent to donor.', 'success');
  setTimeout(() => window.location.reload(), 600);
};

window.startChatWithUser = function(otherUserId, reqId) {
  const currentUser = storage.getCurrentUser();
  if (!currentUser) {
    showToast('Please log in to chat.', 'danger');
    return;
  }
  // Store intent and jump to messages.html
  sessionStorage.setItem('active_chat_user', otherUserId);
  sessionStorage.setItem('active_chat_req', reqId);
  window.location.href = 'messages.html';
};

/* ==========================================================================
   Module 9: My Requests
   ========================================================================== */
function setupMyRequestsPage() {
  const container = document.getElementById('my-requests-list');
  if (!container) return;

  const currentUser = storage.getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  const allReqs = storage.getRequests().filter(r => r.requesterId === currentUser.id);

  if (allReqs.length === 0) {
    container.innerHTML = `
      <div style="background:white; border-radius:12px; padding:40px; text-align:center; border:1px solid var(--color-border);">
        <p style="font-size:16px; color:var(--color-text-muted);">You have not created any blood requests yet.</p>
        <a href="create-request.html" class="btn btn-primary btn-sm" style="margin-top:14px;">+ Create Blood Request</a>
      </div>
    `;
    return;
  }

  container.innerHTML = allReqs.map(req => {
    const acceptances = storage.getAcceptancesForRequest(req.id);
    const urgencyClass = req.urgency === 'Critical' ? 'urgency-critical' : req.urgency === 'Urgent' ? 'urgency-urgent' : 'urgency-normal';
    const statusClass = getStatusClass(req.status);

    return `
      <div class="dash-card" style="margin-bottom:18px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px;">
          <div>
            <span class="req-id">${req.id}</span>
            <h3 style="font-size:20px; margin:4px 0;">${req.patientName}</h3>
            <p style="color:var(--color-text-muted); font-size:13.5px;">🏥 ${req.hospitalName}, ${req.city}</p>
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            <span class="badge badge-blood">${req.bloodGroup}</span>
            <span class="badge ${urgencyClass}">${req.urgency}</span>
            <span class="badge ${statusClass}">${req.status}</span>
          </div>
        </div>

        <div style="display:flex; gap:20px; font-size:13.5px; margin:14px 0; color:var(--color-text-muted); flex-wrap:wrap;">
          <div>Units: <strong>${req.units}</strong></div>
          <div>Needed Date: <strong>${formatDate(req.requiredDate)}</strong></div>
          <div>Interested Donors: <strong>${acceptances.length}</strong></div>
        </div>

        <div style="display:flex; gap:10px; justify-content:flex-end; border-top:1px solid var(--color-border-light); padding-top:12px; flex-wrap:wrap;">
          <a href="request-details.html?id=${req.id}" class="btn btn-outline btn-sm">View Details & Donors (${acceptances.length})</a>
          ${req.status !== 'Completed' && req.status !== 'Cancelled' ? `
            <button onclick="handleMarkCompleted('${req.id}')" class="btn btn-success btn-sm">Mark Completed</button>
            <button onclick="handleCancelRequest('${req.id}')" class="btn btn-secondary btn-sm">Cancel</button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

window.handleMarkCompleted = function(reqId) {
  if (confirm('Mark this request as Completed?')) {
    storage.updateRequestStatus(reqId, 'Completed');
    showToast('Request marked as Completed! Thank you for updating.', 'success');
    setTimeout(() => window.location.reload(), 400);
  }
};

window.handleCancelRequest = function(reqId) {
  if (confirm('Are you sure you want to cancel this request?')) {
    storage.updateRequestStatus(reqId, 'Cancelled');
    showToast('Request cancelled.', 'info');
    setTimeout(() => window.location.reload(), 400);
  }
};

/* ==========================================================================
   Module 10: Accepted Requests (For Donors)
   ========================================================================== */
function setupAcceptedRequestsPage() {
  const container = document.getElementById('accepted-requests-list');
  if (!container) return;

  const currentUser = storage.getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  const allAcceptances = storage.getAcceptances().filter(a => a.donorUserId === currentUser.id);

  if (allAcceptances.length === 0) {
    container.innerHTML = `
      <div style="background:white; border-radius:12px; padding:40px; text-align:center; border:1px solid var(--color-border);">
        <p style="font-size:16px; color:var(--color-text-muted);">You have not accepted any blood requests yet.</p>
        <a href="blood-requests.html" class="btn btn-primary btn-sm" style="margin-top:14px;">Browse Open Requests</a>
      </div>
    `;
    return;
  }

  container.innerHTML = allAcceptances.map(acc => {
    const req = storage.getRequestById(acc.requestId);
    if (!req) return '';
    const statusClass = getStatusClass(req.status);

    return `
      <div class="dash-card" style="margin-bottom:18px;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px;">
          <div>
            <span class="badge ${acc.status === 'Selected' ? 'status-selected' : 'status-interested'}" style="margin-bottom:6px;">Your Acceptance: ${acc.status}</span>
            <h3 style="font-size:20px; margin:4px 0;">${req.patientName}</h3>
            <p style="color:var(--color-text-muted); font-size:13.5px;">🏥 ${req.hospitalName}, ${req.city}</p>
          </div>
          <div>
            <span class="badge badge-blood">${req.bloodGroup}</span>
            <span class="badge ${statusClass}">${req.status}</span>
          </div>
        </div>

        <p style="font-size:13px; color:var(--color-text-muted); margin:12px 0;">
          <strong>Your Availability Note:</strong> ${acc.note || 'None'}<br>
          <small>Accepted: ${timeAgo(acc.acceptedAt)}</small>
        </p>

        <div style="display:flex; gap:10px; justify-content:flex-end; border-top:1px solid var(--color-border-light); padding-top:12px;">
          <a href="request-details.html?id=${req.id}" class="btn btn-outline btn-sm">View Details</a>
          <button onclick="startChatWithUser('${req.requesterId}', '${req.id}')" class="btn btn-primary btn-sm">💬 Message Requester</button>
        </div>
      </div>
    `;
  }).join('');
}
