// firebase-config.js
const firebaseConfig = {
    apiKey: "AIzaSyBUSYzZ5zCM16mK2V3Nmnt_i0XLTkRw6yU",
    authDomain: "tracko-ext.firebaseapp.com",
    projectId: "tracko-ext",
    storageBucket: "tracko-ext.appspot.com",
    messagingSenderId: "542975569888",
    appId: "1:542975569888:web:f867ad365952957dc00585",
    measurementId: "G-GDKD4QM8XR"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  const auth = firebase.auth();
  