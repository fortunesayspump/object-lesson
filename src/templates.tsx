import React from "react";
import {
  Page,
  Email,
  Document,
  Canvas,
  Column,
  Row,
  Text,
  LineBreak,
  Heading,
  Image,
  Divider,
  Link,
  Button,
  defineTheme,
} from "@hyper-elements/react";
import type { Lesson } from "./model.js";
export const colors = {
  ink: "#192C34",
  blue: "#174F8A",
  muted: "#54656C",
  line: "#BECBD1",
  ground: "#EAF0F2",
  white: "#FFFFFF",
};
export const theme = defineTheme({
  colors: {
    background: colors.white,
    foreground: colors.ink,
    primary: colors.blue,
    primaryForeground: colors.white,
    border: colors.line,
  },
  fonts: {
    body: "'Source Sans 3', Arial, sans-serif",
    heading: "'Source Sans 3', Arial, sans-serif",
  },
  fontSizes: { body: 16 },
  lineHeights: { body: 1.5 },
  elements: {
    Heading: {
      by: {
        level: {
          1: { fontSize: 32, fontWeight: 600, lineHeight: 1.12 },
          2: { fontSize: 23, fontWeight: 600, lineHeight: 1.2 },
          3: { fontSize: 18, fontWeight: 600 },
        },
      },
    },
  },
  styles: {
    label: {
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: 1.2,
      textTransform: "uppercase",
      color: colors.muted,
    },
  },
});
function Label({ children }: { children: React.ReactNode }) {
  return <Text style={{ apply: ["label"] }}>{children}</Text>;
}
function Art({ n, src, width }: { n: Lesson; src: string; width?: number }) {
  return (
    <Image
      src={{ src, width: n.imageWidth, height: n.imageHeight }}
      alt={n.alt}
      style={{ width: width || "100%" }}
    />
  );
}
function Identity({ n }: { n: Lesson }) {
  return (
    <Column style={{ gap: 10 }}>
      <Label>COLLECTION RECORD / {n.accession}</Label>
      <Heading level={1}>{n.title}</Heading>
      <Text style={{ fontSize: 20 }}>{n.artist}</Text>
      <Text style={{ color: colors.muted }}>
        {n.date} · {n.medium}
      </Text>
      <Divider />
      <Text style={{ fontSize: 14 }}>{n.dimensions}</Text>
      <Text style={{ fontSize: 14 }}>{n.collection}</Text>
      <Text style={{ fontSize: 12, color: colors.muted }}>{n.credit}</Text>
    </Column>
  );
}
function Attribution({ n }: { n: Lesson }) {
  return (
    <Column style={{ gap: 5 }}>
      <Divider />
      <Text style={{ fontSize: 12, color: colors.muted }}>
        <Link href={n.source}>Museum record {n.accession}</Link> · Image and
        core metadata: The Met Open Access / CC0.
      </Text>
      <Text style={{ fontSize: 11, color: colors.muted }}>
        Independent learning resource by Fortune Eze. Not a museum publication.
        Metadata checked {n.verified}.
      </Text>
    </Column>
  );
}
export function StudyPage({ n, src }: { n: Lesson; src: string }) {
  return (
    <Page
      theme={theme}
      width={1120}
      title={`${n.title} | Object Lesson`}
      lang="en"
    >
      <Column
        style={{ padding: 32, gap: 32, mobile: { padding: 20, gap: 24 } }}
      >
        <Row style={{ gap: 36 }}>
          <Column style={{ width: "62%", gap: 10 }}>
            <Art n={n} src={src} />
            <Text style={{ fontSize: 12, color: colors.muted }}>
              Full composition, uncropped. Look before reading.
            </Text>
          </Column>
          <Column style={{ flex: 1, gap: 24 }}>
            <Identity n={n} />
            <Button
              href={n.source}
              style={{ alignSelf: "start", padding: [10, 16], fontSize: 14 }}
            >
              Open museum record
            </Button>
            <Text style={{ fontSize: 13, color: colors.muted }}>
              Start with what is visible. Keep your observations separate from
              what you infer.
            </Text>
          </Column>
        </Row>
        <Divider />
        <Row style={{ gap: 30 }}>
          {n.prompts.map((p, i) => (
            <Column key={p.title} style={{ gap: 10 }}>
              <Label>LOOKING TASK / 0{i + 1}</Label>
              <Heading level={2}>{p.title}</Heading>
              <Text>{p.question}</Text>
            </Column>
          ))}
        </Row>
        <Attribution n={n} />
      </Column>
    </Page>
  );
}
export function EducatorEmail({ n }: { n: Lesson }) {
  return (
    <Email
      theme={theme}
      width={620}
      title={`A closer look: ${n.title}`}
      previewText="An artwork, three original looking prompts, and its museum record."
      lang="en"
    >
      <Column style={{ padding: 30, gap: 24, mobile: { padding: 20 } }}>
        <Label>OBJECT LESSON / EDUCATOR EDITION</Label>
        <Heading level={1}>Bring one artwork into the conversation.</Heading>
        <Art n={n} src={n.imageUrl} />
        <Column style={{ gap: 6 }}>
          <Heading level={2}>{n.title}</Heading>
          <Text>
            {n.artist} · {n.date}
          </Text>
          <Text style={{ fontSize: 14, color: colors.muted }}>
            {n.medium} · {n.dimensions}
          </Text>
        </Column>
        <Text>
          Begin with a quiet look. Invite each learner to choose a detail before
          sharing interpretations. These prompts are invitations, not an answer
          key.
        </Text>
        <Column style={{ gap: 16 }}>
          {n.prompts.map((p, i) => (
            <Column key={p.title} style={{ gap: 4 }}>
              <Text style={{ fontWeight: 600 }}>
                {i + 1}. {p.title}
              </Text>
              <Text>{p.question}</Text>
            </Column>
          ))}
        </Column>
        <Button
          href={n.source}
          style={{ alignSelf: "start", padding: [12, 18] }}
        >
          Explore the original record
        </Button>
        <Attribution n={n} />
      </Column>
    </Email>
  );
}
function AnswerSpace() {
  return (
    <Column style={{ gap: 25, padding: [12, 0] }}>
      <Divider />
      <Divider />
      <Divider />
    </Column>
  );
}
export function Worksheet({ n, src }: { n: Lesson; src: string }) {
  return (
    <Document
      theme={theme}
      size="A4"
      margin={40}
      title={`${n.title} — observation worksheet`}
      lang="en"
    >
      <Document.Page style={{ gap: 20 }}>
        <Label>OBJECT LESSON / OBSERVATION WORKSHEET</Label>
        <Heading level={1} style={{ fontSize: 25 }}>
          {n.title}
        </Heading>
        <Row style={{ gap: 24 }}>
          <Column style={{ width: 220 }}>
            <Art n={n} src={src} />
          </Column>
          <Column style={{ gap: 8 }}>
            <Text style={{ fontWeight: 600 }}>
              {n.artist} · {n.date}
            </Text>
            <Text style={{ fontSize: 13 }}>
              {n.medium} / {n.dimensions}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {n.collection}
              <LineBreak />
            </Text>
            <Text style={{ fontSize: 12 }}>Object {n.accession}</Text>
            <Text style={{ fontSize: 12, color: colors.muted }}>
              Write observations in your own words. No name or personal
              information is needed.
            </Text>
          </Column>
        </Row>
        {n.prompts.map((p, i) => (
          <Column key={p.title} style={{ gap: 6 }}>
            <Text style={{ fontWeight: 600, fontSize: 16 }}>
              0{i + 1} / {p.title}
            </Text>
            <Text style={{ fontSize: 13 }}>{p.question}</Text>
            <AnswerSpace />
          </Column>
        ))}
        <Text style={{ fontSize: 10, color: colors.muted }}>{n.source}</Text>
        <Text style={{ fontSize: 10, color: colors.muted }}>
          Artwork and metadata: The Met Open Access / CC0. Original prompts:
          Fortune Eze. Independent resource.
        </Text>
      </Document.Page>
    </Document>
  );
}
export function CollectionCard({ n, src }: { n: Lesson; src: string }) {
  return (
    <Canvas
      theme={theme}
      width={1200}
      height={720}
      title={`${n.title} — collection card`}
      style={{ padding: 40, gap: 20, backgroundColor: colors.ground }}
    >
      <Row style={{ gap: 32 }}>
        <Column style={{ width: 690, gap: 10 }}>
          <Art n={n} src={src} />
          <Text style={{ fontSize: 12, color: colors.muted }}>
            The Met Open Access / CC0 · Full composition, uncropped
          </Text>
        </Column>
        <Column style={{ width: 398, gap: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 600 }}>OBJECT LESSON /</Text>
          <Divider />
          <Label>LOOK CLOSELY / {n.accession}</Label>
          <Heading level={1} style={{ fontSize: 32 }}>
            {n.title}
          </Heading>
          <Text style={{ fontSize: 24 }}>{n.artist}</Text>
          <Text style={{ fontSize: 18 }}>
            {n.date} · {n.medium}
          </Text>
          <Text style={{ fontSize: 16, color: colors.muted }}>
            {n.dimensions}
          </Text>
          <Text style={{ fontSize: 16 }}>
            One artwork.
            <LineBreak />
            Three ways into a conversation.
          </Text>
          <Text style={{ fontSize: 12, color: colors.muted }}>
            {n.collection}
          </Text>
        </Column>
      </Row>
      <Divider />
      <Text style={{ fontSize: 12, color: colors.muted }}>
        {n.source} · Independent educational template
      </Text>
    </Canvas>
  );
}
