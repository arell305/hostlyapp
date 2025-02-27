"use node";

import type {
  OrganizationMembership,
  WebhookEvent,
} from "@clerk/clerk-sdk-node";
import { action, internalAction } from "./_generated/server";
import { Webhook } from "svix";
import { v } from "convex/values";
import { createClerkClient } from "@clerk/backend";
import {
  ClerkOrganization,
  CreateClerkInvitationResponse,
  Customer,
  GetOrganizationMembershipsResponse,
  GetPendingInvitationListResponse,
  Membership,
  PendingInvitationUser,
  RevokeOrganizationInvitationResponse,
} from "@/types/types";
import {
  RoleConvex,
  SubscriptionStatusConvex,
  SubscriptionTierConvex,
} from "./schema";
import { internal } from "./_generated/api";
import { Organization } from "@clerk/nextjs/server";
import { ErrorMessages } from "@/types/enums";
import { ResponseStatus, UserRole } from "../utils/enum";
import {
  CreateOrganizationResponse,
  DeleteClerkUserResponse,
  UpdateOrganizationMembershipsResponse,
  UpdateOrganizationMetadataResponse,
  UpdateOrganizationResponse,
} from "@/types/convex-types";
import { requireAuthenticatedUser } from "../utils/auth";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import slugify from "slugify";
import { createClerkOrg, updateOrganizationLogo } from "../utils/clerk";

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export const fulfill = internalAction({
  args: { headers: v.any(), payload: v.string() },
  handler: async (ctx, args) => {
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET as string);
    const payload = wh.verify(args.payload, args.headers) as WebhookEvent;
    return payload;
  },
});

export const getOrganizationMemberships = action({
  args: { clerkOrgId: v.string() },
  handler: async (ctx, args): Promise<GetOrganizationMembershipsResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }

      const clerkClient = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      const { data } =
        await clerkClient.organizations.getOrganizationMembershipList({
          organizationId: args.clerkOrgId,
        });
      const memberships: Membership[] = data.map((membership) => {
        const userData = membership.publicUserData;

        return {
          clerkUserId: userData ? userData.userId : "",
          role: membership.role,
          firstName: userData ? userData.firstName : "Unknown",
          lastName: userData ? userData.lastName : "Unknown",
          imageUrl: userData ? userData.imageUrl : "", // Default to empty string if not available
        };
      });
      return {
        status: ResponseStatus.SUCCESS,
        data: {
          memberships,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : ErrorMessages.GENERIC_ERROR;
      console.error(errorMessage, error);
      return {
        status: ResponseStatus.ERROR,
        data: null,
        error: errorMessage,
      };
    }
  },
});

export const getPendingInvitationList = action({
  args: { clerkOrgId: v.string() },
  handler: async (ctx, args): Promise<GetPendingInvitationListResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }
      const clerkClient = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      const { data } =
        await clerkClient.organizations.getOrganizationInvitationList({
          organizationId: args.clerkOrgId,
          status: ["pending"],
        });

      const users: PendingInvitationUser[] = data.map((invitation) => ({
        clerkInvitationId: invitation.id,
        email: invitation.emailAddress,
        role: invitation.role,
      }));
      return {
        status: ResponseStatus.SUCCESS,
        data: {
          pendingInvitationUsers: users,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : ErrorMessages.GENERIC_ERROR;
      console.error(errorMessage, error);
      return {
        status: ResponseStatus.ERROR,
        data: null,
        error: errorMessage,
      };
    }
  },
});

export const updateOrganizationMemberships = action({
  args: { clerkOrgId: v.string(), clerkUserId: v.string(), role: RoleConvex },
  handler: async (
    ctx,
    args
  ): Promise<UpdateOrganizationMembershipsResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }
      const clerkClient = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      await Promise.all([
        clerkClient.organizations.updateOrganizationMembership({
          organizationId: args.clerkOrgId,
          userId: args.clerkUserId,
          role: args.role,
        }),
        ctx.runMutation(internal.users.updateUserById, {
          clerkUserId: args.clerkUserId,
          role: args.role,
        }),
      ]);

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          clerkUserId: args.clerkUserId,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : ErrorMessages.GENERIC_ERROR;
      console.error(errorMessage, error);
      return {
        status: ResponseStatus.ERROR,
        data: null,
        error: errorMessage,
      };
    }
  },
});

export const deleteClerkUser = action({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args): Promise<DeleteClerkUserResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }

      const clerkClient = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      await Promise.all([
        clerkClient.users.deleteUser(args.clerkUserId),
        ctx.runMutation(internal.users.deleteFromClerk, {
          clerkUserId: args.clerkUserId,
        }),
      ]);
      return {
        status: ResponseStatus.SUCCESS,
        data: {
          clerkUserId: args.clerkUserId,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : ErrorMessages.GENERIC_ERROR;
      console.error(errorMessage, error);
      return {
        status: ResponseStatus.ERROR,
        data: null,
        error: errorMessage,
      };
    }
  },
});

export const createClerkInvitation = action({
  args: {
    clerkOrgId: v.string(),
    clerkUserId: v.string(),
    role: RoleConvex,
    email: v.string(),
  },
  handler: async (ctx, args): Promise<CreateClerkInvitationResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }
      const clerkClient = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      const response =
        await clerkClient.organizations.createOrganizationInvitation({
          organizationId: args.clerkOrgId,
          inviterUserId: args.clerkUserId,
          emailAddress: args.email,
          role: args.role,
        });
      return {
        status: ResponseStatus.SUCCESS,
        data: {
          clerkInvitationId: response.id,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : ErrorMessages.GENERIC_ERROR;
      console.error(errorMessage, error);
      return {
        status: ResponseStatus.ERROR,
        data: null,
        error: errorMessage,
      };
    }
  },
});

export const revokeOrganizationInvitation = action({
  args: {
    clerkOrgId: v.string(),
    clerkUserId: v.string(),
    clerkInvitationId: v.string(),
  },
  handler: async (ctx, args): Promise<RevokeOrganizationInvitationResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }
      const clerkClient = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      await clerkClient.organizations.revokeOrganizationInvitation({
        organizationId: args.clerkOrgId,
        invitationId: args.clerkInvitationId,
        requestingUserId: args.clerkUserId,
      });
      return {
        status: ResponseStatus.SUCCESS,
        data: {
          clerkInvitationId: args.clerkInvitationId,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : ErrorMessages.GENERIC_ERROR;
      console.error(errorMessage, error);
      return {
        status: ResponseStatus.ERROR,
        data: null,
        error: errorMessage,
      };
    }
  },
});

export const createClerkOrganization = action({
  args: {
    companyName: v.string(),
    photo: v.union(v.id("_storage"), v.null()),
    promoDiscount: v.union(v.number(), v.null()),
  },
  handler: async (ctx, args): Promise<CreateOrganizationResponse> => {
    const { companyName, photo } = args;
    let { promoDiscount } = args;

    promoDiscount = promoDiscount ?? 0;
    try {
      const identity = await requireAuthenticatedUser(ctx);
      const clerkUserId = identity.id as string;

      const user = await ctx.runQuery(
        internal.users.internalFindUserByClerkId,
        { clerkUserId }
      );

      if (user.organizationId) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.USER_ALREADY_HAS_COMPANY,
        };
      }

      if (!user.customerId) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.USER_NOT_CUSTOMER,
        };
      }

      const customer = await ctx.runQuery(internal.customers.findCustomerById, {
        customerId: user.customerId,
      });

      if (!customer) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.CUSTOMER_NOT_FOUND,
        };
      }

      const slug: string = slugify(companyName, { lower: true, strict: true });

      const existingOrganization = await ctx.runQuery(
        internal.organizations.getOrganizationBySlug,
        { slug }
      );

      if (existingOrganization) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.COMPANY_NAME_ALREADY_EXISTS,
        };
      }

      const clerkOrganization = await createClerkOrg({
        companyName,
        publicMetadata: {
          urlSlug: slug,
          status: customer.subscriptionStatus,
          tier: customer.subscriptionTier,
        },
        createdBy: clerkUserId,
      });

      const organizationId = await ctx.runMutation(
        internal.organizations.createConvexOrganization,
        {
          clerkOrganizationId: clerkOrganization.id,
          name: companyName,
          slug,
          promoDiscount,
          customerId: customer._id,
          photo,
          userId: user._id,
        }
      );

      if (photo) {
        const blob = await ctx.storage.get(photo);
        if (!blob) {
          console.log(ErrorMessages.FILE_CREATION_ERROR);
          return {
            status: ResponseStatus.SUCCESS,
            data: {
              organizationId,
              slug,
              clerkOrganizationId: organizationId,
            },
          };
        }
        await updateOrganizationLogo({
          organizationId: clerkOrganization.id,
          file: blob,
          uploaderUserId: clerkUserId,
        });
      }

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          organizationId,
          slug,
          clerkOrganizationId: clerkOrganization.id,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : ErrorMessages.GENERIC_ERROR;
      console.error(errorMessage, error);
      return {
        status: ResponseStatus.ERROR,
        data: null,
        error: errorMessage,
      };
    }
  },
});
//     try {
//       console.log("in");
//       const identity = await ctx.auth.getUserIdentity();
//       if (!identity) {
//         return {
//           status: ResponseStatus.ERROR,
//           data: null,
//           error: ErrorMessages.UNAUTHENTICATED,
//         };
//       }
//       const clerkClient = createClerkClient({
//         secretKey: process.env.CLERK_SECRET_KEY,
//       });

//       const existingCustomer: Customer | null = await ctx.runQuery(
//         internal.customers.findCustomerByEmail,
//         {
//           email: args.email,
//         }
//       );

//       if (!existingCustomer) {
//         return {
//           status: ResponseStatus.ERROR,
//           data: null,
//           error: ErrorMessages.NOT_FOUND,
//         };
//       }

//       const organization: Organization =
//         await clerkClient.organizations.createOrganization({
//           name: args.name,
//           createdBy: args.clerkUserId,
//           publicMetadata: {
//             tier: existingCustomer.subscriptionTier,
//             status: existingCustomer.subscriptionStatus,
//           },
//         });
//       console.log("org", organization);
//       const transformedOrganization: TransformedOrganization = {
//         id: organization.id,
//         name: organization.name,
//         createdBy: organization.createdBy,
//         publicMetadata: organization.publicMetadata,
//       };
//       console.log("before org");
//       // if (args.photoFile) {
//       //   try {
//       //     await clerkClient.organizations.updateOrganizationLogo(
//       //       organization.id,
//       //       {
//       //         file: args.photoFile,
//       //         uploaderUserId: args.clerkUserId,
//       //       }
//       //     );
//       //   } catch (error) {
//       //     console.error("Photo upload failed", error);
//       //     return {
//       //       status: ResponseStatus.PARTIAL_SUCESSS,
//       //       data: {
//       //         organization: transformedOrganization,
//       //       },
//       //       error: "Photo Upload failed",
//       //     };
//       //   }
//       // }

//       return {
//         status: ResponseStatus.SUCCESS,
//         data: {
//           organization: transformedOrganization,
//         },
//       };
//     } catch (error) {
//       const errorMessage =
//         error instanceof Error ? error.message : ErrorMessages.GENERIC_ERROR;
//       console.error(errorMessage, error);
//       return {
//         status: ResponseStatus.ERROR,
//         data: null,
//         error: errorMessage,
//       };
//     }
//   },
// });

export const updateOrganization = action({
  args: {
    name: v.string(),
    clerkOrganizationId: v.string(),
  },
  handler: async (ctx, args): Promise<UpdateOrganizationResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }
      const clerkClient = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      await clerkClient.organizations.updateOrganization(
        args.clerkOrganizationId,
        {
          name: args.name,
        }
      );
      return {
        status: ResponseStatus.SUCCESS,
        data: {
          clerkOrgId: args.clerkOrganizationId,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : ErrorMessages.GENERIC_ERROR;
      console.error(errorMessage, error);
      return {
        status: ResponseStatus.ERROR,
        data: null,
        error: errorMessage,
      };
    }
  },
});

export const updateUserMetadata = action({
  args: {
    clerkUserId: v.string(),
    params: v.object({
      promoCode: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    try {
      await clerkClient.users.updateUserMetadata(args.clerkUserId, {
        publicMetadata: { ...args.params },
      });
      return { success: true, message: "MetaData Updated" };
    } catch (err) {
      console.log("Failed to update metadata", err);
      return { success: false, message: "Failed to update metadata." };
    }
  },
});

export const getOrganizationList = action({
  args: {},
  handler: async (ctx, args): Promise<ClerkOrganization[]> => {
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });
    try {
      const { data } = await clerkClient.organizations.getOrganizationList();
      const filteredOrganizations: ClerkOrganization[] = data.map((org) => ({
        clerkOrganizationId: org.id,
        name: org.name,
        imageUrl: org.imageUrl,
        publicMetadata: org.publicMetadata,
      }));
      return filteredOrganizations;
    } catch (err) {
      console.log("Failed to update metadata", err);
      throw new Error("Failed to fetch organization.");
    }
  },
});

export const updateOrganizationMetadata = action({
  args: {
    clerkOrganizationId: v.string(),
    params: v.object({
      status: v.optional(SubscriptionStatusConvex),
      tier: v.optional(SubscriptionTierConvex),
      promoDiscount: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args): Promise<UpdateOrganizationMetadataResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }

      const clerkClient = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      const currentOrganization: Organization =
        await clerkClient.organizations.getOrganization({
          organizationId: args.clerkOrganizationId,
        });
      const currentMetadata: OrganizationPublicMetadata =
        currentOrganization.publicMetadata || {};

      const updatedMetadata: OrganizationPublicMetadata = {
        ...currentMetadata,
        ...args.params,
      };

      await clerkClient.organizations.updateOrganizationMetadata(
        args.clerkOrganizationId,
        {
          publicMetadata: updatedMetadata,
        }
      );

      if (args.params.promoDiscount !== undefined) {
        await ctx.runMutation(
          internal.organizations.updateOrganizationPromoDiscount,
          {
            clerkOrganizationId: args.clerkOrganizationId,
            promoDiscount: args.params.promoDiscount,
          }
        );
      }

      return {
        status: ResponseStatus.SUCCESS,
        data: {
          clerkOrgId: args.clerkOrganizationId,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : ErrorMessages.GENERIC_ERROR;
      console.error(errorMessage, error);
      return {
        status: ResponseStatus.ERROR,
        data: null,
        error: errorMessage,
      };
    }
  },
});

export const getClerkUser = action({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args): Promise<DeleteClerkUserResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }

      const clerkClient = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
      });
      await Promise.all([
        clerkClient.users.deleteUser(args.clerkUserId),
        ctx.runMutation(internal.users.deleteFromClerk, {
          clerkUserId: args.clerkUserId,
        }),
      ]);
      return {
        status: ResponseStatus.SUCCESS,
        data: {
          clerkUserId: args.clerkUserId,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : ErrorMessages.GENERIC_ERROR;
      console.error(errorMessage, error);
      return {
        status: ResponseStatus.ERROR,
        data: null,
        error: errorMessage,
      };
    }
  },
});

// deleted use
export const updateOrganizationMetadataOnCreation = action({
  args: {
    clerkOrganizationId: v.string(),
    email: v.string(),
    urlSlug: v.string(),
  },
  handler: async (ctx, args): Promise<UpdateOrganizationMetadataResponse> => {
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.UNAUTHENTICATED,
        };
      }

      const existingCustomer: Customer | null = await ctx.runQuery(
        internal.customers.findCustomerByEmail,
        {
          email: args.email,
        }
      );

      if (!existingCustomer) {
        return {
          status: ResponseStatus.ERROR,
          data: null,
          error: ErrorMessages.NOT_FOUND,
        };
      }
      const clerkClient = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      await clerkClient.organizations.updateOrganizationMetadata(
        args.clerkOrganizationId,
        {
          publicMetadata: {
            status: existingCustomer.subscriptionStatus,
            tier: existingCustomer.subscriptionTier,
            urlSlug: args.urlSlug,
          },
        }
      );
      return {
        status: ResponseStatus.SUCCESS,
        data: {
          clerkOrgId: args.clerkOrganizationId,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : ErrorMessages.GENERIC_ERROR;
      console.error(errorMessage, error);
      return {
        status: ResponseStatus.ERROR,
        data: null,
        error: errorMessage,
      };
    }
  },
});
