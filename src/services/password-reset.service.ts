import api from './api';


export const passwordResetService = {
 
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

 
  async verifyResetCode(email: string, resetCode: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/auth/verify-reset-code', { email, resetCode });
    return response.data;
  },

 
  async resetPassword(
    email: string, 
    resetCode: string, 
    newPassword: string
  ): Promise<{ success: boolean; message: string; accessToken?: string; user?: any; }> {
    const response = await api.post('/auth/reset-password', { 
      email, 
      resetCode, 
      newPassword,
       
    });
    return response.data;
  },


  async resendResetCode(email: string): Promise<{ message: string }> {
    const response = await api.post('/auth/resend-reset-code', { email });
    return response.data;
  },

  async checkResetCode(email: string, resetCode: string): Promise<{ valid: boolean; expiresAt?: string }> {
    const response = await api.post('/auth/check-reset-code', { email, resetCode });
    return response.data;
  }
};