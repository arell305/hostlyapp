import { ErrorMessages } from "@/types/enums";
import { ResponseStatus } from "../../utils/enum";
import { UserSchema } from "./schemas-types";
import {
  EventSchema,
  OrganizationsSchema,
  TransformedOrganization,
} from "./types";
import { Id } from "../../convex/_generated/dataModel";
import { PaginationResult } from "convex/server";
import { Organization } from "@clerk/backend";

export interface ErrorResponse {
  status: ResponseStatus.ERROR;
  data: null;
  error: ErrorMessages | string;
}

export type FindUserByClerkIdResponse =
  | FindUserByClerkIdSuccess
  | ErrorResponse;

export interface FindUserByClerkIdData {
  user: UserSchema;
}

export interface FindUserByClerkIdSuccess {
  status: ResponseStatus.SUCCESS;
  data: FindUserByClerkIdData;
}

export type UpdateOrganizationMembershipsResponse =
  | UpdateOrganizationMembershipsSuccess
  | ErrorResponse;

export interface UpdateOrganizationMembershipsSuccess {
  status: ResponseStatus.SUCCESS;
  data: UpdateOrganizationMembershipsData;
}

export interface UpdateOrganizationMembershipsData {
  clerkUserId: string;
}

export type DeleteClerkUserResponse = DeleteClerkUserSucess | ErrorResponse;

export interface DeleteClerkUserSucess {
  status: ResponseStatus.SUCCESS;
  data: DeleteClerkUserData;
}
export interface DeleteClerkUserData {
  clerkUserId: string;
}

export type GetAllOrganizationsResponse =
  | GetAllOrganizationsSuccess
  | ErrorResponse;

export interface GetAllOrganizationsSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetAllOrganizationsData;
}

export interface GetAllOrganizationsData {
  organizations: ListOrganizations[];
}

export interface ListOrganizations {
  clerkOrganizationId: string;
  name: string;
  imageUrl?: string;
}

export type CreateOrganizationResponse =
  | CreateOrganizationSuccess
  | ErrorResponse
  | CreateOrganizationPartialSuccess;

export interface CreateOrganizationSuccess {
  status: ResponseStatus.SUCCESS;
  data: CreateOrganizationData;
}

export interface CreateOrganizationPartialSuccess {
  status: ResponseStatus.PARTIAL_SUCESSS;
  data: CreateOrganizationData;
  error: string;
}

export interface CreateOrganizationData {
  organization: TransformedOrganization;
}

export type UpdateOrganizationResponse =
  | UpdateOrganizationSuccess
  | ErrorResponse;

export interface UpdateOrganizationSuccess {
  status: ResponseStatus.SUCCESS;
  data: UpdateOrganizationData;
}

export interface UpdateOrganizationData {
  clerkOrgId: string;
}

export type UpdateOrganizationMetadataResponse =
  | UpdateOrganizationMetadataSuccess
  | ErrorResponse;

export interface UpdateOrganizationMetadataSuccess {
  status: ResponseStatus.SUCCESS;
  data: UpdateOrganizationMetadataData;
}

export interface UpdateOrganizationMetadataData {
  clerkOrgId: string;
}

export type GetEventsByOrganizationResponse =
  | GetEventsByOrganizationSuccess
  | ErrorResponse;

export interface GetEventsByOrganizationSuccess {
  status: ResponseStatus.SUCCESS;
  data: GetEventsByOrganizationData;
}

export interface GetEventsByOrganizationData {
  events: PaginationResult<EventSchema>;
}

export type GetOrganizationByNameQueryResponse =
  | GetOrganizationByNameQuerySuccess
  | ErrorResponse;

export interface GetOrganizationByNameQuerySuccess {
  status: ResponseStatus.SUCCESS;
  data: GetOrganizationByNameQueryData;
}

export interface GetOrganizationByNameQueryData {
  organization: OrganizationsSchema;
}

export type UpdateOrganizationLogoResponse =
  | UpdateOrganizationLogoSuccess
  | ErrorResponse;

export interface UpdateOrganizationLogoSuccess {
  status: ResponseStatus.SUCCESS;
  data: UpdateOrganizationLogoData;
}

export interface UpdateOrganizationLogoData {
  organizationId: string;
}
