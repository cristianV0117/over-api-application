"use client";

import {
  Circle,
  Defs,
  Document,
  G,
  Image,
  LinearGradient,
  Link,
  Page,
  Path,
  Rect,
  Stop,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import { formatDateRange, jobDuration } from "@/lib/cv/dates";
import { fontFamilyOf } from "@/lib/cv/fonts";
import type { CvConfig, CvSection, CvTheme } from "@/lib/cv/types";

function asItems<T>(config: Record<string, unknown>): T[] {
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

function asTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((x) => String(x ?? "").trim()).filter(Boolean);
}

function chunk2<T>(items: T[]): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));
  return rows;
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
    page: {
      fontSize: 9,
      fontFamily: family,
      paddingTop: 40,
      paddingBottom: 52,
      paddingRight: 22,
      paddingLeft: "32%",
      backgroundColor: theme.pageBg,
    },
    sidebarBg: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: "32%",
      backgroundColor: theme.sidebarBg,
    },
    sidebar: {
      position: "absolute",
      left: 0,
      top: 0,
      width: "32%",
      paddingTop: 40,
      paddingHorizontal: 16,
      paddingBottom: 52,
      color: theme.sidebarText,
    },
    main: {
      paddingLeft: 22,
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
    tagChip: {
      borderWidth: 0.6,
      borderColor: theme.heading,
      color: theme.heading,
      fontSize: 6.5,
      letterSpacing: 0.3,
      textTransform: "uppercase",
      paddingVertical: 2,
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
    contactRow: { flexDirection: "row", alignItems: "center", marginBottom: 3 },
    contact: { fontSize: 8, color: theme.body, fontFamily: family },
    contactIcon: { width: 11, height: 11, marginRight: 5 },
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
    jobHead: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
    jobRoleTitle: {
      fontSize: 9.5,
      fontFamily: bold,
      fontWeight: weight,
      color: theme.heading,
    },
    company: {
      fontSize: 8,
      color: theme.body,
      marginTop: 1,
      fontFamily: family,
    },
    jobRole: { fontSize: 8, color: theme.body, marginTop: 1, fontFamily: family },
    jobMeta: { fontSize: 7.5, color: theme.body, textAlign: "right", fontFamily: family },
    jobDesc: { fontSize: 8, color: theme.body, lineHeight: 1.4, marginTop: 5, fontFamily: family },
    jobBlock: { marginBottom: 4 },
    timeline: { flexDirection: "row", alignItems: "stretch" },
    timelineCol: { width: 12, alignItems: "center" },
    timelineDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.heading,
      marginTop: 2,
    },
    timelineLine: {
      width: 1.3,
      flexGrow: 1,
      backgroundColor: "#B4BAC3",
      marginTop: 3,
      minHeight: 12,
    },
    jobBody: { flex: 1, paddingLeft: 9, paddingBottom: 16 },
    projectRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    projectCard: {
      width: "48%",
    },
    projectShot: {
      width: "100%",
      height: 72,
      objectFit: "cover",
      marginTop: 4,
      marginBottom: 3,
    },
    projectName: {
      fontSize: 8,
      fontFamily: bold,
      fontWeight: weight,
      color: theme.heading,
      textTransform: "uppercase",
    },
    projectDesc: {
      fontSize: 7,
      color: theme.body,
      lineHeight: 1.3,
      marginTop: 3,
      fontFamily: family,
    },
    eduTitle: { fontFamily: bold, fontWeight: weight, fontSize: 8, color: theme.sidebarText },
    link: { fontSize: 7.5, color: theme.heading, textDecoration: "none", marginTop: 2, fontFamily: family },
  });
}

function RoundIcon({
  kind,
  color,
  size = 11,
}: {
  kind: "phone" | "email" | "pin";
  color: string;
  size?: number;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="12" fill={color} />
      {kind === "phone" ? (
        <G transform="translate(4.6 4.4) scale(0.62)">
          <Path
            fill="#FFFFFF"
            d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.2 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V21c0 .6-.4 1-1 1C10.6 22 2 13.4 2 2.9 2 2.4 2.4 2 3 2h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8z"
          />
        </G>
      ) : null}
      {kind === "email" ? (
        <G>
          <Path
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.7"
            d="M5.4 8.2h13.2v8.2H5.4V8.2z"
          />
          <Path
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.7"
            d="M5.4 8.2l6.6 4.6 6.6-4.6"
          />
        </G>
      ) : null}
      {kind === "pin" ? (
        <Path
          fill="#FFFFFF"
          d="M12 5.2c-2.3 0-4.2 1.8-4.2 4.1 0 3.1 4.2 9.5 4.2 9.5s4.2-6.4 4.2-9.5c0-2.3-1.9-4.1-4.2-4.1zm0 5.6a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"
        />
      ) : null}
    </Svg>
  );
}

function ContactLine({
  kind,
  text,
  color,
  s,
}: {
  kind: "phone" | "email" | "pin";
  text: string;
  color: string;
  s: ReturnType<typeof stylesFor>;
}) {
  return (
    <View style={s.contactRow}>
      <View style={s.contactIcon}>
        <RoundIcon kind={kind} color={color} />
      </View>
      <Text style={s.contact}>{text}</Text>
    </View>
  );
}

function SoftTag({ label, family, id }: { label: string; family: string; id: string }) {
  const width = Math.min(132, Math.max(36, label.length * 4.7 + 16));
  const height = 14;
  return (
    <View style={{ width, height, marginRight: 4, marginBottom: 4, position: "relative" }}>
      <Svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0 }}>
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#F3F4F6" />
            <Stop offset="0.5" stopColor="#D9DDE3" />
            <Stop offset="1" stopColor="#B7BDC6" />
          </LinearGradient>
        </Defs>
        <Rect
          x={0.4}
          y={0.4}
          width={width - 0.8}
          height={height - 0.8}
          rx={(height - 0.8) / 2}
          fill={`url(#${id})`}
          stroke="#C2C7CF"
          strokeWidth={0.5}
        />
      </Svg>
      <Text
        style={{
          fontSize: 6.3,
          color: "#2E333A",
          textAlign: "center",
          paddingTop: 3,
          fontFamily: family,
          letterSpacing: 0.12,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function SoftTagRow({ tags, family, prefix }: { tags: string[]; family: string; prefix: string }) {
  if (!tags.length) return null;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 6 }}>
      {tags.map((tag, i) => (
        <SoftTag
          key={`${prefix}-${tag}-${i}`}
          label={tag}
          family={family}
          id={`g${prefix}${i}`.replace(/[^A-Za-z0-9]/g, "")}
        />
      ))}
    </View>
  );
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
    <View wrap={false} minPresenceAhead={28}>
      <Text style={s.sideTitle}>{section.title}</Text>
      {section.type === "about" || section.type === "custom" ? (
        <Text style={s.sideText}>{String(c.text ?? "")}</Text>
      ) : null}
      {section.type === "personal"
        ? asItems<{ label: string; value: string }>(c).map((item, i) => (
            <View key={i} style={{ marginBottom: 6 }} wrap={false}>
              <Text style={[s.sideText, { color: accent }]}>{item.label}</Text>
              <Text style={s.sideText}>{item.value}</Text>
            </View>
          ))
        : null}
      {section.type === "links"
        ? asItems<{ label: string; url: string }>(c).map((item, i) => (
            <View key={i} style={{ marginBottom: 5 }} wrap={false}>
              <Text style={s.sideText}>{item.label}</Text>
              <Text style={s.sideText}>{item.url}</Text>
            </View>
          ))
        : null}
      {section.type === "education"
        ? asItems<{
            title: string;
            institution?: string;
            place: string;
            year: string;
            detail: string;
          }>(c).map((item, i) => (
            <View key={i} style={{ marginBottom: 8 }} wrap={false}>
              <Text style={s.eduTitle}>{item.title}</Text>
              {item.institution ? <Text style={s.sideText}>{item.institution}</Text> : null}
              <Text style={s.sideText}>
                {[item.place, item.year].filter(Boolean).join(" · ")}
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
        ? asItems<{ title: string; provider?: string; date: string }>(c).map((item, i) => (
            <View key={i} style={{ marginBottom: 6 }} wrap={false}>
              <Text style={[s.sideText, { textTransform: "uppercase", fontSize: 7 }]}>{item.title}</Text>
              <Text style={[s.sideText, { fontSize: 7 }]}>
                {[item.provider, item.date].filter(Boolean).join(" · ")}
              </Text>
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
  locale,
  family,
  heading,
}: {
  section: CvSection;
  s: ReturnType<typeof stylesFor>;
  iconPngs: Record<string, string>;
  locale: "es" | "en";
  family: string;
  heading: string;
}) {
  const c = section.config;
  const title = (
    <Text style={s.mainTitle} minPresenceAhead={80}>
      {section.title}
    </Text>
  );

  if (section.type === "projects") {
    const rows = chunk2(
      asItems<{
        name: string;
        role: string;
        tagline: string;
        description: string;
        url: string;
        imageDataUrl?: string;
        tags?: string[];
      }>(c)
    );
    return (
      <View>
        {rows.map((pair, row) => (
          <View key={row} wrap={false} minPresenceAhead={140}>
            {row === 0 ? title : null}
            <View style={s.projectRow}>
              {pair.map((project, i) => (
                <View key={i} style={s.projectCard}>
                  <Text style={s.projectName}>{project.name}</Text>
                  {project.role ? <Text style={s.jobRole}>{project.role}</Text> : null}
                  {project.imageDataUrl ? (
                    <Image src={project.imageDataUrl} style={s.projectShot} />
                  ) : null}
                  {project.tagline ? <Text style={s.projectDesc}>{project.tagline}</Text> : null}
                  {project.description ? (
                    <Text style={s.projectDesc}>{project.description}</Text>
                  ) : null}
                  {project.url ? (
                    <Link src={project.url} style={s.link}>
                      {project.url.replace(/^https?:\/\//, "")}
                    </Link>
                  ) : null}
                  <SoftTagRow
                    tags={asTags(project.tags)}
                    family={family}
                    prefix={`${section.id}p${row}${i}`}
                  />
                </View>
              ))}
              {pair.length === 1 ? <View style={s.projectCard} /> : null}
            </View>
          </View>
        ))}
      </View>
    );
  }

  if (section.type === "experience") {
    const jobs = asItems<{
      company: string;
      role: string;
      location: string;
      startMonth?: string;
      endMonth?: string;
      current?: boolean;
      start?: string;
      end?: string;
      duration?: string;
      description: string;
      tags?: string[];
    }>(c);
    return (
      <View>
        {jobs.map((job, i) => {
          const range = formatDateRange(
            job.startMonth,
            job.endMonth,
            Boolean(job.current),
            job.start,
            job.end,
            locale
          );
          const duration = jobDuration(job, locale);
          return (
            <View key={i} wrap={false} minPresenceAhead={80}>
              {i === 0 ? title : null}
              <View style={s.timeline}>
                <View style={s.timelineCol}>
                  <View style={s.timelineDot} />
                  {i < jobs.length - 1 ? <View style={s.timelineLine} /> : null}
                </View>
                <View style={s.jobBody}>
                  <View style={s.jobHead}>
                    <View style={{ flex: 1 }}>
                      <Text style={s.jobRoleTitle}>{job.role || job.company}</Text>
                      {job.role && job.company ? <Text style={s.company}>{job.company}</Text> : null}
                      {job.location ? (
                        <View style={[s.contactRow, { marginTop: 2, marginBottom: 0 }]}>
                          <View style={{ width: 8, height: 8, marginRight: 3 }}>
                            <RoundIcon kind="pin" color={heading} size={8} />
                          </View>
                          <Text style={[s.jobRole, { marginTop: 0 }]}>{job.location}</Text>
                        </View>
                      ) : null}
                    </View>
                    <View>
                      {range ? <Text style={s.jobMeta}>{range}</Text> : null}
                      {duration ? <Text style={s.jobMeta}>{duration}</Text> : null}
                    </View>
                  </View>
                  {job.description ? <Text style={s.jobDesc}>{job.description}</Text> : null}
                  <SoftTagRow
                    tags={asTags(job.tags)}
                    family={family}
                    prefix={`${section.id}j${i}`}
                  />
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <View>
      {title}
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
  const repeat = Boolean(config.theme.repeatSidebar);
  const s = stylesFor(config.theme, family);
  const sidebar = config.sections
    .filter((x) => x.column === "sidebar" && x.visible)
    .sort((a, b) => a.order - b.order);
  const main = config.sections
    .filter((x) => x.column === "main" && x.visible)
    .sort((a, b) => a.order - b.order);
  const h = config.header;
  const photo = h.showPhoto && h.photoDataUrl ? h.photoDataUrl : "";
  const locale = config.locale === "en" ? "en" : "es";

  const sidebarInner = (
    <>
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
    </>
  );

  const mainInner = (
    <>
      <View wrap={false}>
        <Text style={s.name}>{h.fullName}</Text>
        <Text style={s.role}>{h.role}</Text>
        {h.location ? (
          <ContactLine kind="pin" text={h.location} color={config.theme.heading} s={s} />
        ) : null}
        {h.phone ? (
          <ContactLine kind="phone" text={h.phone} color={config.theme.heading} s={s} />
        ) : null}
        {h.email ? (
          <ContactLine kind="email" text={h.email} color={config.theme.heading} s={s} />
        ) : null}
      </View>
      {main.map((section) => (
        <MainSection
          key={section.id}
          section={section}
          s={s}
          iconPngs={iconPngs}
          locale={locale}
          family={family}
          heading={config.theme.heading}
        />
      ))}
    </>
  );

  return (
    <Document title={h.fullName || config.name} author={h.fullName}>
      <Page size="A4" wrap style={s.page}>
        <View style={s.sidebarBg} fixed />
        {repeat ? (
          <View style={s.sidebar} fixed>
            {sidebarInner}
          </View>
        ) : (
          <View style={s.sidebar}>{sidebarInner}</View>
        )}
        <View style={s.main}>{mainInner}</View>
      </Page>
    </Document>
  );
}
