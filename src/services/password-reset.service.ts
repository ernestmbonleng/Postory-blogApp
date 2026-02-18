import api from './api';


export const passwordResetService = {
  /**
   * Step 1: Request password reset code
   * POST /auth/forgot-password
   * Body: { email: string }
   * Response: { message: "We've sent a password reset email..." }
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Step 2: Verify the reset code
   * POST /auth/verify-reset-code
   * Body: { email: string, resetCode: string }
   * Response: { success: true, message: "Code verified successfully" }
   */
  async verifyResetCode(email: string, resetCode: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/auth/verify-reset-code', { email, resetCode });
    return response.data;
  },

  /**
   * Step 3: Reset password with new password
   * POST /auth/reset-password
   * Body: { email: string, resetCode: string, newPassword: string }
   * Response: { success: true, message: "Password reset successful..." }
   */
  async resetPassword(
    email: string, 
    resetCode: string, 
    newPassword: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.post('/auth/reset-password', { 
      email, 
      resetCode, 
      newPassword 
    });
    return response.data;
  },

  /**
   * Optional: Resend reset code
   * POST /auth/resend-reset-code
   * Body: { email: string }
   * Response: { message: "We've sent a password reset email..." }
   */
  async resendResetCode(email: string): Promise<{ message: string }> {
    const response = await api.post('/auth/resend-reset-code', { email });
    return response.data;
  },

  /**
   * Optional: Check if code is still valid
   * POST /auth/check-reset-code
   * Body: { email: string, resetCode: string }
   * Response: { valid: boolean, expiresAt?: string }
   */
  async checkResetCode(email: string, resetCode: string): Promise<{ valid: boolean; expiresAt?: string }> {
    const response = await api.post('/auth/check-reset-code', { email, resetCode });
    return response.data;
  }
};