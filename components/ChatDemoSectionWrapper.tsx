"use client";

import dynamic from "next/dynamic";

const ChatDemoSection = dynamic(() => import("./ChatDemoSection"), {
  ssr: false,
  loading: () => <div className="h-[600px] md:h-[800px] xl:h-[900px] bg-slate-50 animate-pulse rounded-3xl mx-6 md:mx-12 xl:mx-20" />
});

export default function ChatDemoSectionWrapper() {
  return <ChatDemoSection />;
}
