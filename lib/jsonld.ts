import { site, stack } from "./content";
import { siteUrl } from "./site-url";

/** schema.org Person, built only from existing content. */
export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    jobTitle: "Backend engineer",
    description: site.summary,
    url: siteUrl,
    sameAs: [site.github, site.linkedin],
    knowsAbout: stack,
    address: { "@type": "PostalAddress", addressLocality: site.location },
  };
}

/** Serialized for an inline script tag. "<" is escaped so the JSON can never close the tag early. */
export function personJsonLdString(): string {
  return JSON.stringify(personJsonLd()).replace(/</g, "\\u003c");
}
