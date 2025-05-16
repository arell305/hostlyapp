export {};

declare global {
  interface CustomJwtSessionClaims {
    userRole?: string;
    org_id?: string;
  }
}
