"use client";
import { useClerk } from "@clerk/nextjs";
import { useAction, useQuery } from "convex/react";
import React, { useState, useEffect } from "react";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import {
  ActiveStripeTab,
  ActiveTab,
  ResponseStatus,
  StripeAccountStatus,
} from "../../../../utils/enum";
import { loadConnectAndInitialize } from "@stripe/connect-js";
import {
  ConnectAccountOnboarding,
  ConnectComponentsProvider,
  ConnectDocuments,
  ConnectPayments,
  ConnectPayouts,
} from "@stripe/react-connect-js";
import { Tab } from "@/types/types";
import TabsNav from "../events/[eventId]/TabsNav";
import { useToast } from "@/hooks/use-toast";
import { ErrorMessages, FrontendErrorMessages } from "@/types/enums";
import ResponsiveConfirm from "../components/responsive/ResponsiveConfirm";

const Page = () => {
  const { user } = useClerk();
  const { toast } = useToast();

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [stripeConnectInstance, setStripeConnectInstance] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<ActiveStripeTab | ActiveTab>(
    ActiveStripeTab.PAYMENTS
  );

  const [getStripeDashboardUrlError, setgetStripeDashboardUrlError] = useState<
    string | null
  >(null);
  const [getStripeDashboardUrlLoading, setGetStripeDashboardUrlLoading] =
    useState<boolean>(false);
  const [disconnectStripeAccountError, setDisconnectStripeAccountError] =
    useState<string | null>(null);
  const [disconnectStripeAccountLoading, setDisconnectStripeAccountLoading] =
    useState<boolean>(false);
  const [showDisconnectConfirmModal, setShowDisconnectConfirmModal] =
    useState<boolean>(false);

  const connectedAccountData = useQuery(
    api.connectedAccounts.getConnectedAccountByClerkUserId,
    user ? { clerkUserId: user.id } : "skip"
  );

  const createConnectedAccount = useAction(api.stripe.createConnectedAccount);
  const getOnboardingLink = useAction(api.stripe.getOnboardingLink);
  const getStripeDashboardUrl = useAction(api.stripe.getStripeDashboardUrl);
  const disconnectStripeAccount = useAction(api.stripe.disconnectStripeAccount);

  const openDisconnectConfirmModal = () => setShowDisconnectConfirmModal(true);

  const handleDisconnectStripeAccount = async () => {
    if (!user) {
      setDisconnectStripeAccountError(FrontendErrorMessages.USER_NOT_LOADED);
      return;
    }
    setDisconnectStripeAccountError(null);
    setDisconnectStripeAccountLoading(true);
    try {
      const response = await disconnectStripeAccount({ clerkUserId: user.id });
      if (response.status === ResponseStatus.ERROR) {
        setDisconnectStripeAccountError(response.error);
        console.error(response.error);
      } else {
        toast({
          title: "Success",
          description: "Stripe discconected",
        });
      }
    } catch (error) {
      setDisconnectStripeAccountError("Error disconnected stripe account");
      console.error(error);
    } finally {
      setDisconnectStripeAccountLoading(false);
    }
  };
  // Handle creating a Stripe Connected Account
  const handleConnectStripe = async () => {
    if (!user) {
      setErrorMessage(FrontendErrorMessages.USER_NOT_LOADED);
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await createConnectedAccount({ clerkUserId: user.id });

      if (response.status === ResponseStatus.ERROR) {
        console.error("Error creating Stripe account:", response.error);
        setErrorMessage(response.error);
        return;
      }

      await initializeStripeConnect();
    } catch (error) {
      console.error(ErrorMessages.GENERIC_ERROR, error);
      setErrorMessage(ErrorMessages.GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  };

  // Initialize Stripe Connect AFTER the account is created
  const initializeStripeConnect = async () => {
    if (!connectedAccountData?.data || stripeConnectInstance) return; // Prevent duplicate calls

    try {
      const fetchClientSecret = async (): Promise<string> => {
        const response = await getOnboardingLink({ clerkUserId: user!.id });

        if (response.status === ResponseStatus.ERROR) {
          console.error("Error fetching client secret:", response.error);
          setErrorMessage(
            response.error || "Failed to retrieve client secret."
          );
          return "";
        }

        return response.data.client_secret;
      };

      const instance = loadConnectAndInitialize({
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
        fetchClientSecret,
      });

      setStripeConnectInstance(instance);
    } catch (error) {
      console.error("Error initializing Stripe Connect:", error);
      setErrorMessage("Failed to initialize Stripe Connect.");
    }
  };

  const handleOpenStripeDashboard = async () => {
    if (!user) {
      setErrorMessage(FrontendErrorMessages.USER_NOT_LOADED);
      return;
    }

    setGetStripeDashboardUrlLoading(true);
    setgetStripeDashboardUrlError(null);
    try {
      const response = await getStripeDashboardUrl({ clerkUserId: user.id });
      if (response.status === ResponseStatus.ERROR) {
        console.error("error, ", response.error);
        setgetStripeDashboardUrlError(ResponseStatus.ERROR);
        return;
      }
      if (!response.data) {
        console.error("Error: Stripe dashboard URL data is null");
        setgetStripeDashboardUrlError("Invalid Stripe dashboard URL.");
        return;
      }

      window.open(response.data.url, "_blank");
    } catch (error) {
      console.error("Unexpected error opening Stripe dashboard:", error);
      setErrorMessage("An unexpected error occurred.");
    } finally {
      setGetStripeDashboardUrlLoading(false);
    }
  };

  // Automatically initialize Stripe Connect once the connected account exists
  useEffect(() => {
    initializeStripeConnect();
  }, [connectedAccountData?.data]);

  const tabs: Tab[] = [
    { label: "Documents", value: ActiveStripeTab.DOCUMENTS },
    { label: "Payouts", value: ActiveStripeTab.PAYOUTS },
    { label: "Payments", value: ActiveStripeTab.PAYMENTS },
  ];
  console.log("data", connectedAccountData);

  return (
    <div className="justify-center  max-w-3xl  mx-auto mt-1.5 md:min-h-[300px]">
      <div className="flex justify-between items-center w-full px-4 pt-2 md:pt-0 mb-2 ">
        <h1 className=" text-3xl md:text-4xl font-bold ">Stripe</h1>
        <div>
          <Button variant="navGhost" onClick={handleOpenStripeDashboard}>
            {getStripeDashboardUrlLoading ? "Loading..." : "Open Stripe"}
          </Button>
        </div>
      </div>
      <div className="px-4">
        {/* Show "Connect to Stripe" button if user has no connected account */}
        {!connectedAccountData?.data ? (
          <div>
            <Button onClick={handleConnectStripe} disabled={loading}>
              {loading ? "Connecting..." : "Connect To Stripe"}
            </Button>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          </div>
        ) : (
          <div className="flex justify-between">
            <p>
              Stripe account status:{" "}
              <span className="font-bold">
                {connectedAccountData.data.connectedAccount.status}
              </span>
            </p>
            <p
              className={`mr-4 text-sm mt-1 ${getStripeDashboardUrlError ? "text-red-500" : "text-transparent"}`}
            >
              {getStripeDashboardUrlError || "Placeholder to maintain height"}
            </p>{" "}
          </div>
        )}

        {/* Show Connect Components only if Stripe Connect instance is ready */}
        {stripeConnectInstance &&
          connectedAccountData &&
          connectedAccountData.data && (
            <div className="container">
              <ConnectComponentsProvider
                connectInstance={stripeConnectInstance}
              >
                {connectedAccountData.data.connectedAccount.status ===
                  StripeAccountStatus.NOT_ONBOARDED && (
                  <ConnectAccountOnboarding
                    onExit={() => {
                      console.log("The account has exited onboarding");
                    }}
                  />
                )}
                {connectedAccountData.data.connectedAccount.status ===
                  StripeAccountStatus.VERIFIED && (
                  <>
                    <TabsNav
                      activeTab={activeTab}
                      onTabChange={setActiveTab}
                      tabs={tabs}
                    />
                    <div className="mt-4">
                      {activeTab === ActiveStripeTab.PAYMENTS && (
                        <ConnectPayments />
                      )}
                      {activeTab === ActiveStripeTab.PAYOUTS && (
                        <ConnectPayouts />
                      )}
                      {activeTab === ActiveStripeTab.DOCUMENTS && (
                        <ConnectDocuments />
                      )}
                    </div>
                  </>
                )}

                <Button
                  className="mt-4"
                  variant="destructive"
                  onClick={openDisconnectConfirmModal}
                >
                  Disconnect Stripe
                </Button>
                <ResponsiveConfirm
                  isOpen={showDisconnectConfirmModal}
                  title="Confirm Disconnect"
                  confirmText="Yes, Disconnect"
                  cancelText="No, Continue"
                  content="Are you sure you want to disconnect? You won't be able to undo this action."
                  confirmVariant="destructive"
                  error={disconnectStripeAccountError}
                  isLoading={disconnectStripeAccountLoading}
                  modalProps={{
                    onClose: () => setShowDisconnectConfirmModal(false),
                    onConfirm: handleDisconnectStripeAccount,
                  }}
                  drawerProps={{
                    onSubmit: handleDisconnectStripeAccount,
                    onOpenChange: (open) => setShowDisconnectConfirmModal(open),
                  }}
                />
              </ConnectComponentsProvider>
            </div>
          )}
      </div>
    </div>
  );
};

export default Page;
