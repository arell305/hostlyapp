"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useModal from "../../hooks/useModal";
import TermsModal from "../modals/TermsModal";
import PrivacyModal from "../modals/PrivacyModal";
import CreditsModal from "../modals/CreditsModal";
import { CONTACT_EMAIL, PHONE, PHONE_HREF, TITLE } from "../../types/constants";
import { faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";

const Footer: React.FC = () => {
  const privacyModal = useModal();
  const termsModal = useModal();
  const creditsModal = useModal();

  return (
    <footer className=" py-10 px-4 border-t bg-cardBackground ">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <p className="text-3xl text-center md:text-left font-semibold">
              {TITLE}
            </p>
            <div className="flex flex-col items-start mt-4">
              <div className="flex items-center space-x-2">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="ml-2 hover:underline"
                >
                  <div className="flex items-center">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className=" fa-xl pr-2"
                    />{" "}
                    <p>{CONTACT_EMAIL}</p>
                  </div>
                </a>
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <a href={PHONE_HREF} className="ml-2 hover:underline">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faPhone} className=" fa-xl pr-2" />{" "}
                    <p>{PHONE}</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-2 md:mt-8">
            <button
              onClick={termsModal.toggleModal}
              className="underline  transition-colors duration-300"
            >
              Terms of Service
            </button>
            <span>|</span>
            <button
              onClick={privacyModal.toggleModal}
              className="underline  transition-colors duration-300"
            >
              Privacy Policy
            </button>
            <span>|</span>
            <button
              onClick={creditsModal.toggleModal}
              className="underline  transition-colors duration-300"
            >
              Credits
            </button>
          </div>
        </div>
        <div className="mt-8 text-sm text-center">
          <p>
            &copy;{new Date().getFullYear()} {TITLE}. All rights reserved.
          </p>
        </div>
      </div>
      {privacyModal.isOpen && (
        <PrivacyModal handleClose={privacyModal.closeModal} />
      )}
      {termsModal.isOpen && <TermsModal handleClose={termsModal.closeModal} />}
      {creditsModal.isOpen && (
        <CreditsModal handleClose={creditsModal.closeModal} />
      )}
    </footer>
  );
};

export default Footer;
