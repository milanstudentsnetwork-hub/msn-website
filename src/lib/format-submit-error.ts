/** Server function validation failures throw a ZodError whose `.message` is a raw
 * JSON array of issues. Turn that into a short, readable sentence instead of
 * dumping the JSON at the user. Falls back to the plain error message otherwise. */
export function formatSubmitError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);

  try {
    const issues = JSON.parse(message);
    if (Array.isArray(issues) && issues.every((i) => i && typeof i.message === "string")) {
      return issues.map((i) => i.message as string).join(" ");
    }
  } catch {
    // Not a JSON-encoded issue list — fall through to the plain message.
  }

  return message;
}
