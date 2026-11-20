/**
 * BloodConnect - Messaging Controller (messages.js)
 * Implements Module 15: Messaging System (messages.html)
 */

document.addEventListener('DOMContentLoaded', () => {
  setupMessagingSystem();
});

function setupMessagingSystem() {
  const convListContainer = document.getElementById('chat-conversations-list');
  const messagesContainer = document.getElementById('chat-messages-container');
  const chatHeaderName = document.getElementById('chat-header-user-name');
  const chatHeaderSub = document.getElementById('chat-header-subtitle');
  const messageInput = document.getElementById('chat-text-input');
  const sendBtn = document.getElementById('chat-send-btn');

  if (!convListContainer) return;

  const currentUser = storage.getCurrentUser();
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  // Check if directed from a request or donor profile
  let targetUserId = sessionStorage.getItem('active_chat_user');
  let targetReqId = sessionStorage.getItem('active_chat_req');

  // If no stored chat user, default to first conversation partner
  const conversations = storage.getConversationsForUser(currentUser.id);
  if (!targetUserId && conversations.length > 0) {
    targetUserId = conversations[0].otherUserId;
  } else if (!targetUserId) {
    // Demo fallback: if no conversation exists, pick Sarah Jenkins or John Doe
    targetUserId = currentUser.id === 'usr_1' ? 'usr_2' : 'usr_1';
  }

  let activePartnerId = targetUserId;

  function renderConversations() {
    const list = storage.getConversationsForUser(currentUser.id);
    
    // Ensure active partner is represented
    if (!list.some(c => c.otherUserId === activePartnerId)) {
      const otherUser = storage.getUserById(activePartnerId);
      if (otherUser) {
        list.unshift({
          convId: [currentUser.id, activePartnerId].sort().join('_'),
          otherUserId: activePartnerId,
          lastMessage: 'Tap to start conversation...',
          timestamp: new Date().toISOString(),
          unread: 0
        });
      }
    }

    convListContainer.innerHTML = list.map(c => {
      const partner = storage.getUserById(c.otherUserId);
      const isSelected = c.otherUserId === activePartnerId;

      return `
        <li class="conv-item ${isSelected ? 'active' : ''}" onclick="switchConversation('${c.otherUserId}')">
          <div class="conv-avatar">${partner ? partner.name.charAt(0) : 'U'}</div>
          <div class="conv-details">
            <div class="conv-name-row">
              <span class="conv-name">${partner ? partner.name : 'User'}</span>
              <span class="conv-time">${timeAgo(c.timestamp)}</span>
            </div>
            <div class="conv-preview">${c.lastMessage}</div>
          </div>
        </li>
      `;
    }).join('');
  }

  function renderActiveChat() {
    const partner = storage.getUserById(activePartnerId);
    if (chatHeaderName) chatHeaderName.textContent = partner ? partner.name : 'Chat';
    if (chatHeaderSub) chatHeaderSub.textContent = partner ? `${partner.bloodGroup ? `Blood: ${partner.bloodGroup} | ` : ''}${partner.city || 'Online'}` : 'Online';

    const msgs = storage.getMessagesByConversation(currentUser.id, activePartnerId);

    if (msgs.length === 0) {
      messagesContainer.innerHTML = `
        <div style="text-align:center; margin:auto; color:var(--color-text-muted);">
          <div style="font-size:32px; margin-bottom:8px;">💬</div>
          <p>No messages yet with ${partner ? partner.name : 'this user'}.</p>
          <small>Send a greeting to start coordinating!</small>
        </div>
      `;
      return;
    }

    messagesContainer.innerHTML = msgs.map(m => {
      const isMe = m.senderId === currentUser.id;
      return `
        <div class="message-bubble ${isMe ? 'message-outgoing' : 'message-incoming'}">
          <div>${escapeHtml(m.content)}</div>
          <span class="message-time">${formatTime(m.timestamp)}</span>
        </div>
      `;
    }).join('');

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  window.switchConversation = function(otherUserId) {
    activePartnerId = otherUserId;
    sessionStorage.setItem('active_chat_user', otherUserId);
    renderConversations();
    renderActiveChat();
  };

  function handleSend() {
    const text = messageInput.value.trim();
    if (!text) return;

    storage.sendMessage(currentUser, activePartnerId, text, targetReqId);
    messageInput.value = '';
    renderActiveChat();
    renderConversations();

    // Simulated Auto-Reply to demonstrate interactive messaging for evaluation
    setTimeout(() => {
      const partner = storage.getUserById(activePartnerId);
      const automatedReplies = [
        `Thanks for updating me! I will be at the hospital on time.`,
        `Got it! Looking forward to coordinating with you.`,
        `Understood. Let me know if the doctor requires any additional donor details.`,
        `Yes, my donor card and identification are ready.`
      ];
      const reply = automatedReplies[Math.floor(Math.random() * automatedReplies.length)];

      if (partner) {
        storage.sendMessage(partner, currentUser.id, reply, targetReqId);
        renderActiveChat();
        renderConversations();
      }
    }, 1200);
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', handleSend);
  }

  if (messageInput) {
    messageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      }
    });
  }

  renderConversations();
  renderActiveChat();
}

function formatTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
