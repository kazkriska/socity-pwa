'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

export default function QRScanner({ onScanSuccess, onScanError }) {
  const [isScannerStarted, setIsScannerStarted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const html5QrCodeRef = useRef(null);
  const fileInputRef = useRef(null);
  const qrcodeRegionId = "qr-reader-target";

  useEffect(() => {
    // Initialize the core library instance
    html5QrCodeRef.current = new Html5Qrcode(qrcodeRegionId);

    // Start camera by default
    const startCamera = async () => {
      try {
        const config = { 
          fps: 15, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0 
        };
        
        await html5QrCodeRef.current.start(
          { facingMode: "environment" },
          config,
          (decodedText) => {
            handleSuccess(decodedText);
          },
          (errorMessage) => {
            // Ignore noise
          }
        );
        setIsScannerStarted(true);
      } catch (err) {
        console.error("Camera start error:", err);
        if (onScanError) onScanError("Could not start camera.");
      }
    };

    startCamera();

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(e => console.error(e));
      }
    };
  }, []);

  const handleSuccess = (decodedText) => {
    try {
      const data = JSON.parse(decodedText);
      onScanSuccess(data);
    } catch (e) {
      console.error("Not valid JSON:", decodedText);
      if (onScanError) onScanError("Invalid QR format.");
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Explicitly scan the file. The second parameter 'false' skips rendering the image 
      // into the div, which prevents the library from overwriting our UI.
      const decodedText = await html5QrCodeRef.current.scanFile(file, false);
      handleSuccess(decodedText);
    } catch (err) {
      console.error("File scan error:", err);
      if (onScanError) onScanError("No QR code detected. Try a higher quality image.");
    } finally {
      setIsUploading(false);
      // Reset the input value so the same file can be selected again
      if (event.target) event.target.value = "";
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-4">
      {/* Target for camera feed */}
      <div 
        id={qrcodeRegionId} 
        className="w-full aspect-square overflow-hidden rounded-xl border border-zinc-200 bg-black shadow-inner"
      ></div>

      <div className="flex flex-col gap-3">
        <p className="text-center text-sm text-zinc-500">
          Position QR in frame or upload an image
        </p>
        
        <label className="flex items-center justify-center px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm cursor-pointer hover:bg-zinc-50 active:scale-[0.98] transition-all">
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {isUploading ? "Processing..." : "Upload QR Image"}
          </span>
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFileUpload}
            disabled={isUploading}
          />
        </label>
      </div>
    </div>
  );
}
