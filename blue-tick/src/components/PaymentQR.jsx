import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Clock, RefreshCw, AlertCircle } from 'lucide-react';

export const PaymentQR = ({
  upiUri,
  formattedTime,
  isExpired,
  onRegenerate,
  children,
}) => {
  const canvasRef = useRef(null);
  const [qrLoading, setQrLoading] = useState(true);

  // Generate QR code onto canvas
  useEffect(() => {
    if (!canvasRef.current || !upiUri || isExpired) return;

    setQrLoading(true);
    QRCode.toCanvas(
      canvasRef.current,
      upiUri,
      {
        width: 220,
        margin: 1,
        color: {
          dark: '#0F1419',
          light: '#FFFFFF',
        },
      },
      (error) => {
        setQrLoading(false);
        if (error) {
          console.error('QR code generation error:', error);
        }
      }
    );
  }, [upiUri, isExpired]);

  return (
    <div className="flex flex-col items-center text-center p-5 bg-white rounded-lg border border-[#DBDBDB]">
      {/* QR Code Frame (No Dotted Border) */}
      <div className="relative p-2 bg-white flex items-center justify-center min-w-[220px] min-h-[220px]">
        {/* Loading Skeleton */}
        {qrLoading && !isExpired && (
          <div className="absolute inset-0 bg-neutral-100 animate-pulse rounded-lg flex items-center justify-center text-xs text-[#737373]">
            Generating Secure QR...
          </div>
        )}

        {/* Real Canvas QR */}
        <canvas
          ref={canvasRef}
          className={`rounded-sm transition-opacity duration-300 ${
            isExpired ? 'opacity-10 blur-xs pointer-events-none' : 'opacity-100'
          }`}
        />

        {/* Expired Overlay State */}
        {isExpired && (
          <div className="absolute inset-0 bg-white/95 rounded-lg backdrop-blur-xs flex flex-col items-center justify-center p-4 space-y-3 z-10 animate-fade-in">
            <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="font-bold text-sm text-[#0F1419]">QR Expired</div>
              <p className="text-[11px] text-[#737373]">
                The secure payment window has elapsed.
              </p>
            </div>
            <button
              onClick={onRegenerate}
              className="inline-flex items-center gap-1.5 bg-[#0095F6] hover:bg-[#0081d6] active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-sm transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Generate New QR</span>
            </button>
          </div>
        )}
      </div>

      {/* Timer Bar */}
      <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold">
        <Clock className={`w-3.5 h-3.5 ${isExpired ? 'text-rose-500' : 'text-amber-500'}`} />
        <span className="text-[#737373]">QR expires in:</span>
        <span className={`font-mono text-sm ${isExpired ? 'text-rose-500 font-bold' : 'text-[#0F1419]'}`}>
          {formattedTime}
        </span>
      </div>

      {/* Scan Instruction */}
      <p className="text-xs text-[#737373] mt-1">
        Open any UPI app and scan this QR code.
      </p>

      {/* Optional Inlined Payment Buttons Section */}
      {children && (
        <div className="mt-4 pt-4 border-t border-[#DBDBDB]/80 w-full text-left">
          {children}
        </div>
      )}
    </div>
  );
};

export default PaymentQR;
