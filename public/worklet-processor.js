class DecibelProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.maxDecibel = -Infinity;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length > 0) {
      const channelData = input[0]; // Mono channel data
      const rms = Math.sqrt(
        channelData.reduce((sum, value) => sum + value * value, 0) /
          channelData.length
      );

      // Calculate decibel, ensuring we don't get -Infinity for very small values
      const decibel = 20 * Math.log10(rms || 1e-5) + 100;

      if (decibel > this.maxDecibel) {
        this.maxDecibel = decibel;
      }

      // Send the max decibel back to the main thread
      this.port.postMessage({ maxDecibel: this.maxDecibel });
    }

    return true;
  }
}

registerProcessor("decibel-processor", DecibelProcessor);
