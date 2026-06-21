import type { Metadata } from "next";
import { getTool, toolPath } from "@/lib/registry/tools";
import CompressEditor from "./CompressEditor";

const tool = getTool("optimize", "compress");

export const metadata: Metadata = {
  title: tool?.name,
  description: tool?.description,
  alternates: { canonical: tool ? toolPath(tool) : undefined },
};

export default function CompressPage() {
  return <CompressEditor />;
}
