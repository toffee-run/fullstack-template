import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  transport: {
    targets: [
      { target: "pino-pretty" },
      { target: "pino-opentelemetry-transport" },
    ],
  },
});

export default logger;
