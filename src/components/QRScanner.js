'use client';

import { Scanner } from '@yudiel/react-qr-scanner';

export default function QRScanner({ onScanSuccess, onScanError }) {
  const handleScan = (detectedCodes) => {
    if (detectedCodes && detectedCodes.length > 0) {
      try {
        const decodedText = detectedCodes[0].rawValue;
        let data = decodedText;
        try {
          data = JSON.parse(decodedText);
        } catch (e) {
          // If not valid JSON, it's treated as a plain string (UID)
        }
        onScanSuccess(data);
      } catch (e) {
        console.error("Error processing scan:", e);
        if (onScanError) onScanError("Error processing QR format.");
      }
    }
  };

  const handleError = (error) => {
    console.error("QR Scanner Error:", error);
    // Ignore simple "not found" errors, only report serious issues like permission denied
    if (error && error.name === "NotAllowedError") {
      if (onScanError) onScanError("Camera access denied. Please allow camera permissions to scan.");
    } else if (error && error.name === "NotFoundError") {
      if (onScanError) onScanError("No camera found on this device.");
    } else if (error && error.name !== "TrackStartError" && error.name !== "NotReadableError") {
      // Let other unexpected errors through
      if (onScanError) onScanError(error?.message || "Could not start camera.");
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-4">
      <div className="w-full overflow-hidden rounded-xl border border-zinc-200 bg-black shadow-inner relative">
        <Scanner
          onScan={handleScan}
          onError={handleError}
          formats={['qr_code']}
          components={{
            audio: true,
            tracker: true,
            finder: true, // Shows a visual frame overlay guiding the user
          }}
          styles={{
            container: { width: '100%', height: '100%', aspectRatio: '1/1' },
          }}
        />
      </div>

      <div className="flex flex-col gap-3">
        <p className="text-center text-sm text-zinc-500">
          Position the Socity QR code within the frame
        </p>
      </div>
    </div>
  );
}
