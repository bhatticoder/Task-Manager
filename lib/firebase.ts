import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: 'AIzaSyDFoQXUgvrVVGmXYQVZ5JEhN6wkb_DmMJ4',  // Your Firebase API key
  authDomain: 'todoapp4567.firebaseapp.com',  // Your Firebase Auth Domain
  projectId: 'todoapp4567',  // Your Firebase Project ID
  storageBucket: 'todoapp4567.appspot.com',  // Your Firebase Storage Bucket
  messagingSenderId: '477768925442',  // Your Firebase Messaging Sender ID
  appId: '1:477768925442:android:889f5129be8774116f821b',  // Your Firebase App ID
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);