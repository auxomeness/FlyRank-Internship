# Personal Website Hosting And DNS

## Deliverable Link

Live HTTPS portfolio:

```text
https://austinpavia.dev
```

## What The Site Contains

- Positioning: backend-focused full-stack developer with UI/UX awareness
- Featured work and project links
- GitHub link: `https://github.com/auxomeness`
- LinkedIn link: `https://www.linkedin.com/in/karlaustinpavia`
- CV download: `/assets/Karl_Austin_Pavia_CV.pdf`
- Booking/contact link: email-based booking request

## Hosting Check

I checked the live URL with:

```bash
curl -I -L https://austinpavia.dev
```

The response returned:

```text
HTTP/2 200
server: Vercel
strict-transport-security: max-age=63072000
content-type: text/html; charset=utf-8
```

That proves the site is public, reachable, and loading over HTTPS.

## DNS Walkthrough

See `dns-walkthrough.md`.

## Manual Account Check

The assignment also asks that the site be linked from LinkedIn and the CV. The portfolio contains the LinkedIn and CV links. The remaining manual check is to confirm the live URL is also present on the actual LinkedIn profile and latest CV copy.
