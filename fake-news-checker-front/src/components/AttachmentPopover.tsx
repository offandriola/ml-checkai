import React from "react"
import { Type, Link as LinkIcon, Image } from "lucide-react";

interface AttachmentPopoverProps {
  onSelect: (type: "text" | "link" | "image") => void;
  onClose: () => void;
}

export function AttachmentPopover({ onSelect, onClose }: AttachmentPopoverProps) {
  const options = [
    { type: "text" as const, icon: Type, label: "Texto" },
    { type: "link" as const, icon: LinkIcon, label: "Link" },
    { type: "image" as const, icon: Image, label: "Imagem" }
  ];

  const handleKeyDown = (e: React.KeyboardEvent, type: "text" | "link" | "image") => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(type);
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      role="menu"
      className="min-w-[240px] rounded-xl p-3 shadow-lg"
      style={{
        backgroundColor: "var(--m3-surface-container-high)",
        border: "1px solid var(--m3-outline)"
      }}
    >
      {options.map((option, index) => {
        const Icon = option.icon;
        return (
          <button
            key={option.type}
            role="menuitem"
            tabIndex={0}
            onClick={() => onSelect(option.type)}
            onKeyDown={(e) => handleKeyDown(e, option.type)}
            autoFocus={index === 0}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-150
                     hover:bg-white/8 focus:outline-none focus:ring-2 focus:ring-[var(--m3-primary)]
                     active:bg-[var(--m3-primary-container)]"
            style={{ color: "var(--m3-on-surface)" }}
          >
            <Icon size={20} style={{ color: "var(--m3-on-surface-variant)" }} />
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
