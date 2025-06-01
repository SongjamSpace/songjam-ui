import { collection, query, where } from 'firebase/firestore';
import { addDoc, getDocs, onSnapshot } from 'firebase/firestore';
import { db, logFirebaseEvent } from '../firebase.service';

const CUSTOMER_COLLECTION = 'customers';
const SUBSCRIPTIONS_COLLECTION = 'subscriptions';
const PAYMENTS_COLLECTION = 'payments';

const getPriceIdFromPlan = (plan: string) => {
  switch (plan) {
    case 'pro':
      return import.meta.env.VITE_STRIPE_PRO_PRICE_ID;
    case 'starter':
      return import.meta.env.VITE_STRIPE_STARTER_PRICE_ID;
    case 'business':
      return import.meta.env.VITE_STRIPE_BUSINESS_PRICE_ID;
  }
};

export const getPlanFromPriceId = (priceId: string) => {
  if (priceId === import.meta.env.VITE_STRIPE_PRO_PRICE_ID) {
    return 'pro';
  }
  if (priceId === import.meta.env.VITE_STRIPE_BUSINESS_PRICE_ID) {
    return 'business';
  }
  if (priceId === import.meta.env.VITE_STRIPE_STARTER_PRICE_ID) {
    return 'starter';
  }
  return 'free';
};

export const createCheckoutSession = async (
  uid: string,
  plan: 'pro' | 'business' | 'starter',
  callbackUrl?: string
) => {
  let checkoutSessionData = {
    price: getPriceIdFromPlan(plan), // price ID from products fetch
    success_url: callbackUrl || window.location.href, // can set this to a custom page
    cancel_url: callbackUrl || window.location.href, // can set this to a custom page
    mode: plan === 'starter' ? 'payment' : 'subscription',
    metadata: {
      uid,
    },
  };
  const customerRef = collection(
    db,
    CUSTOMER_COLLECTION,
    uid,
    'checkout_sessions'
  );
  const checkoutSessionRef = await addDoc(customerRef, checkoutSessionData);
  logFirebaseEvent('purchase', {
    plan,
    uid,
    callbackUrl,
    checkoutSessionId: checkoutSessionRef.id,
  });
  // The Stripe extension creates a payment link for us
  onSnapshot(checkoutSessionRef, (snap) => {
    const { error, url } = snap.data() as {
      error: string | null;
      url: string | null;
    };
    if (error) {
      // handle error
      console.error(error);
    }
    if (url) {
      window.location.assign(url); // redirect to payment link
    }
  });
};

export type StripeSubscription = {
  id: string;
  created: number;
  current_period_end: number;
  current_period_start: number;
  items: { price: { id: string } }[];
  status:
    | 'active'
    | 'inactive'
    | 'trialing'
    | 'past_due'
    | 'unpaid'
    | 'canceled'
    | 'incomplete'
    | 'incomplete_expired';
};

export const getSubscriptions = async (uid: string) => {
  const customerRef = collection(
    db,
    CUSTOMER_COLLECTION,
    uid,
    SUBSCRIPTIONS_COLLECTION
  );
  const subscriptions = await getDocs(customerRef);
  return subscriptions.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as StripeSubscription[];
};

type Payment = {
  id: string;
  created: number;
  amount: number;
  currency: string;
};
export const getPayments = async (uid: string) => {
  const customerRef = collection(
    db,
    CUSTOMER_COLLECTION,
    uid,
    PAYMENTS_COLLECTION
  );
  const payments = await getDocs(customerRef);
  return payments.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Payment[];
};

export const getActiveSubscription = async (uid: string) => {
  const customerRef = query(
    collection(db, CUSTOMER_COLLECTION, uid, SUBSCRIPTIONS_COLLECTION),
    where('status', '==', 'active')
  );
  const subscriptions = await getDocs(customerRef);
  return subscriptions.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as StripeSubscription[];
};
