'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Image from "next/image";

// Import the scanner dynamically with SSR disabled
const QRScanner = dynamic(() => import('@/components/QRScanner'), { 
  ssr: false,
  loading: () => (
    <div className="w-full max-w-sm h-64 mx-auto animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
      <p className="text-zinc-500">Loading Camera...</p>
    </div>
  )
});

export default function Home() {
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for existing session in localStorage
    const savedSession = localStorage.getItem('socity_user_session');
    if (savedSession) {
      try {
        const userData = JSON.parse(savedSession);
        if (userData && userData.uid) {
          router.replace('/dashboard');
          return; // Skip setting state to false as we're redirecting
        }
      } catch (e) {
        console.error("Corrupted session data", e);
        localStorage.removeItem('socity_user_session');
      }
    }
    setIsCheckingSession(false);
  }, [router]);

  const handleScanSuccess = (data) => {
    // Valid data received: {id, society, pocket, flat_number, uid}
    if (data.uid) {
      localStorage.setItem('socity_user_session', JSON.stringify(data));
      router.push('/dashboard');
    } else {
      setError("Invalid QR code. Missing unique identifier.");
    }
  };

  const handleScanError = (errMsg) => {
    setError(errMsg);
    console.warn("QR Scan Error:", errMsg);
  };

  if (isCheckingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <div className="text-center animate-pulse">
          <Image
            className="dark:invert mx-auto mb-4"
            src="/next.svg"
            alt="Loading..."
            width={80}
            height={16}
          />
          <p className="text-zinc-500">Verifying session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50 dark:bg-black font-sans">
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="mb-12 text-center">
          <Image
            className="dark:invert mx-auto mb-8"
            src="/next.svg"
            alt="Socity Logo"
            width={120}
            height={24}
            priority
          />
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Welcome to Socity
          </h1>
          <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
            Scan your society QR code to login instantly.
          </p>
        </div>

        <div className="w-full max-w-sm space-y-6">
          <QRScanner 
            onScanSuccess={handleScanSuccess} 
            onScanError={handleScanError} 
          />

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
              {error}
              <button 
                onClick={() => setError(null)}
                className="block mx-auto mt-2 font-semibold underline"
              >
                Try Again
              </button>
            </div>
          )}

          <div className="pt-8 text-center border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-sm text-zinc-500">
              Need help? Contact your society administrator.
            </p>
          </div>
        </div>
      </main>
      
      <footer className="py-6 text-center text-xs text-zinc-400">
        &copy; 2026 Socity PWA. All rights reserved.
      </footer>
    </div>
  );
}
