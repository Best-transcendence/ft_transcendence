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

// Get current user → GET /users/me (requires token)_______________________
export async function getCurrentUser() {
  const token = localStorage.getItem("jwt");
  if (!token) throw new Error("No token found");

  const res = await fetch(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Unauthorized");
  const data = await res.json(); // { user, userStats }
  console.log("=== API RESPONSE DEBUG ===");
  console.log("Raw response:", data);
  console.log("Raw response keys:", Object.keys(data));
  console.log("User object:", data.user);
  console.log("User keys:", data.user ? Object.keys(data.user) : 'no user');
  console.log("User stats:", data.user?.stats);
  console.log("User stats type:", typeof data.user?.stats);
  console.log("User stats keys:", data.user?.stats ? Object.keys(data.user.stats) : 'undefined');
  console.log("Full user JSON:", JSON.stringify(data.user, null, 2));
  return data;
}
//_____________________________________________________________________

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

// Verify user credentials for tournament participation (without creating session)
export async function verifyUserForTournament(email: string, password: string) {
  // First, authenticate to get the token
  const authRes = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });

  if (!authRes.ok) {
    // Try to get the error message from the backend
    try {
      const errorData = await authRes.json();
      throw new Error(errorData.error || "Invalid credentials");
    } catch (parseError) {
      // Only catch JSON parsing errors, not our thrown errors
      if (parseError instanceof SyntaxError) {
        console.log("Failed to parse error response:", parseError);
        throw new Error("Invalid credentials");
      } else {
        // Re-throw our error message
        throw parseError;
      }
    }
  }

  const authData = await authRes.json();
  const token = authData.token;
  
  // Now fetch the user profile to get their actual name
  const profileRes = await fetch(`${API_URL}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!profileRes.ok) {
    // Fallback to auth data if profile fetch fails
    return {
      id: authData.user.id,
      name: email.split('@')[0], // Use email prefix as fallback
      email: authData.user.email
    };
  }

  const profileData = await profileRes.json();
  
  // Verify profile actually exists in user-service
  if (!profileData.user || !profileData.user.id) {
    throw new Error("User profile not found in system. Please contact support.");
  }
  
  // Return user data with proper name from user-service
  return {
    id: profileData.user.authUserId,
    name: profileData.user.name,
    email: profileData.user.email
  };
}
