import axios from "axios";

const API = axios.create({
    baseURL: "http://192.168.137.1:8080"
});

// FIX: use sessionStorage! ✅
// each tab reads OWN token!
API.interceptors.request.use(
    (config) => {
        const token = sessionStorage
            .getItem("token"); // ✅

        if (token) {
            config.headers.Authorization =
                "Bearer " + token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// response interceptor!
// handle 401 globally!
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // token expired!
            sessionStorage.removeItem("token"); // ✅
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

export default API;