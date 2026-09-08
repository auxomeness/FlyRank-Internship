# DNS Walkthrough

DNS is the system that turns a human-friendly website name into the technical address a computer needs. People remember names like `austinpavia.dev`, but browsers need to know which hosting service should answer the request. DNS is the lookup system in the middle.

When someone types `https://austinpavia.dev`, the browser first asks a DNS resolver for help. The resolver is usually provided by an internet provider, a company like Google or Cloudflare, or the network the person is using. The resolver does not host the website itself. Its job is to find the right DNS records.

The resolver asks the domain's nameservers for the records attached to the domain. Nameservers are the authoritative place where the domain's DNS settings live. If the domain is connected to a host like Vercel, Netlify, Cloudflare Pages, or GitHub Pages, the DNS records tell traffic where to go.

A DNS record is an instruction for the domain. One common record is an `A` record, which points a domain directly to an IP address. Another common record is a `CNAME` record. A CNAME does not point to an IP address directly; it points one name to another name. For example, a `www` subdomain might use a CNAME to point `www.example.com` to a hosting provider's domain. Then the hosting provider handles the final routing.

After the resolver finds the correct record, it sends the answer back to the browser. The browser can then connect to the host. The host checks the requested domain, finds the matching deployed site, and sends back the website files. HTTPS adds the secure layer: the browser and host use a certificate so the visitor knows the connection is encrypted and belongs to the correct site.

In plain terms, DNS is like asking, "Who is responsible for this website name?" The resolver asks the right nameserver, the nameserver returns the record, and the browser uses that answer to reach the hosting provider. The hosting provider then serves the actual website.

For this portfolio, the public site is `https://austinpavia.dev`. It is hosted on Vercel, and the HTTPS check returns `HTTP/2 200`, which means the host is answering successfully over a secure connection.
