import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { firebaseConfig } from "./config";

let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export { app };
