import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const getAuthHeaders = (token: string) => ({
  headers: { Authorization: `Bearer ${token}` },
});


export const getDashboardData = async (token: string) => {
  const { data } = await axios.get(`${API_URL}/user`, getAuthHeaders(token));
  return data.data; 
};


export const updateProfile = async (token: string, profileData: { displayName?: string; bio?: string }) => {
  const { data } = await axios.patch(`${API_URL}/user/profile`, profileData, getAuthHeaders(token));
  return data.data;
};


export const uploadProfilePicture = async (token: string, file: File) => {
  const formData = new FormData();
  formData.append('profilePicture', file);

  const { data } = await axios.patch(`${API_URL}/user/profile/picture`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return data.data;
};