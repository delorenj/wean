import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInAnonymously } from 'firebase/auth';
import {
  collection,
  doc,
  getDocs,
  writeBatch,
  type DocumentReference,
  type Firestore,
} from 'firebase/firestore';
import useFireauth from './useFireauth';
import { useFirebase } from '../context/firebaseConfig';

const FIRESTORE_BATCH_LIMIT = 450;

const deleteDocumentReferences = async (
  db: Firestore,
  documentRefs: Array<DocumentReference>
): Promise<void> => {
  if (documentRefs.length === 0) {
    return;
  }

  let batch = writeBatch(db);
  let operationCount = 0;

  for (const documentRef of documentRefs) {
    batch.delete(documentRef);
    operationCount += 1;

    if (operationCount >= FIRESTORE_BATCH_LIMIT) {
      await batch.commit();
      batch = writeBatch(db);
      operationCount = 0;
    }
  }

  if (operationCount > 0) {
    await batch.commit();
  }
};

const useAccountDeletion = () => {
  const { user } = useFireauth();
  const { auth, db } = useFirebase();

  const deleteAccount = async (): Promise<void> => {
    if (!db || !auth || !user) {
      throw new Error('No authenticated user found');
    }

    const currentUser = auth.currentUser;

    if (!currentUser || currentUser.uid !== user.uid) {
      throw new Error('Unable to resolve active auth session');
    }

    const dosesSnapshot = await getDocs(collection(db, `doses-${user.uid}`));
    const documentsToDelete: Array<DocumentReference> = dosesSnapshot.docs.map((snapshotDoc) => snapshotDoc.ref);

    documentsToDelete.push(doc(db, 'settings', user.uid));

    await deleteDocumentReferences(db, documentsToDelete);
    await currentUser.delete();
    await AsyncStorage.clear();

    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error('Account deleted, but failed to create a new anonymous session:', error);
    }
  };

  return {
    deleteAccount,
  };
};

export default useAccountDeletion;
