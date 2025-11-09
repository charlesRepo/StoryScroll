/**
 * Normalizes various error formats into a user-friendly error message string.
 * Handles Error objects, JSON strings, nested error objects, and plain strings.
 */
export function normalizeErrorMessage(error: unknown): string {
  // Handle null/undefined
  if (!error) {
    return "An unexpected error occurred";
  }

  // Handle Error instances
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string
  if (typeof error === "string") {
    // Try to parse if it looks like JSON
    if (error.trim().startsWith("{") || error.trim().startsWith("[")) {
      try {
        const parsed = JSON.parse(error);
        return normalizeErrorMessage(parsed);
      } catch {
        // Not valid JSON, return as-is
        return error;
      }
    }
    return error;
  }

  // Handle objects with common error properties
  if (typeof error === "object") {
    const errorObj = error as Record<string, unknown>;

    // Check for nested message property (most common)
    if (errorObj.message && typeof errorObj.message === "string") {
      return errorObj.message;
    }

    // Check for error property
    if (errorObj.error) {
      // If error is a string, return it
      if (typeof errorObj.error === "string") {
        return errorObj.error;
      }
      // If error is an object with message, extract it
      if (
        typeof errorObj.error === "object" &&
        errorObj.error !== null &&
        "message" in errorObj.error &&
        typeof errorObj.error.message === "string"
      ) {
        return errorObj.error.message;
      }
    }

    // Check for details property
    if (errorObj.details && typeof errorObj.details === "string") {
      return errorObj.details;
    }

    // Fallback: try to stringify the object in a readable way
    try {
      const str = JSON.stringify(error);
      // If it's just {}, return generic message
      if (str === "{}" || str === "[]") {
        return "An unexpected error occurred";
      }
      // Don't return raw JSON, return generic message instead
      return "An unexpected error occurred";
    } catch {
      return "An unexpected error occurred";
    }
  }

  // Fallback for any other type
  return "An unexpected error occurred";
}
