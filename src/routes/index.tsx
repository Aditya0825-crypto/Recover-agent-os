import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "../components/landing-page";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "RecoveryOS — AI Revenue Recovery for Razorpay" },
    { name: "description", content: "RecoveryOS helps Razorpay merchants turn failed payments into safe, explainable recovery actions and measurable revenue." },
    { property: "og:title", content: "RecoveryOS — AI Revenue Recovery for Razorpay" },
    { property: "og:description", content: "Turn failed payments into safe, explainable recovery actions and measurable revenue." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: LandingPage,
});
