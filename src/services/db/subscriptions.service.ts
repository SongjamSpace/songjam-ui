import { collection, query, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase.service';

const CUSTOMER_COLLECTION = 'customers';
const SUBSCRIPTION_SUB_COLLECTION = 'subscriptions';

export type Subscription = {
  id: string;
  created: number;
  current_period_end: number;
  current_period_start: string;
};

const getCustomerSubscription = async (customerId: string) => {
  const customer = await getDocs(
    query(
      collection(
        db,
        CUSTOMER_COLLECTION,
        customerId,
        SUBSCRIPTION_SUB_COLLECTION
      ),
      limit(1)
    )
  );
  return customer.docs[0].data() as Subscription;
};

export default getCustomerSubscription;
