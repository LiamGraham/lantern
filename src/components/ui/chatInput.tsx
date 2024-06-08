"use client"
import React, { useRef, useEffect, useImperativeHandle } from "react";
import { cn } from "~/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ChatInputProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onEnterPress?: (value: string) => void;
}

const ChatInput = React.forwardRef<HTMLTextAreaElement, ChatInputProps>(
  ({ className, onEnterPress, ...props }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);

    const handleInput = () => {
      if (internalRef.current) {
        internalRef.current.style.height = "auto";
        internalRef.current.style.height = `${internalRef.current.scrollHeight}px`;
      }
    };

    const setText = (value: string) => {
      if (internalRef.current) {
        internalRef.current.value = value;
        handleInput();
      }
    }

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        if (onEnterPress && internalRef.current?.value) {
          onEnterPress(internalRef.current?.value ?? "");
          setText("");
        }
      }
    };

    useEffect(() => {
      handleInput();
    }, []);

    useImperativeHandle(ref, () => ({
      ...internalRef.current!,
      focus() {
        internalRef.current?.focus();
      },
      setValue(value: string) {
        setText(value);
      },
    }));

    return (
      <textarea
        className={cn(
          "resize-none overflow-hidden flex min-h-[20px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={internalRef}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        rows={1}
        {...props}
      />
    );
  }
);

ChatInput.displayName = "ChatInput";

export { ChatInput };