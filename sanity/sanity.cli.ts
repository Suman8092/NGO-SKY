import { defineCliConfig } from "sanity/cli";

const projectId =
  process.env.SANITY_STUDIO_PROJECT_ID ??
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset =
  process.env.SANITY_STUDIO_DATASET ?? process.env.NEXT_PUBLIC_SANITY_DATASET;

if (!projectId || !dataset) {
  throw new Error(
    "SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET are required for Sanity CLI commands.",
  );
}

export default defineCliConfig({ api: { projectId, dataset } });
