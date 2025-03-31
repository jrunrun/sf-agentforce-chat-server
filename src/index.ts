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
      origin: [
        "https://localhost:5173",
        "https://sf-agentforce-chat-server-production.up.railway.app",
        "https://136.226.100.188:5173",
      ],
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
