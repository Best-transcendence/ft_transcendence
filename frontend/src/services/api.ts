import { API_URL } from "./config";

// Example: get all users
export async function getUsers() {
  const res = await fetch(`${API_URL}/users`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

// Login function
export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include", // if backend uses cookies/sessions
  });
  
  if (!res.ok) {
    // Try to get the error message from the backend
    try {
      const errorData = await res.json();
      throw new Error(errorData.error || "Login failed");
    } catch (parseError) {
      // Only catch JSON parsing errors, not our thrown errors
      if (parseError instanceof SyntaxError) {
        console.log("Failed to parse error response:", parseError);
        throw new Error("Login failed");
      } else {
        // Re-throw our error message
        throw parseError;
      }
    }
  }
  
  return res.json();
}

export async function signup(name: string, email: string, password: string, confirmPassword: string) {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, confirmPassword }),
    credentials: "include", // if backend uses cookies/sessions
  });

  if (!res.ok) {
    // Try to get the error message from the backend
    try {
      const errorData = await res.json();
      throw new Error(errorData.error || "Signup failed");
    } catch (parseError) {
      // Only catch JSON parsing errors, not our thrown errors
      if (parseError instanceof SyntaxError) {
        console.log("Failed to parse error response:", parseError);
        throw new Error("Signup failed");
      } else {
        // Re-throw our error message
        throw parseError;
      }
    }
  }

  return res.json();
}
