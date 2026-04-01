"use client";
import { useEffect } from "react";
import { useSetDefaultScale } from "components/Resume/hooks";
import {
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { usePDF } from "@react-pdf/renderer";
import dynamic from "next/dynamic";
import { useAppDispatch } from "lib/redux/hooks";
import { setResume, initialResumeState } from "lib/redux/resumeSlice";

const ResumeControlBar = ({
  scale,
  setScale,
  documentSize,
  document,
  fileName,
}: {
  scale: number;
  setScale: (scale: number) => void;
  documentSize: string;
  document: JSX.Element;
  fileName: string;
}) => {
  const { scaleOnResize, setScaleOnResize } = useSetDefaultScale({
    setScale,
    documentSize,
  });

  const [instance, update] = usePDF({ document });
  const dispatch = useAppDispatch();

  // Hook to update pdf when document changes
  useEffect(() => {
    update();
  }, [update, document]);

  return (
    <div className="sticky bottom-0 left-0 right-0 flex h-[var(--resume-control-bar-height)] items-center justify-center px-[var(--resume-padding)] text-gray-600 dark:text-dark-fg-muted lg:justify-between bg-white dark:bg-dark-bg-secondary">
      <div className="flex items-center gap-2">
        <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
        <input
          type="range"
          min={0.5}
          max={1.5}
          step={0.01}
          value={scale}
          onChange={(e) => {
            setScaleOnResize(false);
            setScale(Number(e.target.value));
          }}
        />
        <div className="w-10">{`${Math.round(scale * 100)}%`}</div>
        <label className="hidden items-center gap-1 lg:flex">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4"
            checked={scaleOnResize}
            onChange={() => setScaleOnResize((prev) => !prev)}
          />
          <span className="select-none">Autoscale</span>
        </label>
      </div>
      <div className="flex items-center gap-2">
        <a
          className="ml-1 flex items-center gap-1 rounded-md border border-gray-300 dark:border-dark-border px-3 py-0.5 hover:bg-gray-100 dark:hover:bg-dark-bg-tertiary lg:ml-8"
          href={instance.url!}
          download={fileName}
        >
          <ArrowDownTrayIcon className="h-4 w-4" />
          <span className="whitespace-nowrap">Download Resume</span>
        </a>
        <button
          className="flex items-center gap-1 rounded-md border border-red-500 bg-red-500 px-3 py-0.5 text-white hover:bg-red-600 hover:text-white"
          onClick={() => {
            if (confirm("Are you sure you want to clear all data?")) {
              dispatch(setResume(initialResumeState));
            }
          }}
        >
          <TrashIcon className="h-4 w-4" />
          <span className="whitespace-nowrap">Clear</span>
        </button>
      </div>
    </div>
  );
};

/**
 * Load ResumeControlBar client side since it uses usePDF, which is a web specific API
 */
export const ResumeControlBarCSR = dynamic(
  () => Promise.resolve(ResumeControlBar),
  {
    ssr: false,
  }
);

export const ResumeControlBarBorder = () => (
  <div className="absolute bottom-[var(--resume-control-bar-height)] w-full border-t-2 border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg" />
);
