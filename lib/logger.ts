type LogValue = string | number | boolean | null | undefined;

function write(level: "info" | "error", event: string, data: Record<string, LogValue>) {
  const line = JSON.stringify({ level, event, ...data });
  if (level === "error") {
    console.error(line);
  } else {
    console.info(line);
  }
}

export function logInfo(event: string, data: Record<string, LogValue> = {}) {
  write("info", event, data);
}

export function logError(event: string, data: Record<string, LogValue> = {}) {
  write("error", event, data);
}
