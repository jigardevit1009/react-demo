import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * Base API Slice Configuration with Dynamic Environment URL & JWT Auth Header
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Get token from Redux auth state or localStorage
      const token = getState().auth?.token || localStorage.getItem("auth_token");
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Employees", "Tasks", "Auth"],
  endpoints: () => ({}),
});
