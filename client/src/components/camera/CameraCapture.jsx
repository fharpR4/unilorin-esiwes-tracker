import { Camera, RefreshCw, Check, AlertTriangle, ZoomIn } from 'lucide-react';
import useCamera from '@/hooks/useCamera';
import { cn } from '@/lib/utils';

const CameraCapture = ({ onCapture, requiredType, confirmed = false }) => {
  const facingMode = requiredType === 'portrait' ? 'user' : 'environment';
  const {
    videoRef, canvasRef, streaming, error,
    capturedImage, startCamera, capturePhoto, retake,
  } = useCamera(facingMode);

  const handleCapture = () => {
    const img = capturePhoto();
    if (!img) return;
  };

  const handleConfirm = () => {
    if (capturedImage) onCapture(capturedImage);
  };

  const label = requiredType === 'portrait' ? 'Portrait Headshot' : 'Environment Photo';
  const instruction = requiredType === 'portrait'
    ? 'Position your face clearly in frame'
    : 'Show your full training environment in frame';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Camera className="h-4 w-4 text-unilorin-primary dark:text-blue-400" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-xs text-red-500 font-semibold">* Required — Camera only</span>
      </div>

      {confirmed && !capturedImage && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm text-green-700 dark:text-green-400">Photo captured and confirmed</span>
        </div>
      )}

      {error && (
        <div className="flex gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">Camera Error</p>
            <p className="text-xs text-red-600 dark:text-red-300 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {!capturedImage && !confirmed && (
        <div className="space-y-3">
          <div className="relative bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '4/3' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ display: streaming ? 'block' : 'none' }}
            />
            {!streaming && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 gap-2">
                <Camera className="h-12 w-12 text-gray-600" />
                <p className="text-xs text-gray-500">{instruction}</p>
              </div>
            )}
            {streaming && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                {instruction}
              </div>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />

          {!streaming ? (
            <button
              type="button"
              onClick={startCamera}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-unilorin-primary dark:bg-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
            >
              <Camera className="h-4 w-4" />
              Open Camera
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCapture}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm"
            >
              <ZoomIn className="h-4 w-4" />
              Capture Photo
            </button>
          )}
        </div>
      )}

      {capturedImage && !confirmed && (
        <div className="space-y-3">
          <div className="rounded-xl overflow-hidden border-2 border-green-500">
            <img src={capturedImage} alt={`Captured ${label}`} className="w-full object-cover" />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={retake}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:opacity-80 transition-opacity text-sm font-medium"
            >
              <RefreshCw className="h-4 w-4" />
              Retake
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Check className="h-4 w-4" />
              Use Photo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;