"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { LockClosedIcon } from "@heroicons/react/24/solid";

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/** Attempt to parse JSON and return a preview summary of detected sections. */
const getJsonPreview = (
  text: string
): { valid: false } | { valid: true; summary: string[] } => {
  const trimmed = text.trim();
  if (!trimmed) return { valid: false };

  let json: Record<string, unknown>;
  try {
    json = JSON.parse(trimmed);
  } catch {
    return { valid: false };
  }

  if (!json || typeof json !== "object" || Array.isArray(json)) {
    return { valid: false };
  }

  const summary: string[] = [];

  const profile = json.profile as Record<string, string> | undefined;
  if (profile?.name) {
    summary.push(profile.name);
  }

  const workExperiences = json.workExperiences;
  if (Array.isArray(workExperiences) && workExperiences.length > 0) {
    summary.push(
      `${workExperiences.length} work experience${workExperiences.length > 1 ? "s" : ""}`
    );
  }

  const educations = json.educations;
  if (Array.isArray(educations) && educations.length > 0) {
    summary.push(
      `${educations.length} education${educations.length > 1 ? "s" : ""}`
    );
  }

  const projects = json.projects;
  if (Array.isArray(projects) && projects.length > 0) {
    summary.push(
      `${projects.length} project${projects.length > 1 ? "s" : ""}`
    );
  }

  const skills = json.skills;
  if (skills && typeof skills === "object") {
    const s = skills as Record<string, unknown>;
    if (Array.isArray(s.descriptions) && s.descriptions.length > 0) {
      summary.push(`${s.descriptions.length} skill lines`);
    } else {
      const categories = Object.keys(s).length;
      if (categories > 0) {
        summary.push(`${categories} skill categories`);
      }
    }
  }

  return summary.length > 0 ? { valid: true, summary } : { valid: false };
};

export const JsonImportDialog = ({
  isOpen,
  error,
  onClose,
  onImport,
}: {
  isOpen: boolean;
  error: string | null;
  onClose: () => void;
  onImport: (jsonText: string) => void;
}) => {
  const [text, setText] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [mounted, setMounted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const preview = useMemo(() => getJsonPreview(text), [text]);

  // Reset state and animate in when dialog opens; lock body scroll
  useEffect(() => {
    if (isOpen) {
      setText("");
      setFileError(null);
      setFileName(null);
      setMounted(false);
      // Trigger fade-in on next frame
      requestAnimationFrame(() => setMounted(true));
      const id = setTimeout(() => textareaRef.current?.focus(), 80);

      // Lock body scroll
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        clearTimeout(id);
        document.body.style.overflow = prev;
      };
    } else {
      setMounted(false);
    }
  }, [isOpen]);

  // Close on Escape, submit on Ctrl+Enter
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && text.trim()) {
        e.preventDefault();
        onImport(text);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose, onImport, text]);

  // --- File helpers ---

  const loadFile = (file: File) => {
    setFileError(null);

    if (!file.name.endsWith(".json")) {
      setFileError("Only .json files are supported");
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFileError(`File is too large (max ${MAX_FILE_SIZE_MB} MB)`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result !== "string") {
        setFileError("Failed to read file: unexpected content");
        return;
      }
      const cleaned =
        result.charCodeAt(0) === 0xfeff ? result.slice(1) : result;
      setText(cleaned);
      setFileName(file.name);
      setFileError(null);
    };
    reader.onerror = () => {
      console.error("FileReader error:", reader.error);
      setFileError("Failed to read file. Please try again.");
    };
    reader.readAsText(file, "utf-8");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) loadFile(file);
  };

  // --- Drag & drop ---

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  };
  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  };

  // --- Format JSON ---

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(text.trim());
      setText(JSON.stringify(parsed, null, 2));
    } catch {
      // Can't format invalid JSON — do nothing
    }
  };

  const displayError = fileError || error;
  const canFormat = text.trim().length > 0 && preview.valid;

  if (!isOpen) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 ${
        mounted ? "bg-black/40 opacity-100" : "bg-black/0 opacity-0"
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`mx-4 flex w-full max-w-xl flex-col gap-4 rounded-lg bg-white p-6 shadow-xl transition-all duration-200 dark:border dark:border-dark-border dark:bg-dark-bg-secondary ${
          mounted
            ? "scale-100 opacity-100"
            : "scale-95 opacity-0"
        }`}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-fg">
            Import Resume JSON
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-dark-fg"
            aria-label="Close"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Browse file + format row */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-dark-border dark:text-dark-fg-muted dark:hover:bg-dark-bg-tertiary"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            Browse file
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="sr-only"
            accept=".json"
            onChange={handleFileSelect}
          />
          {fileName ? (
            <span className="truncate text-xs text-gray-500 dark:text-dark-fg-muted">
              {fileName}
            </span>
          ) : (
            <span className="text-xs text-gray-400 dark:text-dark-fg-muted">
              drop a file, or paste JSON below
            </span>
          )}
          {canFormat && (
            <button
              onClick={handleFormat}
              className="ml-auto text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
            >
              Format
            </button>
          )}
        </div>

        {/* Textarea with drag-over highlight */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (fileName) setFileName(null);
          }}
          placeholder='{ "profile": { "name": "..." }, "workExperiences": [...], ... }'
          className={`h-64 w-full resize-y rounded-md border p-3 font-mono text-sm text-gray-800 placeholder:text-gray-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 dark:bg-dark-bg dark:text-dark-fg dark:placeholder:text-dark-fg-muted dark:focus:border-sky-500 transition-colors duration-150 ${
            isDragging
              ? "border-sky-400 bg-sky-50 dark:border-sky-500 dark:bg-sky-950/20"
              : "border-gray-300 dark:border-dark-border"
          }`}
          spellCheck={false}
        />

        {/* Live preview */}
        {preview.valid && (
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-gray-500 dark:text-dark-fg-muted">
            <svg
              className="h-3.5 w-3.5 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
            <span>Found:</span>
            {preview.summary.map((item, i) => (
              <span key={i}>
                <span className="font-medium text-gray-700 dark:text-dark-fg">
                  {item}
                </span>
                {i < preview.summary.length - 1 && " · "}
              </span>
            ))}
          </div>
        )}

        {/* Error */}
        {displayError && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {displayError}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <p className="flex items-center text-xs text-gray-400 dark:text-dark-fg-muted">
            <LockClosedIcon className="mr-1 h-3 w-3" />
            Data stays in your browser
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-dark-fg-muted dark:hover:bg-dark-bg-tertiary"
            >
              Cancel
            </button>
            <button
              onClick={() => onImport(text)}
              className="rounded-md bg-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-600 disabled:opacity-50"
              disabled={!text.trim()}
              title="Ctrl+Enter"
            >
              Import
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
