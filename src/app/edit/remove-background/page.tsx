import type { Metadata } from "next";
import { getTool, toolPath } from "@/lib/registry/tools";
import RemoveBackgroundEditor from "./RemoveBackgroundEditor";

const tool = getTool("edit", "remove-background");

export const metadata: Metadata = {
  title: tool?.name,
  description: tool?.description,
  alternates: { canonical: tool ? toolPath(tool) : undefined },
};

export default function RemoveBackgroundPage() {
  return <RemoveBackgroundEditor />;
}
