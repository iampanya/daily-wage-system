import React, { useRef, useState, useCallback, useEffect } from 'react';
import { XCircleIcon } from './Icons';

interface CameraProps {
  onCapture: (imageSrc: string) => void;
  onClose: () => void;
}

export const Camera: React.FC<CameraProps> = ({ onCapture, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string>('');

  const startCamera = async () => {
    try {
      // Constraints for mobile facing mode
      const constraints = {
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Important: Mobile browsers often require play() to be called explicitly
        // and muted to be true for autoplay to work
        try {
            await videoRef.current.play();
        } catch (e) {
            console.error("Error playing video:", e);
        }
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตให้เข้าถึงกล้องใน Browser");
    }
  };

  const capture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Flip horizontal for selfie mirror effect
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageSrc = canvas.toDataURL('image/jpeg', 0.8);
        
        // Stop all tracks
        const stream = video.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        
        onCapture(imageSrc);
      }
    }
  }, [onCapture]);

  useEffect(() => {
    startCamera();
    return () => {
      // Cleanup tracks on unmount
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
      {error ? (
        <div className="text-white text-center">
          <p className="mb-4 text-red-400">{error}</p>
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 rounded-lg">ปิด</button>
        </div>
      ) : (
        <>
           <div className="relative w-full max-w-md aspect-[3/4] bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
             <video 
               ref={videoRef} 
               autoPlay 
               playsInline 
               muted 
               className="absolute inset-0 w-full h-full object-cover transform scale-x-[-1]" 
               onLoadedMetadata={() => videoRef.current?.play()}
             />
             <canvas ref={canvasRef} className="hidden" />
           </div>
           
           <div className="mt-8 flex gap-6 items-center">
             <button 
               onClick={onClose}
               className="p-4 rounded-full bg-gray-800 text-white hover:bg-gray-700"
             >
               <XCircleIcon className="w-8 h-8" />
             </button>
             <button 
               onClick={capture}
               className="p-6 rounded-full bg-white border-4 border-gray-300 hover:bg-gray-100 transition-transform active:scale-95"
             >
               <div className="w-4 h-4" /> {/* Spacer */}
             </button>
           </div>
           <p className="text-white mt-4 text-sm">แตะปุ่มสีขาวเพื่อถ่ายภาพ</p>
        </>
      )}
    </div>
  );
};