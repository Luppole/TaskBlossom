
// Global type declarations

// For sound files
declare module '*.mp3' {
  const src: string;
  export default src;
}

// For use-sound library
declare module 'use-sound' {
  import { Howl } from 'howler';

  type SpriteMap = {
    [key: string]: [number, number];
  };

  type HookOptions = {
    volume?: number;
    playbackRate?: number;
    interrupt?: boolean;
    soundEnabled?: boolean;
    sprite?: SpriteMap;
    onload?: () => void;
    onplay?: (id: number) => void;
    onend?: (id: number) => void;
    onpause?: (id: number) => void;
    onstop?: (id: number) => void;
  };

  type PlayFunction = (options?: {
    id?: string;
    forceSoundEnabled?: boolean;
    playbackRate?: number;
  }) => void;

  type PlayExposedAPI = {
    sound: Howl;
    stop: (id?: string) => void;
    pause: (id?: string) => void;
    duration: number | null;
    id: number | null;
  };

  export default function useSound(
    src: string,
    options?: HookOptions
  ): [PlayFunction, PlayExposedAPI];
}
