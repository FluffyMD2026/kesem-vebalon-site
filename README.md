# Kesem Vebalon Website

Static Hebrew website for Kesem Vebalon.

## Brand colors

The site palette is controlled from the first variables in `theme.css`:

```css
--logo-blue: #22b4d6;
--logo-pink: #f39ab7;
--logo-silver: #c0c0c0;
--logo-ivory: #f7efe6;
--logo-gold: #b98246;
```

Change only those values when the logo colors change. Buttons, backgrounds,
cards, service bullets, shadows, animated balloons, and accessibility controls
derive their colors automatically from that palette. The cropped website marks
are `Images/logo-primary.png` and `Images/logo-icon.png`.

## Local preview

```sh
bash scripts/serve-local.sh
```

Then open:

```text
http://localhost:8000
```

The local preview watches `Images/Gallery`. Move photos among the five category
folders and the open homepage or gallery will reload automatically; no HTML
editing is needed. The same gallery index is generated during a Netlify deploy.

## Netlify

Build command:

```text
bash scripts/generate-gallery.sh
```

Publish directory:

```text
.
```

Security headers, browser permissions, HTTPS enforcement, and cache policies
are maintained in `netlify.toml`. The optimized versioned logo files are used
by the live pages; the original PNG package remains available as the source.

## Performance check

Run the conservative raw-payload estimate for a 10 Mbps connection with:

```sh
bash scripts/check-performance.sh
```

The calculation deliberately ignores CDN compression, browser caching, and
parallel HTTP/2 requests, so deployed repeat visits should be faster.

## Search metadata

The current canonical origin is `https://kesem-vebalon.netlify.app`. Canonical
links, social metadata, `robots.txt`, `sitemap.xml`, and the homepage structured
data use this value. When a custom domain is connected, replace the old origin
in those files, update the structured-data CSP hash in `netlify.toml`, redirect
the Netlify hostname to the custom domain, and resubmit the sitemap in Google
Search Console.
