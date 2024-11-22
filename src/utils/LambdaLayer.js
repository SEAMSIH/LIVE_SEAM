import * as tf from "@tensorflow/tfjs";

// Define a custom Lambda layer with a default function
class LambdaLayer extends tf.layers.Layer {
  constructor(config) {
    super(config);

    // Set the 'fn' function to be an identity function if not provided
    this.fn = config.fn || ((input) => input); // Default to identity function
  }

  call(inputs, kwargs) {
    let input = Array.isArray(inputs) ? inputs[0] : inputs;
    return this.fn(input); // Apply the custom function
  }

  static get className() {
    return "Lambda";
  }

  getConfig() {
    const baseConfig = super.getConfig();
    return { ...baseConfig, fn: this.fn.toString() };
  }
}

export { LambdaLayer };
