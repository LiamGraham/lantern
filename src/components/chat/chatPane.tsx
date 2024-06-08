"use client";
import { useEffect, useState, type ReactNode } from "react";
import { ChatInput, ScrollArea } from "~/components/ui"
import { faker } from '@faker-js/faker';

interface ChatBubbleProps {
  className?: string;
  fromUser?: boolean;
  children: ReactNode;
}

function ChatBubble(props: ChatBubbleProps) {
  const { children, fromUser, className } = props;
  const senderClass = fromUser ? 'self-end max-w-[55%] bg-primary text-primary-foreground' : 'self-start bg-gray-300 max-w-full bg-transparent text-secondary-foreground';
  return (
    <div className={`items-center rounded-2xl border px-2 py-1 focus:outline-none font-sm border-transparent leading-relaxed whitespace-pre-wrap ${senderClass} ${className}`}>
      {children}
    </div>
  )
}

export default function ChatPane() {
  const [bubbles, setBubbles] = useState([] as JSX.Element[]);

  const submitText = (value: string) => {
    const userBubble = <ChatBubble fromUser>{value}</ChatBubble>;
    const assistantBubble = <ChatBubble>{faker.lorem.paragraph({min: 3, max: 30})}</ChatBubble>;
    setBubbles([...bubbles, userBubble, assistantBubble])
  }

  return (
    <div className="flex flex-col w-1/2 h-full p-4">
      <ScrollArea className="flex-1 py-4">
        <div className="flex pr-3 flex-col gap-3">
          {bubbles}
        </div>
      </ScrollArea>
      <ChatInput className="text-md" onEnterPress={submitText} />
    </div>
  )
}
