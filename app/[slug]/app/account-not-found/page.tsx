import CustomCard from "@/components/shared/cards/CustomCard";
import StaticPageContainer from "@/components/shared/containers/StaticPageContainer";

export default function AccountNotFoundPage() {
  return (
    <StaticPageContainer className="h-[80dvh]">
      <CustomCard className="p-4">
        <h1 className="">Account Not Found</h1>
        <p className="text-grayText mt-2">
          Your account has been removed by an administrator. If this is a
          mistake, please contact support.
        </p>
      </CustomCard>
    </StaticPageContainer>
  );
}
