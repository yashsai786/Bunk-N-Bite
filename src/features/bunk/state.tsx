import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";
import {
  fetchUserProfile,
  ensureUserProfile,
  logoutUser,
  completePasswordlessSignIn,
  isPasswordlessEmailLink,
  getFriendlyAuthErrorMessage,
} from "@/features/auth/services/authService";
import type { UserProfile, UniversityStudentMember } from "@/features/auth/types";
import {
  subscribeToUniversityMembers,
  resolvePendingInvitationsForEmail,
  migrateLegacyUserData,
} from "@/features/students/services/studentService";
import {
  approveUniversityRequestInDb,
  rejectUniversityRequestInDb,
  subscribeToUniversities,
  subscribeToUniversityRequests,
} from "@/features/universities/services/universityService";
import {
  approveCanteenRequestInDb,
  rejectCanteenRequestInDb,
  subscribeToCanteens,
  subscribeToCanteenRequests,
  toggleCanteenOperationalStatusInDb,
} from "@/features/canteens/services/canteenService";
import {
  createFoodItemInDb,
  deleteFoodItemInDb,
  subscribeToFoods,
  toggleFoodAvailabilityInDb,
  updateFoodItemInDb,
} from "@/features/menu/services/menuService";
import {
  advanceOrderStatusInDb,
  cancelOrderInDb,
  createOrderInDb,
  subscribeToOrders,
  validateCartAndCalculateTotals,
} from "@/features/orders/services/orderService";
import { initializeDatabaseIfEmpty } from "@/lib/firebase/seed";
import type {
  Canteen,
  CanteenRequest,
  FoodItem,
  Order,
  OrderStatus,
  Role,
  StudentUser,
  University,
  UniversityRequest,
} from "./types";

interface BunkContextType {
  role: Role;
  setRole: (role: Role) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedUniversityId: string;
  setSelectedUniversityId: (id: string) => void;
  selectedCanteenId: string;
  setSelectedCanteenId: (id: string) => void;

  currentUser: UserProfile | null;
  isAuthLoading: boolean;
  isDbLoading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  logout: () => Promise<void>;
  seedDatabase: () => Promise<void>;

  universities: University[];
  universityRequests: UniversityRequest[];
  approveUniversityRequest: (requestId: string) => Promise<{ campusCode: string } | null>;
  rejectUniversityRequest: (requestId: string) => Promise<void>;

  canteens: Canteen[];
  canteenRequests: CanteenRequest[];
  approveCanteenRequest: (requestId: string) => Promise<void>;
  rejectCanteenRequest: (requestId: string) => Promise<void>;
  toggleCanteenOperationalStatus: (canteenId: string, nextStatus: "Active" | "Suspended") => Promise<void>;

  foods: FoodItem[];
  addFoodItem: (item: Omit<FoodItem, "id">) => Promise<void>;
  updateFoodItem: (id: number, updates: Partial<FoodItem>) => Promise<void>;
  toggleFoodAvailability: (id: number) => Promise<void>;

  students: StudentUser[];
  universityMembers: UniversityStudentMember[];
  isProfileCompletionOpen: boolean;
  setIsProfileCompletionOpen: (open: boolean) => void;
  orders: Order[];
  latestOrder: Order | null;
  advanceOrderStatus: (orderId: string) => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;

  cart: Record<number, number>;
  addToCart: (foodId: number) => void;
  updateCartQuantity: (foodId: number, quantity: number) => void;
  removeFromCart: (foodId: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartTax: number;
  cartTotal: number;

  paymentState: "idle" | "processing" | "success" | "failed";
  setPaymentState: (state: "idle" | "processing" | "success" | "failed") => void;
  processPaymentAndOrder: (paymentMethod: "UPI" | "Cards" | "Net Banking") => Promise<boolean>;

  selectedFoodDetail: FoodItem | null;
  setSelectedFoodDetail: (food: FoodItem | null) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  activeOrderIdToTrack: string | null;
  setActiveOrderIdToTrack: (id: string | null) => void;
}

const BunkContext = createContext<BunkContextType | null>(null);

export function BunkProvider({ children }: { children: React.ReactNode }) {
  // Auth state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // App & Navigation State
  const [role, setRoleState] = useState<Role>("student");
  const [activeTab, setActiveTab] = useState<string>("Home");
  const [selectedUniversityId, setSelectedUniversityId] = useState<string>("");
  const [selectedCanteenId, setSelectedCanteenId] = useState<string>("");

  // Database Entities (Realtime synced from Firebase)
  const [universities, setUniversities] = useState<University[]>([]);
  const [universityRequests, setUniversityRequests] = useState<UniversityRequest[]>([]);
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [canteenRequests, setCanteenRequests] = useState<CanteenRequest[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [latestOrder, setLatestOrder] = useState<Order | null>(null);
  const [universityMembers, setUniversityMembers] = useState<UniversityStudentMember[]>([]);
  const [isDbLoading, setIsDbLoading] = useState(true);

  // Cart & UI State
  const [cart, setCart] = useState<Record<number, number>>({});
  const [paymentState, setPaymentState] = useState<"idle" | "processing" | "success" | "failed">("idle");
  const [selectedFoodDetail, setSelectedFoodDetail] = useState<FoodItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeOrderIdToTrack, setActiveOrderIdToTrack] = useState<string | null>(null);
  const [isProfileCompletionOpen, setIsProfileCompletionOpen] = useState(false);

  // Passwordless Email Link Auth Detection on Application Boot
  useEffect(() => {
    if (typeof window !== "undefined" && isPasswordlessEmailLink(window.location.href)) {
      let email = window.localStorage.getItem("emailForSignIn");
      if (!email) {
        email = window.prompt("Please confirm your email address to complete passwordless sign-in:");
      }
      if (email && email.trim()) {
        const cleanEmail = email.trim().toLowerCase();
        completePasswordlessSignIn(cleanEmail, window.location.href)
          .then(async (profile) => {
            setCurrentUser(profile);
            setRoleState(profile.role);
            toast.success(`Welcome, ${profile.displayName || "Student"}! Signed in via email link.`);
            await resolvePendingInvitationsForEmail(cleanEmail, profile.uid, profile.displayName);
            if (!profile.isProfileComplete) {
              setIsProfileCompletionOpen(true);
            }
            window.history.replaceState({}, document.title, window.location.pathname);
          })
          .catch((err) => {
            toast.error(getFriendlyAuthErrorMessage(err?.code || ""));
          });
      }
    }
  }, []);

  // Auth Observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      setIsAuthLoading(true);
      if (firebaseUser) {
        try {
          const profile = await fetchUserProfile(firebaseUser.uid);
          if (profile) {
            setCurrentUser(profile);
            setRoleState(profile.role);
            if (profile.universityId) setSelectedUniversityId(profile.universityId);
            else if (profile.instituteMemberships) {
              const activeMembership = Object.values(profile.instituteMemberships).find((m) => m.status === "active");
              if (activeMembership?.universityId) setSelectedUniversityId(activeMembership.universityId);
            }
            if (profile.canteenId) setSelectedCanteenId(profile.canteenId);
          } else {
            const newProfile = await ensureUserProfile(firebaseUser);
            setCurrentUser(newProfile);
            setRoleState(newProfile.role);
          }
          // Non-blocking legacy data migration for existing users
          migrateLegacyUserData(firebaseUser.uid).catch(() => {});
        } catch (err) {
          console.error("Auth state synchronization error:", err);
        }
      } else {
        setCurrentUser(null);
        setRoleState("student");
      }
      setIsAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Realtime University Members Listener for selectedUniversityId
  useEffect(() => {
    if (!selectedUniversityId) {
      setUniversityMembers([]);
      return;
    }
    const unsub = subscribeToUniversityMembers(
      selectedUniversityId,
      (members) => {
        setUniversityMembers(members);
      },
      (err) => {
        console.warn("Could not subscribe to university members:", err);
      }
    );
    return () => unsub();
  }, [selectedUniversityId]);

  // Database Listeners
  useEffect(() => {
    let loadedCount = 0;
    const checkLoaded = () => {
      loadedCount += 1;
      if (loadedCount >= 5) {
        setIsDbLoading(false);
      }
    };

    const unsubUniv = subscribeToUniversities((list) => {
      setUniversities(list);
      if (list.length > 0 && !list.find((u) => u.id === selectedUniversityId)) {
        if (list[0]?.id) setSelectedUniversityId(list[0].id);
      }
      checkLoaded();
    });

    const unsubUnivReq = subscribeToUniversityRequests((reqs) => {
      setUniversityRequests(reqs);
      checkLoaded();
    });

    const unsubCanteens = subscribeToCanteens((list) => {
      setCanteens(list);
      if (list.length > 0 && !list.find((c) => c.id === selectedCanteenId)) {
        if (list[0]?.id) setSelectedCanteenId(list[0].id);
      }
      checkLoaded();
    });

    const unsubCanteenReq = subscribeToCanteenRequests((reqs) => {
      setCanteenRequests(reqs);
      checkLoaded();
    });

    const unsubFoods = subscribeToFoods((items) => {
      setFoods(items);
      checkLoaded();
    });

    const unsubOrders = subscribeToOrders((orderList) => {
      setOrders(orderList);
      if (orderList.length > 0) {
        setLatestOrder(orderList[0] || null);
      }
    });

    return () => {
      unsubUniv();
      unsubUnivReq();
      unsubCanteens();
      unsubCanteenReq();
      unsubFoods();
      unsubOrders();
    };
  }, []);

  // Sync role-based default tabs
  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    if (newRole === "owner") setActiveTab("Overview");
    else if (newRole === "university") setActiveTab("Overview");
    else if (newRole === "canteen") setActiveTab("Overview");
    else if (newRole === "student") setActiveTab("Home");
    else if (newRole === "visitor") setActiveTab("Menu");
  };

  // Logout Handler
  const logout = async () => {
    await logoutUser();
    setCurrentUser(null);
    clearCart();
    setRole("visitor");
    toast.info("Logged out successfully");
  };

  // Seed database utility
  const seedDatabase = async () => {
    try {
      const seeded = await initializeDatabaseIfEmpty();
      if (seeded) {
        toast.success("Database populated with initial campus records!");
      } else {
        toast.info("Database is already initialized.");
      }
    } catch (e: any) {
      toast.error("Failed to seed database: " + e?.message);
    }
  };

  // University Request Operations
  const approveUniversityRequest = async (requestId: string): Promise<{ campusCode: string } | null> => {
    const req = universityRequests.find((r) => r.id === requestId);
    if (!req) return null;

    try {
      const campusCode = await approveUniversityRequestInDb(requestId, req);
      toast.success(`${req.university} approved! Campus Code: ${campusCode}`, {
        duration: 7000,
      });
      return { campusCode };
    } catch (err: any) {
      toast.error("Failed to approve request: " + err?.message);
      return null;
    }
  };

  const rejectUniversityRequest = async (requestId: string) => {
    const req = universityRequests.find((r) => r.id === requestId);
    if (!req) return;

    try {
      await rejectUniversityRequestInDb(requestId);
      toast.info(`University request from ${req.requestedBy} rejected`);
    } catch (err: any) {
      toast.error("Failed to reject request: " + err?.message);
    }
  };

  // Canteen Request Operations
  const approveCanteenRequest = async (requestId: string) => {
    const req = canteenRequests.find((r) => r.id === requestId);
    if (!req) return;

    try {
      await approveCanteenRequestInDb(requestId, req);
      toast.success(`Canteen "${req.canteenName}" approved for campus`);
    } catch (err: any) {
      toast.error("Failed to approve canteen: " + err?.message);
    }
  };

  const rejectCanteenRequest = async (requestId: string) => {
    const req = canteenRequests.find((r) => r.id === requestId);
    if (!req) return;

    try {
      await rejectCanteenRequestInDb(requestId);
      toast.info(`Canteen request "${req.canteenName}" rejected`);
    } catch (err: any) {
      toast.error("Failed to reject canteen: " + err?.message);
    }
  };

  const toggleCanteenOperationalStatus = async (
    canteenId: string,
    nextStatus: "Active" | "Suspended"
  ) => {
    try {
      await toggleCanteenOperationalStatusInDb(canteenId, nextStatus);
      if (nextStatus === "Active") {
        toast.success("Canteen activated and operational.");
      } else {
        toast.warning("Canteen suspended. Ordering disabled for students & visitors.");
      }
    } catch (err: any) {
      toast.error("Failed to update operational status: " + err?.message);
    }
  };

  // Menu Operations
  const addFoodItem = async (item: Omit<FoodItem, "id">) => {
    try {
      await createFoodItemInDb(item);
      toast.success(`${item.name} added to menu`);
    } catch (err: any) {
      toast.error("Failed to add menu item: " + err?.message);
    }
  };

  const updateFoodItem = async (id: number, updates: Partial<FoodItem>) => {
    try {
      await updateFoodItemInDb(id, updates);
      toast.success("Menu item updated");
    } catch (err: any) {
      toast.error("Failed to update item: " + err?.message);
    }
  };

  const toggleFoodAvailability = async (id: number) => {
    const food = foods.find((f) => f.id === id);
    if (!food) return;
    const nextState = !food.available;
    try {
      await toggleFoodAvailabilityInDb(id, nextState);
      toast.info(`${food.name} is now ${nextState ? "Available" : "Unavailable"}`);
    } catch (err: any) {
      toast.error("Failed to toggle availability: " + err?.message);
    }
  };

  // Order Operations
  const advanceOrderStatus = async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const nextStatusMap: Record<OrderStatus, OrderStatus> = {
      Placed: "Preparing",
      Preparing: "Ready",
      Ready: "Completed",
      Completed: "Completed",
      Cancelled: "Cancelled",
    };

    const next = nextStatusMap[order.status];
    const estimatedTime =
      next === "Preparing"
        ? "5-8 mins"
        : next === "Ready"
        ? "Ready for Pickup"
        : "Completed";

    try {
      await advanceOrderStatusInDb(orderId, next, estimatedTime);
      toast.success(`Order ${orderId} status updated to ${next}`);
    } catch (err: any) {
      toast.error("Failed to update order status: " + err?.message);
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      await cancelOrderInDb(orderId);
      toast.error(`Order ${orderId} cancelled`);
    } catch (err: any) {
      toast.error("Failed to cancel order: " + err?.message);
    }
  };

  // Cart Operations
  const addToCart = (foodId: number) => {
    const food = foods.find((f) => f.id === foodId);
    if (!food) return;

    // Check canteen operational status
    const targetCanteen = canteens.find((c) => c.id === food.canteenId);
    if (targetCanteen && (targetCanteen.operationalStatus === "Suspended" || targetCanteen.status === "Closed")) {
      toast.error(`"${targetCanteen.name}" is temporarily suspended by campus administration.`);
      return;
    }

    if (!food.available) {
      toast.error(`${food.name} is currently sold out`);
      return;
    }
    setCart((prev) => ({
      ...prev,
      [foodId]: (prev[foodId] || 0) + 1,
    }));
    toast.success(`Added ${food.name} to cart`);
  };

  const updateCartQuantity = (foodId: number, quantity: number) => {
    setCart((prev) => {
      const updated = { ...prev };
      if (quantity <= 0) {
        delete updated[foodId];
      } else {
        updated[foodId] = quantity;
      }
      return updated;
    });
  };

  const removeFromCart = (foodId: number) => {
    setCart((prev) => {
      const updated = { ...prev };
      delete updated[foodId];
      return updated;
    });
    toast.info("Item removed from cart");
  };

  const clearCart = () => {
    setCart({});
  };

  const cartCount = useMemo(() => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const food = foods.find((f) => f.id === Number(id));
      return sum + (food ? food.price * qty : 0);
    }, 0);
  }, [cart, foods]);

  const cartTax = useMemo(() => {
    return Math.round(cartSubtotal * 0.05);
  }, [cartSubtotal]);

  const cartTotal = useMemo(() => {
    return cartSubtotal + cartTax;
  }, [cartSubtotal, cartTax]);

  // Order Placement & Payment Workflow
  const processPaymentAndOrder = async (
    paymentMethod: "UPI" | "Cards" | "Net Banking"
  ): Promise<boolean> => {
    if (cartCount === 0) {
      toast.error("Cart is empty");
      return false;
    }

    setPaymentState("processing");

    const activeCanteen = canteens.find((c) => c.id === selectedCanteenId) || canteens[0];
    const activeUniv = universities.find((u) => u.id === selectedUniversityId) || universities[0];

    // Server/Database Price, Availability, and Canteen Operational Status Validation
    const validation = validateCartAndCalculateTotals(cart, foods, activeCanteen);
    if (!validation.isValid) {
      setPaymentState("failed");
      toast.error(validation.error || "Order validation failed. Please check cart items.");
      return false;
    }

    const timestamp = Date.now();
    const tokenNumber = `TK-${(timestamp % 900) + 100}`;
    const orderId = `#${(timestamp % 9000) + 1000}`;

    const newOrder: Order = {
      id: orderId,
      tokenNumber,
      customer: currentUser?.displayName || (role === "visitor" ? "Guest Visitor" : "Student"),
      customerRole: role === "visitor" ? "Visitor" : "Student",
      customerEmail: currentUser?.email,
      universityId: activeUniv?.id || "campus-univ",
      universityName: activeUniv?.name || "Campus",
      canteenId: activeCanteen?.id || "canteen-central",
      canteenName: activeCanteen?.name || "Central Canteen",
      pickupCounter: activeCanteen?.counterLocation || "Counter 1",
      items: validation.orderItems,
      subtotal: validation.subtotal,
      platformTax: validation.platformTax,
      total: validation.total,
      status: "Placed",
      paymentMethod,
      paymentStatus: "Paid",
      placedAt: "Just now",
      estimatedReadyAt: "10-15 mins",
    };

    try {
      await createOrderInDb(newOrder);
      setLatestOrder(newOrder);
      setActiveOrderIdToTrack(newOrder.id);
      clearCart();
      setPaymentState("success");
      toast.success(`Payment verified! Order ${newOrder.id} confirmed.`);
      return true;
    } catch (err: any) {
      setPaymentState("failed");
      toast.error("Failed to place order in database: " + err?.message);
      return false;
    }
  };

  // Realtime Enrolled Students for University View
  const students: StudentUser[] = useMemo(() => {
    if (universityMembers.length > 0) {
      return universityMembers.map((m) => ({
        id: m.id,
        studentId: m.studentId || "N/A",
        name: m.name,
        email: m.email,
        universityId: m.universityId,
        department: m.department || "General",
        ordersCount: m.ordersCount || 0,
        status: m.status === "suspended" ? "Suspended" : "Active",
        joinedDate: new Date(m.addedAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      }));
    }
    return [];
  }, [universityMembers]);

  return (
    <BunkContext.Provider
      value={{
        role,
        setRole,
        activeTab,
        setActiveTab,
        selectedUniversityId,
        setSelectedUniversityId,
        selectedCanteenId,
        setSelectedCanteenId,
        currentUser,
        isAuthLoading,
        isDbLoading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        logout,
        seedDatabase,
        universities,
        universityRequests,
        approveUniversityRequest,
        rejectUniversityRequest,
        canteens,
        canteenRequests,
        approveCanteenRequest,
        rejectCanteenRequest,
        toggleCanteenOperationalStatus,
        foods,
        addFoodItem,
        updateFoodItem,
        toggleFoodAvailability,
        students,
        universityMembers,
        isProfileCompletionOpen,
        setIsProfileCompletionOpen,
        orders,
        latestOrder,
        advanceOrderStatus,
        cancelOrder,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        cartTax,
        cartTotal,
        paymentState,
        setPaymentState,
        processPaymentAndOrder,
        selectedFoodDetail,
        setSelectedFoodDetail,
        isCartOpen,
        setIsCartOpen,
        activeOrderIdToTrack,
        setActiveOrderIdToTrack,
      }}
    >
      {children}
    </BunkContext.Provider>
  );
}

export function useBunk() {
  const context = useContext(BunkContext);
  if (!context) {
    throw new Error("useBunk must be used within a BunkProvider");
  }
  return context;
}
