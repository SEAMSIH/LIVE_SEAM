import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { CheckCircle2, AlertCircle, Camera } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  loadDeepIDModel,
  getDeepIDFaceDescriptor,
  compareDescriptors,
} from "../utils/faceUtils";

const AuthenticationPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeModel = async () => {
      try {
        const loaded = await loadDeepIDModel();
        if (loaded) {
          setModelLoaded(true);
        } else {
          setError("Failed to load DeepID model");
        }
      } catch (err) {
        setError("Error initializing DeepID model");
      } finally {
        setIsLoading(false);
      }
    };

    initializeModel();
  }, []);

  const handleAuthenticate = useCallback(async () => {
    if (!modelLoaded) {
      setError("DeepID model not loaded. Please wait or refresh the page.");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Step 1: Capture image from webcam
      const imageSrc = webcamRef.current?.getScreenshot();
      if (!imageSrc) throw new Error("Failed to capture image");

      // Create an image element for processing the webcam capture
      const userImage = new Image();
      userImage.src = imageSrc;
      await userImage.decode();

      // Generate face descriptor for the webcam image
      const userDescriptor = await getDeepIDFaceDescriptor(userImage);
      if (!userDescriptor) {
        throw new Error("Failed to generate face descriptor for webcam image");
      }

      // Step 2: Load the dataset image
      const datasetImage = new Image();
      datasetImage.src = "/public/dataset/1.jpg"; // Relative path to the dataset image
      await datasetImage.decode();

      // Generate face descriptor for the dataset image
      const datasetDescriptor = await getDeepIDFaceDescriptor(datasetImage);
      if (!datasetDescriptor) {
        throw new Error("Failed to generate face descriptor for dataset image");
      }

      // Step 3: Compare descriptors
      const distance = compareDescriptors(userDescriptor, datasetDescriptor);

      // Step 4: Check if the distance is within the threshold
      if (distance > 0.3) {
        throw new Error("No matching profile found. Access denied.");
      }

      // Navigate to the success page if the match is successful
      navigate(`/profile/success`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  }, [navigate, modelLoaded]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="container mx-auto px-4 py-8 flex flex-col items-center">
        {/* Header Section */}
        <div className="flex items-center justify-center gap-20 mb-10">
          <img src="/logos/logo1.png" alt="Logo 1" className="h-24 w-auto" />
          <img src="/logos/logo2.png" alt="Logo 2" className="h-24 w-auto" />
          <img src="/logos/logo3.png" alt="Logo 3" className="h-24 w-auto" />
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
                modelLoaded ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span className="text-sm text-gray-600">
              {modelLoaded ? "DeepID Model Ready" : "Loading DeepID Model..."}
            </span>
          </div>

          {/* Action Button */}
          <button
            onClick={handleAuthenticate}
            disabled={isLoading || !modelLoaded}
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
            <div className="flex items-center gap-2 text-red-600"></div>
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
