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
        <div className="relative bg-white rounded-lg shadow ">
          {/* Modal header */}
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t ">
            <h3 className="text-xl font-semibold text-gray-900 ">Credits</h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center "
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
            <p>
              Emoji graphics provided by{" "}
              <a href="https://github.com/twitter/twemoji">Twemoji</a>, licensed
              under{" "}
              <a href="https://creativecommons.org/licenses/by/4.0/">
                CC-BY 4.0
              </a>
              . © 2020 Twitter, Inc and other contributors.
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
