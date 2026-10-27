"use client";

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { CvConfig, CvSection, CvTheme } from "@/lib/cv/types";

function asItems<T extends Record<string, string>>(config: Record<string, unknown>): T[] {
  if (!Array.isArray(config.items)) return [];
  return config.items as T[];
}

function asStrings(config: Record<string, unknown>): string[] {
  if (!Array.isArray(config.items)) return [];
  return config.items.map((x) => String(x ?? "")).filter(Boolean);
}

function stylesFor(theme: CvTheme) {
  return StyleSheet.create({
    page: { flexDirection: "row", fontSize: 9, fontFamily: "Helvetica" },
    sidebar: {
      width: "32%",
      backgroundColor: theme.sidebarBg,
      color: theme.sidebarText,
      paddingTop: 28,
      paddingHorizontal: 16,
      paddingBottom: 24,
    },
    main: {
      width: "68%",
      backgroundColor: theme.pageBg,
      paddingTop: 28,
      paddingHorizontal: 22,
      paddingBottom: 24,
    },
    sideTitle: {
      fontSize: 9,
      letterSpacing: 1.4,
      textTransform: "uppercase",
      color: theme.accent,
      marginBottom: 6,
      marginTop: 12,
      fontFamily: "Helvetica-Bold",
    },
    sideText: { color: theme.sidebarMuted, lineHeight: 1.45, fontSize: 8 },
    chipWrap: { flexDirection: "row", flexWrap: "wrap" },
    chip: {
      backgroundColor: theme.chipBg,
      color: theme.chipText,
      fontSize: 6.5,
      letterSpacing: 0.4,
      textTransform: "uppercase",
      paddingVertical: 3,
      paddingHorizontal: 5,
      marginRight: 3,
      marginBottom: 3,
    },
    name: {
      fontSize: 18,
      fontFamily: "Helvetica-Bold",
      color: theme.heading,
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },
    role: {
      fontSize: 10,
      color: theme.heading,
      letterSpacing: 1.6,
      textTransform: "uppercase",
      marginTop: 4,
      marginBottom: 8,
    },
    contact: { fontSize: 8, color: theme.body, marginBottom: 2 },
    mainTitle: {
      fontSize: 10,
      letterSpacing: 1.6,
      textTransform: "uppercase",
      color: theme.heading,
      fontFamily: "Helvetica-Bold",
      borderBottomWidth: 1,
      borderBottomColor: theme.heading,
      paddingBottom: 4,
      marginBottom: 10,
      marginTop: 14,
    },
    jobHead: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
    company: {
      fontSize: 9,
      fontFamily: "Helvetica-Bold",
      color: theme.heading,
      textTransform: "uppercase",
    },
    jobRole: { fontSize: 8, color: theme.body, marginTop: 1 },
    jobMeta: { fontSize: 7.5, color: theme.body, textAlign: "right" },
    jobDesc: { fontSize: 8, color: theme.body, lineHeight: 1.4, marginTop: 4, marginBottom: 10 },
    eduTitle: { fontFamily: "Helvetica-Bold", fontSize: 8, color: theme.sidebarText },
  });
}

function SidebarSection({
  section,
  s,
  accent,
}: {
  section: CvSection;
  s: ReturnType<typeof stylesFor>;
  accent: string;
}) {
  const c = section.config;
  return (
    <View wrap={false}>
      <Text style={s.sideTitle}>{section.title}</Text>
      {section.type === "about" || section.type === "custom" ? (
        <Text style={s.sideText}>{String(c.text ?? "")}</Text>
      ) : null}
      {section.type === "personal"
        ? asItems<{ label: string; value: string }>(c).map((item, i) => (
            <View key={i} style={{ marginBottom: 6 }}>
              <Text style={[s.sideText, { fontFamily: "Helvetica-Bold", color: accent }]}>
                {item.label}
              </Text>
              <Text style={s.sideText}>{item.value}</Text>
            </View>
          ))
        : null}
      {section.type === "links"
        ? asItems<{ label: string; url: string }>(c).map((item, i) => (
            <View key={i} style={{ marginBottom: 5 }}>
              <Text style={[s.sideText, { fontFamily: "Helvetica-Bold" }]}>{item.label}</Text>
              <Text style={s.sideText}>{item.url}</Text>
            </View>
          ))
        : null}
      {section.type === "education"
        ? asItems<{ title: string; place: string; year: string; detail: string }>(c).map((item, i) => (
            <View key={i} style={{ marginBottom: 8 }}>
              <Text style={s.eduTitle}>
                {item.title}
                {item.place ? ` / ${item.place}` : ""}
                {item.year ? ` / ${item.year}` : ""}
              </Text>
              {item.detail ? <Text style={s.sideText}>{item.detail}</Text> : null}
            </View>
          ))
        : null}
      {section.type === "skills" ? (
        <View style={s.chipWrap}>
          {asStrings(c).map((skill) => (
            <Text key={skill} style={s.chip}>
              {skill}
            </Text>
          ))}
        </View>
      ) : null}
      {section.type === "languages"
        ? asItems<{ name: string; level: string }>(c).map((item, i) => (
            <Text key={i} style={[s.sideText, { textTransform: "uppercase", marginBottom: 3 }]}>
              {item.name}
              {item.level ? `  ·  ${item.level}` : ""}
            </Text>
          ))
        : null}
      {section.type === "courses"
        ? asItems<{ title: string; date: string }>(c).map((item, i) => (
            <View key={i} style={{ marginBottom: 6, flexDirection: "row", justifyContent: "space-between", gap: 6 }}>
              <Text style={[s.sideText, { flex: 1, textTransform: "uppercase", fontSize: 7 }]}>{item.title}</Text>
              <Text style={[s.sideText, { fontSize: 7 }]}>{item.date}</Text>
            </View>
          ))
        : null}
    </View>
  );
}

function MainSection({ section, s }: { section: CvSection; s: ReturnType<typeof stylesFor> }) {
  const c = section.config;
  return (
    <View>
      <Text style={s.mainTitle}>{section.title}</Text>
      {section.type === "experience"
        ? asItems<{
            company: string;
            role: string;
            location: string;
            start: string;
            end: string;
            duration: string;
            description: string;
          }>(c).map((job, i) => (
            <View key={i} wrap={false}>
              <View style={s.jobHead}>
                <View style={{ flex: 1 }}>
                  <Text style={s.company}>
                    {job.company}
                    {job.role ? `   ${job.role}` : ""}
                  </Text>
                  {job.location ? <Text style={s.jobRole}>{job.location}</Text> : null}
                </View>
                <View>
                  <Text style={s.jobMeta}>
                    {[job.start, job.end].filter(Boolean).join(" - ")}
                  </Text>
                  {job.duration ? <Text style={s.jobMeta}>{job.duration}</Text> : null}
                </View>
              </View>
              {job.description ? <Text style={s.jobDesc}>{job.description}</Text> : null}
            </View>
          ))
        : null}
      {section.type === "about" || section.type === "custom" ? (
        <Text style={s.jobDesc}>{String(c.text ?? "")}</Text>
      ) : null}
    </View>
  );
}

export function CvPdfDocument({ config }: { config: CvConfig }) {
  const s = stylesFor(config.theme);
  const sidebar = config.sections
    .filter((x) => x.column === "sidebar" && x.visible)
    .sort((a, b) => a.order - b.order);
  const main = config.sections
    .filter((x) => x.column === "main" && x.visible)
    .sort((a, b) => a.order - b.order);
  const h = config.header;

  return (
    <Document title={h.fullName || config.name} author={h.fullName}>
      <Page size="A4" style={s.page}>
        <View style={s.sidebar}>
          {sidebar.map((section) => (
            <SidebarSection key={section.id} section={section} s={s} accent={config.theme.accent} />
          ))}
        </View>
        <View style={s.main}>
          <Text style={s.name}>{h.fullName}</Text>
          <Text style={s.role}>{h.role}</Text>
          {h.location ? <Text style={s.contact}>{h.location}</Text> : null}
          {h.phone ? <Text style={s.contact}>{h.phone}</Text> : null}
          {h.email ? <Text style={s.contact}>{h.email}</Text> : null}
          {main.map((section) => (
            <MainSection key={section.id} section={section} s={s} />
          ))}
        </View>
      </Page>
    </Document>
  );
}
