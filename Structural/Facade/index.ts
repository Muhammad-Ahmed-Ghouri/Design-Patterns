/**
 * Facade Pattern Implementation in TypeScript
 * Scenario: Simplifying a 9-step complex video conversion pipeline.
 */

// ==========================================
// 1. Complex Subsystem Classes (Low-level internals)
// ==========================================

export class CodecFactory {
  static detect(file: string): { type: string } {
    console.log(`[CodecFactory] Detecting codec for: ${file}`);
    return { type: "h264" };
  }
}

export class FileReaderService {
  static read(file: string): Buffer {
    console.log(`[FileReaderService] Reading file from disk: ${file}`);
    return Buffer.from("raw_video_binary_stream");
  }
}

export class Decoder {
  static decode(codec: { type: string }, raw: Buffer): { audio: string; video: string } {
    console.log(`[Decoder] Decoding ${codec.type} raw stream`);
    return { audio: "raw_audio_track", video: "raw_video_frames" };
  }
}

export class AudioMixer {
  static extract(decoded: { audio: string; video: string }): string {
    console.log("[AudioMixer] Extracting audio track");
    return decoded.audio;
  }

  static normalize(audio: string, targetLUFS: number): string {
    console.log(`[AudioMixer] Normalizing audio loudness to ${targetLUFS} LUFS`);
    return `normalized_${audio}`;
  }
}

export class VideoRenderer {
  static extract(decoded: { audio: string; video: string }): string {
    console.log("[VideoRenderer] Extracting video frames");
    return decoded.video;
  }

  static resize(video: string, resolution: string): string {
    console.log(`[VideoRenderer] Resizing video frames to ${resolution}`);
    return `${video}_${resolution}`;
  }
}

export class Encoder {
  static encode(video: string, audio: string, format: string): string {
    console.log(`[Encoder] Encoding combined stream to container: ${format}`);
    return `encoded_stream_${format}`;
  }
}

export class BitrateOptimizer {
  static compress(encoded: string, targetSizeMB: number): string {
    console.log(`[BitrateOptimizer] Optimizing bitrate to match target size ~${targetSizeMB}MB`);
    return `compressed_${encoded}`;
  }
}

export class FileWriterService {
  static write(data: string, outputPath: string): void {
    console.log(`[FileWriterService] Writing converted file to: ${outputPath}\n`);
  }
}

// ==========================================
// 2. The Facade Class (Simplified Single Entry Point)
// ==========================================

export interface ConversionOptions {
  resolution: "1080p" | "720p" | "480p";
  targetSizeMB: number;
}

export class VideoConversionFacade {
  public convert(file: string, outputPath: string, options: ConversionOptions): void {
    console.log(`=== Starting Pipeline for ${file} [Target: ${options.resolution}] ===`);

    // Step 1: Detect & Read
    const codec = CodecFactory.detect(file);
    const raw = FileReaderService.read(file);

    // Step 2: Decode Streams
    const decoded = Decoder.decode(codec, raw);

    // Step 3: Process Audio
    const audio = AudioMixer.extract(decoded);
    const normalizedAudio = AudioMixer.normalize(audio, -14);

    // Step 4: Process Video
    const video = VideoRenderer.extract(decoded);
    const resized = VideoRenderer.resize(video, options.resolution);

    // Step 5: Encode & Compress
    const encoded = Encoder.encode(resized, normalizedAudio, "h264");
    const compressed = BitrateOptimizer.compress(encoded, options.targetSizeMB);

    // Step 6: Write to Disk
    FileWriterService.write(compressed, outputPath);
  }
}

// ==========================================
// 3. Client Classes (Consumers)
// ==========================================

// Client #1: API Upload Controller (Handles real-time uploads)
export class UploadController {
  private converter = new VideoConversionFacade();

  public handleUpload(file: string, outputPath: string): void {
    console.log("[UploadController] Received HTTP video upload request.");
    // 1080p conversion for direct viewing
    this.converter.convert(file, outputPath, { resolution: "1080p", targetSizeMB: 25 });
  }
}

// Client #2: Background Worker (Processes low-bandwidth versions)
export class BackgroundJobWorker {
  private converter = new VideoConversionFacade();

  public processVideoJob(file: string, outputPath: string): void {
    console.log("[BackgroundJobWorker] Processing queued video job.");
    // 720p conversion for mobile / low bandwidth
    this.converter.convert(file, outputPath, { resolution: "720p", targetSizeMB: 10 });
  }
}

// ==========================================
// 4. Verification / Demonstration
// ==========================================

function runDemonstration() {
  const uploadController = new UploadController();
  uploadController.handleUpload("vacation_raw.mov", "output/vacation_1080p.mp4");

  const backgroundWorker = new BackgroundJobWorker();
  backgroundWorker.processVideoJob("vacation_raw.mov", "output/vacation_720p.mp4");
}

runDemonstration();