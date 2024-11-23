import React, { useState, useCallback, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";

const AuthenticationPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  const handleAuthenticate = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Capture the image from webcam
      const imageSrc = webcamRef.current?.getScreenshot();
      if (!imageSrc) throw new Error("Failed to capture image");

      // Convert Base64 to Blob for upload
      const blob = await (await fetch(imageSrc)).blob();
      const formData = new FormData();
      formData.append("image", blob, "webcam_capture.jpg");

      // Step 2: Upload the image to the backend
      const uploadResponse = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload the image");
      }

      const { filePath } = await uploadResponse.json();
      console.log(`Image saved at: ${filePath}`);

      // Navigate to a confirmation page or handle further processing
      navigate(`/confirmation`, { state: { imagePath: filePath } });
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

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
          disabled={isLoading}
          className="bg-blue-600 text-white px-4 py-2 mt-4 rounded disabled:bg-blue-300"
        >
          {isLoading ? <LoadingSpinner /> : "Capture & Save"}
        </button>
        {error && <div className="text-red-600 mt-4">{error}</div>}
      </div>
    </div>
  );
};

export default AuthenticationPage;
