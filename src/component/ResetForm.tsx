import React, { useState } from 'react';

const ResetPasswordForm = () => {
  const [formData, setFormData] = useState({ token: '', newPassword: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirm) return alert("Passwords do not match");

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: formData.token,
          newPassword: formData.newPassword
        }),
      });

      if (res.ok) {
        alert("Success! Your password has been updated.");
        window.location.href = '/login';
      } else {
        alert("Invalid or expired code.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-10 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create new password</h2>
        
        <form onSubmit={handleUpdate} className="space-y-4">
          <input
            type="text"
            placeholder="Enter 6-digit code"
            required
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => setFormData({...formData, token: e.target.value})}
          />
          <input
            type="password"
            placeholder="New password"
            required
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            required
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => setFormData({...formData, confirm: e.target.value})}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl mt-4"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};