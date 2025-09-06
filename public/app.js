// NeuralBot - AI Chatbot with Voice Features
class NeuralBot {
    constructor() {
        this.isRecording = false;
        this.isTTSEnabled = true;
        this.autoTTS = true;
        this.voiceSpeed = 1.0;
        this.voicePitch = 1.0;
        this.currentTheme = 'neural';
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.messages = [];
        
        this.initializeElements();
        this.initializeSpeechRecognition();
        this.initializeEventListeners();
        this.loadSettings();
        this.applyTheme();
    }

    initializeElements() {
        // Main elements
        this.welcomeSection = document.getElementById('welcome-section');
        this.messagesContainer = document.getElementById('messages-container');
        this.messageInput = document.getElementById('message-input');
        this.sendBtn = document.getElementById('send-btn');
        this.voiceBtn = document.getElementById('voice-btn');
        this.voiceStatus = document.getElementById('voice-status');
        this.typingIndicator = document.getElementById('typing-indicator');
        
        // Action buttons
        this.clearBtn = document.getElementById('clear-btn');
        this.ttsBtn = document.getElementById('tts-btn');
        this.settingsBtn = document.getElementById('settings-btn');
        
        // Create scroll to bottom button
        this.createScrollToBottomButton();
        
        // Modal elements
        this.settingsModal = document.getElementById('settings-modal');
        this.closeSettingsBtn = document.getElementById('close-settings');
        this.loadingOverlay = document.getElementById('loading-overlay');
        
        // Settings elements
        this.voiceSpeedSlider = document.getElementById('voice-speed');
        this.voicePitchSlider = document.getElementById('voice-pitch');
        this.autoTTSCheckbox = document.getElementById('auto-tts');
        this.themeSelect = document.getElementById('theme');
        this.speedValue = document.getElementById('speed-value');
        this.pitchValue = document.getElementById('pitch-value');
    }

    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            
            this.recognition.onstart = () => {
                this.isRecording = true;
                this.voiceBtn.classList.add('recording');
                this.updateVoiceStatus('Listening...');
            };
            
            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.messageInput.value = transcript;
                this.sendMessage();
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.updateVoiceStatus('Error occurred');
                this.stopRecording();
            };
            
            this.recognition.onend = () => {
                this.stopRecording();
            };
        } else {
            console.warn('Speech recognition not supported');
            this.voiceBtn.style.display = 'none';
        }
    }

    initializeEventListeners() {
        // Send message events
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Voice control events
        this.voiceBtn.addEventListener('click', () => this.toggleVoiceRecording());

        // Action button events
        this.clearBtn.addEventListener('click', () => this.clearChat());
        this.ttsBtn.addEventListener('click', () => this.toggleTTS());
        this.settingsBtn.addEventListener('click', () => this.openSettings());

        // Modal events
        this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettings();
            }
        });

        // Settings events
        this.voiceSpeedSlider.addEventListener('input', (e) => {
            this.voiceSpeed = parseFloat(e.target.value);
            this.speedValue.textContent = `${this.voiceSpeed}x`;
            this.saveSettings();
        });

        this.voicePitchSlider.addEventListener('input', (e) => {
            this.voicePitch = parseFloat(e.target.value);
            this.pitchValue.textContent = `${this.voicePitch}x`;
            this.saveSettings();
        });

        this.autoTTSCheckbox.addEventListener('change', (e) => {
            this.autoTTS = e.target.checked;
            this.saveSettings();
        });

        this.themeSelect.addEventListener('change', (e) => {
            this.currentTheme = e.target.value;
            this.applyTheme();
            this.saveSettings();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'k':
                        e.preventDefault();
                        this.clearChat();
                        break;
                    case ',':
                        e.preventDefault();
                        this.openSettings();
                        break;
                    case ' ':
                        if (e.shiftKey) {
                            e.preventDefault();
                            this.toggleVoiceRecording();
                        }
                        break;
                }
            }
        });
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // Hide welcome section and show messages
        this.welcomeSection.style.display = 'none';
        this.messagesContainer.classList.add('active');

        // Add user message
        this.addMessage(message, 'user');

        // Clear input
        this.messageInput.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Get AI response
            const response = await this.getAIResponse(message);
            
            // Hide typing indicator
            this.hideTypingIndicator();
            
            // Add bot response
            this.addMessage(response, 'bot');
            
            // Auto TTS if enabled
            if (this.autoTTS && this.isTTSEnabled) {
                this.speak(response);
            }
        } catch (error) {
            console.error('Error getting AI response:', error);
            this.hideTypingIndicator();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        }
    }

    async getAIResponse(message) {
        try {
            // Prepare conversation history for context
            const conversationHistory = this.messages
                .filter(msg => msg.sender === 'user' || msg.sender === 'bot')
                .slice(-10) // Keep last 10 messages for context
                .map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.content
                }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    conversationHistory: conversationHistory
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.isDemo) {
                console.log('🤖 Running in demo mode - AI responses are simulated');
            }
            
            return data.response;
        } catch (error) {
            console.error('Error calling AI API:', error);
            
            // Fallback to demo responses if API fails
            const fallbackResponses = [
                "I'm having trouble connecting to my AI brain right now, but I'm still here to help! This is a fallback response while we work on the connection.",
                "Something went wrong with my neural network, but don't worry - I'm still functional! This is a demo response while we troubleshoot.",
                "I'm experiencing some technical difficulties, but I'm still ready to assist you. This is a temporary response while we fix the issue.",
                "My AI connection is temporarily unavailable, but I'm still here to chat! This is a fallback response while we restore full functionality."
            ];
            
            return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        }
    }

    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = content;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTime);
        
        this.messagesContainer.appendChild(messageDiv);
        
        // Limit messages to prevent UI overflow (keep last 50 messages)
        const maxMessages = 50;
        const messageElements = this.messagesContainer.querySelectorAll('.message');
        if (messageElements.length > maxMessages) {
            // Remove oldest messages
            for (let i = 0; i < messageElements.length - maxMessages; i++) {
                messageElements[i].remove();
            }
        }
        
        // Auto-scroll to bottom
        this.scrollToBottom();
        
        // Store message
        this.messages.push({ content, sender, timestamp: new Date() });
        
        // Limit stored messages too
        if (this.messages.length > maxMessages) {
            this.messages = this.messages.slice(-maxMessages);
        }
    }

    scrollToBottom() {
        // Use requestAnimationFrame for smooth scrolling
        requestAnimationFrame(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        });
    }

    createScrollToBottomButton() {
        // Create scroll to bottom button
        this.scrollToBottomBtn = document.createElement('button');
        this.scrollToBottomBtn.className = 'scroll-to-bottom-btn hidden';
        this.scrollToBottomBtn.innerHTML = '<i class="fas fa-arrow-down"></i>';
        this.scrollToBottomBtn.title = 'Scroll to bottom';
        
        // Add styles
        Object.assign(this.scrollToBottomBtn.style, {
            position: 'absolute',
            bottom: '80px',
            right: '20px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'var(--gradient-primary)',
            border: 'none',
            color: 'white',
            fontSize: '18px',
            cursor: 'pointer',
            zIndex: '1000',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        });

        // Add hover effect
        this.scrollToBottomBtn.addEventListener('mouseenter', () => {
            this.scrollToBottomBtn.style.transform = 'scale(1.1)';
            this.scrollToBottomBtn.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4)';
        });

        this.scrollToBottomBtn.addEventListener('mouseleave', () => {
            this.scrollToBottomBtn.style.transform = 'scale(1)';
            this.scrollToBottomBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        });

        // Add click handler
        this.scrollToBottomBtn.addEventListener('click', () => {
            this.scrollToBottom();
            this.scrollToBottomBtn.classList.add('hidden');
        });

        // Add to chat window
        const chatWindow = document.querySelector('.chat-window');
        chatWindow.appendChild(this.scrollToBottomBtn);

        // Add scroll listener to show/hide button
        this.messagesContainer.addEventListener('scroll', () => {
            const isNearBottom = this.messagesContainer.scrollTop + this.messagesContainer.clientHeight >= 
                                this.messagesContainer.scrollHeight - 100;
            
            if (isNearBottom) {
                this.scrollToBottomBtn.classList.add('hidden');
            } else {
                this.scrollToBottomBtn.classList.remove('hidden');
            }
        });
    }

    showTypingIndicator() {
        this.typingIndicator.classList.remove('hidden');
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.typingIndicator.classList.add('hidden');
    }

    toggleVoiceRecording() {
        if (!this.recognition) {
            this.showNotification('Speech recognition not supported in this browser', 'error');
            return;
        }

        if (this.isRecording) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    stopRecording() {
        this.isRecording = false;
        this.voiceBtn.classList.remove('recording');
        this.updateVoiceStatus('');
    }

    updateVoiceStatus(status) {
        const statusElement = this.voiceStatus.querySelector('.pulse-ring');
        if (status) {
            statusElement.style.display = 'block';
        } else {
            statusElement.style.display = 'none';
        }
    }

    speak(text) {
        if (!this.synthesis || !this.isTTSEnabled) return;

        // Cancel any ongoing speech
        this.synthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = this.voiceSpeed;
        utterance.pitch = this.voicePitch;
        utterance.volume = 0.8;

        // Try to use a more natural voice
        const voices = this.synthesis.getVoices();
        const preferredVoice = voices.find(voice => 
            voice.name.includes('Google') || 
            voice.name.includes('Microsoft') ||
            voice.lang.startsWith('en')
        );
        
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.onstart = () => {
            this.ttsBtn.classList.add('active');
        };

        utterance.onend = () => {
            this.ttsBtn.classList.remove('active');
        };

        this.synthesis.speak(utterance);
    }

    toggleTTS() {
        this.isTTSEnabled = !this.isTTSEnabled;
        this.ttsBtn.classList.toggle('active', this.isTTSEnabled);
        
        if (!this.isTTSEnabled) {
            this.synthesis.cancel();
        }
        
        this.showNotification(
            `Voice output ${this.isTTSEnabled ? 'enabled' : 'disabled'}`,
            'info'
        );
    }

    clearChat() {
        this.messagesContainer.innerHTML = '';
        this.messages = [];
        this.welcomeSection.style.display = 'flex';
        this.messagesContainer.classList.remove('active');
        this.synthesis.cancel();
        this.showNotification('Chat cleared', 'info');
    }

    openSettings() {
        this.settingsModal.classList.remove('hidden');
    }

    closeSettings() {
        this.settingsModal.classList.add('hidden');
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
    }

    saveSettings() {
        const settings = {
            voiceSpeed: this.voiceSpeed,
            voicePitch: this.voicePitch,
            autoTTS: this.autoTTS,
            isTTSEnabled: this.isTTSEnabled,
            theme: this.currentTheme
        };
        localStorage.setItem('neuralbot-settings', JSON.stringify(settings));
    }

    loadSettings() {
        const saved = localStorage.getItem('neuralbot-settings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.voiceSpeed = settings.voiceSpeed || 1.0;
            this.voicePitch = settings.voicePitch || 1.0;
            this.autoTTS = settings.autoTTS !== undefined ? settings.autoTTS : true;
            this.isTTSEnabled = settings.isTTSEnabled !== undefined ? settings.isTTSEnabled : true;
            this.currentTheme = settings.theme || 'neural';
            
            // Update UI
            this.voiceSpeedSlider.value = this.voiceSpeed;
            this.voicePitchSlider.value = this.voicePitch;
            this.autoTTSCheckbox.checked = this.autoTTS;
            this.themeSelect.value = this.currentTheme;
            this.speedValue.textContent = `${this.voiceSpeed}x`;
            this.pitchValue.textContent = `${this.voicePitch}x`;
            this.ttsBtn.classList.toggle('active', this.isTTSEnabled);
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '10px',
            color: 'white',
            fontWeight: '600',
            zIndex: '3000',
            animation: 'slideIn 0.3s ease-out',
            maxWidth: '300px',
            wordWrap: 'break-word'
        });

        // Set background color based on type
        const colors = {
            info: '#00d4ff',
            success: '#00ff88',
            error: '#ff6b6b',
            warning: '#ffa500'
        };
        notification.style.background = colors[type] || colors.info;
        notification.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    showLoading(show) {
        if (show) {
            this.loadingOverlay.classList.remove('hidden');
        } else {
            this.loadingOverlay.classList.add('hidden');
        }
    }
}

// Initialize the chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add slideOut animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Initialize NeuralBot
    window.neuralBot = new NeuralBot();
    
    // Show welcome message
    console.log('🤖 NeuralBot initialized successfully!');
    console.log('💡 Keyboard shortcuts:');
    console.log('   Ctrl/Cmd + K: Clear chat');
    console.log('   Ctrl/Cmd + ,: Open settings');
    console.log('   Ctrl/Cmd + Shift + Space: Toggle voice recording');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden && window.neuralBot) {
        // Stop any ongoing speech when page is hidden
        window.neuralBot.synthesis.cancel();
    }
});

// Handle beforeunload to save settings
window.addEventListener('beforeunload', () => {
    if (window.neuralBot) {
        window.neuralBot.saveSettings();
    }
});
