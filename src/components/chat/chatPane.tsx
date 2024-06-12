"use client";
import { ScrollArea } from "~/components/ui"
import { useEnterSubmit } from "../../lib/hooks/useEnterSubmit";
import { useChat } from '@ai-sdk/react';
import Textarea from 'react-textarea-autosize'
import { type Message } from "@ai-sdk/react";
import { type ReactNode } from "react";

interface ChatBubbleProps {
  className?: string;
  role: Message['role'];
  children: ReactNode;
}

function ChatBubble(props: ChatBubbleProps) {
  const { className, role, children } = props;
  const senderClass = role === 'user' ? 'self-end max-w-[55%] bg-primary text-primary-foreground' : 'self-start bg-gray-300 max-w-full bg-transparent text-secondary-foreground';
  return (
    <div className={`items-center rounded-2xl border px-2 py-1 focus:outline-none font-sm border-transparent leading-relaxed whitespace-pre-wrap ${senderClass} ${className}`}>
      {children}
    </div>
  )
}

export default function ChatPane() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const { formRef, onKeyDown } = useEnterSubmit()
  return (
    <div className="flex flex-col w-1/2 h-full p-4">
      <ScrollArea className="flex-1 py-4">
        <div className="flex pr-3 flex-col gap-3">
          {messages.map(m => (
            <ChatBubble key={m.id} role={m.role}>
              {m.content}
            </ChatBubble>
          ))}
        </div>
      </ScrollArea>
      <form
        onSubmit={handleSubmit}
        ref={formRef}
      >
        <Textarea
          className={"resize-none overflow-hidden flex min-h-[20px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"}
          onChange={handleInputChange}
          placeholder="Message Lantern"
          value={input}
          onKeyDown={onKeyDown}
          rows={1}
        />
      </form>
    </div>
  )
}
