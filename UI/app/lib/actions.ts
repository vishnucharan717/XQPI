'use client'
import axios from "axios";
import axiosInstance from '../axios';
import { redirect } from 'next/navigation'

export async function getUserProducts() {
  try {
    const response = await axiosInstance.get('http://localhost:9000/api/view/user_files/');
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch user product download data.');
  }
}

export async function downloadFile(username: any, filename: string, token: string) {
  try {
    const response = await axiosInstance.get('http://localhost:9000/api/products/downloadapi/' + username + '/' + filename + '/',
    { params: {token: token} });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch user product download data.');
  }
}

export async function downloadZipFile(username: any, filename: string, token: string) {
  try {
    const response = await axiosInstance.get(`/api/products/downloadapi/${username}/${filename}/`, {
      params: { token: token },
      responseType: 'blob' // This tells axios to handle the response as binary (blob)
    });
    return response.data; // This will be a Blob object
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch user product zip file.');
  }
}

export async function getUserProductsZip() {
  try {
    const response = await axiosInstance.get('http://localhost:9000/api/get_zipfile_link/');
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch user product download data.');
  }
}


export async function getUers() {
  try {
    const response = await axiosInstance.get('http://localhost:9000/api/view/users/');
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Redirect to login page if status code is 401
      redirect('/api/auth/signin?callback=/client')
    }
    throw new Error('Failed to fetch users data.');
  }
}

export async function getUser(userId: any) {
  try {
    const response = await axiosInstance.get('http://localhost:9000/api/user/view/',
    { params: {id: userId} }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch users data.');
  }
}

export async function registerUser(userData: any) {
  try {
    const response = await axiosInstance.post<{
      data: any;
    }>('http://localhost:9000/api/register/', {
      username: userData.username,
      password: userData.password,
      password2: userData.password2,
      email: userData.email,
      county: userData.county,
      agency: userData.agency,
      role: userData.role

    });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to register user.');
  }
}

export async function updateUser(userData: any, userId: any) {
  try {
    const response = await axiosInstance.put<{
      data: any;
    }>(`http://localhost:9000/api/user/update/${userId}/`, {
      username: userData.username,
      password: userData.password,
      password2: userData.password2,
      email: userData.email,
      county: userData.county,
      agency: userData.agency,
      role: userData.role
    });
    return response;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to register user.');
  }
}

export async function getAreaAndPoints() {
  try {
    const response = await axiosInstance.get('http://localhost:9000/api/view/areapoints/');
    return response.data;
  } catch (error) {
    console.log("error occured", error);
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Redirect to login page if status code is 401
      redirect('/api/auth/signin?callback=/client')
    }
    throw new Error('Failed to fetch area and points data.');
  }

}

export async function updateAreaAndPoint(mapData: any) {
  try {
    const response = await axiosInstance.post<{
      data: any;
    }>('http://localhost:9000/api/update/areapoints/',
      mapData
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to update area and points data.');
  }
}

export async function getUserProductsSelection() {
  try {
    const response = await axiosInstance.get('http://localhost:9000/api/get_user_products/',
    // { params: {id: userId} }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to fetch users data.');
  }
}

export async function updateUserProductsSelection(userSelection: any) {
  try {
    const response = await axiosInstance.post<{
      data: any;
    }>('http://localhost:9000/api/update_user_products/',
      userSelection
    );
    return response;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw new Error('Failed to update area and points data.');
  }
}

export async function userLogout() {
  console.log("In user logout")
  try {
    const response = await axiosInstance.post('http://localhost:9000/api/logout/');
    console.log("logout api res", response);
    return response.data;
  } catch (error) {
    console.log("error occured", error);
    throw new Error('Failed to fetch area and points data.');
  }
}
