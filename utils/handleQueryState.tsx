"use client";

import React, { ReactElement } from "react";
import { ResponseStatus } from "@/types/enums";
import ErrorComponent from "@/[slug]/app/components/errors/ErrorComponent";
import { Skeleton } from "@/components/ui/skeleton";
import FullLoading from "@/[slug]/app/components/loading/FullLoading";
import { UserResource } from "@clerk/types";
import MessagePage from "@/components/shared/shared-page/MessagePage";

export interface QuerySuccess1<T> {
  status: ResponseStatus.SUCCESS;
  data: T;
}

// Define the shape of an error response
export interface QueryError1 {
  status: ResponseStatus.ERROR;
  error: string;
}

// Combine the success and error responses into a union type
export type QueryResult1<T> = QuerySuccess1<T> | QueryError1;

export type QueryStateResult1<T> =
  | { type: QueryState.Loading; element: React.ReactNode }
  | { type: QueryState.Error; element: React.ReactNode }
  | { type: QueryState.Success; data: T };

export function handleQueryState<T>(
  queryResult: QueryResult1<T> | undefined
): QueryStateResult1<T> {
  if (!queryResult) {
    return {
      type: QueryState.Loading,
      element: (
        <div className="flex items-center justify-center min-h-screen">
          <Skeleton className="w-full h-full" />
        </div>
      ),
    };
  }

  if (queryResult.status === ResponseStatus.ERROR) {
    return {
      type: QueryState.Error,
      element: (
        <MessagePage
          title="Error"
          description={`${queryResult.error || "An error occurred"}. Please contact support if you believe this is an error.`}
          buttonLabel="Home"
        />
      ),
    };
  }

  // At this point, TypeScript knows queryResult is of type QuerySuccess<T>
  return { type: QueryState.Success, data: queryResult.data };
}

enum QueryState {
  Loading = "loading",
  Error = "error",
  Success = "success",
}
export { QueryState };

interface QueryStateResult<T> {
  type: QueryState;
  element?: React.ReactNode;
  data?: T;
}

interface HandleQueryComponentStateOptions {
  loadingComponent?: React.ReactNode;
  errorComponent?: (message: string) => React.ReactNode;
}

export function handleQueryComponentState<T>(
  queryResult: QueryResult1<T> | undefined,
  options?: HandleQueryComponentStateOptions
): QueryStateResult1<T> {
  if (!queryResult) {
    return {
      type: QueryState.Loading,
      element: options?.loadingComponent ?? <FullLoading />,
    };
  }

  if (queryResult.status === ResponseStatus.ERROR) {
    return {
      type: QueryState.Error,
      element: (
        <ErrorComponent
          message={`${
            queryResult.error || "An error occurred"
          }. Please contact support if you believe this is an error.`}
        />
      ),
    };
  }

  return { type: QueryState.Success, data: queryResult.data };
}

export function checkClerkLoading(...args: any[]) {
  const hasFalsy = args.some((arg) => !arg);
  if (hasFalsy) {
    return <FullLoading />;
  }
  return null;
}

type GuardUserResult =
  | { type: "loading"; element: ReactElement }
  | { type: "error"; element: ReactElement }
  | { type: "success"; user: UserResource };

export function guardUser(
  user: UserResource | null | undefined
): GuardUserResult {
  if (user === undefined) {
    return { type: "loading", element: <FullLoading /> };
  }
  if (user === null) {
    return {
      type: "error",
      element: <ErrorComponent message="User not found or not signed in." />,
    };
  }
  return { type: "success", user };
}
