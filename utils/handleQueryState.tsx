// utils/handleQueryState.tsx
import React, { ReactElement } from "react";
import { QueryState, ResponseStatus } from "@/types/enums";
import ErrorComponent from "@/[slug]/app/components/errors/ErrorComponent";
import { Skeleton } from "@/components/ui/skeleton";
import FullLoading from "@/[slug]/app/components/loading/FullLoading";
import { UserResource } from "@clerk/types";
import MessagePage from "@/components/shared/shared-page/MessagePage";
import router from "next/router";
import NProgress from "nprogress";
export interface QuerySuccess<T> {
  status: ResponseStatus.SUCCESS;
  data: T;
}

// Define the shape of an error response
export interface QueryError {
  status: ResponseStatus.ERROR;
  error: string;
}

// Combine the success and error responses into a union type
export type QueryResult<T> = QuerySuccess<T> | QueryError;

export type QueryStateResult<T> =
  | { type: QueryState.Loading; element: React.ReactElement }
  | { type: QueryState.Error; element: React.ReactElement }
  | { type: QueryState.Success; data: T };

export function handleQueryState<T>(
  queryResult: QueryResult<T> | undefined
): QueryStateResult<T> {
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
          description={queryResult.error || "An error occurred."}
          buttonLabel="Go to Home"
          onButtonClick={() => {
            NProgress.start();
            router.push("/");
          }}
        />
      ),
    };
  }

  // At this point, TypeScript knows queryResult is of type QuerySuccess<T>
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
