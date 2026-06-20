import type { ToolMeta } from "~/lib/processors";

export function websiteSchema(siteUrl: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MinifyKit",
    url: siteUrl,
    description,
    inLanguage: "en",
  };
}

export function toolApplicationSchema(tool: ToolMeta, canonicalUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.title.replace(/\s+—\s+MinifyKit$/, ""),
    description: tool.description,
    url: canonicalUrl,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    publisher: {
      "@type": "Organization",
      name: "MinifyKit",
    },
  };
}
