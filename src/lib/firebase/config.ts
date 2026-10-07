/**
 * Firebase Client Configuration
 * Reads configuration from Vite environment variables.
 */

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export const firebaseConfig: FirebaseConfig = {
  apiKey: import.meta.env["VITE_FIREBASE_API_KEY"] || "AIzaSyC34V1EU3RhRTdsJT4fWB-aH1VUGP56RY8",
  authDomain: import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"] || "bunknbite.firebaseapp.com",
  databaseURL: import.meta.env["VITE_FIREBASE_DATABASE_URL"] || "https://bunknbite-default-rtdb.firebaseio.com",
  projectId: import.meta.env["VITE_FIREBASE_PROJECT_ID"] || "bunknbite",
  storageBucket: import.meta.env["VITE_FIREBASE_STORAGE_BUCKET"] || "bunknbite.firebasestorage.app",
  messagingSenderId: import.meta.env["VITE_FIREBASE_MESSAGING_SENDER_ID"] || "1014032980102",
  appId: import.meta.env["VITE_FIREBASE_APP_ID"] || "1:1014032980102:web:3154521de0ada099951907",
  measurementId: import.meta.env["VITE_FIREBASE_MEASUREMENT_ID"] || "G-NHHNR31EDL",
};

export function validateFirebaseConfig(): { isValid: boolean; missingKeys: string[] } {
  const requiredKeys: (keyof FirebaseConfig)[] = [
    "apiKey",
    "authDomain",
    "databaseURL",
    "projectId",
    "storageBucket",
    "appId",
  ];

  const missingKeys = requiredKeys.filter((key) => !firebaseConfig[key]);
  return {
    isValid: missingKeys.length === 0,
    missingKeys,
  };
}
