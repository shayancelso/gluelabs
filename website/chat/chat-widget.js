/**
 * Gloo Chat Widget
 * Custom live chat powered by Supabase
 */

(function() {
  'use strict';

  // Supabase Configuration
  const SUPABASE_URL = 'https://psfqgeomdtwbhdyjsmso.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZnFnZW9tZHR3YmhkeWpzbXNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxODEwMjAsImV4cCI6MjA4MTc1NzAyMH0.pDPTBYSDp622N-KUWpG8rJzpcpQI5vnV7dK2_bViRyM';

  // State
  let supabase = null;
  let conversationId = null;
  let visitorId = null;
  let isOpen = false;
  let unreadCount = 0;
  let messageSubscription = null;

  // DOM Elements
  let widget, chatButton, chatWindow, messagesContainer, inputField, sendButton, badge;

  // Initialize Supabase
  async function initSupabase() {
    // Load Supabase client from CDN if not already loaded
    if (!window.supabase) {
      await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
    }
    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }

  // Load external script
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // Generate or retrieve visitor ID
  function getVisitorId() {
    let id = localStorage.getItem('gloo_visitor_id');
    if (!id) {
      id = 'visitor_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('gloo_visitor_id', id);
    }
    return id;
  }

  // Get or create conversation
  async function getOrCreateConversation() {
    // Check for existing active conversation
    const storedConvId = localStorage.getItem('gloo_conversation_id');

    if (storedConvId) {
      // Verify it still exists and is active
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', storedConvId)
        .eq('status', 'active')
        .single();

      if (data && !error) {
        return data.id;
      }
    }

    // Create new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        visitor_id: visitorId,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return null;
    }

    localStorage.setItem('gloo_conversation_id', data.id);
    return data.id;
  }

  // Load existing messages
  async function loadMessages() {
    if (!conversationId) return;

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    messagesContainer.innerHTML = '';

    if (data.length === 0) {
      showWelcomeMessage();
    } else {
      data.forEach(msg => appendMessage(msg));
    }

    scrollToBottom();
  }

  // Subscribe to new messages
  function subscribeToMessages() {
    if (messageSubscription) {
      messageSubscription.unsubscribe();
    }

    messageSubscription = supabase
      .channel('messages_' + conversationId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const message = payload.new;
          // Only append if it's from agent (visitor messages are added immediately)
          if (message.sender_type === 'agent') {
            appendMessage(message);
            scrollToBottom();

            // Show notification if chat is closed
            if (!isOpen) {
              unreadCount++;
              updateBadge();
              playNotificationSound();
            }
          }
        }
      )
      .subscribe();
  }

  // Send message
  async function sendMessage(content) {
    if (!content.trim() || !conversationId) return;

    const message = {
      conversation_id: conversationId,
      sender_type: 'visitor',
      content: content.trim()
    };

    // Optimistically add message to UI
    const tempId = 'temp_' + Date.now();
    appendMessage({ ...message, id: tempId, created_at: new Date().toISOString() });
    scrollToBottom();
    inputField.value = '';

    // Send to Supabase
    const { error } = await supabase
      .from('messages')
      .insert(message);

    if (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      const tempEl = document.getElementById(tempId);
      if (tempEl) tempEl.remove();
      inputField.value = content;
    }

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
  }

  // Append message to chat
  function appendMessage(message) {
    // Remove welcome message if exists
    const welcome = messagesContainer.querySelector('.gloo-chat-welcome');
    if (welcome) welcome.remove();

    const div = document.createElement('div');
    div.className = `gloo-chat-message ${message.sender_type}`;
    div.id = message.id;

    const time = new Date(message.created_at).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    div.innerHTML = `
      <div class="gloo-chat-message-content">${escapeHtml(message.content)}</div>
      <div class="gloo-chat-message-time">${time}</div>
    `;

    messagesContainer.appendChild(div);
  }

  // Show welcome message
  function showWelcomeMessage() {
    messagesContainer.innerHTML = `
      <div class="gloo-chat-welcome">
        <h5>Welcome to Gloo!</h5>
        <p>Send us a message and we'll get back to you shortly.</p>
      </div>
    `;
  }

  // Scroll to bottom of messages
  function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Update unread badge
  function updateBadge() {
    if (unreadCount > 0) {
      badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
      badge.classList.add('show');
    } else {
      badge.classList.remove('show');
    }
  }

  // Play notification sound
  function playNotificationSound() {
    // Simple beep using Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.1;

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
      // Audio not supported
    }
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Toggle chat window
  function toggleChat() {
    isOpen = !isOpen;
    chatWindow.classList.toggle('open', isOpen);
    chatButton.classList.toggle('open', isOpen);

    // Update inline styles (needed because inline styles override CSS)
    if (isOpen) {
      chatWindow.style.opacity = '1';
      chatWindow.style.visibility = 'visible';
      chatWindow.style.transform = 'translateY(0) scale(1)';
      unreadCount = 0;
      updateBadge();
      inputField.focus();
      scrollToBottom();
    } else {
      chatWindow.style.opacity = '0';
      chatWindow.style.visibility = 'hidden';
      chatWindow.style.transform = 'translateY(20px) scale(0.95)';
    }
  }

  // Create widget HTML
  function createWidget() {
    widget = document.createElement('div');
    widget.className = 'gloo-chat-widget';
    // Inline critical styles to prevent flash before CSS loads
    widget.innerHTML = `
      <div class="gloo-chat-window" style="opacity:0;visibility:hidden;transform:translateY(20px) scale(0.95)">
        <div class="gloo-chat-header">
          <div class="gloo-chat-header-avatar">
            <img src="/images/lou-chat.png" alt="Lou" onerror="this.style.display='none'">
          </div>
          <div class="gloo-chat-header-info">
            <h4>Gloo Support</h4>
            <p>We typically reply within minutes</p>
          </div>
        </div>
        <div class="gloo-chat-messages"></div>
        <div class="gloo-chat-input-container">
          <input type="text" class="gloo-chat-input" placeholder="Type your message..." maxlength="1000">
          <button class="gloo-chat-send" disabled>
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
      <button class="gloo-chat-button">
        <svg class="chat-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
        <svg class="close-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
        <span class="gloo-chat-badge"></span>
      </button>
    `;

    document.body.appendChild(widget);

    // Get DOM references
    chatButton = widget.querySelector('.gloo-chat-button');
    chatWindow = widget.querySelector('.gloo-chat-window');
    messagesContainer = widget.querySelector('.gloo-chat-messages');
    inputField = widget.querySelector('.gloo-chat-input');
    sendButton = widget.querySelector('.gloo-chat-send');
    badge = widget.querySelector('.gloo-chat-badge');
  }

  // Bind events
  function bindEvents() {
    // Toggle chat
    chatButton.addEventListener('click', toggleChat);

    // Send message on button click
    sendButton.addEventListener('click', () => {
      sendMessage(inputField.value);
    });

    // Send message on Enter
    inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage(inputField.value);
      }
    });

    // Enable/disable send button based on input
    inputField.addEventListener('input', () => {
      sendButton.disabled = !inputField.value.trim();
    });
  }

  // Initialize widget
  async function init() {
    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/chat/chat-widget.css';
    document.head.appendChild(link);

    // Create widget UI
    createWidget();
    bindEvents();

    // Initialize Supabase and conversation
    try {
      await initSupabase();
      visitorId = getVisitorId();
      conversationId = await getOrCreateConversation();

      if (conversationId) {
        await loadMessages();
        subscribeToMessages();
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
