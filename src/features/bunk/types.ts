export type Role = "owner" | "university" | "canteen" | "student" | "visitor";

export type OrderStatus = "Placed" | "Preparing" | "Ready" | "Completed" | "Cancelled";

export type UniversityRequestStatus = "Pending" | "Review" | "Approved" | "Rejected";

export type CanteenStatus = "Open" | "Busy" | "Closed";

export interface University {
  id: string;
  name: string;
  location: string;
  campusCode?: string;
  status: "Active" | "Review" | "Inactive";
  canteens: number;
  students: string;
  contactPerson: string;
  contactEmail: string;
  joinedDate: string;
}

export interface UniversityRequest {
  id: string;
  university: string;
  requestedBy: string;
  email: string;
  phone: string;
  campusLocation: string;
  city?: string;
  state?: string;
  canteenCountEst: number;
  date: string;
  status: UniversityRequestStatus;
  notes?: string | undefined;
}

export interface Canteen {
  id: string;
  name: string;
  universityId: string;
  universityName: string;
  owner: string;
  ownerEmail: string;
  phone: string;
  status: CanteenStatus;
  operationalStatus?: "Active" | "Suspended";
  items: number;
  orders: number;
  openingHours: string;
  counterLocation: string;
}

export interface CanteenRequest {
  id: string;
  canteenName: string;
  campusCode?: string;
  universityId: string;
  universityName: string;
  ownerName: string;
  email: string;
  phone: string;
  cuisine: string;
  date: string;
  status: "Pending" | "Approved" | "Rejected";
}

export interface FoodItem {
  id: number;
  canteenId: string;
  name: string;
  price: number;
  category: "Breakfast" | "Snacks" | "Meals" | "Drinks" | "Desserts";
  image: string;
  emoji?: string | undefined;
  available: boolean;
  prepTime: string;
  description: string;
  isVeg: boolean;
}

export interface CartItem {
  food: FoodItem;
  quantity: number;
}

export interface OrderItem {
  foodId: number;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  tokenNumber: string;
  customer: string;
  customerRole: "Student" | "Visitor";
  customerEmail?: string | undefined;
  universityId: string;
  universityName: string;
  canteenId: string;
  canteenName: string;
  pickupCounter: string;
  items: OrderItem[];
  subtotal: number;
  platformTax: number;
  total: number;
  status: OrderStatus;
  paymentMethod: "UPI" | "Cards" | "Net Banking";
  paymentStatus: "Paid" | "Pending";
  placedAt: string;
  estimatedReadyAt: string;
}

export interface StudentUser {
  id: string;
  studentId: string;
  name: string;
  email: string;
  universityId: string;
  department: string;
  ordersCount: number;
  status: "Active" | "Suspended";
  joinedDate: string;
}

export interface InstituteMembership {
  universityId: string;
  universityName?: string;
  status: "active" | "suspended" | "removed";
  studentId?: string;
  department?: string;
  addedAt: number;
  addedBy: string;
  updatedAt?: number;
  updatedBy?: string;
}

export interface StudentInvitation {
  id: string;
  email: string;
  name?: string;
  studentId?: string;
  department?: string;
  universityId: string;
  universityName: string;
  status: "pending" | "accepted" | "expired" | "cancelled";
  invitedAt: number;
  invitedBy: string;
  acceptedAt?: number;
}

export interface UniversityStudentMember {
  id: string;
  uid?: string;
  email: string;
  name: string;
  studentId?: string;
  department?: string;
  universityId: string;
  universityName?: string;
  status: "active" | "suspended" | "removed" | "pending";
  isInvitation?: boolean;
  invitationId?: string;
  ordersCount?: number;
  addedAt: number;
  addedBy: string;
  updatedAt?: number;
  updatedBy?: string;
}
