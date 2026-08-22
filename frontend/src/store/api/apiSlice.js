import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/**
 * Base API Slice Configuration with JWT Auth Header
 */
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    prepareHeaders: (headers, { getState }) => {
      // 1. Get token from Redux auth state or localStorage
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
