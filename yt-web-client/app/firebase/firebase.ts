// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAqd_NNlvYtnl3hSg5wFDyo0gNnXt6AYDM",
  authDomain: "clone-71437.firebaseapp.com",
  projectId: "clone-71437",
  appId: "1:741899135034:web:4032be55c4d0274e1a2d03",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

/**
 * Signs the user in with a Google popup.
 * @returns A promise that resolves with the user's credentials
 */
export function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

/**
 * Signs the user out.
 * @returns A promise that resolves when the user is signed out
 */
export function signOut() {
  return auth.signOut();
}

/**
 * Trigger a callback when user with auth state changes.
 * @returns A function to unsubscribe callback
 */
export function onAuthStateChangedHelper(
  callback: (user: User | null) => void
) {
  return onAuthStateChanged(auth, callback);
}
