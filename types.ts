
export interface Project {
  id: string;
  title: string;
  category: string;
  tag: string;
  image: string;
  number: string;
}

export interface Stat {
  id: string;
  icon: string;
  value: string;
  label: string;
}

/** Reel entry — matches what the Express API returns */
export interface ReelData {
  id: string;
  title: string;
  category: string;
  tag: string;
  year: string;
  color: string;
  /** Public URL path e.g. /content/reels/myvideo_1234.mp4 */
  videoSrc: string;
  filename: string;
  sizeBytes: number;
  uploadedAt: string;
  updatedAt?: string;
  visible: boolean;
}
