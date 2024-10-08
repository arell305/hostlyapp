import { useQuery } from "convex/react";
import React from "react";
import { api } from "../../../convex/_generated/api";
import Image from "next/image";

const PromotionalCompaniesList = () => {
  const companies = useQuery(api.organizations.getAllOrganizations);

  if (!companies) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-center text-3xl md:text-4xl mt-4 font-bold mb-4">
        Promotional Companies
      </h1>
      <div className="flex flex-col flex-wrap justify-center items-center gap-2 p-4">
        {companies.map((company) => (
          <div
            key={company.clerkOrganizationId}
            className="mb-4 shadow-xl w-[350px] md:w-[500px] px-10 py-4 rounded-md bg-customDarkerBlue text-black font-semibold hover:bg-customLightBlue cursor-pointer flex space-x-4 md:space-x-8 justify-start items-center"
          >
            <div className="w-[50px] h-[50px] rounded-full overflow-hidden">
              <Image
                src={company.imageUrl || ""}
                alt={`${company.name} logo`}
                width={50}
                height={50}
                className="object-cover"
              />
            </div>
            <p className="text-xl">{company.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromotionalCompaniesList;
