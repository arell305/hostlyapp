import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ResponseStatus } from "@/types/enums";
import { useState } from "react";

export const useSendContactForm = () => {
  const sendEmail = useAction(api.sendgrid.sendContactFormEmail);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const sendContactForm = async ({
    fromEmail,
    fromName,
    fromCompany,
  }: {
    fromEmail: string;
    fromName: string;
    fromCompany: string;
  }): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("sending email", fromEmail, fromName, fromCompany);
      const result = await sendEmail({ fromEmail, fromName, fromCompany });

      if (result.status === ResponseStatus.SUCCESS) {
        return true;
      } else {
        setError(result.error);
        return false;
      }
    } catch (err: any) {
      console.error(err);
      setError("Something went wrong. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendContactForm,
    isLoading,
    error,
    setError,
  };
};
