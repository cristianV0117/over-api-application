"use client";

import {
  Circle,
  Document,
  G,
  Image,
  Link,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import { formatDateRange, jobDuration } from "@/lib/cv/dates";
import { normalizeFontScale, normalizeSectionScale } from "@/lib/cv/defaults";
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

function stylesFor(theme: CvTheme, family: string, sectionScale?: unknown) {
  const bold = boldOf(family);
  const weight = family === "Helvetica" || family === "Courier" ? undefined : 700;
  const z =
    (normalizeFontScale(theme.fontScale) / 100) * (normalizeSectionScale(sectionScale) / 100);
  const fs = (n: number) => Math.round(n * z * 10) / 10;
  return StyleSheet.create({
    page: {
      fontSize: fs(9),
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
      fontSize: fs(9),
      letterSpacing: 1.4,
      textTransform: "uppercase",
      color: theme.accent,
      marginBottom: 6,
      marginTop: 12,
      fontFamily: bold,
      fontWeight: weight,
    },
    sideText: { color: theme.sidebarMuted, lineHeight: 1.45, fontSize: fs(8), fontFamily: family },
    chipWrap: { flexDirection: "row", flexWrap: "wrap" },
    chip: {
      backgroundColor: theme.chipBg,
      color: theme.chipText,
      fontSize: fs(6.5),
      letterSpacing: 0.4,
      textTransform: "uppercase",
      paddingVertical: 3,
      paddingHorizontal: 5,
      marginRight: 3,
      marginBottom: 3,
      fontFamily: family,
    },
    tagChip: {
      borderWidth: 0.5,
      borderColor: theme.heading,
      color: theme.heading,
      fontSize: fs(5.2),
      letterSpacing: 0.2,
      textTransform: "uppercase",
      paddingVertical: 1,
      paddingHorizontal: 3.5,
      marginRight: 2.5,
      marginBottom: 2.5,
      fontFamily: family,
    },
    iconRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
    icon: { width: fs(18), height: fs(18), marginRight: 7, marginBottom: 7 },
    name: {
      fontSize: fs(18),
      fontFamily: bold,
      fontWeight: weight,
      color: theme.heading,
      letterSpacing: 0.6,
      textTransform: "uppercase",
    },
    role: {
      fontSize: fs(10),
      color: theme.heading,
      letterSpacing: 1.6,
      textTransform: "uppercase",
      marginTop: 4,
      marginBottom: 8,
      fontFamily: family,
    },
    contactRow: { flexDirection: "row", alignItems: "center", marginBottom: 3 },
    contact: { fontSize: fs(8), color: theme.body, fontFamily: family },
    contactIcon: { width: 11, height: 11, marginRight: 5 },
    mainTitle: {
      fontSize: fs(10),
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
      fontSize: fs(9.5),
      fontFamily: bold,
      fontWeight: weight,
      color: theme.heading,
    },
    company: {
      fontSize: fs(8),
      color: theme.body,
      marginTop: 1,
      fontFamily: family,
    },
    jobRole: { fontSize: fs(8), color: theme.body, marginTop: 1, fontFamily: family },
    jobMeta: { fontSize: fs(7.5), color: theme.body, textAlign: "right", fontFamily: family },
    jobDesc: { fontSize: fs(8), color: theme.body, lineHeight: 1.4, marginTop: 4, fontFamily: family },
    jobContinue: {
      marginLeft: 5.35,
      paddingLeft: 14,
      borderLeftWidth: 1.3,
      borderLeftColor: "#B4BAC3",
      paddingBottom: 14,
    },
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
    jobBody: { flex: 1, paddingLeft: 9, paddingBottom: 4 },
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
      fontSize: fs(8),
      fontFamily: bold,
      fontWeight: weight,
      color: theme.heading,
      textTransform: "uppercase",
    },
    projectDesc: {
      fontSize: fs(7),
      color: theme.body,
      lineHeight: 1.3,
      marginTop: 3,
      fontFamily: family,
    },
    eduTitle: { fontFamily: bold, fontWeight: weight, fontSize: fs(8), color: theme.sidebarText },
    courseLine: {
      fontFamily: family,
      fontSize: fs(6.5),
      color: theme.sidebarMuted,
      lineHeight: 1.35,
      marginBottom: fs(3),
      textTransform: "uppercase",
    },
    itemGap: { marginBottom: fs(6) },
    linkGap: { marginBottom: fs(5) },
    eduGap: { marginBottom: fs(8) },
    link: { fontSize: fs(7.5), color: theme.heading, textDecoration: "none", marginTop: 2, fontFamily: family },
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

function TagRow({ tags, style }: { tags: string[]; style: ReturnType<typeof stylesFor>["tagChip"] }) {
  if (!tags.length) return null;
  return (
    <View wrap={false} style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 4 }}>
      {tags.map((tag) => (
        <Text key={tag} style={style}>
          {tag}
        </Text>
      ))}
    </View>
  );
}

function SidebarSection({
  section,
  theme,
  family,
  accent,
  iconPngs,
}: {
  section: CvSection;
  theme: CvTheme;
  family: string;
  accent: string;
  iconPngs: Record<string, string>;
}) {
  const s = stylesFor(theme, family, section.scale);
  const c = section.config;
  return (
    <View>
      {section.type !== "courses" ? (
        <Text style={s.sideTitle} minPresenceAhead={22}>
          {section.title}
        </Text>
      ) : null}
      {section.type === "about" || section.type === "custom" ? (
        <Text style={s.sideText}>{String(c.text ?? "")}</Text>
      ) : null}
      {section.type === "personal"
        ? asItems<{ label: string; value: string }>(c).map((item, i) => (
            <View key={i} style={s.itemGap} wrap={false}>
              <Text style={[s.sideText, { color: accent }]}>{item.label}</Text>
              <Text style={s.sideText}>{item.value}</Text>
            </View>
          ))
        : null}
      {section.type === "links"
        ? asItems<{ label: string; url: string }>(c).map((item, i) => (
            <View key={i} style={s.linkGap} wrap={false}>
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
            <View key={i} style={s.eduGap} wrap={false}>
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
        ? asItems<{ title: string; provider?: string; date: string }>(c).map((item, i) => {
            const meta = [item.provider, item.date].filter(Boolean).join(" · ");
            return (
              <View key={i} wrap={false} minPresenceAhead={16}>
                {i === 0 ? <Text style={s.sideTitle}>{section.title}</Text> : null}
                <Text style={s.courseLine}>
                  {item.title}
                  {meta ? `  ·  ${meta}` : ""}
                </Text>
              </View>
            );
          })
        : null}
    </View>
  );
}

function MainSection({
  section,
  theme,
  family,
  iconPngs,
  locale,
  heading,
}: {
  section: CvSection;
  theme: CvTheme;
  family: string;
  iconPngs: Record<string, string>;
  locale: "es" | "en";
  heading: string;
}) {
  const s = stylesFor(theme, family, section.scale);
  const c = section.config;
  const title = (
    <Text style={s.mainTitle} minPresenceAhead={36}>
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
          <View key={row}>
            <View wrap={false} minPresenceAhead={48}>
              {row === 0 ? title : null}
              <View style={[s.projectRow, { marginBottom: 2 }]}>
                {pair.map((project, i) => (
                  <View key={i} style={s.projectCard}>
                    <Text style={s.projectName}>{project.name}</Text>
                    {project.role ? <Text style={s.jobRole}>{project.role}</Text> : null}
                    {project.imageDataUrl ? (
                      <Image src={project.imageDataUrl} style={s.projectShot} />
                    ) : null}
                  </View>
                ))}
                {pair.length === 1 ? <View style={s.projectCard} /> : null}
              </View>
            </View>
            <View style={s.projectRow}>
              {pair.map((project, i) => (
                <View key={i} style={s.projectCard}>
                  {project.tagline ? <Text style={s.projectDesc}>{project.tagline}</Text> : null}
                  {project.description ? (
                    <Text style={s.projectDesc}>{project.description}</Text>
                  ) : null}
                  {project.url ? (
                    <Link src={project.url} style={s.link}>
                      {project.url.replace(/^https?:\/\//, "")}
                    </Link>
                  ) : null}
                  <TagRow tags={asTags(project.tags)} style={s.tagChip} />
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
      scale?: number;
      breakBefore?: boolean;
    }>(c);
    return (
      <View>
        {jobs.map((job, i) => {
          const js = stylesFor(theme, family, job.scale);
          const range = formatDateRange(
            job.startMonth,
            job.endMonth,
            Boolean(job.current),
            job.start,
            job.end,
            locale
          );
          const duration = jobDuration(job, locale);
          const tags = asTags(job.tags);
          return (
            <View key={i} break={Boolean(job.breakBefore)}>
              <View wrap={false} minPresenceAhead={36}>
                {i === 0 ? title : null}
                <View style={js.timeline}>
                  <View style={js.timelineCol}>
                    <View style={js.timelineDot} />
                  </View>
                  <View style={js.jobBody}>
                    <View style={js.jobHead}>
                      <View style={{ flex: 1 }}>
                        <Text style={js.jobRoleTitle}>{job.role || job.company}</Text>
                        {job.role && job.company ? <Text style={js.company}>{job.company}</Text> : null}
                        {job.location ? (
                          <View style={[js.contactRow, { marginTop: 2, marginBottom: 0 }]}>
                            <View style={{ width: 8, height: 8, marginRight: 3 }}>
                              <RoundIcon kind="pin" color={heading} size={8} />
                            </View>
                            <Text style={[js.jobRole, { marginTop: 0 }]}>{job.location}</Text>
                          </View>
                        ) : null}
                      </View>
                      <View>
                        {range ? <Text style={js.jobMeta}>{range}</Text> : null}
                        {duration ? <Text style={js.jobMeta}>{duration}</Text> : null}
                      </View>
                    </View>
                  </View>
                </View>
              </View>
              <View style={js.jobContinue}>
                {job.description ? <Text style={js.jobDesc}>{job.description}</Text> : null}
                <TagRow tags={tags} style={js.tagChip} />
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
          theme={config.theme}
          family={family}
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
        <View key={section.id} break={Boolean(section.breakBefore)}>
          <MainSection
            section={section}
            theme={config.theme}
            family={family}
            iconPngs={iconPngs}
            locale={locale}
            heading={config.theme.heading}
          />
        </View>
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
