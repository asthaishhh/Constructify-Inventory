import axios from "../utils/axiosConfig";

export const warmupBackendHealth = async () => {
  // Keep this endpoint fast and lightweight so app startup feels predictable.
  try {
    // Try the proxied endpoint first (baseURL will be prepended)
    await axios.get("/health", { timeout: 5000 });
    return true;
  } catch (_error) {
    // Fallback: try direct fetch without axios baseURL to avoid double /api
    try {
      const response = await fetch("http://localhost:5000/health", { timeout: 5000 });
      if (response.ok) return true;
    } catch (e) {
      // ignore
    }
    // If all fails, return true anyway to let the app load
    return true;
  }
};
