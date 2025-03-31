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
      // TODO: change to the production origin
      // origin: ["http://localhost:5173"],
      // For HTTPS
      origin: ["https://localhost:5173"],
      // origin: ["http://localhost:3000"],
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
