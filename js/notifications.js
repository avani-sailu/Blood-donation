/**
 * BloodConnect - Notifications Controller (notifications.js)
 * Implements Module 14: Notifications (notifications.html)
 */

document.addEventListener('DOMContentLoaded', () => {
  setupNotificationsPage();
});

function setupNotificationsPage() {
  const container = document.getElementById('notifications-list');
  if (!container) return;

  const currentUser = storage.getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  const markAllBtn = document.getElementById('notif-mark-all');
  if (markAllBtn) {
    markAllBtn.addEventListener('click', () => {
      storage.markAllNotificationsRead(currentUser.id);
      showToast('All notifications marked as read.', 'info');
      render();
    });
  }

  function render() {
    const notifs = storage.getNotifications(currentUser.id);
    const unreadCount = notifs.filter(n => !n.isRead).length;

    const countHeader = document.getElementById('notif-count-display');
    if (countHeader) countHeader.textContent = unreadCount;

    if (notifs.length === 0) {
      container.innerHTML = `
        <div style="background:white; border-radius:12px; padding:40px; text-align:center; border:1px solid var(--color-border);">
          <div style="font-size:36px; margin-bottom:10px;">🔔</div>
          <h3>You're all caught up!</h3>
          <p style="color:var(--color-text-muted); margin-top:6px;">No notifications at this time.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = notifs.map(n => {
      const icon = n.type === 'donor_accepted' ? '🩸' : n.type === 'new_message' ? '💬' : n.type === 'requester_selected' ? '🎉' : '🔔';

      return `
        <div class="dash-card" style="margin-bottom:12px; padding:16px 20px; display:flex; gap:16px; align-items:center; ${!n.isRead ? 'border-left:5px solid var(--color-primary); background:#FFFBFB;' : ''}">
          <div style="font-size:24px; flex-shrink:0;">${icon}</div>
          <div style="flex-grow:1;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <h4 style="font-size:15px; font-weight:700;">${n.title}</h4>
              <span style="font-size:11.5px; color:var(--color-text-light);">${timeAgo(n.createdAt)}</span>
            </div>
            <p style="font-size:13.5px; color:var(--color-text-muted); margin:4px 0 8px;">${n.message}</p>
            <div style="display:flex; gap:10px;">
              ${n.link ? `<a href="${n.link}" onclick="markAsRead('${n.id}')" class="btn btn-outline btn-sm" style="font-size:11px; padding:3px 10px;">View Details</a>` : ''}
              ${!n.isRead ? `<button onclick="markAsRead('${n.id}')" class="btn btn-secondary btn-sm" style="font-size:11px; padding:3px 10px;">Mark Read</button>` : ''}
              <button onclick="deleteNotif('${n.id}')" class="btn btn-secondary btn-sm" style="font-size:11px; padding:3px 8px; color:var(--color-danger);">Delete</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  window.markAsRead = function(id) {
    storage.markNotificationAsRead(id);
    render();
  };

  window.deleteNotif = function(id) {
    storage.deleteNotification(id);
    render();
  };

  render();
}
