import type { NextConfig } from "next";

// CONFLICT NOTE: 'standalone' is required for the Docker setup; 'export' is required for
// GitHub Pages. The NEXT_OUTPUT env var selects the mode at build time:
//   - Docker builds leave NEXT_OUTPUT unset  → standalone (server bundle, used by Dockerfile)
//   - GitHub Actions sets NEXT_OUTPUT=export → static export written to out/ (GitHub Pages)
//
// REPO_NAME must match this repository's name on GitHub (e.g. "todo-ai-3").
// In the CI workflow it is injected automatically via ${{ github.event.repository.name }}.
// To build the static export locally, run:
//   NEXT_OUTPUT=export REPO_NAME=[REPO_NAME] npm run build
const isStaticExport = process.env.NEXT_OUTPUT === "export";
const repoName = process.env.REPO_NAME ?? "[REPO_NAME]";

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : "standalone",
  basePath: isStaticExport ? `/${repoName}` : "",
  assetPrefix: isStaticExport ? `/${repoName}/` : "",
  images: {
    unoptimized: isStaticExport,
  },
};

export default nextConfig;
