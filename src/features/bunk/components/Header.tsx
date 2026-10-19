import React from "react";
import {
  Building2,
  ChevronDown,
  Database,
  LogIn,
  LogOut,
  ShoppingBag,
  Store,
  User,
  UtensilsCrossed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { navByRole, roleLabels } from "../data";
import { useBunk } from "../state";
import type { Role } from "../types";
import { CapsuleNavigation } from "./CapsuleNavigation";
import { AuthModal } from "@/features/auth/components/AuthModal";
import { ProfileCompletionModal } from "@/features/students/components/ProfileCompletionModal";

export function Header() {
  const {
    role,
    setRole,
    activeTab,
    setActiveTab,
    cartCount,
    setIsCartOpen,
    currentUser,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isProfileCompletionOpen,
    setIsProfileCompletionOpen,
    logout,
    seedDatabase,
    universities,
    selectedUniversityId,
    setSelectedUniversityId,
    canteens,
    selectedCanteenId,
    setSelectedCanteenId,
  } = useBunk();

  const activeUniv =
    universities.find((u) => u.id === selectedUniversityId) || universities[0];
  const activeCanteen =
    canteens.find((c) => c.id === selectedCanteenId) || canteens[0];

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl transition-all">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-2.5 sm:px-6 md:py-3">
        {/* Main top row */}
        <div className="flex items-center justify-between gap-2 md:gap-4">
          {/* Logo */}
          <div className="flex shrink-0 items-center gap-2.5">
            <div className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-xs transition-transform hover:scale-105">
              <UtensilsCrossed className="size-4.5" />
            </div>
            <div className="hidden sm:block">
              <span className="text-sm font-black tracking-tight text-foreground">
                BUNK <span className="text-primary font-extrabold">N</span> BITE
              </span>
              <span className="block text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                {roleLabels[role]}
              </span>
            </div>
          </div>

          {/* Desktop Floating Capsule Navigation */}
          <div className="hidden md:flex flex-1 justify-center max-w-xl">
            <CapsuleNavigation
              items={navByRole[role]}
              activeItem={activeTab}
              onSelect={setActiveTab}
            />
          </div>

          {/* Right side controls */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* Context Dropdowns */}
            {role === "university" && (
              <Select
                value={selectedUniversityId}
                onValueChange={setSelectedUniversityId}
              >
                <SelectTrigger className="h-9 w-[150px] sm:w-[180px] rounded-full border-border/70 bg-card text-xs font-semibold shadow-xs">
                  <Building2 className="mr-1.5 size-3.5 text-muted-foreground" />
                  <SelectValue placeholder="University" />
                </SelectTrigger>
                <SelectContent align="end" className="rounded-2xl">
                  {universities.map((u) => (
                    <SelectItem key={u.id} value={u.id} className="text-xs">
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {(role === "canteen" || role === "student" || role === "visitor") && (
              <Select
                value={selectedCanteenId}
                onValueChange={setSelectedCanteenId}
              >
                <SelectTrigger className="h-9 w-[130px] sm:w-[160px] rounded-full border-border/70 bg-card text-xs font-semibold shadow-xs">
                  <Store className="mr-1.5 size-3.5 text-muted-foreground" />
                  <SelectValue placeholder="Canteen" />
                </SelectTrigger>
                <SelectContent align="end" className="rounded-2xl">
                  {canteens
                    .filter((c) => c.universityId === selectedUniversityId)
                    .map((c) => (
                      <SelectItem key={c.id} value={c.id} className="text-xs">
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}

            {/* Cart Button (Student / Visitor) */}
            {(role === "student" || role === "visitor") && (
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                aria-label={`Cart with ${cartCount} items`}
                className="relative grid size-9 place-items-center rounded-full border border-border/70 bg-card shadow-xs transition-transform hover:scale-105 active:scale-95"
              >
                <ShoppingBag className="size-4 text-foreground" />
                {cartCount > 0 && (
                  <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-xs animate-in zoom-in">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Role Switcher (Evaluation & Interactive Preview) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 rounded-full border-border/70 bg-card/80 px-3 text-xs font-semibold shadow-xs hover:bg-muted"
                >
                  <span className="size-2 rounded-full bg-primary animate-pulse" />
                  <span className="max-w-[72px] truncate sm:max-w-none">
                    {roleLabels[role]}
                  </span>
                  <ChevronDown className="size-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5 shadow-card">
                <DropdownMenuLabel className="px-2 py-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                  Switch Demo Role
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(Object.keys(roleLabels) as Role[]).map((r) => (
                  <DropdownMenuItem
                    key={r}
                    onClick={() => setRole(r)}
                    className="flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-medium cursor-pointer"
                  >
                    <span>{roleLabels[r]}</span>
                    {role === r && (
                      <span className="size-1.5 rounded-full bg-primary" />
                    )}
                  </DropdownMenuItem>
                ))}
                {universities.length === 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={seedDatabase}
                      className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-primary cursor-pointer"
                    >
                      <Database className="size-3.5" />
                      <span>Seed Live Campus Catalog</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Auth / Profile Trigger */}
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="User profile"
                    className="grid size-9 place-items-center rounded-full bg-primary/10 text-xs font-black text-primary shadow-xs ring-1 ring-primary/30 transition-transform hover:scale-105"
                  >
                    {currentUser.displayName.slice(0, 2).toUpperCase()}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-1.5 shadow-card">
                  <div className="px-2.5 py-2">
                    <p className="text-xs font-bold text-foreground">
                      {currentUser.displayName}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {currentUser.email}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5">
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-bold text-primary uppercase">
                        {currentUser.role}
                      </span>
                      <span className="rounded-full bg-green-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-green-600">
                        {currentUser.status}
                      </span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setActiveTab("Settings")}
                    className="rounded-xl px-2.5 py-1.5 text-xs cursor-pointer"
                  >
                    <User className="mr-2 size-3.5 text-muted-foreground" />
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="rounded-xl px-2.5 py-1.5 text-xs text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 size-3.5" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={() => setIsAuthModalOpen(true)}
                className="h-9 gap-1.5 rounded-full bg-primary px-3.5 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90"
              >
                <LogIn className="size-3.5" />
                <span>Sign In</span>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Floating Capsule Navigation */}
        <div className="flex justify-center md:hidden">
          <CapsuleNavigation
            items={navByRole[role]}
            activeItem={activeTab}
            onSelect={setActiveTab}
            className="w-full justify-start"
          />
        </div>
      </div>

      {/* Firebase Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Passwordless Profile Completion Modal */}
      <ProfileCompletionModal
        user={currentUser}
        isOpen={isProfileCompletionOpen}
        onComplete={() => setIsProfileCompletionOpen(false)}
      />
    </header>
  );
}
