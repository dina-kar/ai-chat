# ChatThing

A modern AI chat application built with Next.js, Appwrite and Vercel ChatSDK 3.0

<a href="ai-chat-lime-beta.vercel.app"><strong>App Link</strong></a>

<p align="center">
  <a href="https://cloneathon.t3.chat/"><strong>🏆 T3 Cloneathon</strong></a> ·
</p>

### 🤖 **AI Models**
- **Google Gemini Integration**: Models including Gemini 2.5 Flash, 2.0, and 1.5 series
- **Smart Model Selection**: Grouped by capabilities (Multimodal, Thinking, Code, Tools)


### 💬 **Chat Experience**
- **Real-time Streaming**: Live message generation with smooth animations
- **Message Management**: Edit and vote conversations
- **Syntax Highlighting**: Beautiful code formatting for all programming languages

### 📎 **File Support**
- **Multi-format Upload**: Images, PDFs, documents, audio, video (15+ file types)
- **Drag & Drop Interface**: Intuitive file attachment system

### 🛠 **Artifact System**
- **Code Execution**: Run Python code with Pyodide in the browser
- **Image Generation**: FLUX.1 model integration via Together AI
- **Document Creation**: Text and code artifacts
- **Version Control**: Navigate between different versions of created content

### 🔍 **Tools & Integration**
- **Web Search**: Real-time DuckDuckGo search integration
- **Weather Data**: Location-based weather information
- **Document Tools**: Create, update, and manage artifacts

### 🎨 **Design & UX**
- **Purple Theme**: Beautiful magnolia and chinese-violet color palette
- **Glass Morphism**: Modern frosted glass effects throughout UI
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Dark/Light Mode**: System-aware theme switching

### 🔐 **Authentication & Data**
- **Email OTP Auth**: Secure authentication via Appwrite
- **Chat History**: Persistent conversation storage
- **Privacy Controls**: Public/private chat visibility settings
- **Cross-Device Sync**: Access your chats from anywhere

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- [Google AI API Key](https://aistudio.google.com/app/apikey)
- [Appwrite Account](https://cloud.appwrite.io)
- [Together AI API Key](https://api.together.xyz) (for image generation)

### Installation

1. **Clone and install**
   ```bash
   git clone https://github.com/your-username/ai-chat.git
   cd ai-chat
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your credentials:
   ```env
   # Appwrite Configuration
   APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   APPWRITE_PROJECT_ID=your-project-id
   APPWRITE_API_KEY=your-api-key
   APPWRITE_DATABASE_ID=your-database-id
   APPWRITE_BUCKET_ID=your-bucket-id
   
   # AI API Keys
   GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-key
   TOGETHER_API_KEY=your-together-ai-key
   
   # Authentication
   AUTH_SECRET=your-random-secret
   ```

3. **Setup database**
   ```bash
   npm run setup:appwrite
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open application**
   Visit [http://localhost:3000](http://localhost:3000)

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **AI**: Vercel AI SDK, Google Gemini, Together AI
- **Backend**: Appwrite (Database, Storage, Auth)
- **Code Execution**: Pyodide (Python in browser)
- **UI Components**: Radix UI, Custom components
- **Styling**: Purple-themed design system with glass effects

## 📱 Supported File Types

**Images**: PNG, JPG, JPEG, GIF, WebP, SVG  
**Documents**: PDF, Word, Excel, PowerPoint, Text, CSV, Markdown, JSON, XML  
**Media**: MP3, WAV, M4A, OGG, MP4, WebM, MOV, AVI

## 🔧 Key Features Details

### Code Handling
- **Python Artifacts**: Self-contained executable programs with browser execution
- **Syntax Highlighting**: All programming languages with copy functionality
- **Smart Execution**: Automatic package loading and output capture

### Image Generation
- **FLUX.1 Integration**: High-quality image generation via Together AI
- **Storage Optimization**: Smart content storage (database vs file storage)
- **Base64 Support**: Efficient image data handling

### Chat Management
- **Persistent History**: All conversations saved and searchable
- **Message Editing**: Modify and branch conversation paths
- **Voting System**: Rate AI responses for quality feedback

## 📄 License

Licensed under the **Apache 2.0 License** - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

This is an open-source project. Contributions, issues, and feature requests are welcome!

---

<div align="center">
  <strong>Built with ❤️ using Next.js and modern AI technologies</strong>
</div>
