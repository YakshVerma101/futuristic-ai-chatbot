# 🤖 NeuralBot - Futuristic AI Chatbot

A cutting-edge, futuristic AI chatbot with voice input/output capabilities, built with modern web technologies and featuring a stunning neural network-inspired design.

![NeuralBot Preview](https://via.placeholder.com/800x400/0a0a0f/00d4ff?text=NeuralBot+Preview)

## ✨ Features

### 🎯 Core Functionality
- **AI-Powered Conversations**: Intelligent responses powered by OpenAI's GPT models
- **Voice Input**: Speech-to-text functionality for hands-free interaction
- **Voice Output**: Text-to-speech with customizable voice settings
- **Real-time Chat**: Instant messaging with typing indicators
- **Conversation History**: Persistent chat history with timestamps

### 🎨 Futuristic Design
- **Neural Network Theme**: Animated background with floating nodes and particles
- **Multiple Themes**: Neural Blue, Cyber Green, and Quantum Purple
- **Smooth Animations**: Fluid transitions and hover effects
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Glass Morphism**: Modern UI with backdrop blur effects

### 🔧 Advanced Features
- **Voice Controls**: Toggle voice input/output with visual feedback
- **Settings Panel**: Customize voice speed, pitch, and theme
- **Keyboard Shortcuts**: Quick access to common functions
- **Rate Limiting**: Built-in protection against spam
- **Error Handling**: Graceful fallbacks and user-friendly error messages

## 🚀 Quick Start

### Prerequisites
- Node.js 14.0.0 or higher
- npm 6.0.0 or higher
- Modern web browser with Web Speech API support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/futuristic-chatbot.git
   cd futuristic-chatbot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your OpenAI API key (optional for demo mode):
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Development Mode
```bash
npm run dev
```
This will start the server with auto-reload on file changes.

## 🎮 Usage

### Basic Interaction
1. **Text Input**: Type your message in the input field and press Enter or click Send
2. **Voice Input**: Click the microphone button and speak your question
3. **Voice Output**: Toggle the speaker button to enable/disable voice responses

### Keyboard Shortcuts
- `Ctrl/Cmd + K`: Clear chat
- `Ctrl/Cmd + ,`: Open settings
- `Ctrl/Cmd + Shift + Space`: Toggle voice recording
- `Enter`: Send message
- `Shift + Enter`: New line (in text input)

### Settings
Access settings by clicking the gear icon or using `Ctrl/Cmd + ,`:
- **Voice Speed**: Adjust speech rate (0.5x - 2.0x)
- **Voice Pitch**: Modify voice pitch (0.5x - 2.0x)
- **Auto TTS**: Automatically speak bot responses
- **Theme**: Switch between Neural Blue, Cyber Green, and Quantum Purple

## 🛠️ Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | 3000 | No |
| `OPENAI_API_KEY` | OpenAI API key for AI responses | - | No* |
| `CORS_ORIGIN` | CORS origin setting | * | No |
| `RATE_LIMIT_WINDOW` | Rate limit window (ms) | 60000 | No |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 10 | No |

*Required for full AI functionality. Without it, the bot runs in demo mode.

### OpenAI API Setup
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account and generate an API key
3. Add the key to your `.env` file
4. Restart the server

## 🎨 Customization

### Themes
The chatbot supports three built-in themes:
- **Neural Blue**: Default futuristic blue theme
- **Cyber Green**: Matrix-inspired green theme  
- **Quantum Purple**: Mystical purple theme

### Adding Custom Themes
1. Edit `public/styles.css`
2. Add new theme variables in the `:root` selector
3. Create a new `[data-theme="your-theme"]` selector
4. Add the theme option to the settings dropdown

### Styling
- **Colors**: Modify CSS custom properties in `:root`
- **Animations**: Adjust keyframe animations
- **Layout**: Modify flexbox and grid layouts
- **Typography**: Change font families and sizes

## 🔧 API Endpoints

### POST `/api/chat`
Send a message to the AI chatbot.

**Request Body:**
```json
{
  "message": "Hello, how are you?",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Previous message"
    },
    {
      "role": "assistant", 
      "content": "Previous response"
    }
  ]
}
```

**Response:**
```json
{
  "response": "Hello! I'm doing great, thank you for asking!",
  "isDemo": false,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "usage": {
    "prompt_tokens": 20,
    "completion_tokens": 15,
    "total_tokens": 35
  }
}
```

### GET `/api/health`
Check server health and configuration.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0",
  "features": {
    "openai": true,
    "rateLimit": true,
    "cors": true
  }
}
```

## 🌐 Browser Support

### Required Features
- **Web Speech API**: For voice input/output
- **CSS Grid/Flexbox**: For layout
- **ES6+ JavaScript**: For modern features
- **Local Storage**: For settings persistence

### Supported Browsers
- Chrome 25+
- Firefox 44+
- Safari 14.1+
- Edge 79+

### Mobile Support
- iOS Safari 14.1+
- Chrome Mobile 25+
- Samsung Internet 4.0+

## 🚀 Deployment

### Heroku
1. Create a Heroku app
2. Set environment variables in Heroku dashboard
3. Deploy using Git:
   ```bash
   git push heroku main
   ```

### Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Test on multiple browsers
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for providing the GPT API
- **Font Awesome** for the beautiful icons
- **Google Fonts** for the futuristic typography
- **Web Speech API** for voice capabilities

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/futuristic-chatbot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/futuristic-chatbot/discussions)
- **Email**: support@neuralbot.ai

## 🔮 Roadmap

### Version 1.1
- [ ] Multi-language support
- [ ] Custom AI model selection
- [ ] Conversation export/import
- [ ] Advanced voice settings

### Version 1.2
- [ ] Plugin system
- [ ] Custom themes editor
- [ ] Analytics dashboard
- [ ] Mobile app

### Version 2.0
- [ ] Multi-user support
- [ ] Real-time collaboration
- [ ] Advanced AI features
- [ ] Enterprise features

---

**Made with ❤️ by the NeuralBot Team**

*Experience the future of AI interaction today!*
