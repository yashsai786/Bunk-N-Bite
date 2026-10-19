import React from "react";
import { Check, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { CartDrawer } from "./components/CartDrawer";
import { Header } from "./components/Header";
import { BunkProvider, useBunk } from "./state";
import { CanteenView } from "./views/CanteenView";
import { OwnerView } from "./views/OwnerView";
import { StateGalleryView } from "./views/StateGalleryView";
import { StudentView } from "./views/StudentView";
import { UniversityView } from "./views/UniversityView";
import { VisitorView } from "./views/VisitorView";

function SettingsView() {
  const { role, activeTab, setActiveTab, currentUser } = useBunk();
  const [name, setName] = React.useState(currentUser?.displayName || "Campus User");
  const [notifications, setNotifications] = React.useState(true);
  const [smsAlerts, setSmsAlerts] = React.useState(true);

  React.useEffect(() => {
    if (currentUser?.displayName) {
      setName(currentUser.displayName);
    }
  }, [currentUser]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile preferences saved successfully");
    setActiveTab(role === "student" ? "Home" : "Overview");
  };

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="border-b border-border/60 pb-3">
        <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
          Account Settings
        </h1>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Manage your personal profile and campus meal notifications.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5 rounded-3xl border border-border/70 bg-card p-6 sm:p-7 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="set-name">Full Name</Label>
            <Input
              id="set-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 rounded-xl text-xs"
            />
          </div>

          <div>
            <Label htmlFor="set-email">Email Address</Label>
            <Input
              id="set-email"
              type="email"
              value={currentUser?.email || "guest@bunknbite.in"}
              readOnly
              disabled
              className="mt-1 rounded-xl text-xs opacity-75 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <label className="flex items-center justify-between rounded-2xl border border-border/60 p-3.5 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-foreground">Order Notifications</p>
              <p className="text-[11px] text-muted-foreground">Push alerts when meal order status updates</p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </label>

          <label className="flex items-center justify-between rounded-2xl border border-border/60 p-3.5 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-foreground">SMS Token Alerts</p>
              <p className="text-[11px] text-muted-foreground">Instant pickup SMS when order is marked Ready</p>
            </div>
            <Switch checked={smsAlerts} onCheckedChange={setSmsAlerts} />
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setActiveTab(role === "student" ? "Home" : "Overview")}
            className="rounded-full text-xs font-semibold"
          >
            Cancel
          </Button>
          <Button type="submit" size="sm" className="rounded-full text-xs font-bold">
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
}

function BunkMainContent() {
  const { role, activeTab, isAuthLoading } = useBunk();

  if (isAuthLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <div className="size-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-xs font-semibold text-muted-foreground">Connecting to BUNK N BITE campus services...</p>
      </div>
    );
  }

  if (activeTab === "Settings") {
    return <SettingsView />;
  }

  if (activeTab === "States") {
    return <StateGalleryView />;
  }

  switch (role) {
    case "owner":
      return <OwnerView />;
    case "university":
      return <UniversityView />;
    case "canteen":
      return <CanteenView />;
    case "student":
      return <StudentView />;
    case "visitor":
      return <VisitorView />;
    default:
      return <StudentView />;
  }
}

export function BunkApp() {
  return (
    <BunkProvider>
      <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 flex flex-col">
        {/* Reusable top header with floating capsule navigation */}
        <Header />

        {/* Main Content Area */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-5 sm:px-6 md:py-7">
          <BunkMainContent />
        </main>

        {/* Global Cart Slide-in / Modal */}
        <CartDrawer />

        {/* Footer */}
        <footer className="border-t border-border/60 bg-card/40 py-4 text-center text-[11px] text-muted-foreground">
          <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-2 px-4 sm:px-6">
            <span className="font-semibold">
              BUNK N BITE © 2026 — Multi-Campus Dining Platform
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="size-3.5 text-success" />
              Production Enterprise Edition
            </span>
          </div>
        </footer>
      </div>
    </BunkProvider>
  );
}
