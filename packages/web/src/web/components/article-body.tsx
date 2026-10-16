import { marked } from "marked";
import { useMemo } from "react";

marked.setOptions({ gfm: true, breaks: false });

export function ArticleBody({ markdown }: { markdown: string }) {
  const html = useMemo(() => marked.parse(markdown) as string, [markdown]);
  // Content is authored by the site owner and the scheduled agent, not by visitors.
  return <div className="prose-jp" dangerouslySetInnerHTML={{ __html: html }} />;
}
