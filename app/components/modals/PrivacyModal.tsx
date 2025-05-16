"use client";

import { TITLE, UPDATED_DATE } from "../../types/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";

interface PrivacyModalProps {
  open: boolean;
  onClose: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl p-0">
        <div className="flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="p-6 border-b">
            <DialogHeader>
              <DialogTitle>Privacy Policy</DialogTitle>
              <DialogDescription>
                Hostly&apos;s Privacy Policy.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Body */}
          <div className="overflow-y-auto px-6 py-4 text-sm text-grayText space-y-4">
            <p>
              <strong>Effective Date:</strong> {UPDATED_DATE}
            </p>
            <p>
              <strong>{TITLE}</strong> (&quot;us&quot;, &quot;we&quot;, or
              &quot;our&quot;) values your privacy. This policy outlines how we
              collect, use, and protect your personal information when you use
              our website.
            </p>
            <p>
              We may collect personal data such as your email address, name,
              phone number, and address for purposes including providing and
              improving our services, communicating with you, and complying with
              legal obligations.
            </p>
            <p>
              We do not share your information except as necessary to provide
              our services or as required by law. By using our website, you
              consent to the terms of this policy.
            </p>
            <p>
              We take measures to protect your data, but no method of
              transmission over the Internet is completely secure.
            </p>
            <p>
              Changes to this policy will be posted here; please review it
              periodically.
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

export default PrivacyModal;
