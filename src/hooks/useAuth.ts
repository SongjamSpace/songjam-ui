import { useState, useEffect } from 'react';
import {
  createUser,
  getUser,
  SongjamUser,
  updateUserPlan,
} from '../services/db/user.service';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { auth } from '../services/firebase.service';
import { signInWithCustomToken } from 'firebase/auth';
import axios from 'axios';
import { getDynamicToken } from '../utils';
import {
  getActiveSubscription,
  getPlanFromPriceId,
} from '../services/db/stripe';
export function useAuth() {
  // const [loginMethod, setLoginMethod] = useState<'dynamic' | 'firebase' | null>(
  //   null
  // );
  const [user, setUser] = useState<SongjamUser | null>(null);
  const { user: dynamicUser, showAuthFlow } = useDynamicContext();
  const [isLoading, setIsLoading] = useState(false);

  const processDynamicUser = async () => {
    if (dynamicUser?.userId) {
      setIsLoading(true);
      try {
        const token = getDynamicToken();
        if (!token) {
          throw new Error('No authentication token found');
        }
        if (!auth.currentUser) {
          // Get Firebase custom token from server
          const response = await axios.get(
            `${import.meta.env.VITE_JAM_SERVER_URL}/auth/firebase-token`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // Sign in with custom token
          await signInWithCustomToken(auth, response.data.token);
          // TODO: handle this
        }

        const userDoc = await getUser(dynamicUser.userId, (user) => {
          setUser(user);
        });
        if (userDoc) {
          // TODO: Remove after webhook is setup
          // if (!userDoc.currentPlan) {
          //   const activeSubscription = await getActiveSubscription(
          //     dynamicUser.userId
          //   );
          //   if (activeSubscription.length > 0) {
          //     const subscription = activeSubscription[0];
          //     await updateUserPlan(
          //       dynamicUser.userId,
          //       getPlanFromPriceId(subscription.items[0].price.id),
          //       subscription.current_period_start,
          //       subscription.current_period_end
          //     );
          //   } else {
          //     await updateUserPlan(
          //       dynamicUser.userId,
          //       'free',
          //       Date.now(),
          //       Date.now()
          //     );
          //   }
          // }
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
            projectIds: [],
            defaultProjectId: null,
            currentPlan: 'free',
            usage: {
              aiAssistantRequests: 0,
              spaces: 0,
              autoDms: 0,
              totalRequests: 0,
            },
            startsAt: Date.now(),
            endsAt: Date.now(),
          };
          await createUser(dynamicUser.userId, newUser);
          setUser(newUser);
        }
      } catch (error) {
        console.error('Error processing dynamic user:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  useEffect(() => {
    if (dynamicUser) {
      // setLoginMethod('dynamic');
      processDynamicUser();
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

  return { user, loading: showAuthFlow || isLoading };
}
