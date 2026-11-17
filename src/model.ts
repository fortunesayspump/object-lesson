export interface Lesson {
  slug: string;
  title: string;
  artist: string;
  date: string;
  medium: string;
  dimensions: string;
  accession: string;
  collection: string;
  credit: string;
  source: string;
  api: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  isPublicDomain: boolean;
  verified: string;
  alt: string;
  prompts: { title: string; question: string }[];
}
export function parseLesson(input: unknown): Lesson {
  if (!input || typeof input !== "object")
    throw Error("An object record is required.");
  const n = input as Lesson;
  const limits = {
    slug: 60,
    title: 100,
    artist: 70,
    date: 30,
    medium: 90,
    dimensions: 100,
    accession: 60,
    collection: 100,
    credit: 160,
    source: 256,
    api: 256,
    imageUrl: 256,
    verified: 10,
    alt: 400,
  };
  for (const [k, max] of Object.entries(limits)) {
    const value = n[k as keyof Lesson];
    if (typeof value !== "string" || !value.trim() || value.length > max)
      throw Error(`Invalid ${k}; supply text up to ${max} characters.`);
  }
  if (!/^[a-z0-9-]+$/.test(n.slug)) throw Error("Unsafe slug.");
  if (n.isPublicDomain !== true)
    throw Error("This kit only accepts verified public-domain artwork.");
  for (const k of ["source", "api", "imageUrl"] as const) {
    if (new URL(n[k]).protocol !== "https:")
      throw Error("Sources and image must use HTTPS.");
  }
  if (
    !Number.isInteger(n.imageWidth) ||
    !Number.isInteger(n.imageHeight) ||
    n.imageWidth < 1 ||
    n.imageHeight < 1 ||
    n.imageWidth > 10000 ||
    n.imageHeight > 10000
  )
    throw Error("Invalid image dimensions.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(n.verified))
    throw Error("Verification date required.");
  if (!Array.isArray(n.prompts) || n.prompts.length !== 3)
    throw Error("Supply exactly three original observation prompts.");
  for (const p of n.prompts) {
    if (
      !p ||
      typeof p.title !== "string" ||
      !p.title.trim() ||
      p.title.length > 50 ||
      typeof p.question !== "string" ||
      !p.question.trim() ||
      p.question.length > 180
    )
      throw Error("Invalid observation prompt.");
  }
  return n;
}
// This edition ships one verified object and its matching image assets. It is not an API importer.
export function verifyBundledObject(n: Lesson, s: Record<string, unknown>) {
  for (const [k, field] of [
    ["title", "title"],
    ["artist", "artistDisplayName"],
    ["date", "objectDate"],
    ["medium", "medium"],
    ["accession", "accessionNumber"],
    ["credit", "creditLine"],
    ["source", "objectURL"],
    ["imageUrl", "primaryImageSmall"],
  ] as const) {
    if (n[k] !== s[field])
      throw Error(
        `Bundled image/source mismatch: ${k}. Review and replace the complete source package before adapting to another object.`,
      );
  }
  if (
    s.objectID !== 436535 ||
    s.isPublicDomain !== true ||
    n.imageWidth !== 599 ||
    n.imageHeight !== 477
  )
    throw Error("Unverified bundled object or image dimensions.");
}
