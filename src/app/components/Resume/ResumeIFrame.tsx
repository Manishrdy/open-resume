"use client";
import React, { useMemo } from "react";
import {
  A4_HEIGHT_PX,
  A4_WIDTH_PX,
  LETTER_HEIGHT_PX,
  LETTER_WIDTH_PX,
} from "lib/constants";
import dynamic from "next/dynamic";
import { getAllFontFamiliesToLoad } from "components/fonts/lib";

const getFontFaces = () => {
  const allFontFamilies = getAllFontFamiliesToLoad();
  return allFontFamilies
    .map(
      (font) =>
        `@font-face {font-family: "${font}"; src: url("/fonts/${font}-Regular.ttf");}
         @font-face {font-family: "${font}"; src: url("/fonts/${font}-Bold.ttf"); font-weight: bold;}`
    )
    .join("");
};

/**
 * ResumeIframe (now a Div) displays the resume content scaled down.
 * We removed the iframe to allow content to naturally scroll and expand.
 */
const ResumeIframe = ({
  documentSize,
  scale,
  children,
  enablePDFViewer = false,
}: {
  documentSize: string;
  scale: number;
  children: React.ReactNode;
  enablePDFViewer?: boolean;
}) => {
  const isA4 = documentSize === "A4";
  const fontFaces = useMemo(() => getFontFaces(), []);

  if (enablePDFViewer) {
    return (
      <DynamicPDFViewer className="h-full w-full">
        {children as any}
      </DynamicPDFViewer>
    );
  }
  const width = isA4 ? A4_WIDTH_PX : LETTER_WIDTH_PX;
  const height = isA4 ? A4_HEIGHT_PX : LETTER_HEIGHT_PX;

  return (
    <div
      style={{
        maxWidth: `${width * scale}px`,
      }}
    >
      <style>{fontFaces}</style>
      <div
        style={{
          width: `${width}px`,
          minHeight: `${height}px`,
          transform: `scale(${scale})`,
        }}
        className={`origin-top-left bg-white shadow-lg`}
      >
        {children}
      </div>
    </div>
  );
};

export const ResumeIframeCSR = dynamic(() => Promise.resolve(ResumeIframe), {
  ssr: false,
});

const DynamicPDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((module) => module.PDFViewer),
  {
    ssr: false,
  }
);
