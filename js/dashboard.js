/**
 * BloodConnect - Dashboard Controller (dashboard.js)
 * Implements Module 5: User Dashboard (dashboard.html)
 */

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = checkAuth();
  if (!currentUser) return;

  renderSidebarProfile(currentUser);
  renderDashboardStats(currentUser);
  renderRecentRequests(currentUser);
  renderRecentNotifications(currentUser);
});

function checkAuth() {
  const user = storage.getCurrentUser();
  if (!user) {
    // If not logged in, auto select demo John Doe for immediate review
    const defaultUser = storage.getUserByEmail('john@example.com');
    if (defaultUser) {
      storage.setCurrentUser(defaultUser);
      return defaultUser;
    }
    window.location.href = 'login.html';
    return null;
  }
  return user;
}

function renderSidebarProfile(user) {
  const avatarEl = document.getElementById('sidebar-user-avatar');
  const nameEl = document.getElementById('sidebar-user-name');
  const roleEl = document.getElementById('sidebar-user-role');
  const bloodEl = document.getElementById('sidebar-user-blood');

  if (avatarEl) avatarEl.textContent = user.name.charAt(0);
  if (nameEl) nameEl.textContent = user.name;
  if (roleEl) {
    const roleTitle = user.role === 'admin' ? 'Administrator' : user.role === 'donor' ? 'Registered Donor' : 'Requester & Donor';
    roleEl.textContent = roleTitle;
  }
  if (bloodEl) bloodEl.textContent = user.bloodGroup || 'O+';

  // Update welcome greeting in main view
  const welcomeEl = document.getElementById('dash-welcome-name');
  if (welcomeEl) welcomeEl.textContent = user.name;

  const welcomeSub = document.getElementById('dash-welcome-subtitle');
  if (welcomeSub) {
    welcomeSub.textContent = `Blood Group: ${user.bloodGroup} | Location: ${user.city}, ${user.state}`;
  }

  // Update notification badge
  const unreadCount = storage.getNotifications(user.id).filter(n => !n.isRead).length;
  const badgeEl = document.getElementById('sidebar-notif-badge');
  if (badgeEl) {
    if (unreadCount > 0) {
      badgeEl.textContent = unreadCount;
      badgeEl.style.display = 'inline-block';
    } else {
      badgeEl.style.display = 'none';
    }
  }
}

function renderDashboardStats(user) {
  const allReqs = storage.getRequests();
  const myReqs = allReqs.filter(r => r.requesterId === user.id);
  const activeReqs = allReqs.filter(r => r.status === 'Open' || r.status === 'Donor Interested');
  const completedReqs = allReqs.filter(r => r.status === 'Completed');

  // Count interested donors across user's requests
  const userReqIds = new Set(myReqs.map(r => r.id));
  const acceptances = storage.getAcceptances().filter(a => userReqIds.has(a.requestId));

  const totalReqEl = document.getElementById('stat-total-requests');
  const activeReqEl = document.getElementById('stat-active-requests');
  const interestedDonorsEl = document.getElementById('stat-interested-donors');
  const completedReqEl = document.getElementById('stat-completed-requests');

  if (totalReqEl) totalReqEl.textContent = allReqs.length;
  if (activeReqEl) activeReqEl.textContent = activeReqs.length;
  if (interestedDonorsEl) interestedDonorsEl.textContent = acceptances.length;
  if (completedReqEl) completedReqEl.textContent = completedReqs.length;
}

function renderRecentRequests(user) {
  const container = document.getElementById('dash-recent-requests');
  if (!container) return;

  const requests = storage.getRequests().slice(0, 4);

  if (requests.length === 0) {
    container.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--color-text-muted);">No blood requests found.</td></tr>`;
    return;
  }

  container.innerHTML = requests.map(req => {
    const urgencyClass = req.urgency === 'Critical' ? 'urgency-critical' : req.urgency === 'Urgent' ? 'urgency-urgent' : 'urgency-normal';
    const statusClass = getStatusClass(req.status);

    return `
      <tr>
        <td><strong>${req.id}</strong></td>
        <td>
          <div style="font-weight:700;">${req.patientName}</div>
          <div style="font-size:12px; color:var(--color-text-muted);">${req.hospitalName}, ${req.city}</div>
        </td>
        <td><span class="badge badge-blood">${req.bloodGroup}</span></td>
        <td><strong>${req.units}</strong> Unit(s)</td>
        <td><span class="badge ${urgencyClass}">${req.urgency}</span></td>
        <td><span class="badge ${statusClass}">${req.status}</span></td>
        <td>
          <a href="request-details.html?id=${req.id}" class="btn btn-outline btn-sm">View Details</a>
        </td>
      </tr>
    `;
  }).join('');
}

function renderRecentNotifications(user) {
  const container = document.getElementById('dash-recent-notifications');
  if (!container) return;

  const notifs = storage.getNotifications(user.id).slice(0, 5);

  if (notifs.length === 0) {
    container.innerHTML = `<p style="padding:20px; color:var(--color-text-muted); text-align:center;">No recent notifications.</p>`;
    return;
  }

  container.innerHTML = notifs.map(n => `
    <div style="padding:12px 14px; border-bottom:1px solid var(--color-border-light); display:flex; gap:12px; align-items:flex-start; ${!n.isRead ? 'background:#FFF9F9;' : ''}">
      <span style="font-size:18px;">${n.type === 'donor_accepted' ? '🩸' : n.type === 'new_message' ? '💬' : '🔔'}</span>
      <div style="flex-grow:1;">
        <div style="font-weight:700; font-size:13.5px;">${n.title}</div>
        <div style="font-size:12.5px; color:var(--color-text-muted); margin:2px 0;">${n.message}</div>
        <div style="font-size:11px; color:var(--color-text-light);">${timeAgo(n.createdAt)}</div>
      </div>
      <a href="${n.link}" class="btn btn-outline btn-sm" style="font-size:11px; padding:4px 8px;">View</a>
    </div>
  `).join('');
}

function getStatusClass(status) {
  switch (status) {
    case 'Open': return 'status-open';
    case 'Donor Interested': return 'status-interested';
    case 'Donor Selected': return 'status-selected';
    case 'In Progress': return 'status-inprogress';
    case 'Completed': return 'status-completed';
    case 'Cancelled': return 'status-cancelled';
    default: return 'status-open';
  }
}
