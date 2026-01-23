"use client";
import { getHasUsedAppBefore } from "lib/redux/local-storage";
import { ResumeDropzone } from "components/ResumeDropzone";
import { useState, useEffect } from "react";
import { type ShowForm, initialSettings } from "lib/redux/settingsSlice";
import { type Resume } from "lib/redux/types";
import { deepClone } from "lib/deep-clone";
import { saveStateToLocalStorage } from "lib/redux/local-storage";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppDispatch } from "lib/redux/hooks";
import { setResume } from "lib/redux/resumeSlice";
import { setSettings } from "lib/redux/settingsSlice";

export default function ImportResume() {
  const [hasUsedAppBefore, setHasUsedAppBefore] = useState(false);
  const [hasAddedResume, setHasAddedResume] = useState(false);
  const onFileUrlChange = (fileUrl: string) => {
    setHasAddedResume(Boolean(fileUrl));
  };

  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    setHasUsedAppBefore(getHasUsedAppBefore());
  }, []);

  const onJsonImportClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const resume = deepClone(json) as Resume;

        // Transform skills if it matches the specific format { category: [skill1, skill2] }
        // We check if 'skills' exists and is not the standard ResumeSkills structure (which has descriptions array)
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
    <main>
      <div className="mx-auto mt-14 max-w-3xl rounded-md border border-gray-200 px-10 py-10 text-center shadow-md">
        {!hasUsedAppBefore ? (
          <>
            <h1 className="text-lg font-semibold text-gray-900">
              Import data from an existing resume
            </h1>
            <div className="mx-auto mt-4 max-w-sm">
              <label className="flex cursor-pointer items-center justify-center rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90">
                <span>Import from JSON</span>
                <input
                  type="file"
                  className="sr-only"
                  accept=".json"
                  onChange={onJsonImportClick}
                />
              </label>
            </div>
            <div className="my-4 text-gray-500">Or import from PDF</div>
            <ResumeDropzone
              onFileUrlChange={onFileUrlChange}
              className="mt-5"
            />
            {!hasAddedResume && (
              <>
                <OrDivider />
                <SectionWithHeadingAndCreateButton
                  heading="Don't have a resume yet?"
                  buttonText="Create from scratch"
                />
              </>
            )}
          </>
        ) : (
          <>
            {!hasAddedResume && (
              <>
                <SectionWithHeadingAndCreateButton
                  heading="You have data saved in browser from prior session"
                  buttonText="Continue where I left off"
                />
                <OrDivider />
              </>
            )}
            <h1 className="font-semibold text-gray-900">
              Override data with a new resume
            </h1>
            <div className="mx-auto mt-4 max-w-sm">
              <label className="flex cursor-pointer items-center justify-center rounded-full bg-primary px-6 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90">
                <span>Import from JSON</span>
                <input
                  type="file"
                  className="sr-only"
                  accept=".json"
                  onChange={onJsonImportClick}
                />
              </label>
            </div>
            <div className="my-4 text-gray-500">Or import from PDF</div>
            <ResumeDropzone
              onFileUrlChange={onFileUrlChange}
              className="mt-5"
            />
          </>
        )}
      </div>
    </main>
  );
}

const OrDivider = () => (
  <div className="mx-[-2.5rem] flex items-center pb-6 pt-8" aria-hidden="true">
    <div className="flex-grow border-t border-gray-200" />
    <span className="mx-2 mt-[-2px] flex-shrink text-lg text-gray-400">or</span>
    <div className="flex-grow border-t border-gray-200" />
  </div>
);

const SectionWithHeadingAndCreateButton = ({
  heading,
  buttonText,
}: {
  heading: string;
  buttonText: string;
}) => {
  return (
    <>
      <p className="font-semibold text-gray-900">{heading}</p>
      <div className="mt-5">
        <Link
          href="/resume-builder"
          className="outline-theme-blue rounded-full bg-sky-500 px-6 pb-2 pt-1.5 text-base font-semibold text-white"
        >
          {buttonText}
        </Link>
      </div>
    </>
  );
};
