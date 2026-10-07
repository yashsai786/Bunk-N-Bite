import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { app } from "./app";

export const auth: Auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});
