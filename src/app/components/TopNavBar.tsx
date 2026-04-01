"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import logoSrc from "public/logo.svg";
import { cx } from "lib/cx";
import { useJsonImport } from "lib/hooks/useJsonImport";
import { JsonImportDialog } from "./JsonImportDialog";
import { AutoSaveIndicator } from "./AutoSaveIndicator";
import { ThemeToggle } from "./ThemeToggle";

export const TopNavBar = () => {
  const pathName = usePathname();
  const isHomePage = pathName === "/";

  const { isOpen, error, openDialog, closeDialog, importJson } =
    useJsonImport();

  return (
    <header
      aria-label="Site Header"
      className={cx(
        "flex h-[var(--top-nav-bar-height)] items-center border-b-2 border-gray-100 dark:border-dark-border px-3 lg:px-12 bg-white dark:bg-dark-bg-secondary",
        isHomePage && "bg-dot"
      )}
    >
      <div className="flex h-10 w-full items-center justify-between">
        <Link href="/">
          <span className="sr-only">OpenResume</span>
          <Image
            src={logoSrc}
            alt="OpenResume Logo"
            className="h-8 w-full"
            priority
          />
        </Link>
        <nav
          aria-label="Site Nav Bar"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <AutoSaveIndicator />
          {[
            ["/resume-builder", "Builder"],
            ["/resume-parser", "Parser"],
          ].map(([href, text]) => (
            <Link
              key={text}
              className="rounded-md px-1.5 py-2 text-gray-500 dark:text-dark-fg-muted hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary focus-visible:bg-gray-100 dark:focus-visible:bg-dark-bg-tertiary lg:px-4"
              href={href}
            >
              {text}
            </Link>
          ))}
          <button
            onClick={openDialog}
            className="cursor-pointer rounded-md px-1.5 py-2 text-gray-500 dark:text-dark-fg-muted hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary focus-visible:bg-gray-100 dark:focus-visible:bg-dark-bg-tertiary lg:px-4"
          >
            Import JSON
          </button>
          <JsonImportDialog
            isOpen={isOpen}
            error={error}
            onClose={closeDialog}
            onImport={importJson}
          />
          <ThemeToggle />
          <div className="ml-1 mt-1">
            <iframe
              src="https://ghbtns.com/github-btn.html?user=xitanggg&repo=open-resume&type=star&count=true"
              width="100"
              height="20"
              className="overflow-hidden border-none"
              title="GitHub"
            />
          </div>
        </nav>
      </div>
    </header>
  );
};
