"use client";
import { ScrollArea } from "~/components/ui"
import { useEnterSubmit } from "../../lib/hooks/useEnterSubmit";
import { useChat } from '@ai-sdk/react';
import Textarea from 'react-textarea-autosize'
import { type Message } from "@ai-sdk/react";
import Markdown from 'markdown-to-jsx';
import remarkGfm from 'remark-gfm'

interface ChatMessageProps {
  className?: string;
  message: Message;
}

function UserMessage(props: ChatMessageProps) {
  const { className, message } = props;
  const { content } = message;
  return (
    <div className={`self-end max-w-[55%] bg-primary text-primary-foreground items-center rounded-2xl border px-2 py-1 focus:outline-none font-sm border-transparent leading-relaxed whitespace-pre-wrap ${className}`}>
      {content}
    </div>
  )
}

function BotMessage(props: ChatMessageProps) {
  const { className, message } = props;
  const { content } = message;
  return (
    <div className={`self-start bg-gray-300 max-w-full bg-transparent text-secondary-foreground prose dark:prose-invert items-center rounded-2xl border px-2 py-1 focus:outline-none font-sm border-transparent leading-relaxed whitespace-pre-wrap ${className}`}>
      <Markdown
        remarkPlugins={[remarkGfm]}
      >
        {content}
      </Markdown>
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
            m.role === 'user' ? <UserMessage key={m.id} message={m}/> : <BotMessage key={m.id} message={m}/>
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
