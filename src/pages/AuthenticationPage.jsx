import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { CheckCircle2, AlertCircle, Scan, Camera } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  loadModels,
  performLivenessDetection,
  findBestMatch,
} from "../utils/faceUtils";

const AuthenticationPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeModels = async () => {
      try {
        const loaded = await loadModels();
        if (loaded) {
          setModelsLoaded(true);
        } else {
          setError("Failed to load AI models");
        }
      } catch (err) {
        setError("Error initializing face detection models");
      } finally {
        setIsLoading(false);
      }
    };

    initializeModels();
  }, []);

  const handleAuthenticate = useCallback(async () => {
    if (!modelsLoaded) {
      setError("AI models not loaded. Please wait or refresh the page.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Capture image from webcam
      const imageSrc = webcamRef.current?.getScreenshot();
      if (!imageSrc) throw new Error("Failed to capture image");

      // Create an image element for processing
      const img = new Image();
      img.src = imageSrc;
      await img.decode();

      // Perform liveness detection
      const isLive = await performLivenessDetection(img);
      if (!isLive) {
        throw new Error(
          "Liveness check failed. Please ensure you are a real person and try again."
        );
      }

      // Find best match from dataset
      const match = await findBestMatch(img, "/dataset");

      if (match.distance > 0.6) {
        throw new Error("No matching profile found. Access denied.");
      }

      // Navigate to profile page with matched user ID
      navigate(`/profile/${match.label}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  }, [navigate, modelsLoaded]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="container mx-auto px-4 py-8 flex flex-col items-center">
        {/* Header Section */}
        <div className="flex items-center justify-center gap-12 mb-6">
          <img src="/logos/logo1.png" alt="Logo 1" className="h-16 w-auto" />
          <img src="/logos/logo2.png" alt="Logo 2" className="h-16 w-auto" />
          <img src="/logos/logo3.png" alt="Logo 3" className="h-16 w-auto" />
        </div>
        <h1 className="text-lg md:text-xl font-semibold text-center mb-6">
          Secure Encryption and Authentication Model
        </h1>

        {/* Main Content */}
        <div className="max-w-xl w-full bg-gray-50 rounded-2xl p-6 shadow-lg border border-gray-200">
          {/* Webcam Container */}
          <div className="relative mb-4 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200 aspect-w-16 aspect-h-9">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
            />
            {isLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                <LoadingSpinner />
              </div>
            )}
          </div>

          {/* Status Indicator */}
          <div className="mb-4 flex items-center justify-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                modelsLoaded ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm text-gray-600">
              {modelsLoaded ? "AI Models Ready" : "Loading AI Models..."}
            </span>
          </div>

          {/* Action Button */}
          <button
            onClick={handleAuthenticate}
            disabled={isLoading || !modelsLoaded}
            className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 disabled:bg-green-300 
                     text-white disabled:cursor-not-allowed rounded-xl font-semibold 
                     transition-colors shadow-lg hover:shadow-xl disabled:shadow-none
                     flex items-center justify-center gap-2"
          >
            {isLoading ? <LoadingSpinner /> : <Camera className="w-5 h-5" />}
            {isLoading ? "Processing..." : "Authenticate"}
          </button>

          {/* Guidelines */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <p className="text-sm">
                Look directly at the camera and stay still
              </p>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <p className="text-sm">Ensure good lighting on your face</p>
            </div>
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">
                Remove any face coverings or accessories
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gray-500 text-sm">
          © SEAM Authentication System 2024. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default AuthenticationPage;
