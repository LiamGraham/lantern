"use client";
import { type ReactNode } from "react";
import { DynamicTextarea, ScrollArea } from "~/components/ui"
import { faker } from '@faker-js/faker';

interface ChatBubbleProps {
  className?: string;
  fromUser: boolean;
  children: ReactNode;
}

function ChatBubble(props: ChatBubbleProps) {
  const { children, fromUser, className } = props;
  const senderClass = fromUser ? 'self-end max-w-[66%] bg-primary text-primary-foreground' : 'self-start bg-gray-300 max-w-full bg-transparent text-secondary-foreground';
  return (
    <div className={`items-center rounded-lg border px-1.5 py-1 focus:outline-none font-sm border-transparent leading-relaxed ${senderClass} ${className}`}>
      {children}
    </div>
  )
}

export default function ChatPane() {
  return (
    <div className="flex flex-col w-1/2 h-full p-4">
      <ScrollArea className="flex-1 py-4">
        <div className="flex pr-3 flex-col gap-3">
          {Array.from({ length: 20 }, (_, i) => {
            const isUser = i % 2 == 0;
            return <ChatBubble key={i} fromUser={isUser}>{faker.lorem.sentence({min: 20, max: isUser ? 30 : 150})}</ChatBubble>
          })}
        </div>
      </ScrollArea>
      <DynamicTextarea className="text-md" onEnterPress={() => console.log("Enter")} />
    </div>
  )
}
