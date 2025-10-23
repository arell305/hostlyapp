import type { Appearance } from "@stripe/stripe-js";

export const stripeAppearance: Appearance = {
  theme: "night",
  variables: {
    colorPrimary: "#315DDF",
    colorBackground: "#1a1a1a",
    colorText: "#F9FAFA",
    colorDanger: "#EF4444",
  },
  rules: {
    // Payment method tabs (Card, Cash App Pay, etc.)
    ".Tab": {
      backgroundColor: "transparent",
      borderColor: "#1B1C20",
      borderWidth: "2px",
      boxShadow: "none",
    },
    ".Tab:hover, .Tab:focus, .Tab:active": {
      backgroundColor: "transparent",
      boxShadow: "none",
    },
    ".Tab--selected": {
      backgroundColor: "transparent",
      borderColor: "#315DDF",
      boxShadow: "none",
    },

    // Inputs
    ".Input": {
      backgroundColor: "transparent",
      borderColor: "#1B1C20",
      borderWidth: "2px",
      paddingTop: "0.375rem",
      paddingBottom: "0.375rem",
      paddingLeft: "0.625rem",
      paddingRight: "0.625rem",
    },
    ".Input:focus": {
      borderColor: "#324E78",
      boxShadow: "0 0 0 1px #324E78",
    },
    ".Input--invalid": {
      borderColor: "#EF4444",
    },
    ".Input--invalid:focus": {
      borderColor: "#EF4444",
      boxShadow: "0 0 0 1px #EF4444",
    },
    ".Error": {
      color: "#EF4444",
    },
  },
};
