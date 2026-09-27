/**
 * Safely extracts a readable error message from API responses or exceptions
 * @param err Unknown error object
 * @param fallback Default message if no message can be extracted
 */
export function getErrorMessage(
  err: unknown,
  fallback = "An unexpected error occurred. Please try again."
): string {
  if (!err) return fallback;

  if (typeof err === "string") return err;

  if (typeof err === "object") {
    const errorObj = err as {
      data?: { message?: string; error?: string };
      message?: string;
      error?: string;
    };

    if (errorObj.data?.message) return errorObj.data.message;
    if (errorObj.data?.error) return errorObj.data.error;
    if (errorObj.message) return errorObj.message;
    if (errorObj.error) return errorObj.error;
  }

  return fallback;
}
