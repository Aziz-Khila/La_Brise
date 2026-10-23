import { execFileSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { loadRestaurant } from "@/restaurants";

/** Kept outside the repo and outside OneDrive, so client projects never sync or get committed here. */
export const EXPORT_DIR =
  process.env.STUDIO_EXPORT_DIR ?? path.join(os.homedir(), "restaurants-exports");

const ROOT = process.cwd();
const ROOT_FILES = [".gitignore", "eslint.config.mjs", "next.config.ts", "tsconfig.json"];
const DEFAULT_PATTERN = /export const DEFAULT_RESTAURANT = "[^"]*";/;
const IMAGE_REF = /\/restaurants\/([a-z0-9-]+)\/([^"\s]+)/g;

/** Without the ignore comment, Next traces the whole project (public folder included) into the build. */
const untraced = (...parts: string[]) => path.join(/*turbopackIgnore: true*/ ...parts);

export class ExportError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export function exportPath(slug: string) {
  return path.join(EXPORT_DIR, slug);
}

export function isExported(slug: string) {
  return fs.existsSync(exportPath(slug));
}

/**
 * Builds a standalone project for one restaurant: the shared code (studio included, it only runs
 * under `npm run dev`), that restaurant's content and images, and nothing from the others.
 */
export function exportRestaurant(slug: string): { dir: string; git: boolean } {
  const restaurant = loadRestaurant(slug);
  if (!restaurant) throw new ExportError("Restaurant introuvable.", 404);

  const dir = exportPath(slug);
  // The exported copy becomes the source of truth once handed over; never overwrite it.
  if (fs.existsSync(dir)) {
    throw new ExportError(`Déjà exporté dans ${dir}. Modifiez cette copie directement.`, 409);
  }

  try {
    fs.mkdirSync(dir, { recursive: true });
    for (const file of ROOT_FILES) fs.copyFileSync(untraced(ROOT, file), untraced(dir, file));
    writePackageFiles(dir, slug);

    fs.cpSync(path.join(ROOT, "src"), path.join(dir, "src"), { recursive: true });
    setDefaultRestaurant(dir, slug);

    const publicDir = path.join(ROOT, "public");
    fs.cpSync(publicDir, path.join(dir, "public"), {
      recursive: true,
      filter: (source) => {
        const [top, owner] = path.relative(publicDir, source).split(path.sep);
        return top !== "restaurants" || owner === undefined || owner === slug;
      },
    });
    writeContent(dir, slug);
  } catch (error) {
    fs.rmSync(dir, { recursive: true, force: true });
    throw error;
  }

  return { dir, git: commitInitialVersion(dir, restaurant.name) };
}

function writePackageFiles(dir: string, slug: string) {
  const name = `${slug}-website`;
  const read = (file: string) => JSON.parse(fs.readFileSync(untraced(ROOT, file), "utf8"));
  const write = (file: string, data: unknown) =>
    fs.writeFileSync(path.join(dir, file), `${JSON.stringify(data, null, 2)}\n`, "utf8");

  const pkg = read("package.json");
  write("package.json", { ...pkg, name });

  const lock = read("package-lock.json");
  lock.name = name;
  if (lock.packages?.[""]) lock.packages[""].name = name;
  write("package-lock.json", lock);
}

/**
 * A restaurant created from a template still points at the template's images until they are
 * replaced, so those images are copied into the restaurant's own folder and the paths rewritten.
 */
function writeContent(dir: string, slug: string) {
  const source = fs.readFileSync(path.join(ROOT, "content", "restaurants", `${slug}.json`), "utf8");
  const imagesDir = path.join(dir, "public", "restaurants", slug);
  const moved = new Map<string, string>();

  const content = source.replace(IMAGE_REF, (ref: string, owner: string, file: string) => {
    if (owner === slug) return ref;
    const known = moved.get(ref);
    if (known) return known;

    const from = path.join(ROOT, "public", "restaurants", owner, file);
    if (!fs.existsSync(from)) return ref;
    fs.mkdirSync(imagesDir, { recursive: true });
    const name = fs.existsSync(path.join(imagesDir, file)) ? `${owner}-${file}` : file;
    fs.copyFileSync(from, path.join(imagesDir, name));

    const next = `/restaurants/${slug}/${name}`;
    moved.set(ref, next);
    return next;
  });

  const contentDir = path.join(dir, "content", "restaurants");
  fs.mkdirSync(contentDir, { recursive: true });
  fs.writeFileSync(path.join(contentDir, `${slug}.json`), content, "utf8");
}

function setDefaultRestaurant(dir: string, slug: string) {
  const file = path.join(dir, "src", "restaurants", "index.ts");
  const source = fs.readFileSync(file, "utf8");
  if (!DEFAULT_PATTERN.test(source)) {
    throw new Error("DEFAULT_RESTAURANT introuvable dans src/restaurants/index.ts");
  }
  fs.writeFileSync(file, source.replace(DEFAULT_PATTERN, `export const DEFAULT_RESTAURANT = "${slug}";`));
}

/** Gives the copy its own history so every version sent to the owner can be traced. */
function commitInitialVersion(dir: string, name: string): boolean {
  try {
    const git = (...args: string[]) => execFileSync("git", args, { cwd: dir, stdio: "ignore" });
    git("init", "-b", "main");
    git("add", "-A");
    git("commit", "-m", `${name} — version livrée`);
    return true;
  } catch {
    return false;
  }
}
