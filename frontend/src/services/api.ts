import { API_URL } from "./config";

// Example: get all users
export async function getUsers() {
  const res = await fetch(`${API_URL}/users`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

// Example: login (dummy for now)
export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include", // if backend uses cookies/sessions
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}
