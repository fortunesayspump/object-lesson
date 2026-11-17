// Deliberate typography boundary fixture; never a user-facing record.
import React from "react";
import { readFile, writeFile } from "node:fs/promises";
import { renderPdf } from "@hyper-elements/react/pdf";
import { Worksheet } from "../src/templates.js";
import { parseLesson } from "../src/model.js";
const n = parseLesson(JSON.parse(await readFile("data/lesson.json", "utf8")));
n.prompts = n.prompts.map(() => ({
  title: "Wide prompt heading ".repeat(4).slice(0, 50),
  question: "Describe the visible marks without assuming a hidden history. "
    .repeat(4)
    .slice(0, 180),
}));
const src =
  "data:image/jpeg;base64," +
  (await readFile("assets/artwork.jpg")).toString("base64");
const fonts = await Promise.all(
  [400, 600].map(async (weight) => ({
    family: "Source Sans 3",
    weight,
    src: await readFile(
      `node_modules/@fontsource/source-sans-3/files/source-sans-3-latin-${weight}-normal.woff`,
    ),
  })),
);
const pdf = await renderPdf(<Worksheet n={n} src={src} />, { fonts });
await writeFile("/tmp/object-lesson-stress.pdf", pdf.pdf);
console.log(pdf.diagnostics);
