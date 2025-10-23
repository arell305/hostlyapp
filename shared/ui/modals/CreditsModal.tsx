"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/shared/ui/primitive/dialog";
import { Button } from "@/shared/ui/primitive/button";

interface CreditsModalProps {
  open: boolean;
  onClose: () => void;
}

const CreditsModal: React.FC<CreditsModalProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl p-0">
        <div className="flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-6 border-b">
            <DialogHeader>
              <DialogTitle>Credits</DialogTitle>
              <DialogDescription>Credits for Hostly.</DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Body */}
          <div className="overflow-y-auto px-6 py-4 text-sm text-grayText space-y-4">
            <p>
              Emoji graphics provided by{" "}
              <a
                href="https://github.com/twitter/twemoji"
                className="underline text-blue-600 hover:text-blue-800"
                target="_blank"
                rel="noopener noreferrer"
              >
                Twemoji
              </a>
              , licensed under{" "}
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                className="underline text-blue-600 hover:text-blue-800"
                target="_blank"
                rel="noopener noreferrer"
              >
                CC-BY 4.0
              </a>
              . © 2020 Twitter, Inc and other contributors.
            </p>
          </div>

          {/* Footer */}
          <div className="p-4 border-t">
            <DialogFooter>
              <Button size="sm" variant="secondary" onClick={onClose}>
                Dismiss
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreditsModal;
