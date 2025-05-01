export {};

declare global {
  interface CustomJwtSessionClaims {
    userRole?: string;
  }
}
