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
                {COMPANY_NAME} ("we," "us," or "our") provides an online
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

            {/* Add all other sections similarly formatted using <h4> for section headers and <ul><li> for bullet lists */}

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
