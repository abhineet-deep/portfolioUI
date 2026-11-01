const FALLBACK = "https://portfolio-ui-five-hazel.vercel.app";

/** Absolute site origin: NEXT_PUBLIC_SITE_URL when set, otherwise the Vercel deployment URL. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? FALLBACK).replace(/\/+$/, "");
