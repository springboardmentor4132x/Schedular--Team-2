import API from "../shared/api/api";

export const registerUser = async (userData) => {
    const response = await API.post(
        "/auth/register",
        userData
    );

    return response.data;
};