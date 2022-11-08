import firebase from 'firebase';

const firebaseConfig = {
  apiKey: "AIzaSyDcg6Y-qaV3kIepeJfXuP09hIIhzqPhSTw",
  authDomain: "dive-chatapp-65b13.firebaseapp.com",
  projectId: "dive-chatapp-65b13",
  storageBucket: "dive-chatapp-65b13.appspot.com",
  messagingSenderId: "499453821195",
  appId: "1:499453821195:web:7988d7c7dbb37da0ff220e",
  measurementId: "G-HTW9HHKWVP"
};

const app = !firebase.apps.length
  ? firebase.initializeApp(firebaseConfig)
  : firebase.app();

const db = app.firestore();

const auth = app.auth();

const provider = new firebase.auth.GoogleAuthProvider();

export { db, auth, provider };
