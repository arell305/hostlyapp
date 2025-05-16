if (!process.env.CLERK_ISSUER_DOMAIN) {
  throw new Error(ErrorMessages.ENV_NOT_SET_CLERK_ISSUER_DOMAIN);
}

export default {
  providers: [
    {
      domain: process.env.CLERK_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
