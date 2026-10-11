import {
  ref,
  set,
  update,
  remove,
  onValue,
  type Unsubscribe,
} from "firebase/database";
import { db } from "@/lib/firebase";
import type { FoodItem } from "@/features/bunk/types";

/**
 * Realtime listener for Menu/Food items
 */
export function subscribeToFoods(
  onData: (foods: FoodItem[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const foodsRef = ref(db, "foods");
  return onValue(
    foodsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const val = snapshot.val();
        const list: FoodItem[] = Object.keys(val).map((key) => ({
          ...val[key],
          id: Number(val[key].id || key),
        }));
        onData(list);
      } else {
        onData([]);
      }
    },
    onError
  );
}

/**
 * Add a new food item to the menu in Realtime Database
 */
export async function createFoodItemInDb(
  item: Omit<FoodItem, "id">
): Promise<number> {
  const id = Date.now();
  const newItem: FoodItem = {
    ...item,
    id,
  };
  await set(ref(db, `foods/${id}`), newItem);
  return id;
}

/**
 * Update an existing food item
 */
export async function updateFoodItemInDb(
  id: number,
  updates: Partial<FoodItem>
): Promise<void> {
  await update(ref(db, `foods/${id}`), updates);
}

/**
 * Toggle availability of a food item
 */
export async function toggleFoodAvailabilityInDb(
  id: number,
  nextState: boolean
): Promise<void> {
  await update(ref(db, `foods/${id}`), {
    available: nextState,
  });
}

/**
 * Delete a food item
 */
export async function deleteFoodItemInDb(id: number): Promise<void> {
  await remove(ref(db, `foods/${id}`));
}
