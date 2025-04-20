// utils/handleQueryState.tsx
import React from "react";
import { QueryState, ResponseStatus } from "@/types/enums";
import Loading from "@/[slug]/app/components/loading/Loading";
import ErrorComponent from "@/[slug]/app/components/errors/ErrorComponent";

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
          <Loading />
        </div>
      ),
    };
  }

  if (queryResult.status === ResponseStatus.ERROR) {
    return {
      type: QueryState.Error,
      element: (
        <div className="flex items-center justify-center min-h-screen">
          <ErrorComponent message={queryResult.error || "An error occurred."} />
        </div>
      ),
    };
  }

  // At this point, TypeScript knows queryResult is of type QuerySuccess<T>
  return { type: QueryState.Success, data: queryResult.data };
}
