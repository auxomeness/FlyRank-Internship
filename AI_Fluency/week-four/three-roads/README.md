# Three Roads: Choose The Stack

Portfolio: https://austinpavia.dev

## My Four Constraints

Free only: the stack and hosting should stay on free tiers.

Honest skill level: I can write HTML, CSS, JavaScript, React, Node, and Express, but I want this portfolio to stay maintainable and easy to explain.

What the portfolio needs to do: it needs to present my one-line claim, featured case studies, project screenshots, GitHub links, a short about section, a primary tech stack, and contact links. The strongest work should lead: CodeGuard AI / Compass AI, then APoS, EXPY, and LUMEN.

How the work must be displayed: real screenshots, live project links, GitHub repositories, and short case-study writing. Nothing needs to be dynamic at launch. A backend is not needed yet.

## Option 1: No-Code Builder

How I would build it: use a free no-code builder like Carrd or a simple page builder, then arrange sections for hero, work, about, and contact.

Where I would host it free: the builder's free hosting, or a free published page from the platform.

Does it need a backend: no.

How well it shows my work: it can show screenshots and links quickly, but the site itself would not prove much about my ability to ship and maintain code.

Real trade-off: fastest path, but weaker as developer proof. I would depend more on the tool and less on my own code.

## Option 2: Plain HTML/CSS/JavaScript On A Free Host

How I would build it: write a static portfolio with HTML, CSS, and JavaScript. Keep the structure simple: hero, selected work, about, stack, and contact. Use real screenshots and project links.

Where I would host it free: Vercel, Netlify, GitHub Pages, or Cloudflare Pages. I am using Vercel with the custom domain `austinpavia.dev`.

Does it need a backend: no, not at launch.

How well it shows my work: strong fit. It gives me full control over layout, project sections, screenshots, and links while keeping the code small enough to maintain.

Real trade-off: I have to manage the code and deployment myself, but that is also part of the proof.

## Option 3: Framework Site

How I would build it: use a framework like Next.js or Astro with components, routing, and a more formal project structure.

Where I would host it free: Vercel, Netlify, or Cloudflare Pages.

Does it need a backend: not necessarily, but the framework adds more setup and maintenance.

How well it shows my work: it can show the work well, but it is more than the portfolio needs right now.

Real trade-off: more scalable later, but easier to overbuild. I could spend time maintaining framework details instead of improving the case studies.

## Pressure-Test The Front-Runner

Front-runner: plain HTML/CSS/JavaScript on Vercel.

What breaks if I pick the simplest option: if I pick no-code, the portfolio can still look fine, but the build itself does not support my developer claim. It becomes more like a presentation than proof of shipping code.

What do I maintain if I pick the most powerful option: if I pick a framework, I maintain dependencies, routing, build configuration, and framework conventions. That is useful for some projects, but unnecessary for a mostly static portfolio.

Can I finish in two weeks: yes. Plain HTML/CSS/JavaScript is small enough to finish and revise without getting blocked by setup.

Does it show my work well: yes. It supports real screenshots, case-study sections, live links, GitHub links, and a clean contact path.

Can I maintain this: yes. I understand the files, deployment, and hosting. I can explain how the site works without hiding behind a tool.

## Decision

I chose plain HTML/CSS/JavaScript hosted on Vercel with the custom domain `austinpavia.dev`.

I chose it because it matches the portfolio's real job: show backend-focused full-stack work through case studies, screenshots, GitHub links, and contact actions. It does not need a backend yet, and adding one now would be pretending the site has requirements it does not have. I can maintain this stack because the project is small, the files are direct, and the deployment is simple. It also shows my work well because the site itself is code I can own, while the project screenshots and case studies stay louder than the framework.

I did not choose no-code because it is fast but weaker as developer proof. I did not choose a heavier framework because it adds maintenance before the portfolio needs it.
