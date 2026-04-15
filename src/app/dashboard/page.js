'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { getUserInfoByUserId, createUserInfo } from '@/models/user-info';

export default function Dashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [hasInfo, setHasInfo] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile_number: '',
    number_of_cars: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check session on load
    const savedSession = localStorage.getItem('socity_user_session');
    if (!savedSession) {
      router.replace('/');
      return;
    }
    
    try {
      const data = JSON.parse(savedSession);
      setUserData(data);
      
      // Check if user info exists
      checkUserInfo(data.id);
    } catch (e) {
      console.error("Failed to parse session", e);
      localStorage.removeItem('socity_user_session');
      router.replace('/');
    }
  }, [router]);

  async function checkUserInfo(userId) {
    try {
      const info = await getUserInfoByUserId(userId);
      if (info) {
        setHasInfo(true);
      }
    } catch (error) {
      console.error("Error checking user info:", error);
    } finally {
      setLoadingInfo(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('socity_user_session');
    router.replace('/');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'number_of_cars' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createUserInfo({
        user_id: userData.id,
        ...formData
      });
      setHasInfo(true);
    } catch (error) {
      console.error("Error creating user info:", error);
      alert("Failed to save information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-zinc-500">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <header className="sticky top-0 z-10 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 px-6 py-4">
        <div className="flex items-center justify-between max-w-2xl mx-auto w-full">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Socity Logo"
            width={80}
            height={16}
          />
          <button 
            onClick={handleLogout}
            className="text-sm font-medium text-red-600 hover:text-red-500"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-2xl mx-auto w-full">
        <div className="w-full space-y-8">
          <div className="text-center">
            <div className="h-24 w-24 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
              🏠
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              Welcome Back!
            </h1>
          </div>

          {/* Consolidated View */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm text-center">
            <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-tight">
              {userData.society} | {userData.pocket} | {userData.flat_number}
            </p>
          </div>

          {!loadingInfo && !hasInfo && (
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="text-center">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Complete Your Profile</h2>
                <p className="text-sm text-zinc-500 mt-1">Please provide a few more details to continue.</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 outline-none transition-all"
                    placeholder="Enter your name"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 outline-none transition-all"
                    placeholder="email@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Mobile Number</label>
                  <input 
                    type="tel" 
                    name="mobile_number"
                    required
                    value={formData.mobile_number}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 outline-none transition-all"
                    placeholder="e.g. +91 9876543210"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Number of Cars</label>
                  <input 
                    type="number" 
                    name="number_of_cars"
                    min="0"
                    value={formData.number_of_cars}
                    onChange={handleInputChange}
                    className="w-full p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-50 outline-none transition-all"
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 mt-4 shadow-lg active:scale-[0.98] transition-transform"
                >
                  {isSubmitting ? 'Saving...' : 'Save and Continue'}
                </button>
              </form>
            </div>
          )}

          {hasInfo && (
             <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30 p-6 rounded-2xl text-center animate-in zoom-in duration-500">
                <p className="text-green-800 dark:text-green-400 font-medium flex items-center justify-center gap-2">
                  <span className="text-xl text-green-500">✓</span> Profile Complete
                </p>
                <p className="text-xs text-green-600 dark:text-green-500 mt-1 opacity-80">
                  You have successfully shared your details.
                </p>
             </div>
          )}
        </div>
      </main>

      <footer className="py-8 text-center text-xs text-zinc-400">
        &copy; 2026 Socity PWA Dashboard
      </footer>
    </div>
  );
}
