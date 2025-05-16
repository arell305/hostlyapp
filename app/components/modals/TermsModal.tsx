"use client";

import {
  TITLE,
  UPDATED_DATE,
  EFFECTIVE_DATE,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  COMPANY_NAME,
} from "../../types/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl p-0">
        <div className="flex flex-col max-h-[90vh]">
          {/* Fixed Header */}
          <div className=" border-b">
            <DialogHeader>
              <DialogTitle>{TITLE}</DialogTitle>
              <DialogDescription>
                These Terms and Conditions govern your use of our ticketing
                platform, including purchasing, selling, and attending events
                through our services.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Scrollable Body */}
          <div className="overflow-y-auto px-6 py-4 text-sm text-grayText space-y-4">
            <p>
              <strong>Effective Date:</strong> {EFFECTIVE_DATE}
            </p>
            <p>
              <strong>Last Updated:</strong> {UPDATED_DATE}
            </p>
            <p>
              Welcome to <strong>{COMPANY_NAME}</strong>! These Terms and
              Conditions govern your use of our ticketing platform, including
              purchasing, selling, and attending events through our services. By
              using our platform, you agree to comply with these terms. If you
              do not agree, please do not use our services.
            </p>

            {[
              {
                title: "1. Introduction",
                items: [
                  `${COMPANY_NAME} provides an online marketplace for event organizers to sell tickets and for users to purchase tickets to various events.`,
                  "By using our platform, you acknowledge that you are at least 18 years old or have parental consent to use the service.",
                  "We do not organize or host events; we solely provide a platform for ticket transactions.",
                ],
              },
              {
                title: "2. Account Registration",
                items: [
                  "To use certain features, you may be required to create an account.",
                  "You agree to provide accurate, current, and complete information during registration and to keep your account information updated.",
                  "You are responsible for maintaining the security of your account and for any activity that occurs under your login credentials.",
                  `${COMPANY_NAME} reserves the right to suspend or terminate accounts for violations of these Terms.`,
                ],
              },
              {
                title: "3. Ticket Purchase and Refund Policy",
                items: [
                  "All ticket sales are final unless the event organizer specifies otherwise.",
                  "If an event is canceled, you may be eligible for a refund as determined by the event organizer.",
                  "We do not guarantee refunds for postponed or rescheduled events. Refund requests must be directed to the event organizer.",
                  "Any disputes regarding ticket purchases must be resolved with the event organizer.",
                ],
              },
              {
                title: "4. Event Organizer Agreement",
                items: [
                  "Event organizers are responsible for accurately listing event details, including dates, times, locations, and refund policies.",
                  "Organizers must comply with all applicable laws, regulations, and venue requirements.",
                  `${COMPANY_NAME} is not responsible for event quality, safety, or adherence to laws.`,
                  "We reserve the right to remove any event listing that violates our policies or laws.",
                ],
              },
              {
                title: "5. Copyrighted Content and Intellectual Property",
                items: [
                  "Event organizers and users are solely responsible for ensuring that they have the legal rights, licenses, or permissions to use any copyrighted material.",
                  `${COMPANY_NAME} is not liable for any unauthorized use of copyrighted materials.`,
                  "We comply with the DMCA and will respond to valid takedown notices.",
                ],
              },
              {
                title: "6. Payment, Fees, and Chargebacks",
                items: [
                  "Service fees may apply and will be disclosed at checkout.",
                  "Organizers are responsible for taxes on ticket sales.",
                  "If a chargeback is issued, the organizer assumes financial responsibility.",
                  `All payments are processed securely through third-party providers. ${COMPANY_NAME} does not store credit card details.`,
                ],
              },
              {
                title: "7. Liability & Indemnification",
                items: [
                  `${COMPANY_NAME} is not responsible for event cancellations, refunds, or changes.`,
                  "We are not liable for delays or losses due to unforeseen events (e.g., natural disasters, pandemics).",
                  `Users and organizers agree to indemnify and hold ${COMPANY_NAME} harmless from any claims or disputes.`,
                ],
              },
              {
                title: "8. Privacy Policy & Data Protection",
                items: [
                  "Personal data is handled according to our Privacy Policy.",
                  "We comply with GDPR, CCPA, and other data protection laws as applicable.",
                ],
              },
              {
                title: "9. Event Restrictions & Prohibited Content",
                items: [
                  "We do not allow ticket sales for events that promote illegal activity, hate speech, or are high-risk (e.g., gambling, crypto schemes).",
                  "Organizers must comply with health and safety guidelines.",
                ],
              },
              {
                title: "10. Dispute Resolution & Governing Law",
                items: [
                  "Disputes should first be resolved amicably. If unresolved, they may proceed to legal arbitration.",
                  `Users agree not to participate in class action lawsuits against ${COMPANY_NAME}.`,
                ],
              },
              {
                title: "11. Advertising & Promotions Policy",
                items: [
                  "Organizers may not engage in false advertising.",
                  `Paid promotions must follow ${COMPANY_NAME}'s guidelines.`,
                ],
              },
              {
                title: "12. Accessibility & Age Restrictions",
                items: [
                  "Events must comply with ADA laws where applicable.",
                  "Users must be at least 18 years old or have guardian consent.",
                ],
              },
              {
                title: "13. Changes to These Terms",
                items: [
                  "We may modify these Terms at any time.",
                  "Continued use of the platform constitutes acceptance of the updated Terms.",
                ],
              },
            ].map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold mt-4">{section.title}</h4>
                <ul className="list-disc list-inside space-y-1">
                  {section.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h4 className="font-semibold mt-4">Contact Information</h4>
              <p>
                If you have any questions about these Terms, please contact us
                at:
              </p>
              <p>
                {COMPANY_NAME}
                <br />
                Email: {CONTACT_EMAIL}
                <br />
                Phone: {CONTACT_PHONE}
              </p>
            </div>
          </div>

          {/* Fixed Footer */}
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

export default TermsModal;
