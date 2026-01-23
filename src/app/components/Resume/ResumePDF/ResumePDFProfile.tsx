import { View } from "@react-pdf/renderer";
import {
  ResumePDFIcon,
  type IconType,
} from "components/Resume/ResumePDF/common/ResumePDFIcon";
import { styles, spacing } from "components/Resume/ResumePDF/styles";
import {
  ResumePDFLink,
  ResumePDFSection,
  ResumePDFText,
} from "components/Resume/ResumePDF/common";
import type { ResumeProfile } from "lib/redux/types";

export const ResumePDFProfile = ({
  profile,
  themeColor,
  isPDF,
}: {
  profile: ResumeProfile;
  themeColor: string;
  isPDF: boolean;
}) => {
  const { name, email, phone, website, linkedin, github, summary, location } =
    profile;
  const iconProps = { email, phone, location, github, linkedin, website };

  return (
    <ResumePDFSection style={{ marginTop: spacing["4"] }}>
      <ResumePDFText
        bold={true}
        themeColor={themeColor}
        style={{ fontSize: "20pt" }}
      >
        {name}
      </ResumePDFText>
      {summary && (
        <ResumePDFText style={{ textAlign: "justify" }}>{summary}</ResumePDFText>
      )}

      <View
        style={{
          ...styles.flexRowBetween,
          flexWrap: "nowrap",
          marginTop: spacing["0.5"],
        }}
      >
        {Object.entries(iconProps).map(([key, value]) => {
          if (!value) return null;

          let iconType = key as IconType;
          if (key === "website") {
            iconType = "url";
          } else if (key === "github") {
            iconType = "url_github";
          } else if (key === "linkedin") {
            iconType = "url_linkedin";
          }

          const shouldUseLinkWrapper = [
            "email",
            "website",
            "phone",
            "linkedin",
            "github",
          ].includes(key);
          const Wrapper = ({ children }: { children: React.ReactNode }) => {
            if (!shouldUseLinkWrapper) return <>{children}</>;

            let src = "";
            switch (key) {
              case "email": {
                src = `mailto:${value}`;
                break;
              }
              case "phone": {
                src = `tel:${value.replace(/[^\d+]/g, "")}`; // Keep only + and digits
                break;
              }
              default: {
                src = value.startsWith("http") ? value : `https://${value}`;
              }
            }

            return (
              <ResumePDFLink src={src} isPDF={isPDF}>
                {children}
              </ResumePDFLink>
            );
          };

          return (
            <View
              key={key}
              style={{
                ...styles.flexRow,
                alignItems: "center",
                gap: spacing["0.5"],
              }}
            >
              <ResumePDFIcon type={iconType} isPDF={isPDF} />
              <Wrapper>
                <ResumePDFText style={{ fontSize: "8pt" }}>
                  {value}
                </ResumePDFText>
              </Wrapper>
            </View>
          );
        })}
      </View>
    </ResumePDFSection>
  );
};
