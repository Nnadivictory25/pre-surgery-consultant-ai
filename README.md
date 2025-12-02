# Pre-Surgery Consultant AI

An AI-powered pre-surgery consultation platform built with SvelteKit and Bun, providing intelligent medical guidance and support for patients preparing for surgical procedures.

## Features

- **AI-Powered Consultations**: Advanced conversational AI for pre-surgery guidance
- **Real-time Chat**: Interactive chat interface with streaming responses
- **Medical Knowledge Base**: Comprehensive information about surgical procedures
- **Patient Support**: Personalized recommendations and preparation guidance
- **Modern UI**: Clean, responsive design built with Tailwind CSS

## Tech Stack

- **Frontend**: SvelteKit 5 with Svelte 5
- **Runtime**: Bun (JavaScript runtime)
- **Database**: SQLite with Drizzle ORM
- **AI**: OpenRouter AI SDK with multiple model support
- **Styling**: Tailwind CSS v4
- **UI Components**: ShadCn UI with Lucide icons
- **Deployment**: Docker with svelte-adapter-bun deployed on Dokploy

## Prerequisites

- Bun 1.3.1 or higher
- Node.js (for some tooling)
- Docker (optional, for containerized deployment)

## Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd pre-surgery-consultant-ai

# Install dependencies
bun install
```

### Environment Setup

Create a `.env` file in the root directory:

```env
DATABASE_URL=./database.sqlite
OPENROUTER_API_KEY=your_openrouter_api_key
```

### Database Setup

```bash
# Run database migrations
bun run db:migrate

# Optional: Open Drizzle Studio for database management
bun run db:studio
```

### Development

```bash
# Start development server
bun run dev

# Start with open browser
bun run dev -- --open
```

The application will be available at `http://localhost:5173`.

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run check` - Run Svelte type checking
- `bun run format` - Format code with Prettier
- `bun run lint` - Check code formatting
- `bun run db:push` - Push database schema changes
- `bun run db:gen` - Generate database migrations
- `bun run db:migrate` - Run database migrations
- `bun run db:studio` - Open Drizzle Studio

## Docker Deployment

### Build and Run

```bash
# Build the Docker image
docker build -t pre-surgery-ai .

# Run the container
docker run -p 4173:4173 pre-surgery-ai
```

### Using Docker Compose

```bash
docker-compose up --build
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
