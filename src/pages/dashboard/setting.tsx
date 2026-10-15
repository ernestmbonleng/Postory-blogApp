import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/src/hooks/useAuth';
import { Button } from '@/src/component/ui/button';
import { 
  User, Lock, Camera, Trash2, 
  BarChart3, Heart, FileText, 
  Moon, Sun, ShieldAlert, Mail,
  Save, Loader2, AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { DashboardLayout } from '@/src/component/DashboardLayout';
import { getMyBlog } from '@/src/services/blogs';

// API Functions
const updateProfile = async ({ token, data }: { token: string; data: any }) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
    method: 'PATCH',
    headers: { 
      'Authorization': `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update profile');
  }
  return response.json();
};

const updatePassword = async ({ token, data }: { token: string; data: { currentPassword: string; newPassword: string } }) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/password`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update password');
  }
  return response.json();
};

const uploadAvatar = async ({ token, file }: { token: string; file: File }) => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/avatar`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload avatar');
  }
  return response.json();
};

const deleteBlogApi = async ({ token, tenantId }: { token: string; tenantId: string }) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants/${tenantId}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete blog');
  }
  return response.json();
};

const updateThemePreference = async ({ token, theme }: { token: string; theme: string }) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/preferences`, {
    method: 'PATCH',
    headers: { 
      'Authorization': `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({ theme }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update theme');
  }
  return response.json();
};

// Fetch user profile
const fetchUserProfile = async (token: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch profile');
  }
  const payload = await response.json();
  return payload.data ?? payload;
};

export default function SettingsPage() {
  const router = useRouter();
  const { token, user: authUser, logout } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'danger'>('profile');
  
  // Form states
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    bio: '' 
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // UI states
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!avatarPreview) return;
    return () => URL.revokeObjectURL(avatarPreview);
  }, [avatarPreview]);

  // Fetch user profile data
const { data: userProfile, isLoading: profileLoading } = useQuery({
  queryKey: ['user-profile', token],
  queryFn: () => fetchUserProfile(token!),
  enabled: !!token,
});

useEffect(() => {
  if (userProfile) {
    setFormData({
      name: userProfile.displayName || userProfile.name || '',
      email: userProfile.email || '',
      bio: userProfile.bio || '',
    });

    setTheme(userProfile.preferences?.theme || 'light');
  }
}, [userProfile]);

  // Fetch blog data
  const { data: blog, isLoading: blogLoading } = useQuery({
    queryKey: ['my-blog-settings', token],
    queryFn: () => getMyBlog(token!),
    enabled: !!token,
  });

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      setSaveSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setTimeout(() => setSaveSuccess(false), 3000);
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to update profile');
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      setPasswordSuccess(true);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordError('');
      setTimeout(() => setPasswordSuccess(false), 3000);
    },
    onError: (error: any) => {
      setPasswordError(error.message || 'Failed to update password');
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (result) => {
      if (result?.data) {
        queryClient.setQueryData(['user-profile', token], (current: any) => ({
          ...current,
          ...result.data,
        }));
      }
      setAvatarPreview(null);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setAvatarError('');
    },
    onError: (error: any) => {
      setAvatarError(error.message || 'Failed to upload avatar');
    },
  });

  const updateThemeMutation = useMutation({
    mutationFn: updateThemePreference,
    onSuccess: () => {
      // Apply theme to document
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
  });

  const deleteBlogMutation = useMutation({
    mutationFn: deleteBlogApi,
    onSuccess: () => {
      alert("Blog deleted successfully.");
      // You might want to update user role or redirect
      router.push('/dashboard');
      queryClient.invalidateQueries({ queryKey: ['my-blog-settings'] });
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to delete blog');
    },
  });

  // Handlers
  const handleProfileSave = () => {
    if (!token) return;
    updateProfileMutation.mutate({ token, data: formData });
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    updatePasswordMutation.mutate({ 
      token: token!, 
      data: { 
        currentPassword: passwordData.currentPassword, 
        newPassword: passwordData.newPassword 
      } 
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setAvatarError('');

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('File size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setAvatarError('File must be an image');
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    uploadAvatarMutation.mutate({ token, file });
  };

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    if (token) {
      updateThemeMutation.mutate({ token, theme: newTheme });
    }
  };

  const handleDeleteBlog = () => {
    if (!token || !blog?.tenantId) return;
    
    const confirmName = prompt(`To confirm, type your blog name: "${blog.title}"`);
    
    if (confirmName === blog.title) {
      deleteBlogMutation.mutate({ token, tenantId: blog.tenantId });
    } else if (confirmName !== null) {
      alert("Names don't match. Deletion cancelled.");
    }
  };

  const isLoading = profileLoading || blogLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="animate-spin text-indigo-600" size={40} />
        </div>
      </DashboardLayout>
    );
  }

  const menuItems = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'appearance' as const, label: 'Appearance', icon: Moon },
    { id: 'danger' as const, label: 'Danger Zone', icon: ShieldAlert },
  ];

  return (
    <DashboardLayout>
      <Head>
        <title>Settings | Wordoo</title>
      </Head>

      <div className="max-w-5xl mx-auto py-8 px-4">
        {/* Header Section with Stats */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white mb-8 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-5">
              {/* Avatar with upload */}
              <div className="relative group">
                <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-bold border-4 border-slate-700 overflow-hidden">
                  {avatarPreview || userProfile?.profilePicture || userProfile?.picture ? (
                    <img 
                      src={avatarPreview || userProfile.profilePicture || userProfile.picture} 
                      alt={formData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    formData.name[0]?.toUpperCase() || 'U'
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Camera size={20} className="text-white" />
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={uploadAvatarMutation.isPending}
                  />
                </label>
                {uploadAvatarMutation.isPending && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <Loader2 size={20} className="animate-spin text-white" />
                  </div>
                )}
              </div>
              
              <div>
                <h1 className="text-2xl font-bold">{formData.name || 'User'}</h1>
                <p className="text-slate-400">@{blog?.slug || 'no-blog-yet'}</p>
              </div>
            </div>
            
            {blog && (
              <div className="flex gap-8">
                <div className="text-center">
                  <p className="text-2xl font-bold">{blog.postCount || 0}</p>
                  <p className="text-xs text-slate-400 uppercase tracking-widest">Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{blog.subscriberCount || 0}</p>
                  <p className="text-xs text-slate-400 uppercase tracking-widest">Subscribers</p>
                </div>
              </div>
            )}
          </div>

          {avatarError && (
            <div className="mt-4 bg-red-500/20 text-red-200 p-3 rounded-lg text-sm">
              {avatarError}
            </div>
          )}
        </section>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="w-full lg:w-64 space-y-2">
            {menuItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id 
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                  : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </aside>

          {/* Main Panels */}
          <main className="flex-1 bg-white border border-gray-100 rounded-3xl p-6 md:p-10 shadow-sm">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Profile Settings</h3>
                  <p className="text-gray-500 text-sm mt-1">Update your personal information.</p>
                </div>

                {saveSuccess && (
                  <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100 flex items-center gap-3">
                    <Save size={18} /> Profile updated successfully!
                  </div>
                )}

                <div className="space-y-6 max-w-2xl">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                      Display Name
                    </label>
                    <input 
                      type="text"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      disabled={updateProfileMutation.isPending}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                      Email Address
                    </label>
                    <input 
                      type="email"
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      disabled={updateProfileMutation.isPending}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                      Bio
                    </label>
                    <textarea 
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                      rows={4}
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      disabled={updateProfileMutation.isPending}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <Button 
                    className="w-full md:w-auto px-10 py-6 rounded-xl"
                    onClick={handleProfileSave}
                    isLoading={updateProfileMutation.isPending}
                  >
                    Save Changes
                  </Button>
                </div>

                {/* Password Change Section */}
                <div className="pt-8 border-t border-gray-100">
                  <h4 className="text-lg font-bold text-gray-900 mb-6">Change Password</h4>
                  
                  <form onSubmit={handlePasswordUpdate} className="max-w-xl space-y-4">
                    {passwordSuccess && (
                      <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl border border-emerald-100">
                        Password updated successfully!
                      </div>
                    )}
                    
                    {passwordError && (
                      <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center gap-2">
                        <AlertCircle size={18} />
                        {passwordError}
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                        Current Password
                      </label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                        <input 
                          type="password"
                          className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          disabled={updatePasswordMutation.isPending}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                        <input 
                          type="password"
                          className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          disabled={updatePasswordMutation.isPending}
                          required
                          minLength={8}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-3.5 text-gray-400" />
                        <input 
                          type="password"
                          className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          disabled={updatePasswordMutation.isPending}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        type="submit"
                        variant="secondary"
                        className="px-8 py-3 rounded-xl"
                        isLoading={updatePasswordMutation.isPending}
                      >
                        Update Password
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Appearance</h3>
                  <p className="text-gray-500 text-sm mt-1">Choose your theme preference.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                  <button 
                    onClick={() => handleThemeChange('light')}
                    disabled={updateThemeMutation.isPending}
                    className={`group p-1 rounded-2xl border-2 transition-all ${
                      theme === 'light' 
                        ? 'border-indigo-500 ring-2 ring-indigo-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="bg-gray-50 p-8 rounded-xl flex flex-col items-center text-center transition-colors group-hover:bg-white">
                      <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-amber-500 mb-4 border border-gray-100">
                        <Sun size={28} />
                      </div>
                      <div className="font-bold text-gray-900">Light Mode</div>
                      <div className="text-xs text-gray-500 mt-2">Clean and bright</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => handleThemeChange('dark')}
                    disabled={updateThemeMutation.isPending}
                    className={`group p-1 rounded-2xl border-2 transition-all ${
                      theme === 'dark' 
                        ? 'border-indigo-500 ring-2 ring-indigo-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="bg-slate-900 p-8 rounded-xl flex flex-col items-center text-center">
                      <div className="w-14 h-14 bg-slate-800 rounded-2xl shadow-sm flex items-center justify-center text-indigo-400 mb-4 border border-slate-700">
                        <Moon size={28} />
                      </div>
                      <div className="font-bold text-white">Dark Mode</div>
                      <div className="text-xs text-slate-400 mt-2">Easy on the eyes</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Danger Zone Tab */}
            {activeTab === 'danger' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div>
                  <h3 className="text-xl font-bold text-red-900">Danger Zone</h3>
                  <p className="text-red-600 text-sm mt-1">Irreversible actions for your blog.</p>
                </div>

                <div className="p-6 bg-red-50 border border-red-100 rounded-2xl max-w-2xl">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-100 rounded-xl">
                      <AlertCircle className="text-red-600" size={24} />
                    </div>
                    <div>
                      <h4 className="text-red-900 font-bold text-lg">Delete Blog</h4>
                      <p className="text-red-700 text-sm mt-2 leading-relaxed">
                        Once you delete <strong className="font-bold">{blog?.title || 'your blog'}</strong>, 
                        there is no going back. All your posts, images, and subscribers will be permanently removed.
                      </p>
                      
                      <div className="mt-6 p-4 bg-white/50 rounded-xl border border-red-200">
                        <p className="text-xs font-bold text-red-800 uppercase tracking-wider mb-3">
                          ⚠️ This will:
                        </p>
                        <ul className="text-sm text-red-700 space-y-2 list-disc list-inside">
                          <li>Delete all {blog?.postCount || 0} published posts</li>
                          <li>Release your blog URL slug <strong>@{blog?.slug}</strong></li>
                          <li>Remove all {blog?.subscriberCount || 0} subscribers</li>
                          <li>Permanently delete all uploaded images</li>
                        </ul>
                      </div>

                      <button 
                        onClick={handleDeleteBlog}
                        disabled={deleteBlogMutation.isPending || !blog?.tenantId}
                        className="mt-6 flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deleteBlogMutation.isPending ? (
                          <Loader2 className="animate-spin" size={18} />
                        ) : (
                          <Trash2 size={18} />
                        )}
                        Permanently Delete "{blog?.title || 'Blog'}"
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
}
