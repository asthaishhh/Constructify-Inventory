import axios from "../utils/axiosConfig";

export const warmupBackendHealth = async () => {
  // Keep this endpoint fast and lightweight so app startup feels predictable.
  try {
    await axios.get("/health", { timeout: 5000 });
    return true;
  } catch (_error) {
    await axios.get("/api/health", { timeout: 5000 });
    return true;
  }
};
