"use client";

import { Document, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { fontFamilyOf } from "@/lib/cv/fonts";
import type { CvConfig, CvSection, CvTheme } from "@/lib/cv/types";

function asItems<T extends Record<string, string>>(config: Record<string, unknown>): T[] {
  if (!Array.isArray(config.items)) return [];
  return config.items as T[];
}

function asSkillNames(config: Record<string, unknown>): string[] {
  if (!Array.isArray(config.items)) return [];
  return config.items
    .map((x) => (typeof x === "string" ? x : String((x as { name?: string })?.name ?? "")))
    .filter(Boolean);
}

function asIconIds(config: Record<string, unknown>): string[] {
  if (!Array.isArray(config.items)) return [];
  return config.items.map((x) => String(x ?? "")).filter(Boolean);
}

function boldOf(family: string) {
  if (family === "Helvetica") return "Helvetica-Bold";
  if (family === "Times-Roman") return "Times-Bold";
  if (family === "Courier") return "Courier-Bold";
  return family;
}

function stylesFor(theme: CvTheme, family: string) {
  const bold = boldOf(family);
  const weight = family === "Helvetica" || family === "Courier" ? undefined : 700;
  return StyleSheet.create({
    page: { flexDirection: "row", fontSize: 9, fontFamily: family },
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
    photo: {
      width: 78,
      height: 78,
      borderRadius: 39,
      objectFit: "cover",
      marginBottom: 12,
      alignSelf: "center",
    },
    sideTitle: {
      fontSize: 9,
      letterSpacing: 1.4,
      textTransform: "uppercase",
      color: theme.accent,
      marginBottom: 6,
      marginTop: 12,
      fontFamily: bold,
      fontWeight: weight,
    },
    sideText: { color: theme.sidebarMuted, lineHeight: 1.45, fontSize: 8, fontFamily: family },
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
      fontFamily: family,
    },
    iconRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
    icon: { width: 18, height: 18, marginRight: 7, marginBottom: 7 },
    name: {
      fontSize: 18,
      fontFamily: bold,
      fontWeight: weight,
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
      fontFamily: family,
    },
    contact: { fontSize: 8, color: theme.body, marginBottom: 2, fontFamily: family },
    mainTitle: {
      fontSize: 10,
      letterSpacing: 1.6,
      textTransform: "uppercase",
      color: theme.heading,
      fontFamily: bold,
      fontWeight: weight,
      borderBottomWidth: 1,
      borderBottomColor: theme.heading,
      paddingBottom: 4,
      marginBottom: 10,
      marginTop: 14,
    },
    jobHead: { flexDirection: "row", justifyContent: "space-between" },
    company: {
      fontSize: 9,
      fontFamily: bold,
      fontWeight: weight,
      color: theme.heading,
      textTransform: "uppercase",
    },
    jobRole: { fontSize: 8, color: theme.body, marginTop: 1, fontFamily: family },
    jobMeta: { fontSize: 7.5, color: theme.body, textAlign: "right", fontFamily: family },
    jobDesc: { fontSize: 8, color: theme.body, lineHeight: 1.4, marginTop: 4, marginBottom: 10, fontFamily: family },
    eduTitle: { fontFamily: bold, fontWeight: weight, fontSize: 8, color: theme.sidebarText },
  });
}

function SidebarSection({
  section,
  s,
  accent,
  iconPngs,
}: {
  section: CvSection;
  s: ReturnType<typeof stylesFor>;
  accent: string;
  iconPngs: Record<string, string>;
}) {
  const c = section.config;
  return (
    <View>
      <Text style={s.sideTitle}>{section.title}</Text>
      {section.type === "about" || section.type === "custom" ? (
        <Text style={s.sideText}>{String(c.text ?? "")}</Text>
      ) : null}
      {section.type === "personal"
        ? asItems<{ label: string; value: string }>(c).map((item, i) => (
            <View key={i} style={{ marginBottom: 6 }}>
              <Text style={[s.sideText, { color: accent }]}>{item.label}</Text>
              <Text style={s.sideText}>{item.value}</Text>
            </View>
          ))
        : null}
      {section.type === "links"
        ? asItems<{ label: string; url: string }>(c).map((item, i) => (
            <View key={i} style={{ marginBottom: 5 }}>
              <Text style={s.sideText}>{item.label}</Text>
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
          {asSkillNames(c).map((skill) => (
            <Text key={skill} style={s.chip}>
              {skill}
            </Text>
          ))}
        </View>
      ) : null}
      {section.type === "icons" ? (
        <View style={s.iconRow}>
          {asIconIds(c).map((id) =>
            iconPngs[`${section.id}:${id}`] ? (
              <Image key={id} src={iconPngs[`${section.id}:${id}`]} style={s.icon} />
            ) : null
          )}
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
            <View key={i} style={{ marginBottom: 6, flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={[s.sideText, { flex: 1, textTransform: "uppercase", fontSize: 7 }]}>{item.title}</Text>
              <Text style={[s.sideText, { fontSize: 7 }]}>{item.date}</Text>
            </View>
          ))
        : null}
    </View>
  );
}

function MainSection({
  section,
  s,
  iconPngs,
}: {
  section: CvSection;
  s: ReturnType<typeof stylesFor>;
  iconPngs: Record<string, string>;
}) {
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
      {section.type === "icons" ? (
        <View style={s.iconRow}>
          {asIconIds(c).map((id) =>
            iconPngs[`${section.id}:${id}`] ? (
              <Image key={id} src={iconPngs[`${section.id}:${id}`]} style={s.icon} />
            ) : null
          )}
        </View>
      ) : null}
      {section.type === "about" || section.type === "custom" ? (
        <Text style={s.jobDesc}>{String(c.text ?? "")}</Text>
      ) : null}
    </View>
  );
}

export function CvPdfDocument({
  config,
  iconPngs = {},
}: {
  config: CvConfig;
  iconPngs?: Record<string, string>;
}) {
  const family = fontFamilyOf(config.theme.fontFamily);
  const s = stylesFor(config.theme, family);
  const sidebar = config.sections
    .filter((x) => x.column === "sidebar" && x.visible)
    .sort((a, b) => a.order - b.order);
  const main = config.sections
    .filter((x) => x.column === "main" && x.visible)
    .sort((a, b) => a.order - b.order);
  const h = config.header;
  const photo = h.showPhoto && h.photoDataUrl ? h.photoDataUrl : "";

  return (
    <Document title={h.fullName || config.name} author={h.fullName}>
      <Page size="A4" style={s.page}>
        <View style={s.sidebar}>
          {photo ? <Image src={photo} style={s.photo} /> : null}
          {sidebar.map((section) => (
            <SidebarSection
              key={section.id}
              section={section}
              s={s}
              accent={config.theme.accent}
              iconPngs={iconPngs}
            />
          ))}
        </View>
        <View style={s.main}>
          <Text style={s.name}>{h.fullName}</Text>
          <Text style={s.role}>{h.role}</Text>
          {h.location ? <Text style={s.contact}>{h.location}</Text> : null}
          {h.phone ? <Text style={s.contact}>{h.phone}</Text> : null}
          {h.email ? <Text style={s.contact}>{h.email}</Text> : null}
          {main.map((section) => (
            <MainSection key={section.id} section={section} s={s} iconPngs={iconPngs} />
          ))}
        </View>
      </Page>
    </Document>
  );
}
