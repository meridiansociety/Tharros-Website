"use client";

import dynamic from "next/dynamic";

const IntakeAgent = dynamic(() => import("./IntakeAgent"), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-white" />
});

export default function IntakeAgentWrapper() {
  return <IntakeAgent />;
}
