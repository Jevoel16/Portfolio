---
title: Hardening a static portfolio with security headers
short: Security headers
date: 2026-11-04
summary: A static site has no login or database, but the browser can still be told how to treat it. These are the headers this portfolio sends on Vercel, and why each one is there.
tags: [web-security, headers, vercel]
constellation: security
---

A portfolio built with Vite is only HTML, CSS and JavaScript files. There is no server code to exploit, no
database to dump and no session to steal. That makes it tempting to skip security entirely.

But the browser still makes decisions about the page: which scripts it may run, whether it can be framed by
another site, whether it should ever be loaded over plain HTTP. **Response headers** are how a site answers
those questions, and on a static host they cost nothing.

## The headers

This site sets them in `vercel.json`, so every response carries them:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ]
}
```

### Strict-Transport-Security (HSTS)

After the first visit over HTTPS, the browser refuses to load the site over HTTP for the given `max-age`
(two years here). This closes the gap where someone on the same network could intercept the very first,
unencrypted request and downgrade the connection.

### X-Content-Type-Options

`nosniff` tells the browser to trust the `Content-Type` the server sends instead of guessing. Without it, a
file served as text could be "sniffed" and run as a script.

### Referrer-Policy

When a visitor clicks a link to another site, `strict-origin-when-cross-origin` sends only the origin
(`https://www.jevoelorbilla.dev`), never the full path they were on.

### X-Frame-Options and frame-ancestors

`DENY` stops other sites from loading this page inside an `<iframe>`, which is the setup behind
clickjacking: an invisible frame placed over a button the victim thinks they are clicking.

## Content Security Policy

The most powerful header is `Content-Security-Policy`. It lists where scripts, styles, fonts and images
may come from. If an attacker ever managed to inject a `<script>` tag, a strict policy stops it from running.

A policy for a site like this one starts from "only my own origin" and opens up only what is needed:

```text
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data:;
font-src 'self';
connect-src 'self';
frame-ancestors 'none';
base-uri 'self';
form-action 'none'
```

Self-hosting the fonts is what makes `font-src 'self'` possible. Loading them from a font CDN would mean
trusting another origin.

## Checking the result

Open the browser's developer tools, reload the page and look at the response headers of the document
request. Any resource blocked by the policy shows up in the console as a CSP violation, which is the
signal to either fix the resource or loosen the policy on purpose.

Free scanners such as [Mozilla HTTP Observatory](https://developer.mozilla.org/en-US/observatory) grade
the headers and explain anything missing.

## Takeaway

Security on a static site is mostly about **telling the browser what not to allow**. A few lines of
configuration cover transport security, content sniffing, referrer leaks, clickjacking and injected
scripts.
