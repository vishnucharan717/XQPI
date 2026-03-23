'use client'

import axios from "axios";
import { getSession } from "next-auth/react";

const axiosInstance = axios.create({
  baseURL: process.env.API_URL,
});

// Create the interceptor
axiosInstance.interceptors.request.use(async (request) => {
  // Get the session
  console.log("in axios instance")
  const session = await getSession();

  // Add your desired session value to the request headers
  if (session?.accessToken) {
    request.headers = Object.assign({}, request.headers, {
      Authorization: `Bearer ${session.accessToken}`,
    });
  } 
  return request;
});

export default axiosInstance;