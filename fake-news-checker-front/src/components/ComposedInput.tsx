import React, { useState, useRef, useEffect } from "react";
import { Plus, ArrowRight, Loader2, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { AttachmentPopover } from "./AttachmentPopover";

interface ComposedInputProps {
  className?: string;
  placeholder?: string;
  onSubmit?: (
    value: string,
    attachmentType,
  ) => void,
  helperText?: string;
  error?: boolean;
  errorText?: string;
  disabled?: boolean;
  maxLength?: number;
}

type SubmitState = "idle" | "loading" | "success";

export function ComposedInput({
  className = "",
  placeholder = "O que vamos verificar?",
  onSubmit,
  helperText,
  error = false,
  errorText,
  disabled = false,
  maxLength
}: ComposedInputProps) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [attachmentType, setAttachmentType] = useState<"text" | "link" | "image">("text");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleAttachmentSelect = (type: "text" | "link" | "image") => {
    setPopoverOpen(false);
    setAttachmentType(type);
    if (type === "link") {
      setValue("https://");
    }
    textareaRef.current?.focus();
  };

  const handleSubmit = async () => {
    if (!value.trim() || disabled || error) return;

    setSubmitState("loading");

    try {
      onSubmit?.(value, attachmentType);

      setTimeout(() => {
        setSubmitState("success");
        setTimeout(() => {
          setValue("");
          setSubmitState("idle");
          setAttachmentType("text");
        }, 240);
      }, 200);
    } catch (err) {
      console.error(err);
      setSubmitState('idle')
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 72; // ~3 lines
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [value]);

  const borderColor = error
    ? "var(--m3-error)"
    : isFocused
      ? "var(--m3-primary)"
      : "var(--m3-outline)";

  const containerClasses = `
    flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200
    ${disabled ? "opacity-60 cursor-not-allowed" : ""}
    ${className}
  `;

  return (
    <div className="w-full">
      <div
        className={containerClasses}
        style={{
          backgroundColor: "var(--m3-surface-container)",
          border: `1px solid ${borderColor}`,
          boxShadow: isFocused ? "0 0 0 1px var(--m3-primary)" : "none"
        }}
      >
        {/* Add Button */}
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              disabled={disabled}
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                       transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--m3-primary)]
                       hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: "var(--m3-surface-variant)",
                color: "var(--m3-on-surface-variant)"
              }}
              aria-label="Adicionar anexo"
            >
              <Plus size={20} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="top"
            align="start"
            className="p-0 border-0 bg-transparent shadow-none"
            sideOffset={8}
          >
            <AttachmentPopover
              onSelect={handleAttachmentSelect}
              onClose={() => setPopoverOpen(false)}
            />
          </PopoverContent>
        </Popover>

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          rows={1}
          className="flex-1 bg-transparent border-0 outline-none resize-none overflow-y-auto
                   placeholder:opacity-60 disabled:cursor-not-allowed"
          style={{
            color: "var(--m3-on-surface)",
            minHeight: "24px",
            maxHeight: "72px"
          }}
        />

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={disabled || !value.trim() || error || submitState !== "idle"}
          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                   transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--m3-primary)]
                   hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: "var(--m3-primary)",
            color: "var(--m3-on-primary)"
          }}
          aria-label="Enviar"
        >
          {submitState === "loading" && <Loader2 size={20} className="animate-spin" />}
          {submitState === "success" && <Check size={20} />}
          {submitState === "idle" && <ArrowRight size={20} />}
        </button>
      </div>

      {/* Helper/Error Text */}
      {(helperText || errorText || maxLength) && (
        <div className="flex justify-between items-center mt-2 px-4 text-sm">
          <span
            style={{
              color: error ? "var(--m3-error)" : "var(--m3-on-surface-variant)"
            }}
          >
            {error ? errorText : helperText}
          </span>
          {maxLength && (
            <span
              style={{ color: "var(--m3-on-surface-variant)" }}
              className="text-xs"
            >
              {value.length}/{maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  );
}