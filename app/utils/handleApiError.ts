import { handleError } from "./messageUtils";

// Define type for API errors with response structure
interface ErrorWithResponse {
  response?: {
    status?: number;
    data?: {
      detail?: string;
      message?: string;
    };
  };
  status?: number;
  message?: string;
}

/**
 * Type guard to check if object has a response property
 */
function hasResponse(error: unknown): error is ErrorWithResponse {
  return Boolean(
    error &&
      typeof error === "object" &&
      "response" in error &&
      error.response &&
      typeof error.response === "object"
  );
}

/**
 * Type guard to check if object has a status property
 */
function hasStatus(error: unknown): error is { status: number } {
  return Boolean(
    error &&
      typeof error === "object" &&
      "status" in error &&
      typeof error.status === "number"
  );
}

/**
 * Handles API errors, with special handling for 401 Unauthorized responses
 * @param error The error caught from an API request
 * @param logout Optional logout function from auth context
 * @returns The original error for further handling if needed
 */
export const handleApiError = (
  error: unknown,
  logout?: () => void
): unknown => {
  // Check if error is a 401 unauthorized error
  let isUnauthorized = false;

  // Check for status code in error object
  if (hasStatus(error) && error.status === 401) {
    isUnauthorized = true;
  }
  // Check for nested response status
  else if (hasResponse(error) && error.response?.status === 401) {
    isUnauthorized = true;
  }
  // Check for error detail mentioning authentication
  else if (
    hasResponse(error) &&
    error.response?.data &&
    typeof error.response.data === "object" &&
    "detail" in error.response.data &&
    typeof error.response.data.detail === "string" &&
    error.response.data.detail.includes("authentication")
  ) {
    isUnauthorized = true;
  }
  // Check string errors
  else if (
    typeof error === "string" &&
    error.toLowerCase().includes("unauthorized")
  ) {
    isUnauthorized = true;
  }

  if (isUnauthorized) {
    // Clear auth data from localStorage
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    // Call logout function if provided (for context cleanup)
    if (logout) {
      logout();
    }

    // Show error message to user
    handleError("Your session has expired. Please log in again.");

    // Redirect to login page if running in browser
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  } else {
    // For non-auth errors, extract and display error message
    let errorMessage = "An error occurred";

    if (typeof error === "string") {
      errorMessage = error;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    } else if (hasResponse(error)) {
      // Try to extract message from response data
      const responseData = error.response?.data;

      if (responseData && typeof responseData === "object") {
        if (
          "detail" in responseData &&
          typeof responseData.detail === "string"
        ) {
          errorMessage = responseData.detail;
        } else if (
          "message" in responseData &&
          typeof responseData.message === "string"
        ) {
          errorMessage = responseData.message;
        }
      }
    } else if (error && typeof error === "object" && "message" in error) {
      const message = (error as Record<string, unknown>).message;
      if (typeof message === "string") {
        errorMessage = message;
      }
    }

    handleError(errorMessage);
  }

  return error;
};
