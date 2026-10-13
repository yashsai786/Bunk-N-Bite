import {
  ref,
  get,
  set,
  update,
  onValue,
  type Unsubscribe,
} from "firebase/database";
import { db } from "@/lib/firebase";
import type { Canteen, FoodItem, Order, OrderStatus } from "@/features/bunk/types";

/**
 * Realtime listener for Orders
 */
export function subscribeToOrders(
  onData: (orders: Order[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const ordersRef = ref(db, "orders");
  return onValue(
    ordersRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const list: Order[] = Object.keys(val).map((key) => ({
          ...val[key],
          id: val[key].id || key,
        }));
        // Sort descending by placement timestamp
        list.sort((a, b) => (b.id > a.id ? 1 : -1));
        onData(list);
      } else {
        onData([]);
      }
    },
    onError
  );
}

/**
 * Validates cart items against current database menu and recalculates prices safely.
 * Also revalidates that the canteen is currently operational (not suspended).
 */
export function validateCartAndCalculateTotals(
  cart: Record<number, number>,
  databaseFoods: FoodItem[],
  canteen?: Canteen | null
): {
  isValid: boolean;
  error?: string;
  orderItems: Order["items"];
  subtotal: number;
  platformTax: number;
  total: number;
} {
  if (canteen && (canteen.operationalStatus === "Suspended" || canteen.status === "Closed")) {
    return {
      isValid: false,
      error: `"${canteen.name}" is temporarily suspended by campus administration and cannot accept new orders.`,
      orderItems: [],
      subtotal: 0,
      platformTax: 0,
      total: 0,
    };
  }

  const orderItems: Order["items"] = [];
  let subtotal = 0;

  for (const [foodIdStr, quantity] of Object.entries(cart)) {
    if (quantity <= 0) continue;
    const foodId = Number(foodIdStr);
    const item = databaseFoods.find((f) => f.id === foodId);

    if (!item) {
      return {
        isValid: false,
        error: `Item #${foodId} no longer exists in menu catalog.`,
        orderItems: [],
        subtotal: 0,
        platformTax: 0,
        total: 0,
      };
    }

    if (!item.available) {
      return {
        isValid: false,
        error: `"${item.name}" is currently sold out. Please remove it from your tray.`,
        orderItems: [],
        subtotal: 0,
        platformTax: 0,
        total: 0,
      };
    }

    const itemSubtotal = item.price * quantity;
    subtotal += itemSubtotal;
    orderItems.push({
      foodId,
      name: item.name,
      quantity,
      price: item.price,
    });
  }

  if (orderItems.length === 0) {
    return {
      isValid: false,
      error: "Cart is empty.",
      orderItems: [],
      subtotal: 0,
      platformTax: 0,
      total: 0,
    };
  }

  const platformTax = Math.round(subtotal * 0.05); // 5% GST standard campus rate
  const total = subtotal + platformTax;

  return {
    isValid: true,
    orderItems,
    subtotal,
    platformTax,
    total,
  };
}

/**
 * Create Order in Realtime Database
 */
export async function createOrderInDb(order: Order): Promise<void> {
  const cleanId = order.id.replace(/[.#$[\]]/g, "_");
  await set(ref(db, `orders/${cleanId}`), order);
}

/**
 * Advance Order status
 */
export async function advanceOrderStatusInDb(
  orderId: string,
  nextStatus: OrderStatus,
  estimatedReadyAt: string
): Promise<void> {
  const cleanId = orderId.replace(/[.#$[\]]/g, "_");
  await update(ref(db, `orders/${cleanId}`), {
    status: nextStatus,
    estimatedReadyAt,
  });
}

/**
 * Cancel Order
 */
export async function cancelOrderInDb(orderId: string): Promise<void> {
  const cleanId = orderId.replace(/[.#$[\]]/g, "_");
  await update(ref(db, `orders/${cleanId}`), {
    status: "Cancelled",
  });
}
