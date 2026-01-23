"use client";
import React, { useState, useEffect, useRef } from "react";
import { store } from "lib/redux/store";
import { CloudIcon, CheckIcon } from "@heroicons/react/24/outline";

type SaveStatus = "idle" | "saving" | "saved";

export const AutoSaveIndicator = () => {
    const [status, setStatus] = useState<SaveStatus>("idle");
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const unsubscribe = store.subscribe(() => {
            // Clear existing timeout to debounce
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            setStatus("saving");

            // Set timeout to transition to 'saved'
            timeoutRef.current = setTimeout(() => {
                setStatus("saved");

                // Set another timeout to transition back to 'idle'
                timeoutRef.current = setTimeout(() => {
                    setStatus("idle");
                }, 2000);
            }, 1000);
        });

        return () => {
            unsubscribe();
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    if (status === "idle") return null;

    return (
        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-opacity duration-300">
            {status === "saving" ? (
                <>
                    <CloudIcon className="h-5 w-5 animate-pulse" />
                    <span>Saving...</span>
                </>
            ) : (
                <>
                    <CheckIcon className="h-5 w-5 text-green-600" />
                    <span className="text-green-600">Saved</span>
                </>
            )}
        </div>
    );
};
