'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";

export default function Dashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);

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
    } catch (e) {
      console.error("Failed to parse session", e);
      localStorage.removeItem('socity_user_session');
      router.replace('/');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('socity_user_session');
    router.replace('/');
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
            <p className="text-zinc-500">
              UID: {userData.uid}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoCard label="Society" value={userData.society} />
            <InfoCard label="Pocket" value={userData.pocket} />
            <InfoCard label="Flat Number" value={userData.flat_number} />
            <InfoCard label="Member ID" value={userData.id} />
          </div>

          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
              Your PWA Status
            </h2>
            <div className="flex items-center gap-3 text-green-600 dark:text-green-400">
              <span className="flex h-2 w-2 rounded-full bg-current"></span>
              <p className="text-sm">Password-less Login Active</p>
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              You won't need to scan again on this device unless you logout.
            </p>
          </div>
        </div>
      </main>

      <footer className="py-8 text-center text-xs text-zinc-400">
        &copy; 2026 Socity PWA Dashboard
      </footer>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
        {value}
      </p>
    </div>
  );
}
