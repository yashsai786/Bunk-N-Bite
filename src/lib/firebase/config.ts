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
  apiKey: import.meta.env["VITE_FIREBASE_API_KEY"] || "",
  authDomain: import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"] || "",
  databaseURL: import.meta.env["VITE_FIREBASE_DATABASE_URL"] || "",
  projectId: import.meta.env["VITE_FIREBASE_PROJECT_ID"] || "",
  storageBucket: import.meta.env["VITE_FIREBASE_STORAGE_BUCKET"] || "",
  messagingSenderId: import.meta.env["VITE_FIREBASE_MESSAGING_SENDER_ID"] || "",
  appId: import.meta.env["VITE_FIREBASE_APP_ID"] || "",
  measurementId: import.meta.env["VITE_FIREBASE_MEASUREMENT_ID"] || "",
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
