/**
 * AudioWorkletProcessor: captures microphone input and converts to 16-bit PCM chunks.
 * Runs in the AudioWorklet thread (separate from main thread).
 *
 * Output: posts { pcm: Int16Array } messages to main thread every ~100ms
 */
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super()
    this._buffer = []
    // At 16kHz, 100ms = 1600 samples
    this._chunkSize = 1600
  }

  process(inputs) {
    const input = inputs[0]
    if (!input || input.length === 0) return true

    const channelData = input[0] // mono
    if (!channelData) return true

    // Convert Float32 [-1,1] to Int16 [-32768,32767]
    for (let i = 0; i < channelData.length; i++) {
      const s = Math.max(-1, Math.min(1, channelData[i]))
      this._buffer.push(s < 0 ? s * 0x8000 : s * 0x7fff)
    }

    // Emit complete chunks
    while (this._buffer.length >= this._chunkSize) {
      const chunk = new Int16Array(this._buffer.splice(0, this._chunkSize))
      this.port.postMessage({ pcm: chunk }, [chunk.buffer])
    }

    return true
  }
}

registerProcessor('audio-processor', AudioProcessor)
