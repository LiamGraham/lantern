"use client"
import React, { useRef, useEffect, useImperativeHandle } from "react";
import { cn } from "~/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface DynamicTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onEnterPress?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const DynamicTextarea = React.forwardRef<HTMLTextAreaElement, DynamicTextareaProps>(
  ({ className, onEnterPress, ...props }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);

    const handleInput = () => {
      if (internalRef.current) {
        internalRef.current.style.height = "auto";
        internalRef.current.style.height = `${internalRef.current.scrollHeight}px`;
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        if (onEnterPress) {
          onEnterPress(event);
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
      setValue(val: string) {
        if (internalRef.current) {
          internalRef.current.value = val;
          handleInput();
        }
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

DynamicTextarea.displayName = "DynamicTextarea";

export { DynamicTextarea };