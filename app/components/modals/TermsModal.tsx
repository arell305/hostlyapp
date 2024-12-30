import { TITLE, UPDATED_DATE } from "../../types/constants";

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
              Terms of Service
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
              Welcome to {TITLE}! By accessing and using this website, you agree
              to comply with these Terms of Service. This website and its
              content are provided for informational purposes only. We strive to
              ensure accuracy but make no warranties or representations
              regarding the completeness, accuracy, or reliability of any
              information. Use the information at your own risk. We reserve the
              right to modify these terms at any time without notice. Your
              continued use of the website constitutes acceptance of any
              changes. We may link to third-party websites; these links are
              provided for convenience and do not imply endorsement. Your use of
              linked websites is subject to their terms and policies. We respect
              your privacy; please review our Privacy Policy for details on how
              we handle your personal information
            </p>
          </div>
          {/* Modal footer */}
          <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
            <button
              onClick={handleClose}
              type="button"
              className="text-white bg-custom5 hover:bg-custom3 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
