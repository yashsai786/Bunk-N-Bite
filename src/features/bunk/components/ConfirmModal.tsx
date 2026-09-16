import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description = "This action will update the system immediately.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDestructive = false,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-6 sm:p-7">
        <DialogHeader className="text-left">
          <DialogTitle className="text-lg font-bold text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6 flex flex-row justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-full text-xs font-semibold"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={isDestructive ? "destructive" : "default"}
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="rounded-full text-xs font-semibold"
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
