import React, { createContext, useContext, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  initialCanteenRequests,
  initialCanteens,
  initialFoods,
  initialOrders,
  initialStudents,
  initialUniversities,
  initialUniversityRequests,
} from "./data";
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
  
  universities: University[];
  universityRequests: UniversityRequest[];
  approveUniversityRequest: (requestId: string) => void;
  rejectUniversityRequest: (requestId: string) => void;

  canteens: Canteen[];
  canteenRequests: CanteenRequest[];
  approveCanteenRequest: (requestId: string) => void;
  rejectCanteenRequest: (requestId: string) => void;

  foods: FoodItem[];
  addFoodItem: (item: Omit<FoodItem, "id">) => void;
  updateFoodItem: (id: number, updates: Partial<FoodItem>) => void;
  toggleFoodAvailability: (id: number) => void;

  students: StudentUser[];
  orders: Order[];
  latestOrder: Order | null;
  advanceOrderStatus: (orderId: string) => void;
  cancelOrder: (orderId: string) => void;

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

let orderCounter = 1049;

export function BunkProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>("student");
  const [activeTab, setActiveTab] = useState<string>("Home");
  const [selectedUniversityId, setSelectedUniversityId] = useState<string>("ahmedabad-univ");
  const [selectedCanteenId, setSelectedCanteenId] = useState<string>("canteen-central");

  const [universities, setUniversities] = useState<University[]>(initialUniversities);
  const [universityRequests, setUniversityRequests] = useState<UniversityRequest[]>(initialUniversityRequests);

  const [canteens, setCanteens] = useState<Canteen[]>(initialCanteens);
  const [canteenRequests, setCanteenRequests] = useState<CanteenRequest[]>(initialCanteenRequests);

  const [foods, setFoods] = useState<FoodItem[]>(initialFoods);
  const [students] = useState<StudentUser[]>(initialStudents);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [latestOrder, setLatestOrder] = useState<Order | null>(initialOrders[0] ?? null);

  const [cart, setCart] = useState<Record<number, number>>({ 1: 1, 3: 1 });
  const [paymentState, setPaymentState] = useState<"idle" | "processing" | "success" | "failed">("idle");
  const [selectedFoodDetail, setSelectedFoodDetail] = useState<FoodItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeOrderIdToTrack, setActiveOrderIdToTrack] = useState<string | null>(null);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    if (newRole === "owner") setActiveTab("Overview");
    else if (newRole === "university") setActiveTab("Overview");
    else if (newRole === "canteen") setActiveTab("Overview");
    else if (newRole === "student") setActiveTab("Home");
    else if (newRole === "visitor") setActiveTab("Menu");
  };

  const approveUniversityRequest = (requestId: string) => {
    const req = universityRequests.find((r) => r.id === requestId);
    if (!req) return;

    setUniversityRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "Approved" } : r))
    );

    const newUniv: University = {
      id: `univ-${Date.now()}`,
      name: req.university,
      location: req.campusLocation,
      status: "Active",
      canteens: req.canteenCountEst || 2,
      students: "1,500",
      contactPerson: req.requestedBy,
      contactEmail: req.email,
      joinedDate: "Today",
    };

    setUniversities((prev) => [newUniv, ...prev]);
    toast.success(`${req.university} approved and activated`);
  };

  const rejectUniversityRequest = (requestId: string) => {
    const req = universityRequests.find((r) => r.id === requestId);
    if (!req) return;

    setUniversityRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "Rejected" } : r))
    );
    toast.error(`University request from ${req.requestedBy} rejected`);
  };

  const approveCanteenRequest = (requestId: string) => {
    const req = canteenRequests.find((r) => r.id === requestId);
    if (!req) return;

    setCanteenRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "Approved" } : r))
    );

    const newCanteen: Canteen = {
      id: `canteen-${Date.now()}`,
      name: req.canteenName,
      universityId: req.universityId,
      universityName: req.universityName,
      owner: req.ownerName,
      ownerEmail: req.email,
      phone: req.phone,
      status: "Open",
      items: 12,
      orders: 0,
      openingHours: "08:30 AM – 08:00 PM",
      counterLocation: "Food Court Counter 4",
    };

    setCanteens((prev) => [newCanteen, ...prev]);
    toast.success(`Canteen "${req.canteenName}" approved for campus`);
  };

  const rejectCanteenRequest = (requestId: string) => {
    const req = canteenRequests.find((r) => r.id === requestId);
    if (!req) return;

    setCanteenRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "Rejected" } : r))
    );
    toast.error(`Canteen request "${req.canteenName}" rejected`);
  };

  const addFoodItem = (item: Omit<FoodItem, "id">) => {
    const newId = Date.now();
    const newItem: FoodItem = { ...item, id: newId };
    setFoods((prev) => [newItem, ...prev]);
    toast.success(`${item.name} added to menu`);
  };

  const updateFoodItem = (id: number, updates: Partial<FoodItem>) => {
    setFoods((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
    toast.success("Menu item updated");
  };

  const toggleFoodAvailability = (id: number) => {
    setFoods((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const nextState = !f.available;
          toast.info(`${f.name} is now ${nextState ? "Available" : "Unavailable"}`);
          return { ...f, available: nextState };
        }
        return f;
      })
    );
  };

  const advanceOrderStatus = (orderId: string) => {
    const nextStatusMap: Record<OrderStatus, OrderStatus> = {
      Placed: "Preparing",
      Preparing: "Ready",
      Ready: "Completed",
      Completed: "Completed",
      Cancelled: "Cancelled",
    };

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const next = nextStatusMap[o.status];
          toast.success(`Order ${orderId} moved to ${next}`);
          const updated = {
            ...o,
            status: next,
            estimatedReadyAt:
              next === "Preparing"
                ? "5-8 mins"
                : next === "Ready"
                ? "Ready for Pickup"
                : "Completed",
          };
          if (latestOrder?.id === orderId) {
            setLatestOrder(updated);
          }
          return updated;
        }
        return o;
      })
    );
  };

  const cancelOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          toast.error(`Order ${orderId} cancelled`);
          const updated = { ...o, status: "Cancelled" as OrderStatus };
          if (latestOrder?.id === orderId) setLatestOrder(updated);
          return updated;
        }
        return o;
      })
    );
  };

  const addToCart = (foodId: number) => {
    const food = foods.find((f) => f.id === foodId);
    if (!food) return;
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

  const processPaymentAndOrder = async (
    paymentMethod: "UPI" | "Cards" | "Net Banking"
  ): Promise<boolean> => {
    if (cartCount === 0) {
      toast.error("Cart is empty");
      return false;
    }

    setPaymentState("processing");

    await new Promise((resolve) => setTimeout(resolve, 900));

    orderCounter += 1;
    const currentId = `#${orderCounter}`;
    const token = `TK-${orderCounter % 100}`;

    const orderItems = Object.entries(cart).map(([id, qty]) => {
      const food = foods.find((f) => f.id === Number(id))!;
      return {
        foodId: Number(id),
        name: food.name,
        quantity: qty,
        price: food.price,
      };
    });

    const activeCanteen = canteens.find((c) => c.id === selectedCanteenId) || canteens[0]!;
    const activeUniv = universities.find((u) => u.id === selectedUniversityId) || universities[0]!;

    const newOrder: Order = {
      id: currentId,
      tokenNumber: token,
      customer: role === "visitor" ? "Guest Visitor" : "Aarav Shah",
      customerRole: role === "visitor" ? "Visitor" : "Student",
      customerEmail: role === "visitor" ? undefined : "aarav.shah@ahduni.edu.in",
      universityId: activeUniv.id,
      universityName: activeUniv.name,
      canteenId: activeCanteen.id,
      canteenName: activeCanteen.name,
      pickupCounter: activeCanteen.counterLocation,
      items: orderItems,
      subtotal: cartSubtotal,
      platformTax: cartTax,
      total: cartTotal,
      status: "Placed",
      paymentMethod,
      paymentStatus: "Paid",
      placedAt: "Just now",
      estimatedReadyAt: "10-15 mins",
    };

    setOrders((prev) => [newOrder, ...prev]);
    setLatestOrder(newOrder);
    setActiveOrderIdToTrack(newOrder.id);
    clearCart();
    setPaymentState("success");
    toast.success(`Payment verified! Order ${newOrder.id} confirmed.`);
    return true;
  };

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
        universities,
        universityRequests,
        approveUniversityRequest,
        rejectUniversityRequest,
        canteens,
        canteenRequests,
        approveCanteenRequest,
        rejectCanteenRequest,
        foods,
        addFoodItem,
        updateFoodItem,
        toggleFoodAvailability,
        students,
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
