import { useState, useEffect } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase.service";
import { getUser, SongjamUser } from "../services/db/user.service";
export function useAuth() {
  const [user, setUser] = useState<SongjamUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Get additional user data from Firestore
        const userDoc = await getUser(firebaseUser.uid, (user) => {
          setUser(user);
        });

        if (userDoc) {
          // Combine Firebase auth user with Firestore data
          setUser(userDoc);
        } else {
          // Create new user document if it doesn't exist
          const newUser: SongjamUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            username: (firebaseUser as any).reloadUserInfo?.screenName,
            spaceIds: [],
            spaceCredits: 1,
            totalUnlockedSpaces: 0,
          };

          await setDoc(doc(db, "users", firebaseUser.uid), newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
  }, []);

  return { user, loading };
}
