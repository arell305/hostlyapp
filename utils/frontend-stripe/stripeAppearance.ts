import type { Appearance } from "@stripe/stripe-js";

export const stripeAppearance: Appearance = {
  theme: "night",
  variables: {
    colorPrimary: "#315DDF",
    colorBackground: "#1a1a1a",
    colorText: "#ffffff",
    // 👇 error color (borders, icons, messages)
    colorDanger: "#EF4444", // tailwind red-500
  },
  rules: {
    // ensure the input border uses your red
    ".Input--invalid": {
      borderColor: "#EF4444",
    },
    ".Input--invalid:focus": {
      borderColor: "#EF4444",
      boxShadow: "0 0 0 1px #EF4444",
    },
    // error message text
    ".Error": {
      color: "#EF4444",
    },
  },
};
