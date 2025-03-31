# Chat Server

A Fastify-based server application that handles chat functionality with Salesforce integration.

## Prerequisites

- Node.js (v16 or higher)
- pnpm (recommended) or npm
- SSL certificates for HTTPS (if using HTTPS)

## Installation

1. Clone the repository:
```bash
git clone <your-repository-url>
cd server
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=8080
# Add other environment variables as needed
```

## HTTPS Configuration

To enable HTTPS, you'll need to make changes in two files:

### 1. src/index.ts
Update the CORS configuration to use HTTPS:

```typescript
await server.register(cors, {
  // For HTTPS
  origin: ["https://localhost:5173"],
  // For HTTP (development)
  // origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
  credentials: true,
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "Origin",
    "X-Requested-With",
    "x-conversation-id",
  ],
  exposedHeaders: ["*"],
  maxAge: 86400,
});
```

### 2. src/handlers/chat-sse-handler.ts
Update the CORS headers to use HTTPS:

```typescript
const streamableResponse = {
  status: 200,
  headers: {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    // For HTTPS
    "Access-Control-Allow-Origin": "https://localhost:5173",
    // For HTTP (development)
    // "Access-Control-Allow-Origin": "http://localhost:5173",
    "Access-Control-Allow-Credentials": "true",
  },
  body: sseResponse.body,
};
```

## Development

To start the development server:

```bash
pnpm dev
```

The server will start on `http://localhost:8080` (or the port specified in your `.env` file).

## Building for Production

To build the project:

```bash
pnpm build
```

To start the production server:

```bash
pnpm start
```

## API Endpoints

- `/api/messaging` - Main messaging endpoint
- `/api/sse` - Server-Sent Events endpoint for real-time updates

## Environment Variables

Create a `.env` file with the following variables:

```env
PORT=8080
# Add other required environment variables
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
