import axios from 'axios';
import { authService } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const postAlert = async (alertData) => {
  try {
    const user = authService.getCurrentUser();
    if (!user || !user.id) {
      throw new Error('Usuario no autenticado');
    }

    const response = await axios.post(`${API_URL}/alerts/create`, {
      ...alertData,
      user_id: user.id
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
};

export const getAlerts = async () => {
  try {
    const response = await axios.get(`${API_URL}/alerts`);
    return response.data;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error;
  }
};
