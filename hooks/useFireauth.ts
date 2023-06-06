import { useEffect, useState } from 'react';
import {getAuth, signInAnonymously, onAuthStateChanged} from 'firebase/auth';

export interface User {
  uid: string
}

export interface FireauthType {
  user: User
}

const useFireauth = (): FireauthType => {
  const [user, setUser] = useState<User>();
  const auth = getAuth();

  useEffect(() => {
    signInAnonymously(auth)
      .then((userCredential) => {
        console.log("signInAnonymously(): " + userCredential.user.uid)
      })
      .catch((e) => {
        console.log(`damn: ${e.message}`)
      })

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log(`onAuthStateChanged(): ${user.uid}`)
        setUser(user)
      } else {
        console.log("onAuthStateChanged(): Signed out!")
        setUser(null)
      }
    });

    // Return a cleanup function to unsubscribe from the auth state change listener
    return unsubscribe;
  }, [auth, setUser]);

  return { user };
}

export default useFireauth;
