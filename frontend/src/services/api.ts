// Centralized HTTP client for the Cricnerd backend API

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export interface ZodIssue {
  path: (string | number)[];
  message: string;
  code: string;
}

export class ApiError extends Error {
  status: number;
  zodErrors?: Record<string, string>;
  rawError?: any;

  constructor(status: number, message: string, rawError?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.rawError = rawError;

    // Auto-parse backend validation errors (Zod format)
    const backendError = rawError?.error;
    if (backendError && typeof backendError === "object") {
      const issues = backendError.issues;
      if (Array.isArray(issues)) {
        this.zodErrors = {};
        issues.forEach((issue: ZodIssue) => {
          const fieldName = issue.path.join(".");
          this.zodErrors![fieldName] = issue.message;
        });
      }
    }
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // const token = localStorage.getItem("token");
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // if (token) {
  //   headers.set("Authorization", `Bearer ${token}`);
  // }

  const config: RequestInit = {
    credentials: "include", // Send cookies (JWT)
    mode: 'cors', 
    ...options,
    headers,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorBody.message || "Something went wrong",
      errorBody
    );
  }

  return response.json();
}

export const api = {
  // 1. GET requests: Used to fetch data (like getting a list of matches)
  async get<T = any>(endpoint: string) {
    return await request<T>(endpoint, { 
      method: "GET" 
    });
  },

  // 2. POST requests: Used to create new data (like adding a new player)
  async post<T = any>(endpoint: string, data: any) {
    return await request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data), // Converts the JavaScript object to a JSON string
    });
  },

  // 3. PATCH requests: Used to update existing data (like ending a match)
  async patch<T = any>(endpoint: string, data: any) {
    return await request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data), // Converts the JavaScript object to a JSON string
    });
  },

  // 4. DELETE requests: Used to remove data (like deleting a team)
  async delete<T = any>(endpoint: string) {
    return await request<T>(endpoint, { 
      method: "DELETE" 
    });
  },
};
