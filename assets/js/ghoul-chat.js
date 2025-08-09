/**
 * BlackReaper Ghoul Chat System
 * A messaging system for ghouls in Ghoul Mode
 */

const BlackReaperGhoulChat = (() => {
    // Private variables
    let isInitialized = false;
    let chatContainer = null;
    let messagesContainer = null;
    let messageInput = null;
    let currentUser = null;
    let database = null;
    let messagesRef = null;
    let presenceRef = null;
    let activeUsers = {};
    
    // Ghoul personas for anonymous mode
    const ghoulPersonas = [
        { name: 'Eyepatch', avatar: '👁️‍🗨️' },
        { name: 'Rabbit', avatar: '🐰' },
        { name: 'Raven', avatar: '🐦' },
        { name: 'Jason', avatar: '🎭' },
        { name: 'Gourmet', avatar: '🍽️' },
        { name: 'Centipede', avatar: '🦂' },
        { name: 'Owl', avatar: '🦉' },
        { name: 'Serpent', avatar: '🐍' },
        { name: 'Ape', avatar: '🐒' },
        { name: 'Naki', avatar: '😭' }
    ];
    
    // Initialize the chat system
    function init() {
        if (isInitialized) return;
        
        // Reference to Firebase Database
        if (firebase && firebase.database) {
            database = firebase.database();
            messagesRef = database.ref('ghoul_chat/messages');
            presenceRef = database.ref('ghoul_chat/presence');
        } else {
            console.error('Firebase database not initialized');
            return;
        }
        
        // Create chat UI if in Ghoul Mode
        if (!document.body.classList.contains('ghoul')) return;
        
        // Get current user
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                currentUser = user;
                setupChat();
                setupPresence();
                isInitialized = true;
            }
        });
    }
    
    // Setup chat UI
    function setupChat() {
        // Create chat container if not exists
        if (!document.getElementById('ghoul-chat')) {
            createChatUI();
        }
        
        // Reference elements
        chatContainer = document.getElementById('ghoul-chat');
        messagesContainer = document.getElementById('chat-messages');
        messageInput = document.getElementById('chat-input');
        
        // Setup event listeners
        document.getElementById('chat-send').addEventListener('click', sendMessage);
        document.getElementById('chat-toggle').addEventListener('click', toggleChat);
        
        // Listen for Enter key
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        
        // Load messages
        loadMessages();
    }
    
    // Create chat UI
    function createChatUI() {
        const chatEl = document.createElement('div');
        chatEl.id = 'ghoul-chat';
        chatEl.className = 'ghoul-chat minimized';
        
        chatEl.innerHTML = `
            <div class="chat-header">
                <div class="chat-title">
                    <div class="chat-icon">👁️</div>
                    <span>Ghoul Network</span>
                </div>
                <div class="chat-actions">
                    <span class="online-count">0</span>
                    <button id="chat-toggle">_</button>
                </div>
            </div>
            
            <div class="chat-body">
                <div id="chat-messages" class="chat-messages"></div>
                
                <div class="chat-input-container">
                    <textarea id="chat-input" placeholder="Type a message..."></textarea>
                    <button id="chat-send" class="glitch-btn">Send</button>
                </div>
                
                <div class="chat-active-users" id="active-users">
                    <!-- Active users will be listed here -->
                </div>
            </div>
        `;
        
        document.body.appendChild(chatEl);
        
        // Add CSS if not already added
        if (!document.getElementById('ghoul-chat-styles')) {
            const styles = document.createElement('style');
            styles.id = 'ghoul-chat-styles';
            styles.textContent = `
                .ghoul-chat {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 320px;
                    max-height: 500px;
                    background-color: rgba(10, 10, 10, 0.95);
                    border-radius: 8px;
                    box-shadow: 0 5px 15px rgba(225, 0, 0, 0.3);
                    z-index: 1000;
                    display: flex;
                    flex-direction: column;
                    transition: all 0.3s ease-in-out;
                    border: 1px solid #e10000;
                }
                
                .ghoul-chat.minimized {
                    max-height: 50px;
                    overflow: hidden;
                }
                
                .chat-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 15px;
                    border-bottom: 1px solid rgba(225, 0, 0, 0.5);
                    cursor: pointer;
                }
                
                .chat-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #fff;
                }
                
                .chat-icon {
                    font-size: 1.2rem;
                }
                
                .chat-actions {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .online-count {
                    color: #e10000;
                    font-size: 0.8rem;
                }
                
                #chat-toggle {
                    background: none;
                    border: none;
                    color: #fff;
                    cursor: pointer;
                    font-size: 1.2rem;
                }
                
                .chat-body {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    max-height: 450px;
                }
                
                .chat-messages {
                    flex-grow: 1;
                    padding: 15px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    max-height: 300px;
                }
                
                .chat-input-container {
                    display: flex;
                    padding: 10px;
                    gap: 10px;
                    border-top: 1px solid rgba(225, 0, 0, 0.5);
                }
                
                #chat-input {
                    flex-grow: 1;
                    background-color: rgba(30, 30, 30, 0.7);
                    border: 1px solid rgba(225, 0, 0, 0.3);
                    border-radius: 4px;
                    color: #fff;
                    padding: 8px;
                    resize: none;
                    height: 40px;
                }
                
                #chat-send {
                    height: 40px;
                    padding: 0 15px;
                }
                
                .message {
                    display: flex;
                    gap: 10px;
                    max-width: 80%;
                }
                
                .message.own {
                    align-self: flex-end;
                    flex-direction: row-reverse;
                }
                
                .message-avatar {
                    width: 30px;
                    height: 30px;
                    background-color: #e10000;
                    color: #fff;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .message-content {
                    background-color: rgba(50, 50, 50, 0.7);
                    padding: 8px 12px;
                    border-radius: 8px;
                    position: relative;
                }
                
                .message.own .message-content {
                    background-color: rgba(225, 0, 0, 0.7);
                }
                
                .message-sender {
                    font-size: 0.8rem;
                    font-weight: bold;
                    margin-bottom: 4px;
                    color: #aaa;
                }
                
                .message.own .message-sender {
                    color: #ffcccb;
                }
                
                .message-text {
                    color: #fff;
                    word-break: break-word;
                }
                
                .message-time {
                    font-size: 0.7rem;
                    color: #aaa;
                    margin-top: 4px;
                    text-align: right;
                }
                
                .chat-active-users {
                    padding: 10px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    border-top: 1px solid rgba(225, 0, 0, 0.5);
                    max-height: 80px;
                    overflow-y: auto;
                }
                
                .active-user {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    background-color: rgba(50, 50, 50, 0.7);
                    padding: 3px 8px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    color: #fff;
                }
                
                .active-user-avatar {
                    font-size: 1rem;
                }
            `;
            document.head.appendChild(styles);
        }
    }
    
    // Toggle chat minimize/maximize
    function toggleChat() {
        chatContainer.classList.toggle('minimized');
        
        const button = document.getElementById('chat-toggle');
        if (chatContainer.classList.contains('minimized')) {
            button.textContent = '_';
        } else {
            button.textContent = '×';
            // Scroll to bottom when maximizing
            scrollToBottom();
        }
    }
    
    // Setup presence system
    function setupPresence() {
        // Get user's persona
        const userPersona = getUserPersona();
        
        // Set up presence reference for this user
        const userPresenceRef = presenceRef.child(currentUser.uid);
        
        // Add this user to presence list when online
        userPresenceRef.set({
            name: userPersona.name,
            avatar: userPersona.avatar,
            lastActive: firebase.database.ServerValue.TIMESTAMP
        });
        
        // Remove user when disconnected
        userPresenceRef.onDisconnect().remove();
        
        // Listen for presence changes
        presenceRef.on('value', (snapshot) => {
            activeUsers = snapshot.val() || {};
            updateActiveUsersList();
            updateOnlineCount();
        });
    }
    
    // Get user's ghoul persona
    function getUserPersona() {
        let persona = localStorage.getItem('ghoul_persona');
        
        if (!persona) {
            // Assign a random persona
            persona = JSON.stringify(ghoulPersonas[Math.floor(Math.random() * ghoulPersonas.length)]);
            localStorage.setItem('ghoul_persona', persona);
        } else {
            persona = JSON.parse(persona);
        }
        
        return persona;
    }
    
    // Update active users list
    function updateActiveUsersList() {
        const activeUsersList = document.getElementById('active-users');
        if (!activeUsersList) return;
        
        activeUsersList.innerHTML = '';
        
        Object.keys(activeUsers).forEach(uid => {
            const user = activeUsers[uid];
            
            const userElement = document.createElement('div');
            userElement.className = 'active-user';
            userElement.innerHTML = `
                <div class="active-user-avatar">${user.avatar}</div>
                <div class="active-user-name">${user.name}</div>
            `;
            
            activeUsersList.appendChild(userElement);
        });
    }
    
    // Update online count
    function updateOnlineCount() {
        const onlineCount = document.querySelector('.online-count');
        if (!onlineCount) return;
        
        const count = Object.keys(activeUsers).length;
        onlineCount.textContent = count;
    }
    
    // Load messages
    function loadMessages() {
        // Listen for new messages
        messagesRef.orderByChild('timestamp').limitToLast(50).on('child_added', (snapshot) => {
            const message = snapshot.val();
            displayMessage(message);
        });
    }
    
    // Display message
    function displayMessage(message) {
        if (!messagesContainer) return;
        
        const isOwnMessage = message.userId === currentUser.uid;
        const messageElement = document.createElement('div');
        messageElement.className = `message ${isOwnMessage ? 'own' : ''}`;
        
        messageElement.innerHTML = `
            <div class="message-avatar">${message.avatar}</div>
            <div class="message-content">
                <div class="message-sender">${message.name}</div>
                <div class="message-text">${escapeHtml(message.text)}</div>
                <div class="message-time">${formatTimestamp(message.timestamp)}</div>
            </div>
        `;
        
        messagesContainer.appendChild(messageElement);
        scrollToBottom();
    }
    
    // Send a message
    function sendMessage() {
        if (!messageInput || !messageInput.value.trim()) return;
        
        const text = messageInput.value.trim();
        messageInput.value = '';
        
        const userPersona = getUserPersona();
        
        // Create message object
        const message = {
            userId: currentUser.uid,
            name: userPersona.name,
            avatar: userPersona.avatar,
            text: text,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        };
        
        // Save message to Firebase
        messagesRef.push(message)
            .catch((error) => {
                console.error('Error sending message:', error);
                if (window.BlackReaperNotifications) {
                    window.BlackReaperNotifications.show(
                        'Error', 
                        'Failed to send message. Please try again.',
                        'error'
                    );
                }
            });
    }
    
    // Format timestamp
    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
    // Scroll messages to bottom
    function scrollToBottom() {
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
    
    // Escape HTML to prevent XSS
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    
    // Public methods
    return {
        init: init
    };
})();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if in Ghoul Mode
    if (document.body.classList.contains('ghoul')) {
        BlackReaperGhoulChat.init();
    }
    
    // Listen for mode changes
    document.getElementById('mode-toggle').addEventListener('change', (e) => {
        if (e.target.checked) {
            // Switching to Ghoul Mode
            BlackReaperGhoulChat.init();
        }
    });
});
