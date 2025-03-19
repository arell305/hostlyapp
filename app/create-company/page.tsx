"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { UserButton, useClerk, useSession } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { IoBusinessOutline } from "react-icons/io5";
import { Label } from "@/components/ui/label";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { ResponseStatus } from "../../utils/enum";
import _ from "lodash";
import { ErrorMessages, FrontendErrorMessages } from "@/types/enums";
import { RiImageAddFill } from "react-icons/ri";
import { validatePromoDiscount } from "../../utils/frontend-validation";
import { Id } from "../../convex/_generated/dataModel";
import Loading from "@/[slug]/app/components/loading/Loading";
import { compressAndUploadImage } from "../../utils/image";
import FullLoading from "@/[slug]/app/components/loading/FullLoading";

type ErrorState = {
  companyName: string | null;
  general: string | null;
  promoDiscount: string | null;
};

export default function CreateCompanyPage() {
  const { organization, loaded } = useClerk();
  const [companyName, setCompanyName] = useState("");
  const [promoDiscountAmount, setPromoDiscountAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setActive } = useClerk();

  const { session } = useSession();

  const generateUploadUrl = useMutation(api.photo.generateUploadUrl);
  const [photoStorageId, setPhotoStorageId] = useState<Id<"_storage"> | null>(
    null
  );
  const [isPhotoLoading, setIsPhotoLoading] = useState<boolean>(false);
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null);
  const displayCompanyPhoto = useQuery(api.photo.getFileUrl, {
    storageId: photoStorageId,
  });
  const createClerkOrganization = useAction(api.clerk.createClerkOrganization);

  const { toast } = useToast();
  const [errors, setErrors] = useState<ErrorState>({
    companyName: null,
    general: null,
    promoDiscount: null,
  });

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) {
      console.error("No file selected");
      return;
    }
    setIsPhotoLoading(true);

    try {
      const response = await compressAndUploadImage(file, generateUploadUrl);

      if (response.ok) {
        const { storageId } = await response.json();
        setPhotoStorageId(storageId as Id<"_storage">);
      } else {
        setPhotoUploadError("Photo upload failed");
        console.error("Photo upload failed");
      }
    } catch (error) {
      setPhotoUploadError("Photo upload failed");
      console.error("Error uploading photo:", error);
    } finally {
      setIsPhotoLoading(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoStorageId(null);
  };

  const handleSubmit = async () => {
    setErrors({ companyName: null, general: null, promoDiscount: null });
    if (organization) {
      setErrors((prev) => ({ ...prev, general: "Company already created." }));
      return;
    }
    if (companyName.trim() === "") {
      setErrors((prev) => ({ ...prev, companyName: "Name cannot be empty." }));
      return;
    }

    const { promoDiscountValue, promoDiscountValueError } =
      validatePromoDiscount(promoDiscountAmount);
    if (promoDiscountValueError) {
      setErrors((prev) => ({
        ...prev,
        promoDiscount: promoDiscountValueError,
      }));
      return;
    }

    if (!setActive) {
      setErrors((prev) => ({
        ...prev,
        general: FrontendErrorMessages.GENERIC_ERROR,
      }));
      console.log(FrontendErrorMessages.USE_ORGANIZATION_LIST_NOT_LOADED);
      return;
    }

    if (!session) {
      setErrors((prev) => ({
        ...prev,
        general: FrontendErrorMessages.GENERIC_ERROR,
      }));
      console.log(FrontendErrorMessages.USE_ORGANIZATION_LIST_NOT_LOADED);
      return;
    }

    setIsLoading(true);

    try {
      const response = await createClerkOrganization({
        companyName,
        photo: photoStorageId,
        promoDiscount: promoDiscountValue,
      });

      if (
        response.status === ResponseStatus.ERROR &&
        response.error === ErrorMessages.COMPANY_NAME_ALREADY_EXISTS
      ) {
        setErrors((prev) => ({
          ...prev,
          general: ErrorMessages.COMPANY_NAME_ALREADY_EXISTS,
        }));
      } else if (response.status === ResponseStatus.ERROR) {
        console.log("error creating company", response.error);
        setErrors((prev) => ({ ...prev, general: "Error creating company" }));
      } else {
        const newOrganizationId = response.data.clerkOrganizationId;
        await setActive({
          session: session.id,
          organization: newOrganizationId,
        });
        const slug = response.data.slug;
        window.location.href = `/${slug}/app`;

        toast({
          title: "Success",
          description: "Company created.",
        });
      }
    } catch (error) {
      console.error(error);
      setErrors((prev) => ({ ...prev, general: "Error creating company" }));
    } finally {
      setIsLoading(false);
    }
  };

  if (!loaded) {
    <FullLoading />;
  }

  return (
    <main className="">
      <nav className={"px-4 w-full flex justify-end  z-10 top-0 fixed h-12  "}>
        <UserButton />
      </nav>
      <div className="px-4 flex flex-col mt-16 md:mt-10 max-w-2xl mx-auto">
        <div className="flex gap-3 mb-6 justify-center md:justify-start">
          <IoBusinessOutline className="text-4xl" />
          <h1 className="mb-5 text-3xl md:text-4xl font-bold">New Company</h1>
        </div>
        <div className="space-y-1">
          <div className="flex flex-col">
            <Label
              htmlFor="companyName"
              className="font-bold font-playfair text-xl"
            >
              Name*
            </Label>
            <Input
              id="companyName"
              type="text"
              placeholder="Enter Company Name"
              value={companyName}
              onChange={(e) => {
                setErrors((prev) => ({
                  ...prev,
                  companyName: null,
                }));
                setCompanyName(e.target.value);
              }}
              className={`w-full ${errors.companyName ? "border-red-500" : ""}`}
            />
            <p
              className={` text-sm mt-1 ${errors.companyName ? "text-red-500" : "text-transparent"}`}
            >
              {errors.companyName || "Placeholder to maintain height"}
            </p>{" "}
          </div>
          <div className="flex flex-col">
            <Label
              htmlFor="promoDiscountAmount"
              className="font-bold font-playfair text-xl"
            >
              Promo Discount
            </Label>
            <Input
              id="promoDiscountAmount"
              type="number"
              placeholder="Enter Promo Discount Amount"
              value={promoDiscountAmount}
              onChange={(e) => {
                setErrors((prev) => ({
                  ...prev,
                  companyName: null,
                }));
                setPromoDiscountAmount(e.target.value);
              }}
              className={`w-full ${errors.companyName ? "border-red-500" : ""}`}
            />
            <p
              className={` text-sm mt-1 ${errors.companyName ? "text-red-500" : "text-transparent"}`}
            >
              {errors.companyName || "Placeholder to maintain height"}
            </p>{" "}
          </div>
          <div>
            <Label
              className="font-bold font-playfair text-xl mb-2"
              htmlFor="companyPhoto"
            >
              Company Photo
            </Label>
            <p className="text-sm text-gray-600">
              Recommended size 1:1, up to 10MB.
            </p>
            <div className="relative w-64 h-64 mt-2 ">
              {displayCompanyPhoto && (
                <>
                  <div className="w-full h-full  rounded-md overflow-hidden">
                    <Image
                      src={displayCompanyPhoto}
                      alt="Company Photo Preview"
                      layout="fill"
                      objectFit="cover"
                      className="rounded-md"
                    />
                  </div>
                  <button
                    onClick={handleRemovePhoto}
                    className="absolute -top-2 -right-2 bg-white border rounded-full p-1 shadow-lg z-10 hover:bg-gray-200"
                    type="button"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 text-gray-600"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </>
              )}
              {!displayCompanyPhoto && (
                <div className="relative w-full h-full group">
                  <Input
                    id="companyPhoto"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center transition-colors duration-200 group-hover:bg-gray-100">
                    {isPhotoLoading ? (
                      <Loading />
                    ) : (
                      <RiImageAddFill className="text-4xl text-gray-500" />
                    )}
                  </div>
                  <p
                    className={` text-sm mt-1 ${photoUploadError ? "text-red-500" : "text-transparent"}`}
                  >
                    {photoUploadError || "Placeholder to maintain height"}
                  </p>{" "}
                </div>
              )}
            </div>
          </div>
          <p
            className={` text-sm mt-1 ${errors.general ? "text-red-500" : "text-transparent"}`}
          >
            {errors.general || "Placeholder to maintain height"}
          </p>{" "}
          <div className="">
            <Button
              className=" mx-auto my-8"
              onClick={handleSubmit}
              disabled={companyName === ""}
            >
              {" "}
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2
                    className="animate-spin h-4 w-4"
                    aria-hidden="true"
                  />
                  <span>Creating...</span>
                </div>
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
