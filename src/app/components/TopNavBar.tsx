"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import logoSrc from "public/logo.svg";
import { cx } from "lib/cx";
import { type ShowForm, initialSettings } from "lib/redux/settingsSlice";
import { type Resume } from "lib/redux/types";
import { deepClone } from "lib/deep-clone";
import {
  saveStateToLocalStorage,
  getHasUsedAppBefore,
} from "lib/redux/local-storage";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "lib/redux/hooks";
import { setResume } from "lib/redux/resumeSlice";
import { setSettings } from "lib/redux/settingsSlice";
import { AutoSaveIndicator } from "./AutoSaveIndicator";

export const TopNavBar = () => {
  const pathName = usePathname();
  const isHomePage = pathName === "/";
  const router = useRouter();
  const dispatch = useAppDispatch();

  const onJsonImportClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const resume = deepClone(json) as Resume;

        // Transform skills if it matches the specific format { category: [skill1, skill2] }
        if (json.skills && !Array.isArray(json.skills.descriptions)) {
          const skillsList: string[] = [];
          Object.entries(json.skills).forEach(([category, skills]) => {
            if (Array.isArray(skills)) {
              skillsList.push(`${category}: ${skills.join(", ")}`);
            }
          });
          resume.skills = {
            featuredSkills: [],
            descriptions: skillsList,
          };
        }

        const settings = deepClone(initialSettings);
        if (getHasUsedAppBefore()) {
          const sections = Object.keys(settings.formToShow) as ShowForm[];
          const sectionToFormToShow: Record<ShowForm, boolean> = {
            workExperiences: resume.workExperiences?.length > 0,
            educations: resume.educations?.length > 0,
            projects: resume.projects?.length > 0,
            skills: resume.skills?.descriptions?.length > 0,
            custom: resume.custom?.descriptions?.length > 0,
          };
          for (const section of sections) {
            settings.formToShow[section] = sectionToFormToShow[section];
          }
        }

        saveStateToLocalStorage({ resume, settings });
        dispatch(setResume(resume));
        dispatch(setSettings(settings));
        router.push("/resume-builder");
      } catch (error) {
        console.error("Failed to parse JSON PDF", error);
        alert("Failed to parse JSON file");
      }
    };
    reader.readAsText(file);
  };

  return (
    <header
      aria-label="Site Header"
      className={cx(
        "flex h-[var(--top-nav-bar-height)] items-center border-b-2 border-gray-100 px-3 lg:px-12",
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
              className="rounded-md px-1.5 py-2 text-gray-500 hover:bg-gray-100 focus-visible:bg-gray-100 lg:px-4"
              href={href}
            >
              {text}
            </Link>
          ))}
          <label className="cursor-pointer rounded-md px-1.5 py-2 text-gray-500 hover:bg-gray-100 focus-visible:bg-gray-100 lg:px-4">
            <span>Import JSON</span>
            <input
              type="file"
              className="sr-only"
              accept=".json"
              onChange={onJsonImportClick}
            />
          </label>
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
