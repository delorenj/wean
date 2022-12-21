import { initializeApp } from 'firebase/app';

// Optionally import the services that you want to use
// import {...} from "firebase/auth";
// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Initialize Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyDXh34Ns3tNXWH3tAzlLQnc9Wh3wrrFPRE',
  authDomain: 'wean-17739.firebaseapp.com',
  projectId: "wean-17739",
  storageBucket: "wean-17739.appspot.com",
  messagingSenderId: "385319022932",
  appId: "1:385319022932:web:15c8c9d621874487b2d8c1",
  measurementId: "G-DPMJHN70HD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase
