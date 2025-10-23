import { redirect } from "next/navigation";
import { auth, currentUser } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";
import { UserRole } from "@shared/types/enums";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default async function PostSignIn() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/post-sign-in");
  }

  const user = await currentUser();
  const role =
    (user?.publicMetadata?.role as UserRole | undefined) ?? undefined;

  const org = await convex.query(
    api.organizations.getOrganizationByClerkUserId,
    {
      clerkUserId: userId,
    }
  );

  if (org?.slug === "admin") {
    redirect("/admin/app/companies");
  }
  if (org) {
    redirect(`/${org.slug}/app`);
  }
  if (role === UserRole.Admin) {
    redirect("/create-company");
  }

  redirect("/");
}
