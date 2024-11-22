import React, { useState, useCallback, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";
import {
  loadDeepIDModel,
  getDeepIDFaceDescriptor,
  compareDescriptors,
} from "../utils/faceUtils";
import LoadingSpinner from "../components/LoadingSpinner";

const AuthenticationPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeModel = async () => {
      try {
        await loadDeepIDModel();
        setModelLoaded(true);
      } catch (err) {
        setError("Error loading DeepID model");
      }
    };
    initializeModel();
  }, []);

  const handleAuthenticate = useCallback(async () => {
    if (!modelLoaded) {
      setError("Model not loaded. Please wait.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Capture image from webcam
      const imageSrc = webcamRef.current?.getScreenshot();
      if (!imageSrc) throw new Error("Failed to capture image");

      // Convert captured image to a Blob or Base64
      const capturedImage = new Image();
      capturedImage.src = imageSrc;
      await capturedImage.decode();

      const userDescriptor = await getDeepIDFaceDescriptor(capturedImage);
      if (!userDescriptor)
        throw new Error("Failed to generate descriptor for captured image");

      // Step 2: Compare with all dataset images
      const datasetDescriptors = [];
      const datasetImages = [
        "/public/dataset/1.jpg",
        "/public/dataset/2.jpg",
        "/public/dataset/3.jpg",
        "/public/dataset/4.jpg",
        "/public/dataset/5.jpg",
        "/public/dataset/6.jpg",
        // Add more dataset images here
      ];

      for (const imagePath of datasetImages) {
        const datasetImage = new Image();
        datasetImage.src = imagePath;
        await datasetImage.decode();

        const descriptor = await getDeepIDFaceDescriptor(datasetImage);
        if (descriptor) {
          datasetDescriptors.push({ imagePath, descriptor });
        }
      }

      // Step 3: Find the best match
      let bestMatch = null;
      let minDistance = Infinity;

      datasetDescriptors.forEach(({ imagePath, descriptor }) => {
        const distance = compareDescriptors(userDescriptor, descriptor);
        if (distance < minDistance) {
          minDistance = distance;
          bestMatch = imagePath;
        }
      });

      if (minDistance > 2) throw new Error("No matching profile found");

      // Step 4: Navigate to the profile page with the matched image
      const matchedImageName = bestMatch.split("/").pop();
      navigate(`/profile/:id`, { state: { image: matchedImageName } });
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  }, [modelLoaded, navigate]);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="container mx-auto px-4 py-8 flex flex-col items-center">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          className="rounded-lg"
        />
        <button
          onClick={handleAuthenticate}
          disabled={isLoading || !modelLoaded}
          className="bg-blue-600 text-white px-4 py-2 mt-4 rounded disabled:bg-blue-300"
        >
          {isLoading ? <LoadingSpinner /> : "Authenticate"}
        </button>
        {error && <div className="text-red-600 mt-4">{error}</div>}
      </div>
    </div>
  );
};

export default AuthenticationPage;
