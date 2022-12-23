import { useEffect, useState } from 'react';
import {getAuth, signInAnonymously, onAuthStateChanged} from 'firebase/auth';

const useFireauth = () => {
  const [user, setUser] = useState();
  const auth = getAuth();

  useEffect(() => {
    signInAnonymously(auth)
      .then(() => {
        console.log("YAY!")
      })
      .catch((e) => {
        console.log(`damn: ${e.message}`)
      })
  }, [auth, setUser]);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log(`Signed in!: ${user.uid}`)
      setUser(user)
    } else {
      console.log("Signed out!")
      setUser(null)
    }
  });

  return { user };
}

export default useFireauth;
