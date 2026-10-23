import { createHash } from "crypto";
import fs from "fs";
import path from "path";
import type { RestaurantConfig } from "@/config/types";
import { CONTENT_PATH, IMAGES_PATH, IMAGES_URL, contentFile } from "@/restaurants";

/**
 * Where the admin reads and saves content. On the host it commits to GitHub, which triggers a
 * redeploy; without GitHub settings it writes the local files, which only works under `npm run dev`.
 */

export class RepositoryError extends Error {
  constructor(
    message: string,
    readonly status = 500,
    /** Status GitHub answered with, when the error comes from its API. */
    readonly upstream?: number
  ) {
    super(message);
  }
}

export type StoredContent = { config: RestaurantConfig; sha: string };
export type PendingImage = { url: string; blobSha: string };

type GitHubSettings = { token: string; repo: string; branch: string };

function githubSettings(): GitHubSettings | null {
  const { GITHUB_TOKEN: token, GITHUB_REPO: repo, GITHUB_BRANCH: branch } = process.env;
  return token && repo ? { token, repo, branch: branch || "main" } : null;
}

function localAllowed() {
  if (process.env.NODE_ENV !== "development") {
    throw new RepositoryError("GitHub n’est pas configuré sur l’hébergement (GITHUB_TOKEN, GITHUB_REPO).");
  }
}

/** Publishing is live after a redeploy on GitHub, immediately on local files. */
export const publishesThroughGitHub = () => githubSettings() !== null;

/** Same id Git gives the file, so both sides agree on which version the owner edited. */
const blobSha = (data: Buffer) =>
  createHash("sha1").update(`blob ${data.length}\0`).update(data).digest("hex");

const serialize = (config: RestaurantConfig) => `${JSON.stringify(config, null, 2)}\n`;

async function github<T>(settings: GitHubSettings, route: string, method = "GET", body?: unknown): Promise<T> {
  const response = await fetch(`https://api.github.com/repos/${settings.repo}${route}`, {
    method,
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${settings.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new RepositoryError(
      `GitHub a refusé la requête (${response.status}) : ${detail.slice(0, 200)}`,
      502,
      response.status
    );
  }
  return (await response.json()) as T;
}

export async function loadContent(): Promise<StoredContent> {
  const settings = githubSettings();
  if (settings) {
    const file = await github<{ content: string; sha: string }>(
      settings,
      `/contents/${CONTENT_PATH}?ref=${encodeURIComponent(settings.branch)}`
    );
    const data = Buffer.from(file.content, "base64");
    return { config: JSON.parse(data.toString("utf8")), sha: file.sha };
  }

  localAllowed();
  const data = fs.readFileSync(contentFile());
  return { config: JSON.parse(data.toString("utf8")), sha: blobSha(data) };
}

/** Stores an uploaded image; on GitHub it only becomes part of the site at the next publish. */
export async function storeImage(name: string, data: Buffer): Promise<{ url: string; blobSha?: string }> {
  const url = `${IMAGES_URL}/${name}`;
  const settings = githubSettings();
  if (settings) {
    const blob = await github<{ sha: string }>(settings, "/git/blobs", "POST", {
      content: data.toString("base64"),
      encoding: "base64",
    });
    return { url, blobSha: blob.sha };
  }

  localAllowed();
  const dir = path.join(/*turbopackIgnore: true*/ process.cwd(), IMAGES_PATH);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(/*turbopackIgnore: true*/ dir, name), data);
  return { url };
}

/** Saves the content (plus new images) as one commit; returns the new content sha. */
export async function publishContent(
  config: RestaurantConfig,
  images: PendingImage[],
  message: string
): Promise<string> {
  const data = Buffer.from(serialize(config), "utf8");
  const settings = githubSettings();
  if (!settings) {
    localAllowed();
    fs.writeFileSync(contentFile(), data);
    return blobSha(data);
  }

  const ref = `/git/refs/heads/${encodeURIComponent(settings.branch)}`;
  const head = await github<{ object: { sha: string } }>(settings, ref);
  const commit = await github<{ tree: { sha: string } }>(settings, `/git/commits/${head.object.sha}`);
  const tree = await github<{ sha: string }>(settings, "/git/trees", "POST", {
    base_tree: commit.tree.sha,
    tree: [
      { path: CONTENT_PATH, mode: "100644", type: "blob", content: data.toString("utf8") },
      ...images.map((image) => ({
        path: `${IMAGES_PATH}/${image.url.slice(IMAGES_URL.length + 1)}`,
        mode: "100644",
        type: "blob",
        sha: image.blobSha,
      })),
    ],
  });
  const next = await github<{ sha: string }>(settings, "/git/commits", "POST", {
    message,
    tree: tree.sha,
    parents: [head.object.sha],
  });
  try {
    await github(settings, ref, "PATCH", { sha: next.sha });
  } catch (error) {
    // 422: the branch moved since we read it (not a fast-forward).
    if (error instanceof RepositoryError && error.upstream === 422) {
      throw new RepositoryError("Le site a été modifié pendant la publication. Rechargez la page.", 409);
    }
    throw error;
  }
  return blobSha(data);
}
