const $ = (id) => document.getElementById(id);
const formats = {
  study: [
    "study.html",
    "study HTML",
    "An image-first study page, rendered with Hyper Elements Page.",
  ],
  email: [
    "email.html",
    "email HTML",
    "An educator briefing: a picture, three prompts, and a link to the museum.",
  ],
  worksheet: [
    "worksheet.pdf",
    "worksheet PDF",
    "A one-page observation worksheet with blank space for learner responses.",
  ],
  card: [
    "collection-card.png",
    "collection PNG",
    "A 1200 × 720 collection card. Real artwork, source-linked metadata.",
  ],
};
function fit() {
  const f = $("preview");
  try {
    if (!f.hidden && f.contentDocument) {
      f.style.height = "1px";
      f.style.height =
        f.contentDocument.documentElement.scrollHeight + 20 + "px";
    }
  } catch {}
}
$("preview").addEventListener("load", fit);
window.addEventListener("resize", fit);
for (const b of document.querySelectorAll("[data-mode]"))
  b.addEventListener("click", () => {
    const m = b.dataset.mode,
      s = formats[m];
    for (const other of document.querySelectorAll("[data-mode]"))
      other.setAttribute("aria-pressed", String(other === b));
    $("description").textContent = s[2];
    $("download").href = s[0];
    $("download").textContent = "Download " + s[1];
    $("preview").hidden = m === "card";
    $("card").hidden = m !== "card";
    if (m !== "card") {
      $("preview").src = m === "worksheet" ? "worksheet.html" : s[0];
      $("preview").title =
        m === "worksheet"
          ? "Printable observation worksheet"
          : m === "email"
            ? "Educator email"
            : "Artwork study page";
    }
    $("status").textContent =
      "Selected " +
      b.textContent +
      ". No email has been sent. No learner data is collected.";
  });
$("inspect").addEventListener("click", () => {
  $("zoom").value = "100";
  $("zoom-value").value = "100%";
  $("full-art").style.width = "100%";
  $("viewer").showModal();
});
$("close-viewer").addEventListener("click", () => $("viewer").close());
$("zoom").addEventListener("input", () => {
  $("full-art").style.width = $("zoom").value + "%";
  $("zoom-value").value = $("zoom").value + "%";
});
$("notes").addEventListener("input", () => {
  $("count").textContent = $("notes").value.length + " / 4000";
  $("note-status").textContent = "Not saved. Download to keep these notes.";
});
$("clear-notes").addEventListener("click", () => {
  $("notes").value = "";
  $("count").textContent = "0 / 4000";
  $("note-status").textContent = "Notes cleared.";
});
$("save-notes").addEventListener("click", () => {
  if (!$("notes").value.trim()) {
    $("note-status").textContent = "Add an observation before downloading.";
    return;
  }
  const blob = new Blob(
    [
      "Object Lesson — my observations\nArtwork: Wheat Field with Cypresses, Vincent van Gogh, 1889\nSource: https://www.metmuseum.org/art/collection/search/436535\n\n" +
        $("notes").value,
    ],
    { type: "text/plain;charset=utf-8" },
  );
  const a = document.createElement("a");
  const u = URL.createObjectURL(blob);
  a.href = u;
  a.download = "object-lesson-notes.txt";
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
  $("note-status").textContent =
    "Notes downloaded to this device. No upload was made.";
});
