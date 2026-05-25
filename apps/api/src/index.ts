import http from "node:http";
import { logger } from "@repo/logger";
import { app as expressApplication } from "./server";

import { env } from "./env";

async function init() {
  try {
    const server = http.createServer(expressApplication);
    const PORT: number = env.PORT ? +env.PORT : 8000;
    server.listen(PORT, () => {
      logger.info(`http server is running on PORT ${PORT}`);
    });

    const shutdown = () => {
      logger.info("SIGINT/SIGTERM signal received. Shutting down gracefully...");
      server.close(() => {
        logger.info("HTTP server closed successfully.");
        process.exit(0);
      });

      // Forcefully terminate after 10 seconds if connections hang
      setTimeout(() => {
        logger.error("Forceful shutdown triggered after timeout.");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (err) {
    logger.error(`Error creating http server`, { err });
    process.exit(1);
  }
}

init();
