import React, { useState } from "react";
import {
  ArrowLeft,
  Building2,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Phone,
  Shield,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getFriendlyAuthErrorMessage,
  loginWithEmail,
  loginWithGoogle,
  logoutUser,
  requestPasswordReset,
} from "../services/authService";
import { submitCanteenRequestWithCampusCode } from "@/features/canteens/services/canteenService";
import { submitUniversityRequest } from "@/features/universities/services/universityService";
import { useBunk } from "@/features/bunk/state";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { currentUser, isAuthLoading, logout, setRole, setActiveTab } = useBunk();
  const [view, setView] = useState<"signin" | "campus" | "canteen">("signin");
  const [isLoading, setIsLoading] = useState(false);

  // Sign In state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Campus Request state
  const [univName, setUnivName] = useState("");
  const [univContact, setUnivContact] = useState("");
  const [univEmail, setUnivEmail] = useState("");
  const [univPhone, setUnivPhone] = useState("");
  const [univCity, setUnivCity] = useState("");
  const [univState, setUnivState] = useState("");

  // Canteen Registration state
  const [canteenName, setCanteenName] = useState("");
  const [canteenOwner, setCanteenOwner] = useState("");
  const [canteenEmail, setCanteenEmail] = useState("");
  const [canteenPassword, setCanteenPassword] = useState("");
  const [campusCode, setCampusCode] = useState("");
  const [canteenCuisine, setCanteenCuisine] = useState("Fast Food & Beverages");

  // Reset view state when opening
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setView("signin");
      onClose();
    }
  };

  // Sign In
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      toast.error("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const profile = await loginWithEmail(loginEmail, loginPassword);
      toast.success(`Welcome, ${profile.displayName}!`);
      // Role-based automatic dashboard redirect
      setRole(profile.role);
      if (profile.role === "student") setActiveTab("Home");
      else if (profile.role === "visitor") setActiveTab("Menu");
      else setActiveTab("Overview");
      onClose();
    } catch (err: any) {
      toast.error(getFriendlyAuthErrorMessage(err?.code || ""));
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-In
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const profile = await loginWithGoogle();
      toast.success(`Signed in via Google as ${profile.displayName}`);
      setRole(profile.role);
      if (profile.role === "student") setActiveTab("Home");
      else if (profile.role === "visitor") setActiveTab("Menu");
      else setActiveTab("Overview");
      onClose();
    } catch (err: any) {
      toast.error(getFriendlyAuthErrorMessage(err?.code || ""));
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password
  const handleForgotPassword = async () => {
    if (!loginEmail.trim()) {
      toast.error("Please enter your email address to receive password reset instructions.");
      return;
    }

    setIsLoading(true);
    try {
      await requestPasswordReset(loginEmail);
      toast.success(`Password reset email sent to ${loginEmail}. Please check your inbox.`);
    } catch (err: any) {
      toast.error(getFriendlyAuthErrorMessage(err?.code || ""));
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Campus Access Request
  const handleCampusRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!univName.trim() || !univContact.trim() || !univEmail.trim()) {
      toast.error("Please fill in the required university details.");
      return;
    }

    setIsLoading(true);
    try {
      await submitUniversityRequest({
        university: univName.trim(),
        requestedBy: univContact.trim(),
        email: univEmail.trim(),
        phone: univPhone.trim() || "+91 98765 43210",
        campusLocation: `${univCity.trim()}, ${univState.trim()}`.replace(/^,\s*|,\s*$/g, "") || "Campus",
        city: univCity.trim(),
        state: univState.trim(),
        canteenCountEst: 2,
        notes: "Campus access request submitted via terminal.",
      });
      toast.success("Campus request submitted");
      setView("signin");
    } catch (err: any) {
      toast.error("Failed to submit campus request: " + (err?.message || ""));
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Canteen Registration via Campus Code
  const handleCanteenRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canteenName.trim() || !canteenOwner.trim() || !canteenEmail.trim() || !campusCode.trim()) {
      toast.error("Please fill in all required canteen fields and campus code.");
      return;
    }

    const cleanCode = campusCode.trim().toUpperCase();
    if (cleanCode.length !== 6) {
      toast.error("Campus Code must be exactly 6 characters (e.g. A7K9PX).");
      return;
    }

    setIsLoading(true);
    try {
      await submitCanteenRequestWithCampusCode({
        canteenName: canteenName.trim(),
        ownerName: canteenOwner.trim(),
        email: canteenEmail.trim(),
        password: canteenPassword.trim() || undefined,
        campusCode: cleanCode,
        cuisine: canteenCuisine.trim(),
      });
      toast.success("Canteen request submitted");
      setView("signin");
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit canteen registration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm rounded-3xl p-6 sm:p-7 shadow-2xl border border-border/80">
        {currentUser ? (
          /* Profile & Logout State */
          <div className="space-y-4 pt-1">
            <DialogHeader className="text-left space-y-1">
              <div className="flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <UtensilsCrossed className="size-4" />
                </div>
                <DialogTitle className="text-base font-black tracking-tight text-foreground">
                  Authenticated Account
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="rounded-2xl border border-border/70 bg-muted/40 p-4 space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary font-black text-sm">
                  {currentUser.displayName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-foreground truncate">{currentUser.displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-border/50 text-xs">
                <span className="font-semibold text-muted-foreground">Role:</span>
                <span className="rounded-full bg-primary/15 px-2 py-0.5 font-bold text-primary uppercase text-[10px]">
                  {currentUser.role}
                </span>
                <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-green-600 font-semibold text-[10px]">
                  {currentUser.status}
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="destructive"
              onClick={async () => {
                await logout();
                onClose();
              }}
              className="w-full rounded-xl text-xs font-bold gap-2 h-9"
            >
              <LogOut className="size-3.5" />
              Sign Out
            </Button>
          </div>
        ) : view === "campus" ? (
          /* REQUEST CAMPUS ACCESS FORM */
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setView("signin")}
                className="grid size-7 place-items-center rounded-lg border border-border/70 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" />
              </button>
              <div>
                <h2 className="text-base font-black tracking-tight text-foreground">
                  Request Campus Access
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Institutional dining management onboarding.
                </p>
              </div>
            </div>

            <form onSubmit={handleCampusRequestSubmit} className="space-y-2.5">
              <div>
                <Label className="text-xs font-semibold">University / Campus Name *</Label>
                <Input
                  placeholder="e.g. Ahmedabad University"
                  value={univName}
                  onChange={(e) => setUnivName(e.target.value)}
                  className="rounded-xl text-xs h-8.5 mt-1"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Official Contact Name *</Label>
                <Input
                  placeholder="Dean / Campus Director"
                  value={univContact}
                  onChange={(e) => setUnivContact(e.target.value)}
                  className="rounded-xl text-xs h-8.5 mt-1"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Official Email Address *</Label>
                <Input
                  type="email"
                  placeholder="admin@univ.edu.in"
                  value={univEmail}
                  onChange={(e) => setUnivEmail(e.target.value)}
                  className="rounded-xl text-xs h-8.5 mt-1"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Contact Number</Label>
                <Input
                  placeholder="+91 98765 43210"
                  value={univPhone}
                  onChange={(e) => setUnivPhone(e.target.value)}
                  className="rounded-xl text-xs h-8.5 mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs font-semibold">City</Label>
                  <Input
                    placeholder="Ahmedabad"
                    value={univCity}
                    onChange={(e) => setUnivCity(e.target.value)}
                    className="rounded-xl text-xs h-8.5 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">State</Label>
                  <Input
                    placeholder="Gujarat"
                    value={univState}
                    onChange={(e) => setUnivState(e.target.value)}
                    className="rounded-xl text-xs h-8.5 mt-1"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl text-xs font-bold h-9 mt-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? "Submitting..." : "Submit Campus Request"}
              </Button>
            </form>
          </div>
        ) : view === "canteen" ? (
          /* REGISTER CANTEEN (CAMPUS CODE ONLY) */
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setView("signin")}
                className="grid size-7 place-items-center rounded-lg border border-border/70 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" />
              </button>
              <div>
                <h2 className="text-base font-black tracking-tight text-foreground">
                  Register Canteen
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Connect your outlet with a 6-character Campus Code.
                </p>
              </div>
            </div>

            <form onSubmit={handleCanteenRegisterSubmit} className="space-y-2.5">
              <div>
                <Label className="text-xs font-semibold">Canteen / Food Outlet Name *</Label>
                <Input
                  placeholder="e.g. Chai & Bites Cafe"
                  value={canteenName}
                  onChange={(e) => setCanteenName(e.target.value)}
                  className="rounded-xl text-xs h-8.5 mt-1"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Owner / Manager Name *</Label>
                <Input
                  placeholder="Manager Name"
                  value={canteenOwner}
                  onChange={(e) => setCanteenOwner(e.target.value)}
                  className="rounded-xl text-xs h-8.5 mt-1"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Contact Email *</Label>
                <Input
                  type="email"
                  placeholder="owner@canteen.in"
                  value={canteenEmail}
                  onChange={(e) => setCanteenEmail(e.target.value)}
                  className="rounded-xl text-xs h-8.5 mt-1"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Account Password</Label>
                <Input
                  type="password"
                  placeholder="Create a password (if new account)"
                  value={canteenPassword}
                  onChange={(e) => setCanteenPassword(e.target.value)}
                  className="rounded-xl text-xs h-8.5 mt-1"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">6-Character Campus Code *</Label>
                  <span className="text-[10px] font-mono text-primary uppercase font-bold">From University</span>
                </div>
                <Input
                  placeholder="e.g. A7K9PX"
                  value={campusCode}
                  maxLength={6}
                  onChange={(e) => setCampusCode(e.target.value.toUpperCase())}
                  className="rounded-xl text-xs h-8.5 mt-1 font-mono tracking-widest uppercase font-bold text-center text-sm"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Cuisine Category</Label>
                <Input
                  placeholder="Fast Food & Beverages"
                  value={canteenCuisine}
                  onChange={(e) => setCanteenCuisine(e.target.value)}
                  className="rounded-xl text-xs h-8.5 mt-1"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl text-xs font-bold h-9 mt-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? "Submitting..." : "Submit Canteen Request"}
              </Button>
            </form>
          </div>
        ) : (
          /* DEFAULT MINIMAL AUTH SCREEN: Sign In + Google + Links */
          <div className="space-y-4 pt-1">
            <DialogHeader className="text-left space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground shadow-xs">
                  <UtensilsCrossed className="size-4" />
                </div>
                <span className="text-sm font-black tracking-tight text-foreground">
                  BUNK <span className="text-primary">N</span> BITE
                </span>
              </div>
              <DialogTitle className="text-xl font-black tracking-tight text-foreground">
                Sign In
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleLogin} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="auth-email" className="text-xs font-semibold">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                  <Input
                    id="auth-email"
                    type="email"
                    placeholder="name@univ.edu.in"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="rounded-xl pl-9 text-xs h-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auth-pass" className="text-xs font-semibold">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[11px] font-medium text-primary hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                  <Input
                    id="auth-pass"
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="rounded-xl pl-9 text-xs h-9"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl text-xs font-bold h-9 mt-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/70" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold text-muted-foreground">
                <span className="bg-card px-2">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              disabled={isLoading}
              onClick={handleGoogleLogin}
              className="w-full rounded-xl text-xs font-semibold h-9 gap-2 border-border/80 shadow-xs"
            >
              <svg className="size-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continue with Google
            </Button>

            {/* Registration Options: Request Campus Access & Register Canteen */}
            <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs">
              <button
                type="button"
                onClick={() => setView("campus")}
                className="text-[11px] font-semibold text-muted-foreground hover:text-primary transition-colors"
              >
                Request Campus Access
              </button>
              <span className="text-muted-foreground/40">•</span>
              <button
                type="button"
                onClick={() => setView("canteen")}
                className="text-[11px] font-semibold text-muted-foreground hover:text-primary transition-colors"
              >
                Register Canteen
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
