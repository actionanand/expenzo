export interface ExpenzoNativeBridge {
  isBiometricAvailable(): boolean;
  enableBiometric(secret: string): void;
  authenticateBiometric(): void;
  disableBiometric(): void;
}

export interface ExpenzoSystemBarsBridge {
  setDarkMode(enabled: boolean): void;
}

declare global {
  interface Window {
    ExpenzoNative?: ExpenzoNativeBridge;
    ExpenzoSystemBars?: ExpenzoSystemBarsBridge;
  }
}

export {};
