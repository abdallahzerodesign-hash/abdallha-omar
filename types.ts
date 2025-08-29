
export interface UploadedFile {
  base64: string;
  mimeType: string;
  name: string;
}

export interface Shot {
  id: number;
  visual: string;
  overlay: string;
  cameraMotion: string;
  motionAmount: number;
}

export interface GeneratedClip {
  src: string;
  name: string;
  narration: string | null;
}