# Pre-Surgery Consultant AI

An AI-powered pre-surgery consultation platform built with SvelteKit and Bun, providing intelligent medical guidance and support for patients preparing for surgical procedures.

## Features

- **AI-Powered Consultations**: Advanced conversational AI for pre-surgery guidance
- **Real-time Chat**: Interactive chat interface with streaming responses
- **Medical Knowledge Base**: Comprehensive information about surgical procedures
- **Patient Support**: Personalized recommendations and preparation guidance
- **Modern UI**: Clean, responsive design built with Tailwind CSS
An intelligent healthcare assistant that helps patients prepare for surgery through personalized consultations.

## ✨ Features

### Core Functionality
- **AI-Powered Consultations** - Get personalized pre-surgery guidance
- **Real-time Chat Interface** - Interactive conversations with AI assistant
- **User Authentication** - Secure user identification with FingerprintJS
- **Conversation History** - Persistent chat sessions

### Advanced Analytics
- **📊 Session Timing** - Automatic tracking of consultation duration
- **👍👎 Accuracy Measurement** - Real-time feedback with thumbs up/down ratings
- **🤖 AI-Powered Session Management** - Intelligent session termination
- **📈 Analytics Dashboard** - Session and quality statistics

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) runtime
- OpenRouter API key

### Installation

```bash
# Clone the repository
git clone https://github.com/Nnadivictory25/pre-surgery-consultant-ai.git
cd pre-surgery-consultant-ai

# Install dependencies
bun install

# Create .env file
cp .env.example .env

# Add your OpenRouter API key to .env
OPENROUTER_API_KEY=your_api_key_here

# Run database migrations
bun run db:gen
bun run db:migrate

# Start development server
bun run dev
```

The application will be available at `http://localhost:4173`.

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── ai-elements/     # AI chat components
│   │   └── ui/              # Reusable UI components
│   ├── server/
│   │   └── db/              # Database configuration and schema
│   └── utils.ts             # Utility functions
├── routes/
│   ├── api/chat/            # Chat API endpoint
│   └── +layout.svelte       # Root layout
└── app.d.ts                 # Global type definitions
```

## Database

This project uses SQLite with Drizzle ORM for data persistence. The database schema is defined in `src/lib/server/db/schema.ts` and migrations are managed through Drizzle Kit.

## AI Integration

The application integrates with OpenRouter to provide access to multiple AI models for medical consultations. Configure your preferred models in the AI configuration settings.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.
