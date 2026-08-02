import API from "../shared/api/api";

export const registerUser = async (userData) => {
    const response = await API.post(
        "/auth/register",
        userData
    );

    return response.data;
};

export const adminExists = async () => {
    const response = await API.get("/auth/admin-exists");
    return response.data.admin_exists;
};