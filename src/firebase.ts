import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export async function syncUserToFirestore(user: { username: string; firstName?: string; lastName?: string; email?: string }) {
  try {
    const cleanUser = user.username.toLowerCase().replace(/@sanscounts\.san$/i, '').trim();
    if (!cleanUser) return;

    const userRef = doc(db, 'users', cleanUser);
    await setDoc(userRef, {
      username: cleanUser,
      firstName: user.firstName || cleanUser,
      lastName: user.lastName || '',
      email: user.email || `${cleanUser}@sanscounts.san`,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    console.log('[Firebase Sync] User synced to Firestore:', cleanUser);
  } catch (e) {
    console.warn('[Firebase Sync] Firestore sync warning:', e);
  }
}
