import {
  TITLE,
  UPDATED_DATE,
  EFFECTIVE_DATE,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  COMPANY_NAME,
} from "../../types/constants";
import { Button } from "../ui/button";

interface ModalProps {
  handleClose: () => void;
}

const TermsModal: React.FC<ModalProps> = ({ handleClose }) => {
  return (
    <div
      id="default-modal"
      tabIndex={-1}
      aria-hidden="true"
      className="fixed inset-0 z-50 flex justify-center items-center w-full h-full overflow-y-auto overflow-x-hidden bg-black bg-opacity-50"
    >
      <div className="relative p-4 w-full max-w-2xl max-h-full">
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
          {/* Modal header */}
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {TITLE}
            </h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={handleClose}
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>

          {/* Modal body */}
          <div className="p-4 md:p-5 space-y-4 overflow-y-auto max-h-[60vh] text-sm text-gray-700 dark:text-gray-300">
            <p>
              <strong>Effective Date:</strong> {EFFECTIVE_DATE}
            </p>
            <p>
              <strong>Last Updated:</strong> {UPDATED_DATE}
            </p>
            <p>
              Welcome to {COMPANY_NAME}! These Terms and Conditions govern your
              use of our ticketing platform, including purchasing, selling, and
              attending events through our services. By using our platform, you
              agree to comply with these terms. If you do not agree, please do
              not use our services.
            </p>

            <h4 className="font-semibold mt-4">1. Introduction</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                &quot;COMPANY_NAME&quot; (&quot;$2&quot;) provides an online
                marketplace for event organizers to sell tickets and for users
                to purchase tickets to various events.
              </li>
              <li>
                By using our platform, you acknowledge that you are at least 18
                years old or have parental consent to use the service.
              </li>
              <li>
                We do not organize or host events; we solely provide a platform
                for ticket transactions.
              </li>
            </ul>

            <h4 className="font-semibold mt-4">2. Account Registration</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                To use certain features, you may be required to create an
                account.
              </li>
              <li>
                You agree to provide accurate, current, and complete information
                during registration and to keep your account information
                updated.
              </li>
              <li>
                You are responsible for maintaining the security of your account
                and for any activity that occurs under your login credentials.
              </li>
              <li>
                {COMPANY_NAME} reserves the right to suspend or terminate
                accounts for violations of these Terms.
              </li>
            </ul>

            <h4 className="font-semibold mt-4">
              3. Ticket Purchase and Refund Policy
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                All ticket sales are final unless the event organizer specifies
                otherwise.
              </li>
              <li>
                If an event is canceled, you may be eligible for a refund as
                determined by the event organizer.
              </li>
              <li>
                We do not guarantee refunds for postponed or rescheduled events.
                Refund requests must be directed to the event organizer.
              </li>
              <li>
                Any disputes regarding ticket purchases must be resolved with
                the event organizer.
              </li>
            </ul>

            <h4 className="font-semibold mt-4">4. Event Organizer Agreement</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Event organizers are responsible for accurately listing event
                details, including dates, times, locations, and refund policies.
              </li>
              <li>
                Organizers must comply with all applicable laws, regulations,
                and venue requirements.
              </li>
              <li>
                {COMPANY_NAME} is not responsible for event quality, safety, or
                adherence to laws.
              </li>
              <li>
                We reserve the right to remove any event listing that violates
                our policies or laws.
              </li>
            </ul>

            <h4 className="font-semibold mt-4">
              5. Copyrighted Content and Intellectual Property
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Event organizers and users are solely responsible for ensuring
                that they have the legal rights, licenses, or permissions to use
                any copyrighted material.
              </li>
              <li>
                {COMPANY_NAME} is not liable for any unauthorized use of
                copyrighted materials.
              </li>
              <li>
                We comply with the DMCA and will respond to valid takedown
                notices.
              </li>
            </ul>

            <h4 className="font-semibold mt-4">
              6. Payment, Fees, and Chargebacks
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Service fees may apply and will be disclosed at checkout.</li>
              <li>Organizers are responsible for taxes on ticket sales.</li>
              <li>
                If a chargeback is issued, the organizer assumes financial
                responsibility.
              </li>
              <li>
                All payments are processed securely through third-party
                providers. {COMPANY_NAME} does not store credit card details.
              </li>
            </ul>

            <h4 className="font-semibold mt-4">
              7. Liability & Indemnification
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                {COMPANY_NAME} is not responsible for event cancellations,
                refunds, or changes.
              </li>
              <li>
                We are not liable for delays or losses due to unforeseen events
                (e.g., natural disasters, pandemics).
              </li>
              <li>
                Users and organizers agree to indemnify and hold {COMPANY_NAME}{" "}
                harmless from any claims or disputes.
              </li>
            </ul>

            <h4 className="font-semibold mt-4">
              8. Privacy Policy & Data Protection
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Personal data is handled according to our Privacy Policy.</li>
              <li>
                We comply with GDPR, CCPA, and other data protection laws as
                applicable.
              </li>
            </ul>

            <h4 className="font-semibold mt-4">
              9. Event Restrictions & Prohibited Content
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                We do not allow ticket sales for events that promote illegal
                activity, hate speech, or are high-risk (e.g., gambling, crypto
                schemes).
              </li>
              <li>Organizers must comply with health and safety guidelines.</li>
            </ul>

            <h4 className="font-semibold mt-4">
              10. Dispute Resolution & Governing Law
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Disputes should first be resolved amicably. If unresolved, they
                may proceed to legal arbitration.
              </li>
              <li>
                Users agree not to participate in class action lawsuits against{" "}
                {COMPANY_NAME}.
              </li>
            </ul>

            <h4 className="font-semibold mt-4">
              11. Advertising & Promotions Policy
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Organizers may not engage in false advertising.</li>
              <li>
                Paid promotions must follow {COMPANY_NAME}&apos;s guidelines.
              </li>
            </ul>

            <h4 className="font-semibold mt-4">
              12. Accessibility & Age Restrictions
            </h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Events must comply with ADA laws where applicable.</li>
              <li>
                Users must be at least 18 years old or have guardian consent.
              </li>
            </ul>

            <h4 className="font-semibold mt-4">13. Changes to These Terms</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>We may modify these Terms at any time.</li>
              <li>
                Continued use of the platform constitutes acceptance of the
                updated Terms.
              </li>
            </ul>

            <h4 className="font-semibold mt-4">Contact Information</h4>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p>
              {COMPANY_NAME}
              <br />
              Email: {CONTACT_EMAIL}
              <br />
              Phone: {CONTACT_PHONE}
            </p>
          </div>

          {/* Modal footer */}
          <div className="flex justify-center items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleClose}
              type="button"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
