import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";

import { schemaTypes } from "./schemaTypes";

function requiredEnvironmentValue(
  name: string,
  value: string | undefined,
): string {
  if (!value) {
    throw new Error(`${name} is required to start Skymeredian Studio.`);
  }
  return value;
}

const projectId = requiredEnvironmentValue(
  "SANITY_STUDIO_API_PROJECT_ID or SANITY_STUDIO_PROJECT_ID",
  process.env.SANITY_STUDIO_API_PROJECT_ID ??
    process.env.SANITY_STUDIO_PROJECT_ID ??
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
);
const dataset = requiredEnvironmentValue(
  "SANITY_STUDIO_API_DATASET or SANITY_STUDIO_DATASET",
  process.env.SANITY_STUDIO_API_DATASET ??
    process.env.SANITY_STUDIO_DATASET ??
    process.env.NEXT_PUBLIC_SANITY_DATASET,
);

export default defineConfig({
  name: "skymeredian",
  title: "Skymeredian Foundation",
  projectId,
  dataset,
  plugins: [structureTool()],
  schema: { types: schemaTypes },
  document: {
    newDocumentOptions: (previous) =>
      previous.filter(({ templateId }) => !templateId.startsWith("system.")),
  },
});
