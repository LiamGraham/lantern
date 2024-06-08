"use client";
import { type ReactNode } from "react";
import { DynamicTextarea, ScrollArea } from "~/components/ui"

interface ChatBubbleProps {
  className?: string;
  fromUser: boolean;
  children: ReactNode;
}

function ChatBubble(props: ChatBubbleProps) {
  const { children, fromUser, className } = props;
  const alignmentClass = fromUser ? 'self-end bg-blue-500 text-white max-w-[66%]' : 'self-start bg-gray-300 max-w-full text-black';
  return (
    <div className={`items-center rounded-lg border px-1.5 py-1 text-xs focus:outline-none border-transparent bg-primary text-primary-foreground ${alignmentClass} ${className}`}>
      {children}
    </div>
  )
}

export default function ChatPane() {
  return (
    <div className="flex flex-col w-full h-full p-4">
      <ScrollArea className="flex-1 py-4 space-y-4">
        <div className="flex pr-3 flex-col gap-3">
          <ChatBubble fromUser={true}>This is some text (1)</ChatBubble>
          <ChatBubble fromUser={false}>This is some text</ChatBubble>
          <ChatBubble fromUser={true}>This is some text</ChatBubble>
          <ChatBubble fromUser={false}>This is some text</ChatBubble>
          <ChatBubble fromUser={true}>This is some text</ChatBubble>
          <ChatBubble fromUser={false}>This is some text</ChatBubble>
          <ChatBubble fromUser={true}>This is some text</ChatBubble>
          <ChatBubble fromUser={false}>This is some text</ChatBubble>
          <ChatBubble fromUser={true}>This is some text</ChatBubble>
          <ChatBubble fromUser={false}>This is some text</ChatBubble>
          <ChatBubble fromUser={true}>This is some text</ChatBubble>
          <ChatBubble fromUser={false}>This is some text</ChatBubble>
          <ChatBubble fromUser={true}>This is some text</ChatBubble>
          <ChatBubble fromUser={false}>This is some text</ChatBubble>
          <ChatBubble fromUser={true}>This is some text</ChatBubble>
          <ChatBubble fromUser={false}>This is some text</ChatBubble>
          <ChatBubble fromUser={true}>This is some text</ChatBubble>
          <ChatBubble fromUser={false}>This is some text</ChatBubble>
          <ChatBubble fromUser={true}>This is some text</ChatBubble>
          <ChatBubble fromUser={false}>This is some text</ChatBubble>
          <ChatBubble fromUser={true}>This is some text</ChatBubble>
          <ChatBubble fromUser={false}>This is some text</ChatBubble>
          <ChatBubble fromUser={true}>This is some text</ChatBubble>
          <ChatBubble fromUser={false}>This is some text</ChatBubble>
          <ChatBubble fromUser={true}>This is some text</ChatBubble>
          <ChatBubble fromUser={false}>This is some text</ChatBubble>
          <ChatBubble fromUser={true}>This is some text</ChatBubble>
          <ChatBubble fromUser={false}>This is some text</ChatBubble>
          <ChatBubble fromUser={true}>This is some text</ChatBubble>
          <ChatBubble fromUser={false}>This is some text</ChatBubble>
          <ChatBubble fromUser={true}>This is some text</ChatBubble>
          <ChatBubble fromUser={false}>This is some text</ChatBubble>
          <ChatBubble fromUser={true}>This is some text</ChatBubble>
          <ChatBubble fromUser={false}>This is some text</ChatBubble>
          <ChatBubble fromUser={true}>This is some text</ChatBubble>
          <ChatBubble fromUser={false}>This is some text</ChatBubble>
          <ChatBubble fromUser={true}>This is some text</ChatBubble>
          <ChatBubble fromUser={false}>This is some text</ChatBubble>
          <ChatBubble fromUser={true}>This is some text</ChatBubble>
          <ChatBubble fromUser={false}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin vel neque cursus, mollis est ac, ultrices justo. In orci diam, vestibulum non bibendum et, egestas ac arcu. Curabitur aliquet eleifend ex, sed ullamcorper purus dapibus at. Phasellus convallis ac risus eu convallis. Ut nibh augue, elementum in metus a, viverra vehicula quam. Praesent sit amet tellus aliquam felis placerat placerat. Ut blandit rutrum erat nec dignissim.

            Integer vel tempus velit. Pellentesque ac risus condimentum, consectetur lacus in, facilisis sem. Nulla ac ligula lacinia, pretium purus sit amet, sagittis massa. Praesent ut ligula vestibulum, aliquam nulla non, placerat arcu. Nullam sagittis hendrerit elit, sit amet ornare lectus mattis eget. Fusce eu nisi a justo interdum aliquet. Proin at orci interdum, ullamcorper sapien eget, vehicula nisl. Etiam a aliquam nibh, eu sodales odio. Quisque euismod feugiat nisl, sit amet lobortis tortor. Mauris mattis nulla dui, eget tristique elit consectetur sed. Donec eleifend feugiat nibh, non dapibus quam dapibus non. Pellentesque rutrum eget lectus rutrum iaculis. Aliquam sodales ex sit amet rutrum lobortis. Curabitur mattis malesuada orci, sit amet tincidunt ante blandit non. Etiam hendrerit velit nec ligula vestibulum, sed dignissim eros tempor. Suspendisse nec nunc lectus.
          </ChatBubble>
        </div>
      </ScrollArea>
      <DynamicTextarea onEnterPress={() => console.log("Enter")} />
    </div>
  )
}
