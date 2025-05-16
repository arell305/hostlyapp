"use client";
import { useRouter } from "next/navigation";
import NProgress from "nprogress";

const plans = [
  {
    name: "Standard",
    badge: "Free Trial",
    price: "$39.99/month",
    features: [
      "Unlimited Ticketed Events",
      "Ticket Lookup Check-In",
      "QR Code Scan Check-In",
      "Promo Code Support",
      "Manager Access",
      "Moderator Access",
      "Stripe Payouts",
    ],
  },
  {
    name: "Plus",
    badge: "Free Trial",
    price: "$99.99/month",
    features: [
      "Unlimited Ticketed Events",
      "3 Guest List Events",
      "Ticket Lookup Check-In",
      "QR Code Scan Check-In",
      "Promoter Access",
      "Manager Access",
      "Moderator Access",
      "Promo Code Support",
      "Stripe Payouts",
    ],
  },
  {
    name: "Elite",
    badge: "Full Access",
    price: "$199.99/month",
    features: [
      "Unlimited Ticketed Events",
      "Unlimited Guest List Events",
      "Ticket Lookup Check-In",
      "QR Code Scan Check-In",
      "Promoter Access",
      "Manager Access",
      "Moderator Access",
      "Promo Code Support",
      "Stripe Payouts",
    ],
  },
];

const Pricing = () => {
  const router = useRouter();

  const handleClick = () => {
    NProgress.start();
    router.push("/sign-up");
  };

  return (
    <section className="py-16 px-4 max-w-7xl mx-auto text-center">
      <h2 className="mb-10 text-3xl md:text-5xl  text-center  font-bold">
        Pricing{" "}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <div
            key={index}
            className="border rounded-2xl shadow p-6 flex flex-col items-center bg-cardBackground"
          >
            <h3 className="text-2xl font-bold text-whiteText  mb-2">
              {plan.name}
            </h3>
            <span className="text-sm font-medium text-whiteText mb-1">
              {plan.badge}
            </span>

            <p className="text-xl font-bold mb-4">{plan.price}</p>
            <ul className="text-left space-y-2 mb-6">
              {plan.features.map((feature, i) => {
                const highlight = [
                  "Unlimited Ticketed Events",
                  "Unlimited Guest List Events",
                  "3 Guest List Events",
                ];
                return (
                  <li key={i} className="text-grayText pl-5 relative">
                    <span className="absolute left-0">•</span>
                    <span
                      className={
                        highlight.includes(feature)
                          ? "font-semibold inline-block"
                          : "inline-block"
                      }
                    >
                      {feature}
                    </span>
                  </li>
                );
              })}
            </ul>
            <button
              onClick={handleClick}
              className="mt-auto bg-primaryBlue text-white px-6 py-2 rounded-[20px] font-semibold hover:bg-primaryBlue/80 transition"
            >
              Get Started
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Pricing;
