import { useEffect, useState, type ReactNode } from 'react';
import {
  type User,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { AuthContext } from './authContextCore';

async function loadAdminStatus(email: string): Promise<{ isAdmin: boolean; isSuper: boolean }> {
  const snap = await getDoc(doc(db, 'admins', email));
  if (!snap.exists()) return { isAdmin: false, isSuper: false };
  return { isAdmin: true, isSuper: snap.data().isSuper === true };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser?.email) {
        const status = await loadAdminStatus(firebaseUser.email);
        setIsAdmin(status.isAdmin);
        setIsSuperAdmin(status.isSuper);
      } else {
        setIsAdmin(false);
        setIsSuperAdmin(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    if (cred.user.email) {
      const status = await loadAdminStatus(cred.user.email);
      if (!status.isAdmin) {
        await firebaseSignOut(auth);
        throw new Error(`Нет доступа: ${cred.user.email} не в списке администраторов`);
      }
    }
  }

  async function signOut() {
    await firebaseSignOut(auth);
    setIsAdmin(false);
    setIsSuperAdmin(false);
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, isSuperAdmin, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
