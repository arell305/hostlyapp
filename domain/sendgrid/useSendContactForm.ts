import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ResponseStatus } from "@/shared/types/enums";
import { useState } from "react";
import { setErrorFromConvexError } from "@/shared/lib/errorHelper";

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
      const result = await sendEmail({ fromEmail, fromName, fromCompany });

      if (result.status === ResponseStatus.SUCCESS) {
        return true;
      } else {
        setError(result.error);
        return false;
      }
    } catch (err: any) {
      setErrorFromConvexError(err, setError);
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
