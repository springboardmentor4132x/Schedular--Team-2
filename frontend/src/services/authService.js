import API from "../shared/api/api";

export const loginUser = async (email, password) => {
    const formData = new FormData();

    formData.append("username", email);
    formData.append("password", password);

    const response = await API.post(
        "/auth/login",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};

export const getCurrentUser = async () => {
    const response = await API.get("/auth/me");
    return response.data;
};