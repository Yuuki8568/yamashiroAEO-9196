import { useEffect } from "react";

function setMeta(attr: "name" | "property", key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let tag = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
}

/**
 * Sets the per-page title, description, canonical and JSON-LD.
 * jsonLd entries are keyed by id so navigating replaces them instead of stacking.
 */
export function Head({
  title,
  description,
  canonical,
  jsonLd,
}: {
  title: string;
  description: string;
  canonical?: string;
  jsonLd?: Record<string, unknown>[];
}) {
  useEffect(() => {
    document.title = title;
    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    if (canonical) {
      setMeta("property", "og:url", canonical);
      setLink("canonical", canonical);
    }

    const nodes = (jsonLd ?? []).map((data) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.head = "page";
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
      return script;
    });
    return () => nodes.forEach((node) => node.remove());
  }, [title, description, canonical, jsonLd]);

  return null;
}
