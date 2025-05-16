export {};

declare global {
  interface CustomJwtSessionClaims {
    userRole?: string;
    orgId?: string;
  }
}
