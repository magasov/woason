"use client";

import { use } from "react";
import { ChatInbox } from "@/components/chat-inbox";

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ChatInbox peerId={id} />;
}
