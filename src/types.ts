// FIX: Added CameraMotion type to be shared across components.
export type CameraMotion = 'none' | 'zoom-in' | 'zoom-out' | 'pan-left' | 'pan-right' | 'tilt-up' | 'tilt-down' | 'drone-up' | 'drone-forward' | 'orbit-left' | 'orbit-right';

export interface UploadedFile {
  base64: string;
  mimeType: string;
  name: string;
}

export interface Shot {
  id: number;
  visual: string;
  overlay: string;
  // FIX: Used the specific CameraMotion type instead of a generic string.
  cameraMotion: CameraMotion;
  motionAmount: number;
}

export interface GeneratedClip {
  src: string;
  name: string;
  narration: string | null;
}
