// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCkqMJRNienmfDh1onIRVpkzMLUMHYKYd0",
  authDomain: "uniconnect-g3.firebaseapp.com",
  projectId: "uniconnect-g3",
  storageBucket: "uniconnect-g3.firebasestorage.app",
  messagingSenderId: "545904567797",
  appId: "1:545904567797:web:cbf240a7aa54fbad09acbc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Exportar los servicios para usarlos en el resto de la app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);