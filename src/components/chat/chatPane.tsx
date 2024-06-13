"use client";
import { ScrollArea } from "~/components/ui"
import { useEnterSubmit } from "../../lib/hooks/useEnterSubmit";
import { useChat } from '@ai-sdk/react';
import Textarea from 'react-textarea-autosize'
import { type Message } from "@ai-sdk/react";
import Markdown from 'markdown-to-jsx';
import remarkGfm from 'remark-gfm'
import { Button } from "../ui/button";
import { ReactNode } from "react";

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
    <div className={`self-start bg-gray-300 max-w-full bg-transparent text-secondary-foreground prose dark:prose-invert items-center rounded-2xl border px-2 py-1 focus:outline-none font-sm border-transparent leading-relaxed ${className}`}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        options={{
          overrides: {
            code: {
              props: {
                className: 'text-wrap', // Ensure overlong code lines wrap correctly
              },
            }
          }
        }}
      >
        {content}
      </Markdown>
    </div>
  )
}

function ErrorMessage(props: { className?: string, children: ReactNode }) {
  const { className, children } = props;
  return (
    <div className={`self-end bg-red-900 text-primary-foreground items-center rounded-2xl border px-2 py-1 focus:outline-none font-sm border-transparent leading-relaxed whitespace-pre-wrap ${className}`}>
      {children}
    </div>
  )
}

export default function ChatPane() {
  const { messages, input, error, isLoading, handleInputChange, handleSubmit } = useChat();
  const { formRef, onKeyDown } = useEnterSubmit(!isLoading)

  return (
    <div className="flex flex-col w-full lg:w-1/2 h-full p-4">
      <ScrollArea className="flex-1 py-4">
        <div className="flex pr-3 flex-col gap-3">
          <>
            {messages.map(m => (
              m.role === 'user' ? <UserMessage key={m.id} message={m} /> : <BotMessage key={m.id} message={m} />
            ))}
            {error && <ErrorMessage>An error has occurred. Please try again.</ErrorMessage>}
          </>
        </div>
      </ScrollArea>
      <form
        onSubmit={handleSubmit}
        ref={formRef}
      >
        <div className="flex flex-row gap-2 items-end">
          <Textarea
            className={"resize-none overflow-hidden flex-grow min-h-[20px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"}
            onChange={handleInputChange}
            placeholder="Message Lantern"
            value={input}
            onKeyDown={onKeyDown}
            rows={1}
          />
          <Button type='submit' disabled={isLoading} className={`rounded-full w-9 h-9 transition-all`}>
            ↑
          </Button>
        </div>
      </form>
    </div>
  )
}
