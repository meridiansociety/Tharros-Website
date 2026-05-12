"use client";

import dynamic from "next/dynamic";

const ChatDemoSection = dynamic(() => import("./ChatDemoSection"), {
  ssr: false,
  loading: () => <div className="h-[600px] bg-slate-50 animate-pulse rounded-3xl" />
});

export default function ChatDemoSectionWrapper() {
  return <ChatDemoSection />;
}
