// import { useState, useEffect } from "react";

// export default function Settings() {
//   const [blogName, setBlogName] = useState("");
//   const [description, setDescription] = useState("");
//   const [loading, setLoading] = useState(false);

//   // Helper function to find the token no matter what it's named
//   const getExistingToken = () => {
//     return localStorage.getItem("token") || localStorage.getItem("accessToken");
//   };

//   useEffect(() => {
//     const fetchBlog = async () => {
//       const token = getExistingToken();
//       // If no token is found, we just stop quietly instead of crashing
//       if (!token || token === "undefined") return;

//       try {
//         const res = await fetch("http://localhost:4000/blogs/me", {
//           headers: { "Authorization": `Bearer ${token}` }
//         });

//         const data = await res.json();
//         if (res.ok && data.blog) {
//           setBlogName(data.blog.title || data.blog.blogName || "");
//           setDescription(data.blog.description || data.blog.blogDescription || "");
//         }
//       } catch (error) {
//         console.log("Note: Could not load existing blog data yet.");
//       }
//     };
//     fetchBlog();
//   }, []);

//   const handleSave = async () => {
//     const token = getExistingToken();

//     if (!token || token === "undefined") {
//       alert("Please log in again to save your changes.");
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await fetch("http://localhost:4000/blogs/settings", {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token.trim()}`, 
//         },
//         body: JSON.stringify({
//           blogName: blogName,          
//           blogDescription: description 
//         }),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.message || "Update failed");
//       }

//       alert("✅ Settings updated successfully!");
//     } catch (error: any) {
//       alert("Error: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{ padding: "40px", maxWidth: "700px", margin: "0 auto", fontFamily: "sans-serif" }}>
//       <h1 style={{ fontSize: "28px", marginBottom: "30px" }}>Settings</h1>
//       <div style={{ border: "1px solid #e5e5e5", borderRadius: "10px", padding: "25px", background: "#fff" }}>
//         <h2 style={{ marginBottom: "20px" }}>Blog Settings</h2>
        
//         <div style={{ marginBottom: "20px" }}>
//           <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Blog Name</label>
//           <input
//             type="text"
//             value={blogName}
//             onChange={(e) => setBlogName(e.target.value)}
//             style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
//           />
//         </div>

//         <div style={{ marginBottom: "20px" }}>
//           <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Blog Description</label>
//           <textarea
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             rows={4}
//             style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
//           />
//         </div>

//         <button
//           onClick={handleSave}
//           disabled={loading}
//           style={{
//             padding: "10px 18px",
//             backgroundColor: loading ? "#666" : "#111",
//             color: "white",
//             borderRadius: "6px",
//             border: "none",
//             cursor: loading ? "not-allowed" : "pointer"
//           }}
//         >
//           {loading ? "Saving..." : "Save Changes"}
//         </button>
//       </div>
//     </div>
//   );
// }


import React, { useState, useEffect } from "react";
import { Loader2, User, Lock, Globe, Save } from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [profile, setProfile] = useState({ displayName: "", email: "", username: "" });
  const [blog, setBlog] = useState({ name: "", description: "" });
  const [security, setSecurity] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  const getExistingToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken")?.trim() || null;
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    alert("Session expired. Please log in again.");
    window.location.href = "/login"; 
  };

  useEffect(() => {
    const loadSettings = async () => {
      const token = getExistingToken();
      if (!token) {
        setInitialLoading(false);
        return;
      }

      try {
        // We fetch both, but we will handle them individually to prevent one crash from killing the other
        const [userRes, blogRes] = await Promise.all([
          fetch("http://localhost:4000/user/me", { 
            headers: { Authorization: `Bearer ${token}` } 
          }),
          fetch("http://localhost:4000/blogs/me", { 
            headers: { Authorization: `Bearer ${token}` } 
          }),
        ]);

        // DEBUG LOGS - Check your browser console!
        console.log("User API Status:", userRes.status);
        console.log("Blog API Status:", blogRes.status);

        // 1. Handle User Data (Primary)
        if (userRes.status === 403 || userRes.status === 401) {
          console.error("User request failed with 403/401. Logging out.");
          handleLogout();
          return;
        }

        const uData = await userRes.json();
        if (uData.success && uData.data) {
          setProfile({
            displayName: uData.data.displayName || "",
            email: uData.data.email || "",
            username: uData.data.username || "",
          });
        }

        // 2. Handle Blog Data (Secondary)
        if (blogRes.ok) {
          const bData = await blogRes.json();
          // Safe check for different backend response structures
          const blogInfo = bData.blog || bData.data || bData;
          if (blogInfo) {
            setBlog({
              name: blogInfo.title || blogInfo.blogName || blogInfo.name || "",
              description: blogInfo.description || blogInfo.blogDescription || "",
            });
          }
        } else {
          console.warn("Blog settings couldn't be loaded, but profile is okay.");
        }

      } catch (err) {
        console.error("Settings Load Error:", err);
      } finally {
        setInitialLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleUpdate = async (url: string, method: string, body: any, successMsg: string) => {
    const token = getExistingToken();
    if (!token) return handleLogout();

    setLoading(true);
    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      
      if (res.ok) {
        if (url.includes("user/profile")) {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            localStorage.setItem("user", JSON.stringify({ ...parsed, ...body }));
          }
        }
        alert(`✅ ${successMsg}`);
        if (method !== "PUT") window.location.reload(); 
      } else {
        if (res.status === 403 || res.status === 401) {
           handleLogout();
        } else {
           alert(`❌ ${data.message || "Update failed"}`);
        }
      }
    } catch (err) {
      alert("❌ Network error. Check if your server is running.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <Loader2 className="animate-spin text-black" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 font-sans bg-white min-h-screen text-black">
      <h1 className="text-4xl font-extrabold mb-10 text-gray-900">Settings</h1>

      <div className="flex flex-col md:flex-row gap-10">
        <div className="md:w-64 flex flex-col gap-2">
          <TabButton active={activeTab === "account"} onClick={() => setActiveTab("account")} icon={<User size={20}/>} label="Account" />
          <TabButton active={activeTab === "blog"} onClick={() => setActiveTab("blog")} icon={<Globe size={20}/>} label="Blog Settings" />
          <TabButton active={activeTab === "security"} onClick={() => setActiveTab("security")} icon={<Lock size={20}/>} label="Security" />
        </div>

        <div className="flex-1 border border-gray-100 rounded-2xl p-8 shadow-sm">
          {activeTab === "account" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold">Account Settings</h2>
              <div className="grid gap-4">
                <InputGroup label="Username" value={profile.username} onChange={(v) => setProfile({...profile, username: v})} />
                <InputGroup label="Display Name" value={profile.displayName} onChange={(v) => setProfile({...profile, displayName: v})} />
                <InputGroup label="Email" type="email" value={profile.email} onChange={(v) => setProfile({...profile, email: v})} />
                <button onClick={() => handleUpdate("http://localhost:4000/user/profile", "PATCH", profile, "Profile Updated!")} disabled={loading} className={btnClass}>
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save Account
                </button>
              </div>
            </div>
          )}
{activeTab === "blog" && (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold">Blog Settings</h2>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold mb-1">Blog Title</label>
        <input 
          className={inputClass} 
          value={blog.name} 
          onChange={(e) => setBlog({...blog, name: e.target.value})} 
          placeholder="e.g. My Tech Journey" 
        />
      </div>
      <div>
        <label className="block text-sm font-semibold mb-1">About the Blog</label>
        <textarea 
          className={inputClass} 
          rows={4} 
          value={blog.description} 
          onChange={(e) => setBlog({...blog, description: e.target.value})} 
          placeholder="Describe what you write about..." 
        />
      </div>
      <button 
        onClick={() => handleUpdate("http://localhost:4000/blogs/settings", "PUT", { 
          blogName: blog.name, 
          blogDescription: blog.description 
        }, "Blog Updated!")} 
        disabled={loading} 
        className={btnClass}
      >
        <Save size={18} /> Update Blog
      </button>
    </div>
  </div>
)}

          {activeTab === "security" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <h2 className="text-2xl font-bold text-red-600">Security</h2>
              <div className="grid gap-4">
                <InputGroup label="Current Password" type="password" value={security.currentPassword} onChange={(v) => setSecurity({...security, currentPassword: v})} />
                <hr className="my-2"/>
                <InputGroup label="New Password" type="password" value={security.newPassword} onChange={(v) => setSecurity({...security, newPassword: v})} />
                <InputGroup label="Confirm New Password" type="password" value={security.confirmPassword} onChange={(v) => setSecurity({...security, confirmPassword: v})} />
                <button 
                   onClick={() => {
                     if (security.newPassword !== security.confirmPassword) return alert("Passwords don't match");
                     handleUpdate("http://localhost:4000/user/change-password", "PATCH", { currentPassword: security.currentPassword, newPassword: security.newPassword }, "Password changed successfully!");
                   }}
                   disabled={loading} 
                   className="w-full bg-red-600 text-white p-4 rounded-xl font-bold hover:bg-red-700 transition-colors"
                >
                  Change Password
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Reusable Sub-components to keep code clean
const TabButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`flex items-center gap-3 p-4 rounded-xl transition-all ${active ? "bg-black text-white shadow-lg" : "text-gray-600 hover:bg-gray-100"}`}>
    {icon} <span className="font-medium">{label}</span>
  </button>
);

const InputGroup = ({ label, value, onChange, type = "text" }: any) => (
  <div>
    <label className="block text-sm font-semibold mb-1 text-gray-700">{label}</label>
    <input type={type} className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const inputClass = "w-full p-4 border border-gray-200 rounded-xl outline-none bg-gray-50 text-black focus:ring-2 focus:ring-black focus:bg-white transition-all";
const btnClass = "w-full flex items-center justify-center gap-2 bg-black text-white p-4 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 transition-all active:scale-[0.98]";