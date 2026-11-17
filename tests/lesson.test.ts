import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import React from "react";
import { render, validate } from "@hyper-elements/react";
import { parseLesson, verifyBundledObject } from "../src/model.js";
import {
  StudyPage,
  EducatorEmail,
  Worksheet,
  CollectionCard,
  colors,
} from "../src/templates.js";
const raw = JSON.parse(await readFile("data/lesson.json", "utf8"));
const source = JSON.parse(await readFile("data/met-source.json", "utf8"));
const n = parseLesson(raw);
const bytes = await readFile("assets/artwork.jpg");
const src = "data:image/jpeg;base64," + bytes.toString("base64");
test("sample fields match the bundled first-party museum record", () => {
  for (const [k, s] of [
    ["title", "title"],
    ["artist", "artistDisplayName"],
    ["date", "objectDate"],
    ["medium", "medium"],
    ["accession", "accessionNumber"],
    ["credit", "creditLine"],
    ["source", "objectURL"],
    ["imageUrl", "primaryImageSmall"],
  ])
    assert.equal(raw[k], source[s]);
  assert.equal(source.isPublicDomain, true);
});
test("reject non-public-domain artwork", () =>
  assert.throws(
    () => parseLesson({ ...raw, isPublicDomain: false }),
    /public-domain/,
  ));
test("reject unsafe source and path", () => {
  assert.throws(
    () => parseLesson({ ...raw, source: "javascript:alert(1)" }),
    /HTTPS/,
  );
  assert.throws(() => parseLesson({ ...raw, slug: "../escape" }), /slug/);
});
test("require truthful alt text and bounded fixed-format copy", () => {
  assert.throws(() => parseLesson({ ...raw, alt: "" }), /alt/);
  assert.throws(() => parseLesson({ ...raw, title: "x".repeat(101) }), /title/);
});
test("require exactly three authored prompts", () =>
  assert.throws(() => parseLesson({ ...raw, prompts: [] }), /three/));
test("all four actual Hyper Elements roots validate without errors or warnings", () => {
  for (const tree of [
    React.createElement(StudyPage, { n, src }),
    React.createElement(EducatorEmail, { n }),
    React.createElement(Worksheet, { n, src }),
    React.createElement(CollectionCard, { n, src }),
  ])
    assert.deepEqual(
      validate(tree).diagnostics.filter(
        (d) => d.severity === "error" || d.severity === "warning",
      ),
      [],
    );
});
test("web preserves attribution and escapes supplied titles", async () => {
  const r = await render(
    React.createElement(StudyPage, {
      n: { ...n, title: "<script>alert(1)</script>" },
      src,
    }),
  );
  assert.ok(r.html.includes(n.source));
  assert.ok(!r.html.includes("<script>alert(1)</script>"));
  assert.match(r.html, /&lt;script&gt;/);
});
test("email image uses verified remote URL, never a local file", async () => {
  const r = await render(React.createElement(EducatorEmail, { n }));
  assert.ok(r.html.includes(n.imageUrl));
  assert.ok(!r.html.includes("data:image"));
  assert.ok(r.text?.includes("not an answer key"));
});
test("PDF is one explicit page and PNG has real signatures", async () => {
  const pdf = await readFile("dist/worksheet.pdf"),
    png = await readFile("dist/collection-card.png");
  assert.equal(pdf.subarray(0, 4).toString(), "%PDF");
  assert.equal(
    (pdf.toString("latin1").match(/\/Type \/Page\b/g) || []).length,
    1,
  );
  assert.equal(png.subarray(1, 4).toString(), "PNG");
});
test("notes are local only: no tracking, storage or upload code", async () => {
  const js = await readFile("public/app.js", "utf8");
  assert.ok(
    !/fetch\(|localStorage|sessionStorage|XMLHttpRequest|sendBeacon/.test(js),
  );
  assert.match(js, /createObjectURL/);
});
function lum(h: string) {
  const c = h
    .slice(1)
    .match(/../g)!
    .map((x) => parseInt(x, 16) / 255)
    .map((x) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
}
test("body/link/muted colors meet AA on both reading surfaces", () => {
  for (const fg of [colors.ink, colors.blue, colors.muted])
    for (const bg of [colors.white, colors.ground])
      assert.ok((lum(bg) + 0.05) / (lum(fg) + 0.05) >= 4.5);
});

test("build refuses mismatched artwork metadata", () => {
  verifyBundledObject(n, source);
  assert.throws(
    () => verifyBundledObject({ ...n, title: "Another artwork" }, source),
    /mismatch/,
  );
});
test("prompt boundaries are enforced", () => {
  parseLesson({
    ...raw,
    prompts: raw.prompts.map((p: any) => ({
      ...p,
      title: "A".repeat(50),
      question: "B".repeat(180),
    })),
  });
  assert.throws(
    () =>
      parseLesson({
        ...raw,
        prompts: raw.prompts.map((p: any) => ({
          ...p,
          question: "B".repeat(181),
        })),
      }),
    /prompt/,
  );
});

test("email makes no unavailable worksheet promise",async()=>{const r=await render(React.createElement(EducatorEmail,{n}));assert.ok(!r.html.includes("printable study sheet"));assert.ok(r.html.includes("its museum record"));});
