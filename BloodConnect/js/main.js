/**
 * BloodConnect - Main Utilities & Global UI (main.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  setupNavbar();
  setupToastContainer();
  setupModalDismissals();
});

function setupNavbar() {
  const currentUser = storage.getCurrentUser();
  const authContainer = document.getElementById('navbar-auth-section');
  const navMenu = document.getElementById('navbar-menu');
  const hamburger = document.getElementById('hamburger-btn');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
    });
  }

  if (authContainer) {
    if (currentUser) {
      // Calculate unread notifs
      const notifs = storage.getNotifications(currentUser.id).filter(n => !n.isRead);
      const notifCount = notifs.length;
      const isAdmin = currentUser.role === 'admin';

      authContainer.innerHTML = `
        <a href="notifications.html" class="btn btn-outline btn-sm" title="Notifications" style="position:relative; padding: 6px 10px;">
          🔔 ${notifCount > 0 ? `<span class="badge status-open" style="font-size:10px; padding:1px 5px; background:var(--color-primary); color:#fff; position:absolute; top:-6px; right:-6px;">${notifCount}</span>` : ''}
        </a>
        <a href="${isAdmin ? 'admin-dashboard.html' : 'dashboard.html'}" class="nav-user-chip">
          <div class="nav-avatar">${currentUser.name.charAt(0)}</div>
          <span style="font-weight:700; font-size:13.5px; color:var(--color-text);">${currentUser.name.split(' ')[0]}</span>
        </a>
        <button onclick="handleLogout()" class="btn btn-secondary btn-sm" style="padding: 6px 12px;">Logout</button>
      `;
    } else {
      authContainer.innerHTML = `
        <a href="login.html" class="btn btn-outline btn-sm">Login</a>
        <a href="signup.html" class="btn btn-primary btn-sm">Sign Up</a>
      `;
    }
  }
}

function handleLogout() {
  storage.logout();
  showToast('Logged out successfully', 'info');
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 400);
}

function setupToastContainer() {
  if (!document.getElementById('toast-container')) {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
}

function showToast(message, type = 'info') {
  setupToastContainer();
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icon = type === 'success' ? '✓' : type === 'danger' ? '⚠' : 'ℹ';
  toast.innerHTML = `
    <span style="font-size: 18px; font-weight: bold;">${icon}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function setupModalDismissals() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('active');
      }
    });
  });

  document.querySelectorAll('.modal-close, [data-dismiss="modal"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) modal.classList.remove('active');
    });
  });
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

// Utility date formatter
function formatDate(isoStr) {
  if (!isoStr) return 'N/A';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return isoStr;
  }
}

function timeAgo(isoStr) {
  if (!isoStr) return '';
  const now = new Date();
  const past = new Date(isoStr);
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}
