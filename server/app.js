const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// AI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const AI_PROVIDERS = {
    openai: {
        url: 'https://api.openai.com/v1/chat/completions',
        key: OPENAI_API_KEY,
        model: 'gpt-3.5-turbo'
    },
    huggingface: {
        url: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large',
        key: HUGGINGFACE_API_KEY,
        model: 'microsoft/DialoGPT-large'
    },
    groq: {
        url: 'https://api.groq.com/openai/v1/chat/completions',
        key: GROQ_API_KEY,
        model: 'llama-3.1-8b-instant'
    },
    anthropic: {
        url: 'https://api.anthropic.com/v1/messages',
        key: ANTHROPIC_API_KEY,
        model: 'claude-3-sonnet-20240229'
    }
};

// Rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute per IP

// Rate limiting middleware
const rateLimit = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return next();
    }
    
    const userLimit = rateLimitMap.get(ip);
    
    if (now > userLimit.resetTime) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return next();
    }
    
    if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
        return res.status(429).json({ 
            error: 'Rate limit exceeded. Please try again later.',
            retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
        });
    }
    
    userLimit.count++;
    next();
};

// Demo response generator
function generateDemoResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Greeting responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return "Hello! I'm NeuralBot, your AI assistant. I'm here to help you with questions, provide information, and have engaging conversations. What would you like to know?";
    }
    
    // How are you responses
    if (lowerMessage.includes('how are you') || lowerMessage.includes('how do you feel')) {
        return "I'm doing great! I'm running smoothly in demo mode and ready to assist you. I'm excited to help with whatever questions or topics you have in mind. How can I assist you today?";
    }
    
    // What are you responses
    if (lowerMessage.includes('what are you') || lowerMessage.includes('who are you')) {
        return "I'm NeuralBot, a futuristic AI assistant designed to help with a wide variety of topics. I can assist with questions about technology, science, general knowledge, problem-solving, and creative tasks. I'm currently running in demo mode, but I'm still quite capable!";
    }
    
    // Weather questions
    if (lowerMessage.includes('weather') || lowerMessage.includes('temperature')) {
        return "I'd love to help with weather information! In demo mode, I can't access real-time weather data, but I can tell you that weather forecasting typically involves analyzing atmospheric pressure, temperature, humidity, and wind patterns. For current weather, I'd recommend checking a weather app or website.";
    }
    
    // Time questions
    if (lowerMessage.includes('time') || lowerMessage.includes('date')) {
        const now = new Date();
        return `The current time is ${now.toLocaleTimeString()} and the date is ${now.toLocaleDateString()}. I can help you with time-related questions, scheduling, or time zone conversions!`;
    }
    
    // Math questions
    if (lowerMessage.includes('calculate') || lowerMessage.includes('math') || lowerMessage.includes('+') || lowerMessage.includes('-') || lowerMessage.includes('*') || lowerMessage.includes('/')) {
        return "I can help with mathematical calculations! I'm good at arithmetic, algebra, geometry, and other mathematical concepts. What specific calculation or math problem would you like me to help you with?";
    }
    
    // Programming questions
    if (lowerMessage.includes('code') || lowerMessage.includes('programming') || lowerMessage.includes('javascript') || lowerMessage.includes('python') || lowerMessage.includes('html') || lowerMessage.includes('css')) {
        return "I'd be happy to help with programming questions! I can assist with various programming languages, debugging, best practices, and software development concepts. What programming topic or problem are you working on?";
    }
    
    // Science questions
    if (lowerMessage.includes('science') || lowerMessage.includes('physics') || lowerMessage.includes('chemistry') || lowerMessage.includes('biology')) {
        return "Science is fascinating! I can help explain scientific concepts, theories, and phenomena across various fields like physics, chemistry, biology, and more. What scientific topic would you like to explore?";
    }
    
    // Technology questions
    if (lowerMessage.includes('technology') || lowerMessage.includes('ai') || lowerMessage.includes('artificial intelligence') || lowerMessage.includes('machine learning')) {
        return "Technology is my specialty! I can discuss AI, machine learning, software development, emerging technologies, and how they impact our world. What aspect of technology interests you most?";
    }
    
    // Help requests
    if (lowerMessage.includes('help') || lowerMessage.includes('assist')) {
        return "I'm here to help! I can assist with a wide range of topics including general knowledge, problem-solving, creative tasks, technology questions, and more. What specific area would you like help with?";
    }
    
    // Thank you responses
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
        return "You're very welcome! I'm glad I could help. Feel free to ask me anything else - I'm here to assist you with whatever questions or topics you have in mind.";
    }
    
    // Goodbye responses
    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('see you')) {
        return "Goodbye! It was great chatting with you. Feel free to come back anytime if you have more questions. I'm always here to help!";
    }
    
    // Default intelligent response
    const responses = [
        `That's an interesting question about "${message}". I'd be happy to help you explore this topic further. Could you provide a bit more detail about what specific aspect you'd like to know about?`,
        `I understand you're asking about "${message}". This is a great topic to discuss! In demo mode, I can provide general information and guidance. What would you like to know specifically?`,
        `"${message}" - that's a thoughtful question! I can help break this down and provide insights. What particular angle or aspect of this topic interests you most?`,
        `I appreciate you asking about "${message}". This is definitely something I can help you with! Could you tell me more about what you're trying to understand or accomplish?`,
        `Great question about "${message}"! I'm here to help you explore this topic. What specific information or guidance are you looking for?`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
}

// Get the best available AI provider
function getAvailableProvider() {
    const availableProviders = [];
    
    for (const [name, provider] of Object.entries(AI_PROVIDERS)) {
        // Check if the key exists and is not a placeholder
        if (provider.key && 
            provider.key !== 'your_openai_api_key_here' &&
            provider.key !== 'your_huggingface_api_key_here' &&
            provider.key !== 'your_groq_api_key_here' &&
            provider.key !== 'your_anthropic_api_key_here' &&
            provider.key.length > 20) { // Basic validation for real API keys
            availableProviders.push({ name, ...provider });
        }
    }
    
    // Return the first available provider, or null if none
    return availableProviders.length > 0 ? availableProviders[0] : null;
}

// Call AI API with the best available provider
async function callAIProvider(provider, messages) {
    const { name, url, key, model } = provider;
    
    try {
        let requestBody;
        let headers = {
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
        };
        
        switch (name) {
            case 'openai':
            case 'groq':
                requestBody = {
                    model: model,
                    messages: messages,
                    max_tokens: 500,
                    temperature: 0.7
                };
                break;
                
            case 'huggingface':
                // Hugging Face uses a different format
                const lastMessage = messages[messages.length - 1];
                requestBody = {
                    inputs: lastMessage.content,
                    parameters: {
                        max_length: 200,
                        temperature: 0.7,
                        do_sample: true
                    }
                };
                break;
                
            case 'anthropic':
                requestBody = {
                    model: model,
                    max_tokens: 500,
                    messages: messages.slice(1) // Remove system message for Claude
                };
                headers['x-api-key'] = key;
                delete headers['Authorization'];
                break;
                
            default:
                throw new Error(`Unsupported provider: ${name}`);
        }
        
        const response = await axios.post(url, requestBody, {
            headers,
            timeout: 30000
        });
        
        let aiResponse;
        switch (name) {
            case 'openai':
            case 'groq':
                aiResponse = response.data.choices[0].message.content;
                break;
            case 'huggingface':
                aiResponse = response.data.generated_text || response.data[0]?.generated_text || 'I understand your question. Let me help you with that.';
                break;
            case 'anthropic':
                aiResponse = response.data.content[0].text;
                break;
        }
        
        return {
            response: aiResponse,
            provider: name,
            isDemo: false
        };
        
    } catch (error) {
        console.error(`Error calling ${name} API:`, error.message);
        throw error;
    }
}

// Middleware
app.use(cors());
app.use(express.json());

// API Routes (must come before static files)
// Chat endpoint
app.post('/api/chat', rateLimit, async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;
        
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({ error: 'Message is required and must be a non-empty string' });
        }
        
        if (message.length > 1000) {
            return res.status(400).json({ error: 'Message too long. Maximum 1000 characters allowed.' });
        }
        
        // Check for available AI providers
        const provider = getAvailableProvider();
        
        if (!provider) {
            // No AI providers available, use demo response
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
            const response = generateDemoResponse(message);
            return res.json({ 
                response,
                isDemo: true,
                timestamp: new Date().toISOString(),
                provider: 'demo'
            });
        }
        
        // Prepare conversation history for AI
        const messages = [
            {
                role: 'system',
                content: `You are NeuralBot, a helpful, friendly, and knowledgeable AI assistant. You have a futuristic, tech-savvy personality and you're excited to help users with their questions. You should be concise but informative, and always maintain a positive, engaging tone. You can help with a wide variety of topics including technology, science, general knowledge, problem-solving, and creative tasks.`
            },
            ...conversationHistory.slice(-10), // Keep last 10 messages for context
            {
                role: 'user',
                content: message.trim()
            }
        ];
        
        // Call AI provider
        const aiResult = await callAIProvider(provider, messages);
        
        res.json({
            response: aiResult.response,
            isDemo: aiResult.isDemo,
            timestamp: new Date().toISOString(),
            provider: aiResult.provider
        });
        
    } catch (error) {
        console.error('Chat API error:', error);
        
        if (error.response) {
            // OpenAI API error
            const status = error.response.status;
            const errorMessage = error.response.data?.error?.message || 'OpenAI API error';
            
            if (status === 401) {
                return res.status(500).json({ 
                    error: 'AI service configuration error. Please contact support.',
                    isDemo: true
                });
            } else if (status === 429) {
                return res.status(429).json({ 
                    error: 'AI service is currently busy. Please try again in a moment.',
                    retryAfter: 60
                });
            } else if (status >= 500) {
                return res.status(503).json({ 
                    error: 'AI service temporarily unavailable. Please try again later.',
                    isDemo: true
                });
            } else {
                return res.status(500).json({ 
                    error: 'AI service error. Please try again.',
                    isDemo: true
                });
            }
        } else if (error.code === 'ECONNABORTED') {
            return res.status(504).json({ 
                error: 'Request timeout. Please try again.',
                isDemo: true
            });
        } else {
            return res.status(500).json({ 
                error: 'Internal server error. Please try again.',
                isDemo: true
            });
        }
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    const availableProviders = [];
    for (const [name, provider] of Object.entries(AI_PROVIDERS)) {
        if (provider.key) {
            availableProviders.push(name);
        }
    }
    
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        features: {
            aiProviders: availableProviders,
            rateLimit: true,
            cors: true
        },
        currentProvider: availableProviders.length > 0 ? availableProviders[0] : 'demo'
    });
});

// Static files (must come after API routes)
app.use(express.static(path.join(__dirname, '../public')));

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ 
        error: 'Internal server error',
        isDemo: true
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 NeuralBot server running on port ${PORT}`);
    console.log(`🌐 Open http://localhost:${PORT} to access the chatbot`);
    
    if (!OPENAI_API_KEY) {
        console.log('⚠️  Running in demo mode - set OPENAI_API_KEY environment variable for full AI functionality');
    } else {
        console.log('✅ OpenAI API key configured - full AI functionality enabled');
    }
    
    console.log('📊 Features enabled:');
    console.log('   - Rate limiting (10 requests/minute per IP)');
    console.log('   - CORS enabled');
    console.log('   - Static file serving');
    console.log('   - Error handling');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    process.exit(0);
});