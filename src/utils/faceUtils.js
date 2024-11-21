import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as faceapi from 'face-api.js';

let blazefaceModel = null;
let landmarksModel = null;

export const loadModels = async () => {
  try {
    // Load Blazeface model for quick face detection
    blazefaceModel = await blazeface.load();

    // Load face-landmarks-detection model for liveness detection
    landmarksModel = await faceLandmarksDetection.load(
      faceLandmarksDetection.SupportedPackages.mediapipeFacemesh
    );

    // Load face-api models for face recognition
    await Promise.all([
      faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
      faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
      faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
    ]);

    return true;
  } catch (error) {
    console.error('Error loading models:', error);
    return false;
  }
};

export const performLivenessDetection = async (imageElement) => {
  if (!landmarksModel) throw new Error('Landmarks model not loaded');

  const predictions = await landmarksModel.estimateFaces({
    input: imageElement,
    predictIrises: true
  });

  if (predictions.length === 0) {
    throw new Error('No face detected');
  }

  // Check for basic liveness indicators
  const landmarks = predictions[0].scaledMesh;
  
  // Calculate eye aspect ratio to detect blinks
  const leftEyeAspectRatio = calculateEyeAspectRatio(landmarks, 'left');
  const rightEyeAspectRatio = calculateEyeAspectRatio(landmarks, 'right');
  
  // Check if eyes are open (not blinking)
  const eyesOpen = leftEyeAspectRatio > 0.2 && rightEyeAspectRatio > 0.2;
  
  // Check face orientation (should be roughly frontal)
  const isFrontal = checkFacialOrientation(landmarks);

  return eyesOpen && isFrontal;
};

export const findBestMatch = async (imageElement, datasetPath) => {
  const detection = await faceapi.detectSingleFace(imageElement)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    throw new Error('No face detected for matching');
  }

  // Load and process dataset images
  const labeledDescriptors = await loadLabeledImages(datasetPath);
  const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);

  // Find best match
  const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
  
  return {
    label: bestMatch.label,
    distance: bestMatch.distance
  };
};

// Helper functions
const calculateEyeAspectRatio = (landmarks, eye) => {
  // Simplified eye aspect ratio calculation
  const eyePoints = eye === 'left' ? 
    [33, 160, 158, 133, 153, 144] : 
    [362, 385, 387, 263, 373, 380];
  
  const points = eyePoints.map(idx => landmarks[idx]);
  
  const height1 = distance(points[1], points[5]);
  const height2 = distance(points[2], points[4]);
  const width = distance(points[0], points[3]);
  
  return (height1 + height2) / (2.0 * width);
};

const checkFacialOrientation = (landmarks) => {
  // Simplified check for frontal face orientation
  const nose = landmarks[1];
  const leftEye = landmarks[33];
  const rightEye = landmarks[263];
  
  const eyeDistance = distance(leftEye, rightEye);
  const noseOffset = Math.abs(nose[0] - (leftEye[0] + rightEye[0]) / 2);
  
  return noseOffset < eyeDistance * 0.2;
};

const distance = (a, b) => {
  return Math.sqrt(
    Math.pow(a[0] - b[0], 2) +
    Math.pow(a[1] - b[1], 2) +
    Math.pow(a[2] - b[2], 2)
  );
};

const loadLabeledImages = async (datasetPath) => {
  const labels = ['sarah', 'john', 'emma']; // Example dataset labels
  const labeledDescriptors = [];

  for (const label of labels) {
    try {
      const img = await faceapi.fetchImage(`${datasetPath}/${label}.jpg`);
      const detection = await faceapi.detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detection) {
        labeledDescriptors.push(
          new faceapi.LabeledFaceDescriptors(label, [detection.descriptor])
        );
      }
    } catch (error) {
      console.error(`Error loading image for ${label}:`, error);
    }
  }

  return labeledDescriptors;
};