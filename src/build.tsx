import React from "react";
import { readFile, writeFile, mkdir, cp } from "node:fs/promises";
import { render, validate, outline } from "@hyper-elements/react";
import { renderPdf } from "@hyper-elements/react/pdf";
import { renderImage } from "@hyper-elements/react/image";
import {
  emailClients,
  renderInEmailClients,
} from "@hyper-elements/email-clients";
import { parseLesson, verifyBundledObject } from "./model.js";
import {
  StudyPage,
  EducatorEmail,
  Worksheet,
  CollectionCard,
} from "./templates.js";
const n = parseLesson(
  JSON.parse(await readFile(process.argv[2] || "data/lesson.json", "utf8")),
);
verifyBundledObject(
  n,
  JSON.parse(await readFile("data/met-source.json", "utf8")),
);
await mkdir("dist/assets", { recursive: true });
await cp("assets/artwork.jpg", "dist/assets/artwork.jpg");
await cp("assets/artwork-original.jpg", "dist/assets/artwork-original.jpg");
const bytes = await readFile("assets/artwork.jpg");
const src = "data:image/jpeg;base64," + bytes.toString("base64");
const fonts = await Promise.all(
  [400, 600].map(async (weight) => {
    const p = `node_modules/@fontsource/source-sans-3/files/source-sans-3-latin-${weight}-normal.woff`;
    await cp(p, `dist/assets/source-${weight}.woff`);
    return { family: "Source Sans 3", weight, src: await readFile(p) };
  }),
);
await cp(
  "node_modules/@fontsource/source-sans-3/LICENSE",
  "dist/assets/FONT-LICENSE.txt",
);
const page = <StudyPage n={n} src={src} />,
  email = <EducatorEmail n={n} />,
  document = <Worksheet n={n} src={src} />,
  canvas = <CollectionCard n={n} src={src} />;
const plugin = await emailClients({
  clients: ["gmail", "outlook", "apple-mail"],
});
const styles = `<style>@font-face{font-family:'Source Sans 3';src:url('assets/source-400.woff')}@font-face{font-family:'Source Sans 3';src:url('assets/source-600.woff');font-weight:600}a:focus-visible{outline:3px solid #174F8A;outline-offset:3px}body{overflow-wrap:anywhere}</style>`;
for (const [name, tree] of [
  ["study", page],
  ["email", email],
  ["worksheet", document],
] as const) {
  const r = await render(tree);
  await writeFile(
    `dist/${name}.html`,
    name === "email" ? r.html : r.html.replace("</head>", styles + "</head>"),
  );
  if (name === "email") await writeFile("dist/email.txt", r.text || "");
}
const pdf = await renderPdf(document, { fonts });
await writeFile("dist/worksheet.pdf", pdf.pdf);
const png = await renderImage(canvas, { fonts });
await writeFile("dist/collection-card.png", png.image);
const clients = await renderInEmailClients(email, {
  emailClients: ["outlook", "gmail", "apple-mail"],
  computers: ["windows"],
});
await mkdir("dist/clients", { recursive: true });
for (const p of clients.previews)
  await writeFile(`dist/clients/${p.filename}`, p.html);
await writeFile("dist/record.json", JSON.stringify(n, null, 2));
await writeFile(
  "dist/diagnostics.json",
  JSON.stringify(
    {
      page: validate(page),
      email: validate(email, { plugins: [plugin] }),
      document: validate(document),
      canvas: validate(canvas),
      pdf: pdf.diagnostics,
      png: png.diagnostics,
    },
    null,
    2,
  ),
);
await writeFile("dist/outline.txt", outline(page));
for (const f of ["index.html", "app.css", "app.js"])
  await cp(`public/${f}`, `dist/${f}`);
console.log(
  "Generated study, educator email + text, worksheet PDF, collection PNG and client previews.",
);
