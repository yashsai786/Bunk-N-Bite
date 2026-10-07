import { get, ref, set } from "firebase/database";
import { db } from "./database";
import {
  initialCanteens,
  initialFoods,
  initialUniversities,
} from "@/features/bunk/data";

/**
 * Seeds initial campus catalog into Firebase Realtime Database
 * only if the database is currently uninitialized.
 */
export async function initializeDatabaseIfEmpty(): Promise<boolean> {
  try {
    const univSnap = await get(ref(db, "universities"));
    if (univSnap.exists() && Object.keys(univSnap.val()).length > 0) {
      return false; // Already populated
    }

    // 1. Seed Universities
    const univMap: Record<string, any> = {};
    initialUniversities.forEach((u) => {
      univMap[u.id] = u;
    });
    await set(ref(db, "universities"), univMap);

    // 2. Seed Canteens
    const canteenMap: Record<string, any> = {};
    initialCanteens.forEach((c) => {
      canteenMap[c.id] = c;
    });
    await set(ref(db, "canteens"), canteenMap);

    // 3. Seed Menu Foods
    const foodMap: Record<string, any> = {};
    initialFoods.forEach((f) => {
      foodMap[f.id] = f;
    });
    await set(ref(db, "foods"), foodMap);

    return true;
  } catch (error) {
    console.error("Failed to seed initial database:", error);
    return false;
  }
}
