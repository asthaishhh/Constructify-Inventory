import axios from "../utils/axiosConfig";

export const getDashboardAnalytics = async () => {
	const response = await axios.get("/api/dashboard/analytics");
	return response.data;
};
