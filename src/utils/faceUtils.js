import * as tf from "@tensorflow/tfjs";
import { LambdaLayer } from "./LambdaLayer"; // Ensure this path is correct

// Register the custom LambdaLayer class
tf.serialization.registerClass(LambdaLayer);

let deepIDModel = null;

/**
 * Load the DeepID model and clear cache
 * @returns {Promise<boolean>} - Resolves to true if the model loads successfully, otherwise false
 */
export const loadDeepIDModel = async () => {
  try {
    // Load the DeepID model from the specified path
    deepIDModel = await tf.loadLayersModel("/public/web_model1/model.json");
    console.log("DeepID model loaded successfully");
    return true;
  } catch (error) {
    console.error("Error loading DeepID model:", error);
    return false;
  }
};

/**
 * Generate face descriptor using the DeepID model
 * @param {HTMLImageElement | HTMLVideoElement | HTMLCanvasElement} inputImage - The input element for prediction
 * @returns {Promise<number[] | null>} - DeepID face descriptor array or null if an error occurs
 */
export const getDeepIDFaceDescriptor = async (inputImage) => {
  if (!deepIDModel) {
    throw new Error("DeepID model not loaded");
  }

  try {
    // Preprocess the input image
    const inputTensor = tf.tidy(
      () =>
        tf.browser
          .fromPixels(inputImage)
          .resizeNearestNeighbor([96, 96]) // Match DeepID input size
          .toFloat()
          .expandDims(0)
          .div(255.0) // Normalize pixel values
    );

    // Perform prediction and return descriptor as array
    const faceDescriptor = deepIDModel.predict(inputTensor);
    const descriptorArray = await faceDescriptor.array(); // Convert tensor to JavaScript array

    inputTensor.dispose(); // Clean up memory
    faceDescriptor.dispose(); // Clean up memory

    return descriptorArray[0]; // Return the first descriptor (flattened array)
  } catch (error) {
    console.error("Error generating face descriptor:", error);
    return null;
  }
};

/**
 * Compare face descriptors
 * @param {number[]} descriptor1 - First face descriptor array
 * @param {number[]} descriptor2 - Second face descriptor array
 * @returns {number} - Euclidean distance between the descriptors
 */
export const compareDescriptors = (descriptor1, descriptor2) => {
  if (!descriptor1 || !descriptor2) {
    throw new Error("Descriptors are required for comparison");
  }

  try {
    // Convert descriptor arrays to tensors
    const tensor1 = tf.tensor(descriptor1);
    const tensor2 = tf.tensor(descriptor2);

    // Calculate Euclidean distance
    const distance = tf.tidy(() => tf.norm(tensor1.sub(tensor2)).dataSync()[0]);

    tensor1.dispose(); // Clean up memory
    tensor2.dispose(); // Clean up memory

    console.log("Descriptor distance:", distance);
    return distance;
  } catch (error) {
    console.error("Error comparing descriptors:", error);
    return Infinity; // Return a large value if comparison fails
  }
};

/**
 * Check if two images match based on their face descriptors
 * @param {HTMLImageElement | HTMLVideoElement | HTMLCanvasElement} image1 - First image element
 * @param {HTMLImageElement | HTMLVideoElement | HTMLCanvasElement} image2 - Second image element
 * @param {number} threshold - Threshold for matching (default: 0.6)
 * @returns {Promise<boolean>} - True if the images match, otherwise false
 */
export const compareImages = async (image1, image2, threshold = 0.6) => {
  try {
    // Generate face descriptors for both images
    const descriptor1 = await getDeepIDFaceDescriptor(image1);
    const descriptor2 = await getDeepIDFaceDescriptor(image2);

    if (!descriptor1 || !descriptor2) {
      throw new Error("Failed to generate descriptors for one or both images");
    }

    // Calculate distance between descriptors
    const distance = compareDescriptors(descriptor1, descriptor2);

    // Check if distance is below the threshold
    const isMatch = distance <= threshold;
    console.log(
      isMatch
        ? "Images match! Distance: " + distance
        : "Images do not match. Distance: " + distance
    );

    return isMatch;
  } catch (error) {
    console.error("Error comparing images:", error);
    return false;
  }
};
