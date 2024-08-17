import { TITLE, UPDATED_DATE } from "@/app/constants";

interface ModalProps {
  handleClose: () => void;
}

const PrivacyModal: React.FC<ModalProps> = ({ handleClose }) => {
  return (
    <div
      id="default-modal"
      tabIndex={-1}
      aria-hidden="true"
      className="fixed inset-0 z-50 flex justify-center items-center w-full h-full overflow-y-auto overflow-x-hidden bg-black bg-opacity-50"
    >
      <div className="relative p-4 w-full max-w-2xl max-h-full">
        {/* Modal content */}
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
          {/* Modal header */}
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Privacy Policy
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
          <div className="p-4 md:p-5 space-y-4">
            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
              Effective Date: {UPDATED_DATE}
            </p>
            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
              {TITLE} ("us", "we", or "our") values your privacy. This policy
              outlines how we collect, use, and protect your personal
              information when you use our website. We may collect personal data
              such as your email address, name, phone number, and address for
              purposes including providing and improving our services,
              communicating with you, and complying with legal obligations. We
              do not share your information except as necessary to provide our
              services or as required by law. By using our website, you consent
              to the terms of this policy. We take measures to protect your
              data, but no method of transmission over the Internet is
              completely secure. Changes to this policy will be posted here;
              please review it periodically.
            </p>
          </div>
          {/* Modal footer */}
          <div className="flex items-center justify-center p-4 md:p-5 border-t border-gray-200 rounded-b ">
            <button
              onClick={handleClose}
              type="button"
              className="text-white bg-customDarkBlue hover:bg-customPrimaryBlue focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center "
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyModal;
