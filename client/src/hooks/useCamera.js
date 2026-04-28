import { useState, useRef, useCallback, useEffect } from 'react';

const useCamera = (facingMode = 'user') => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setCameraError] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setStreaming(true);
      }
    } catch (err) {
      const messages = {
        NotAllowedError: 'Camera access is REQUIRED to submit a log. Please allow camera access in your browser settings. Gallery upload is not permitted.',
        NotFoundError: 'No camera found on your device. A camera is required for log submission.',
        NotReadableError: 'Camera is in use by another application. Please close other apps and try again.',
      };
      setCameraError(messages[err.name] || `Unable to access camera: ${err.message}`);
    }
  }, [facingMode]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL('image/jpeg', 0.7);
    setCapturedImage(base64);
    stopCamera();
    return base64;
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setStreaming(false);
  }, []);

  const retake = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const reset = useCallback(() => {
    stopCamera();
    setCapturedImage(null);
    setCameraError(null);
  }, [stopCamera]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return {
    videoRef,
    canvasRef,
    streaming,
    error,
    capturedImage,
    startCamera,
    capturePhoto,
    stopCamera,
    retake,
    reset,
  };
};

export default useCamera;