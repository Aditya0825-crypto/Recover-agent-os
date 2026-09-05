import { createFileRoute } from "@tanstack/react-router";
import { OverviewPage } from "../components/recovery-pages";

export const Route = createFileRoute("/workspace")({
  head: () => ({
    meta: [
      { title: "Recovery Command Center — RecoveryOS" },
      { name: "description", content: "Monitor revenue at risk, recovery decisions and live agent activity in RecoveryOS." },
      { property: "og:title", content: "Recovery Command Center — RecoveryOS" },
      { property: "og:description", content: "Monitor revenue at risk, recovery decisions and live agent activity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OverviewPage,
});