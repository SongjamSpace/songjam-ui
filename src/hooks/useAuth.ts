import { useState, useEffect } from 'react';
import { createUser, getUser, SongjamUser } from '../services/db/user.service';
import { auth } from '../services/firebase.service';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';

export function useAuth() {
  // const [loginMethod, setLoginMethod] = useState<'dynamic' | 'firebase' | null>(
  //   null
  // );
  const [user, setUser] = useState<SongjamUser | null>(null);
  const { user: dynamicUser, showAuthFlow } = useDynamicContext();

  const getUserFromDynamic = async () => {
    if (dynamicUser?.userId) {
      const userDoc = await getUser(dynamicUser.userId, (user) => {
        setUser(user);
      });
      if (userDoc) {
        setUser(userDoc);
      } else {
        // Create new user document if it doesn't exist
        const newUser: SongjamUser = {
          uid: dynamicUser.userId,
          email: dynamicUser.email || '',
          displayName: dynamicUser.alias || '',
          photoURL: null,
          username: dynamicUser.alias || '',
          spaceIds: [],
          spaceCredits: 1,
          totalUnlockedSpaces: 0,
          isTwitterLogin: false,
          isDynamicLogin: true,
          organizationIds: [],
          defaultOrganizationId: null,
        };
        await createUser(dynamicUser.userId, newUser);
        setUser(newUser);
      }
    }
  };
  useEffect(() => {
    if (dynamicUser) {
      // setLoginMethod('dynamic');
      getUserFromDynamic();
    }
    // else if (loginMethod === 'dynamic') {
    //   setUser(null);
    // }
  }, [dynamicUser]);

  // useEffect(() => {
  //   return auth.onAuthStateChanged(async (firebaseUser) => {
  //     if (firebaseUser) {
  //       // Get additional user data from Firestore
  //       const userDoc = await getUser(firebaseUser.uid, (user) => {
  //         setUser(user);
  //       });

  //       if (userDoc) {
  //         // Combine Firebase auth user with Firestore data
  //         setUser(userDoc);
  //       } else {
  //         // Create new user document if it doesn't exist
  //         const newUser: SongjamUser = {
  //           uid: firebaseUser.uid,
  //           email: firebaseUser.email || '',
  //           displayName: firebaseUser.displayName,
  //           photoURL: firebaseUser.photoURL,
  //           username: (firebaseUser as any).reloadUserInfo?.screenName,
  //           spaceIds: [],
  //           spaceCredits: 1,
  //           totalUnlockedSpaces: 0,
  //           isTwitterLogin: true,
  //           isDynamicLogin: false,
  //         };
  //         await createUser(firebaseUser.uid, newUser);

  //         setUser(newUser);
  //       }
  //     } else {
  //       setUser(null);
  //     }
  //     setLoading(false);
  //   });
  // }, []);

  return { user, loading: showAuthFlow };
}
