"use client"; // Ensure this component runs on the client side
import { useState } from "react";
import { Input } from "@/components/ui/input"; // Assuming you have a styled Input component
import Image from "next/image"; // For displaying the uploaded image preview
import { UserButton, useClerk, useOrganizationList } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { IoBusinessOutline } from "react-icons/io5";
import { Label } from "@/components/ui/label";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  containsUnderscore,
  replaceSpacesWithHyphens,
} from "../../utils/helpers";

type ErrorState = {
  companyName: string | null;
  general: string | null;
};

export default function CreateCompanyPage() {
  const { organization, user, loaded } = useClerk();
  console.log("org", organization);
  console.log("user", user);
  const [companyName, setCompanyName] = useState("");
  const [companyPhoto, setCompanyPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { createOrganization, isLoaded, setActive } = useOrganizationList({
    userMemberships: true,
  });
  const updateOrganizationMetadataOnCreation = useAction(
    api.clerk.updateOrganizationMetadataOnCreation
  );

  const existingOrganizations = useQuery(api.organizations.getAllOrganizations);
  const { toast } = useToast();
  const [errors, setErrors] = useState<ErrorState>({
    companyName: null,
    general: null,
  });
  const router = useRouter();

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCompanyPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string); // Set the preview image
      };
      reader.readAsDataURL(file); // Read the file as a data URL
    }
  };
  console.log("user", user);
  const handleSubmit = async () => {
    setErrors({ companyName: null, general: null });
    if (companyName.trim() === "") {
      setErrors((prev) => ({ ...prev, companyName: "Name cannot be empty." }));
      return;
    }

    if (!user) {
      setErrors((prev) => ({
        ...prev,
        general: "Error Loading User. Please try again.",
      }));
      console.log("User undefined when creating company");
      return;
    }
    if (containsUnderscore(companyName)) {
      setErrors((prev) => ({
        ...prev,
        companyName: 'Name cannot contain "-"',
      }));
      return;
    }

    const name = replaceSpacesWithHyphens(companyName).toLowerCase();

    const isDuplicate = existingOrganizations?.data?.organizations?.some(
      (org) => org.name.toLowerCase() === name
    );
    if (isDuplicate) {
      setErrors((prev) => ({
        ...prev,
        companyName: "This company name already exists.",
      }));
      return;
    }
    if (!isLoaded) {
      setErrors((prev) => ({
        ...prev,
        general: "Please try again.",
      }));
      return;
    }

    setIsLoading(true);

    try {
      const newOrganization = await createOrganization({
        name,
      });

      await Promise.all([
        newOrganization.setLogo({ file: companyPhoto }),
        updateOrganizationMetadataOnCreation({
          clerkOrganizationId: newOrganization.id,
          email: user.emailAddresses[0].emailAddress,
        }),
        setActive({ organization: newOrganization.id }),
      ]);

      router.push(`${newOrganization.name}/app/team`);
      toast({
        title: "Success",
        description: "Company created.",
      });
    } catch (error) {
      setErrors((prev) => ({ ...prev, general: "Error creating company" }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePhoto = () => {
    setCompanyPhoto(null);
    setPhotoPreview(null);
  };
  if (!loaded || !isLoaded || isLoading) {
    <p>Loading</p>;
  }

  if (organization) {
    return (
      <div className="fixed inset-0 flex flex-col bg-white ">
        <div className="mt-[100px] flex-grow p-4 overflow-hidden md:mx-auto md:border md:shadow md:rounded-xl md:w-[700px] md:p-10 md:max-h-[460px]">
          <h1 className="mb-5 text-3xl md:text-4xl font-bold">
            Company already exits
          </h1>
        </div>
      </div>
    );
  }
  return (
    <div className="fixed inset-0 flex flex-col bg-white ">
      <nav
        className={
          "w-full flex  shadow md:shadow-none md:border-none bg-white z-10 top-0 fixed h-12 transition-colors duration-300    border-b border-gray-200"
        }
      >
        <div className="flex h-full items-center mx-auto p-2.5">
          <a href="/" className="text-2xl font-semibold font-playfair ">
            {"Hostly"}
          </a>
        </div>
        <UserButton />
      </nav>
      <div className="mt-[100px] flex-grow p-4 overflow-hidden md:mx-auto md:border md:shadow md:rounded-xl md:w-[700px] md:p-10 md:max-h-[460px]">
        <div className="flex gap-3">
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
            <div className="relative w-32 h-32 mt-2">
              {photoPreview && (
                <>
                  <div className="w-full h-full rounded-md overflow-hidden">
                    <Image
                      src={photoPreview}
                      alt="Company Photo Preview"
                      layout="fill"
                      objectFit="cover"
                      className="rounded-md"
                    />
                  </div>
                  <button
                    onClick={handleDeletePhoto}
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
              <div className="relative w-full h-full group">
                <Input
                  id="companyPhoto"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {!photoPreview && (
                  <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center transition-colors duration-200 group-hover:bg-gray-100">
                    <span className="text-gray-400">Upload Photo</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <p
            className={` text-sm mt-1 ${errors.general ? "text-red-500" : "text-transparent"}`}
          >
            {errors.general || "Placeholder to maintain height"}
          </p>{" "}
          <div className=" hidden md:flex">
            <Button className="w-[200px] mx-auto" onClick={handleSubmit}>
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
      <div className="p-4 md:hidden">
        <Button
          className="w-full h-12 text-lg font-semibold"
          onClick={handleSubmit}
        >
          {" "}
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="animate-spin h-4 w-4" aria-hidden="true" />
              <span>Creating...</span>
            </div>
          ) : (
            "Create"
          )}
        </Button>
      </div>
    </div>
  );
}
