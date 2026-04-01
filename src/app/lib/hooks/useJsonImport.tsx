import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "lib/redux/hooks";
import { setResume, initialResumeState } from "lib/redux/resumeSlice";
import {
  setSettings,
  initialSettings,
  type ShowForm,
} from "lib/redux/settingsSlice";
import {
  getHasUsedAppBefore,
  saveStateToLocalStorage,
} from "lib/redux/local-storage";
import { store } from "lib/redux/store";
import { deepMerge } from "lib/deep-merge";
import type { Resume } from "lib/redux/types";

/**
 * Validates that the parsed JSON has the basic shape of a Resume.
 * Returns an error message if invalid, or null if valid.
 */
const validateResumeJson = (json: unknown): string | null => {
  if (!json || typeof json !== "object" || Array.isArray(json)) {
    return "Input does not contain a valid JSON object";
  }

  const obj = json as Record<string, unknown>;

  if (!obj.profile || typeof obj.profile !== "object") {
    return "Missing or invalid 'profile' section";
  }

  const arraySections = ["workExperiences", "educations", "projects"] as const;
  for (const section of arraySections) {
    if (obj[section] !== undefined && !Array.isArray(obj[section])) {
      return `'${section}' must be an array`;
    }
  }

  if (obj.skills !== undefined && typeof obj.skills !== "object") {
    return "'skills' must be an object";
  }

  return null;
};

/**
 * Transforms legacy skill formats (e.g., { category: [skill1, skill2] })
 * into the standard ResumeSkills structure.
 */
const transformSkills = (
  json: Record<string, unknown>
): Resume["skills"] | null => {
  if (!json.skills || typeof json.skills !== "object") return null;

  const skills = json.skills as Record<string, unknown>;
  if (Array.isArray(skills.descriptions)) return null;

  const skillsList: string[] = [];
  Object.entries(skills).forEach(([category, values]) => {
    if (Array.isArray(values)) {
      skillsList.push(`${category}: ${values.join(", ")}`);
    }
  });

  return {
    featuredSkills: [],
    descriptions: skillsList,
  };
};

/**
 * Shared hook for importing a resume from pasted JSON text.
 * Exposes dialog open/close state and an import handler.
 */
export const useJsonImport = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openDialog = useCallback(() => {
    setError(null);
    setIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setError(null);
    setIsOpen(false);
  }, []);

  const importJson = useCallback(
    (jsonText: string) => {
      setError(null);

      const trimmed = jsonText.trim();
      if (!trimmed) {
        setError("Please paste your resume JSON");
        return;
      }

      let json: unknown;
      try {
        json = JSON.parse(trimmed);
      } catch {
        setError("Invalid JSON — check for missing commas or brackets");
        return;
      }

      const validationError = validateResumeJson(json);
      if (validationError) {
        setError(validationError);
        return;
      }

      try {
        const jsonObj = json as Record<string, unknown>;

        const transformedSkills = transformSkills(jsonObj);
        if (transformedSkills) {
          jsonObj.skills = transformedSkills;
        }

        const resume = deepMerge(
          structuredClone(initialResumeState),
          jsonObj
        ) as Resume;

        const settings = structuredClone(initialSettings);
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

        dispatch(setResume(resume));
        dispatch(setSettings(settings));
        saveStateToLocalStorage(store.getState());
        setIsOpen(false);
        router.push("/resume-builder");
      } catch (error) {
        console.error("Failed to import resume:", error);
        setError(
          "Failed to import — the JSON structure doesn't match the expected resume format"
        );
      }
    },
    [dispatch, router]
  );

  return { isOpen, error, openDialog, closeDialog, importJson };
};
