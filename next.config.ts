import type { NextConfig } from "next";

/**
 * GitHub Pages can only serve a static export: there is no Node runtime, so
 * `output: "export"` is mandatory there and the API route cannot exist. The
 * live demo therefore talks to the FastAPI backend directly from the browser
 * (see `NEXT_PUBLIC_API_BASE` in `app/components/LiveDemo.tsx`).
 *
 * `NEXT_PUBLIC_BASE_PATH` is only needed for a PROJECT site
 * (`https://<user>.github.io/<repo>/`); leave it empty for a user/organisation
 * page (`https://<user>.github.io/`). The Pages workflow below sets it
 * automatically from the repository name.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const isPages = process.env.NEXT_OUTPUT === "export";

const nextConfig: NextConfig = {
  ...(isPages ? { output: "export" } : {}),
  // Pages has no image optimiser.
  images: { unoptimized: true },
  // Pages serves `404.html` for a missing URL, so links must carry `.html`.
  trailingSlash: true,
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;
