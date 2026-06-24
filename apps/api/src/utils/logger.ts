type Level = "info" | "warn" | "error" | "debug";

function log(level: Level, ...args: unknown[]): void {
  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${level.toUpperCase().padEnd(5)}]`;
  switch (level) {
    case "error":
      console.error(prefix, ...args);
      break;
    case "warn":
      console.warn(prefix, ...args);
      break;
    case "debug":
      if (process.env.NODE_ENV !== "production") console.debug(prefix, ...args);
      break;
    default:
      console.log(prefix, ...args);
  }
}

export const logger = {
  info:  (...args: unknown[]) => log("info",  ...args),
  warn:  (...args: unknown[]) => log("warn",  ...args),
  error: (...args: unknown[]) => log("error", ...args),
  debug: (...args: unknown[]) => log("debug", ...args),
};
