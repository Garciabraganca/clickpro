"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "./ThemeProvider";

type ThemeOption = {
  value: "light" | "dark";
  label: string;
  icon: string;
};

const OPTIONS: ThemeOption[] = [
  { value: "light", label: "Claro", icon: "☀️" },
  { value: "dark", label: "Escuro", icon: "🌙" },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const currentIcon = theme === "dark" ? "🌙" : "☀️";

  return (
    <div className="theme-menu" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        className="theme-toggle"
        title="Selecionar tema"
        aria-label="Selecionar tema"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="theme-toggle-emoji" aria-hidden="true">
          {currentIcon}
        </span>
      </button>

      {open && (
        <div role="menu" aria-label="Tema" className="theme-dropdown">
          {OPTIONS.map((option) => {
            const isActive = option.value === theme;

            return (
              <button
                key={option.value}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                onClick={() => {
                  setTheme(option.value);
                  setOpen(false);
                }}
                className={`theme-option ${isActive ? "active" : ""}`}
              >
                <span aria-hidden="true">{option.icon}</span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
