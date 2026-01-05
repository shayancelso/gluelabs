/**
 * Gloo Chat Dashboard
 * Admin interface for managing live chat conversations
 */

// Supabase Configuration
const SUPABASE_URL = 'https://psfqgeomdtwbhdyjsmso.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZnFnZW9tZHR3YmhkeWpzbXNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxODEwMjAsImV4cCI6MjA4MTc1NzAyMH0.pDPTBYSDp622N-KUWpG8rJzpcpQI5vnV7dK2_bViRyM';

// Initialize Supabase client
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// State
let conversations = [];
let currentConversationId = null;
let messageSubscription = null;
let conversationSubscription = null;

// DOM Elements
const conversationList = document.getElementById('conversationList');
const chatPlaceholder = document.getElementById('chatPlaceholder');
const chatContainer = document.getElementById('chatContainer');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const searchInput = document.getElementById('searchInput');
const visitorName = document.getElementById('visitorName');
const visitorStatus = document.getElementById('visitorStatus');
const closeConversation = document.getElementById('closeConversation');

// Initialize
async function init() {
    await loadConversations();
    subscribeToNewConversations();
    bindEvents();
}

// Load all conversations
async function loadConversations() {
    const { data, error } = await supabaseClient
        .from('conversations')
        .select(`
            *,
            messages (
                content,
                sender_type,
                created_at
            )
        `)
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Error loading conversations:', error);
        conversationList.innerHTML = '<div class="empty-state"><h3>Error loading conversations</h3></div>';
        return;
    }

    conversations = data || [];
    renderConversationList();
}

// Render conversation list
function renderConversationList(filter = '') {
    if (conversations.length === 0) {
        conversationList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" width="48" height="48">
                    <path fill="#551d84" d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                </svg>
                <h3>No conversations yet</h3>
                <p>Conversations will appear here when visitors send messages</p>
            </div>
        `;
        return;
    }

    const filteredConversations = filter
        ? conversations.filter(c =>
            c.visitor_id.toLowerCase().includes(filter.toLowerCase()) ||
            (c.visitor_name && c.visitor_name.toLowerCase().includes(filter.toLowerCase()))
        )
        : conversations;

    conversationList.innerHTML = filteredConversations.map(conv => {
        const lastMessage = conv.messages && conv.messages.length > 0
            ? conv.messages[conv.messages.length - 1]
            : null;

        const displayName = conv.visitor_name || `Visitor ${conv.visitor_id.slice(-6)}`;
        const preview = lastMessage
            ? `${lastMessage.sender_type === 'agent' ? 'You: ' : ''}${lastMessage.content.substring(0, 50)}${lastMessage.content.length > 50 ? '...' : ''}`
            : 'No messages yet';

        const time = formatTime(conv.updated_at);
        const isActive = conv.id === currentConversationId;
        const isClosed = conv.status === 'closed';

        return `
            <div class="conversation-item ${isActive ? 'active' : ''} ${isClosed ? 'closed' : ''}"
                 data-id="${conv.id}"
                 onclick="selectConversation('${conv.id}')">
                <div class="conversation-header">
                    <span class="conversation-name">${escapeHtml(displayName)}</span>
                    <span class="conversation-time">${time}</span>
                </div>
                <div class="conversation-preview">
                    ${isClosed ? '<span style="color: #6b7280;">✓ Resolved</span> - ' : ''}
                    ${escapeHtml(preview)}
                </div>
            </div>
        `;
    }).join('');
}

// Select a conversation
async function selectConversation(id) {
    currentConversationId = id;
    const conversation = conversations.find(c => c.id === id);

    if (!conversation) return;

    // Update UI
    chatPlaceholder.style.display = 'none';
    chatContainer.style.display = 'flex';

    // Update header
    visitorName.textContent = conversation.visitor_name || `Visitor ${conversation.visitor_id.slice(-6)}`;
    visitorStatus.textContent = conversation.status === 'closed' ? 'Resolved' : 'Active';
    visitorStatus.className = `visitor-status ${conversation.status === 'closed' ? 'closed' : ''}`;

    // Update sidebar active state
    renderConversationList(searchInput.value);

    // Load messages
    await loadMessages(id);

    // Subscribe to new messages
    subscribeToMessages(id);
}

// Load messages for a conversation
async function loadMessages(conversationId) {
    const { data, error } = await supabaseClient
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error loading messages:', error);
        return;
    }

    renderMessages(data || []);
}

// Render messages
function renderMessages(messages) {
    if (messages.length === 0) {
        chatMessages.innerHTML = `
            <div class="empty-state">
                <p>No messages in this conversation yet</p>
            </div>
        `;
        return;
    }

    chatMessages.innerHTML = messages.map(msg => `
        <div class="message ${msg.sender_type}">
            <div class="message-content">${escapeHtml(msg.content)}</div>
            <div class="message-time">${formatMessageTime(msg.created_at)}</div>
        </div>
    `).join('');

    scrollToBottom();
}

// Subscribe to new messages in current conversation
function subscribeToMessages(conversationId) {
    if (messageSubscription) {
        messageSubscription.unsubscribe();
    }

    messageSubscription = supabaseClient
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
                // Only append if from visitor (agent messages are added immediately)
                if (message.sender_type === 'visitor') {
                    appendMessage(message);
                    playNotificationSound();
                }
            }
        )
        .subscribe();
}

// Subscribe to new conversations
function subscribeToNewConversations() {
    conversationSubscription = supabaseClient
        .channel('conversations')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
                table: 'conversations'
            },
            () => {
                // Reload conversations list on any change
                loadConversations();
            }
        )
        .on(
            'postgres_changes',
            {
                event: 'INSERT',
                schema: 'public',
                table: 'messages'
            },
            (payload) => {
                // Play sound for new visitor messages
                if (payload.new.sender_type === 'visitor' &&
                    payload.new.conversation_id !== currentConversationId) {
                    playNotificationSound();
                }
                // Refresh conversation list to update previews
                loadConversations();
            }
        )
        .subscribe();
}

// Append a single message
function appendMessage(message) {
    const emptyState = chatMessages.querySelector('.empty-state');
    if (emptyState) emptyState.remove();

    const div = document.createElement('div');
    div.className = `message ${message.sender_type}`;
    div.innerHTML = `
        <div class="message-content">${escapeHtml(message.content)}</div>
        <div class="message-time">${formatMessageTime(message.created_at)}</div>
    `;

    chatMessages.appendChild(div);
    scrollToBottom();
}

// Send a message
async function sendMessage() {
    const content = messageInput.value.trim();
    if (!content || !currentConversationId) return;

    // Clear input immediately
    messageInput.value = '';
    sendButton.disabled = true;
    autoResizeTextarea();

    // Optimistically add message
    const tempMessage = {
        id: 'temp_' + Date.now(),
        conversation_id: currentConversationId,
        sender_type: 'agent',
        content: content,
        created_at: new Date().toISOString()
    };
    appendMessage(tempMessage);

    // Send to Supabase
    const { error } = await supabaseClient
        .from('messages')
        .insert({
            conversation_id: currentConversationId,
            sender_type: 'agent',
            content: content
        });

    if (error) {
        console.error('Error sending message:', error);
        // Remove optimistic message on error
        const tempEl = document.querySelector(`[data-id="${tempMessage.id}"]`);
        if (tempEl) tempEl.remove();
        messageInput.value = content;
    }

    // Update conversation timestamp
    await supabaseClient
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentConversationId);
}

// Close/resolve a conversation
async function closeCurrentConversation() {
    if (!currentConversationId) return;

    const { error } = await supabaseClient
        .from('conversations')
        .update({ status: 'closed' })
        .eq('id', currentConversationId);

    if (error) {
        console.error('Error closing conversation:', error);
        return;
    }

    // Refresh
    await loadConversations();

    // Update header
    visitorStatus.textContent = 'Resolved';
    visitorStatus.className = 'visitor-status closed';
}

// Bind event listeners
function bindEvents() {
    // Send button click
    sendButton.addEventListener('click', sendMessage);

    // Enter to send (Shift+Enter for new line)
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Enable/disable send button
    messageInput.addEventListener('input', () => {
        sendButton.disabled = !messageInput.value.trim();
        autoResizeTextarea();
    });

    // Search conversations
    searchInput.addEventListener('input', (e) => {
        renderConversationList(e.target.value);
    });

    // Close conversation
    closeConversation.addEventListener('click', closeCurrentConversation);
}

// Auto-resize textarea
function autoResizeTextarea() {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
}

// Scroll to bottom of messages
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Play notification sound
function playNotificationSound() {
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
        oscillator.stop(audioContext.currentTime + 0.15);
    } catch (e) {
        // Audio not supported
    }
}

// Format time for conversation list
function formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;

    // Less than 1 minute
    if (diff < 60000) return 'Just now';

    // Less than 1 hour
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';

    // Same day
    if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    }

    // Older
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// Format time for messages
function formatMessageTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make selectConversation global for onclick handlers
window.selectConversation = selectConversation;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', init);
