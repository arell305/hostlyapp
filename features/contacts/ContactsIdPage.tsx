// ContactsIdPage.tsx
"use client";
import { AddButton } from "@shared/ui/buttonContainers/NewItemButton";
import PageContainer from "@shared/ui/containers/PageContainer";
import SectionHeaderWithAction from "@shared/ui/headings/SectionHeaderWithAction";
import { useState } from "react";
import ContactsLoader from "@/features/contacts/components/ContactsLoader";
import ResponsiveAddContact from "@/features/contacts/components/ResponsiveAddContact";
import { useUserScope } from "@/shared/hooks/contexts";
import { ActionButton } from "@/shared/ui/buttonContainers/ActionButton";
import { UploadIcon } from "lucide-react";
import ResponsiveUploadContact from "./components/CsvUpload/ResponsiveUploadContact";
import useMediaQuery from "@/shared/hooks/ui/useMediaQuery";
import { DESKTOP_WIDTH } from "@/shared/types/constants";
import AddContactsMenuContent from "./components/AddContactsMenuContent";
import MobileActionDrawer from "@/shared/ui/drawer/MobileActionDrawer";
import AddContactTriggerButton from "./components/AddContactTriggerButton";

const ContactsIdPage = () => {
  const { userId } = useUserScope();
  const [isAddingContact, setIsAddingContact] = useState<boolean>(false);
  const [isUploadingContactsModal, setIsUploadingContactsModal] =
    useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const isDesktop = useMediaQuery(DESKTOP_WIDTH);

  const handleUploadContacts = () => {
    setIsUploadingContactsModal(true);
  };

  return (
    <PageContainer>
      <SectionHeaderWithAction
        title="Contacts"
        actions={
          isDesktop ? (
            <div className="flex items-center gap-2">
              <ActionButton
                onClick={handleUploadContacts}
                label="Upload"
                icon={<UploadIcon size={20} />}
                variant="secondaryAction"
              />
              <AddButton
                onClick={() => setIsAddingContact(true)}
                label="Contact"
              />
            </div>
          ) : (
            <MobileActionDrawer
              isOpen={isMenuOpen}
              onOpenChange={setIsMenuOpen}
              title="Add Contact"
              description="Add a contact manually"
              trigger={<AddContactTriggerButton onOpenChange={setIsMenuOpen} />}
            >
              <AddContactsMenuContent
                onUpload={() => {
                  handleUploadContacts();
                  setIsMenuOpen(false);
                }}
                onClose={() => setIsMenuOpen(false)}
                onManual={() => {
                  setIsAddingContact(true);
                  setIsMenuOpen(false);
                }}
              />
            </MobileActionDrawer>
          )
        }
      />

      <ContactsLoader userId={userId} />

      <ResponsiveAddContact
        isOpen={isAddingContact}
        onOpenChange={setIsAddingContact}
        userId={userId}
      />
      <ResponsiveUploadContact
        isOpen={isUploadingContactsModal}
        onOpenChange={setIsUploadingContactsModal}
        userId={userId}
      />
    </PageContainer>
  );
};

export default ContactsIdPage;
