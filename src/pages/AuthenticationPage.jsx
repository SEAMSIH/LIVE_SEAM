import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import { CheckCircle2, AlertCircle, Camera } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import * as faceDetection from "@tensorflow-models/face-detection";
import * as tf from "@tensorflow/tfjs";
import {
  loadDeepIDModel,
  getDeepIDFaceDescriptor,
  compareDescriptors,
} from "../utils/faceUtils";

const AuthenticationPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [faceDetector, setFaceDetector] = useState(null);
  const [multipleFacesDetected, setMultipleFacesDetected] = useState(false);
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  // Load models and initialize face detection
  useEffect(() => {
    const initializeModels = async () => {
      try {
        // Load DeepID model
        const deepIDLoaded = await loadDeepIDModel();

        // Load face detection model
        const faceDetectorModel = await faceDetection.createDetector(
          faceDetection.SupportedModels.MediaPipeFaceDetector,
          {
            runtime: "tfjs",
            maxFaces: 5, // Detect up to 5 faces
          }
        );

        if (deepIDLoaded && faceDetectorModel) {
          setModelLoaded(true);
          setFaceDetector(faceDetectorModel);
        } else {
          setError("Failed to load models.");
        }
      } catch (err) {
        setError("Error initializing models.");
      } finally {
        setIsLoading(false);
      }
    };

    initializeModels();
  }, []);

  // Monitor the webcam feed for faces
  useEffect(() => {
    const detectFaces = async () => {
      if (webcamRef.current && faceDetector) {
        const video = webcamRef.current.video;

        if (video.readyState === 4) {
          // Detect faces in the webcam feed
          const faces = await faceDetector.estimateFaces(video, {
            flipHorizontal: false,
          });

          // Check if multiple faces are detected (2 or more)
          setMultipleFacesDetected(faces.length >= 2);
        }
      }
    };

    const intervalId = setInterval(detectFaces, 500); // Run detection every 500ms
    return () => clearInterval(intervalId);
  }, [faceDetector]);

  // Handle face authentication
  const handleAuthenticate = useCallback(async () => {
    if (!modelLoaded) {
      setError("Models not fully loaded. Please wait.");
      return;
    }

    if (multipleFacesDetected) {
      setError(
        "Multiple faces detected. Please ensure only one face is in the frame."
      );
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Step 1: Capture image from webcam
      const imageSrc = webcamRef.current?.getScreenshot();
      if (!imageSrc)
        throw new Error("Failed to capture an image from the webcam.");

      // Create an image element for processing the webcam capture
      const userImage = new Image();
      userImage.src = imageSrc;
      await userImage.decode();

      // Generate face descriptor for the captured image
      const userDescriptor = await getDeepIDFaceDescriptor(userImage);
      if (!userDescriptor) {
        throw new Error(
          "Failed to generate a face descriptor for the captured image."
        );
      }

      // Step 2: Load a dataset image
      const datasetImagePath = "/public/dataset/3.jpg"; // Change to the desired path
      const datasetImage = new Image();
      datasetImage.src = datasetImagePath;
      await datasetImage.decode();

      // Generate face descriptor for the dataset image
      const datasetDescriptor = await getDeepIDFaceDescriptor(datasetImage);
      if (!datasetDescriptor) {
        throw new Error(
          "Failed to generate a face descriptor for the dataset image."
        );
      }

      // Step 3: Compare face descriptors
      const distance = compareDescriptors(userDescriptor, datasetDescriptor);

      // Step 4: Verify if the match is within the acceptable threshold
      if (distance > 200) {
        throw new Error("No matching profile found. Access denied.");
      }

      // Navigate to the profile page on successful authentication
      navigate(`/profile/3`); // Replace "3" with a dynamic ID if needed
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  }, [navigate, modelLoaded, multipleFacesDetected]);

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
                modelLoaded
                  ? multipleFacesDetected
                    ? "bg-red-500"
                    : "bg-green-500"
                  : "bg-gray-500"
              }`}
            />
            <span className="text-sm text-gray-600">
              {modelLoaded
                ? multipleFacesDetected
                  ? "Multiple Faces Detected"
                  : "DeepID Model Ready"
                : "Loading Models..."}
            </span>
          </div>

          {/* Action Button */}
          <button
            onClick={handleAuthenticate}
            disabled={isLoading || !modelLoaded || multipleFacesDetected}
            className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 disabled:bg-green-300 
                     text-white disabled:cursor-not-allowed rounded-xl font-semibold 
                     transition-colors shadow-lg hover:shadow-xl disabled:shadow-none
                     flex items-center justify-center gap-2"
          >
            {isLoading ? <LoadingSpinner /> : <Camera className="w-5 h-5" />}
            {isLoading ? "Processing..." : "Authenticate"}
          </button>

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
      </div>
    </div>
  );
};

export default AuthenticationPage;
