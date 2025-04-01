import fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";
import path from "node:path";
import fastifyStatic from "@fastify/static";
import messagingRoutes from "./routes.js";

dotenv.config();

const server = fastify({
  logger: true,
});

async function start() {
  try {
    await server.register(fastifyStatic, {
      root: path.join(process.cwd(), "dist"),
      prefix: "/",
    });

    await server.register(cors, {
      origin: (origin, cb) => {
        // Log the incoming origin for debugging
        console.log('CORS request from origin:', origin);
        
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
          console.log('No origin provided, allowing request');
          return cb(null, true);
        }
        
        const allowedOrigins = [
          "https://localhost:5173",
          "http://localhost:5173",
          "https://sf-agentforce-chat-server-production.up.railway.app",
          "https://136.226.100.188:5173",
          "http://localhost:3000",
          "https://localhost:3000"
        ];
        
        if (allowedOrigins.includes(origin)) {
          console.log('Origin allowed:', origin);
          cb(null, true);
        } else {
          console.log('Origin not allowed:', origin);
          cb(new Error('Not allowed by CORS'), false);
        }
      },
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
      credentials: true,
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "X-Requested-With",
        "x-conversation-id",
        "Access-Control-Allow-Origin",
        "Access-Control-Allow-Headers",
        "Access-Control-Allow-Methods",
        "Access-Control-Allow-Credentials",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers"
      ],
      exposedHeaders: ["*"],
      maxAge: 86400,
      preflightContinue: false,
      optionsSuccessStatus: 204
    });

    // Add a global hook to log all requests
    server.addHook('onRequest', async (request, reply) => {
      console.log('Incoming request:', {
        method: request.method,
        url: request.url,
        headers: request.headers,
        origin: request.headers.origin
      });
    });

    // Health check endpoint for Railway
    server.get("/", async () => {
      return { status: "ok" };
    });

    await server.register(messagingRoutes, { prefix: "/api" });

    server.setNotFoundHandler((request, reply) => {
      return reply.sendFile("index.html");
    });

    const port = process.env.PORT || 8080;
    const host = '0.0.0.0'; // Required for Railway
    
    console.log('Starting server with configuration:', {
      port,
      host,
      env: process.env.NODE_ENV,
      allEnvVars: process.env
    });

    await server.listen({ 
      port: Number(port), 
      host,
      listenTextResolver: (address) => {
        return `Server running at ${address}`;
      }
    });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
