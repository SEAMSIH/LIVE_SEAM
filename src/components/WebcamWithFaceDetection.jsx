import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as faceDetection from "@tensorflow-models/face-detection";

const WebcamWithFaceDetection = () => {
  const videoRef = useRef(null);
  const [multipleFacesDetected, setMultipleFacesDetected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeModel = async () => {
      try {
        // Load MediaPipe Face Detector
        const model = await faceDetection.createDetector(
          faceDetection.SupportedModels.MediaPipeFaceDetector,
          {
            runtime: "tfjs",
            maxFaces: 5,
          }
        );

        // Start the webcam feed
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        videoRef.current.srcObject = stream;

        // Wait for the video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          setLoading(false);
          startDetection(model);
        };
      } catch (error) {
        console.error("Error initializing face detection:", error);
      }
    };

    initializeModel();
  }, []);

  const startDetection = async (model) => {
    const detectFaces = async () => {
      if (videoRef.current) {
        const faces = await model.estimateFaces(videoRef.current, {
          flipHorizontal: false,
        });

        // Update face detection status
        setMultipleFacesDetected(faces.length > 1);

        // Draw bounding boxes on detected faces
        drawFaceBoundingBoxes(faces);
      }
    };

    setInterval(detectFaces, 100); // Run detection periodically
  };

  const drawFaceBoundingBoxes = (faces) => {
    const canvas = document.getElementById("faceCanvas");
    const ctx = canvas.getContext("2d");
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    faces.forEach((face) => {
      const { xMin, yMin, width, height } = face.boundingBox;
      ctx.strokeStyle = "blue";
      ctx.lineWidth = 2;
      ctx.strokeRect(xMin, yMin, width, height);
    });
  };

  const handleCapture = () => {
    if (multipleFacesDetected) {
      alert("Cannot capture. Multiple faces detected!");
    } else {
      alert("Image captured successfully!");
      // Additional capture logic here
    }
  };

  return (
    <div className="webcam-container">
      {loading && <p>Loading face detection model...</p>}

      <div style={{ position: "relative", display: "inline-block" }}>
        <video
          ref={videoRef}
          style={{ width: "640px", height: "480px" }}
          muted
          autoPlay
        />
        <canvas
          id="faceCanvas"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "640px",
            height: "480px",
          }}
        />
      </div>

      {multipleFacesDetected ? (
        <p className="text-red-500 mt-2">
          Multiple faces detected. Capture disabled.
        </p>
      ) : (
        <p className="text-green-500 mt-2">
          Single face detected. Ready to capture.
        </p>
      )}

      <button
        onClick={handleCapture}
        disabled={multipleFacesDetected}
        className={`mt-4 px-6 py-2 rounded ${
          multipleFacesDetected
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        Capture
      </button>
    </div>
  );
};

export default WebcamWithFaceDetection;
