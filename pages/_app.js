import '../styles/globals.css';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import Login from './Login';
import Loading from './Loading';
import firebase from 'firebase';
import { useEffect } from 'react';
import { useBeforeunload } from 'react-beforeunload';
function MyApp({ Component, pageProps }) {
  const [user, loading] = useAuthState(auth);

  useBeforeunload(async () => {
    console.log("gone");
    await db.collection("users").doc(user.uid).set(
      {
        isOnline: false,
      },
      { merge: true }
    );
  });



  useEffect(() => {
    if (user) {
      db.collection('users').doc(user.uid).set(
        {
          email: user.email,
          lastSeen: firebase.firestore.FieldValue.serverTimestamp(),
          photoURL: user.photoURL,
          isOnline: true
        },
        {
          merge: true,
        }
      );
    }
  }, [user]);

  if (loading) return <Loading />;

  if (!user) return <Login />;

  return <Component {...pageProps} />;
}

export default MyApp;
