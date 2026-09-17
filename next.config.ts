import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

// The home directory is itself a git repo, so Next's automatic workspace-root
// detection walks all the way up to ~. Pin it to this project.
const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: { root: projectRoot },
  outputFileTracingRoot: projectRoot,
};

export default nextConfig;
