# Explain It Like You Built It

Portfolio: https://austinpavia.dev

Piece I chose: how the portfolio navigation links connect to sections on the page.

## The Real Code Piece

In my portfolio, the top navigation has links like this:

```html
<a href="#identity">Identity</a>
<a href="#experience">Experience</a>
<a href="#work">Work</a>
<a href="#stack">Stack</a>
<a href="#contact">Contact</a>
```

Those links point to sections with matching IDs:

```html
<section class="identity light-section" id="identity">
<section class="work light-section" id="work">
<section class="stack-section light-section" id="stack">
<footer class="site-footer dark-section" id="contact">
```

## Plain-Words Explanation

The navigation on my portfolio works by matching a link's `href` to a section's `id`.

When a link starts with `#`, it does not open a new page. It tells the browser to move to a specific part of the same page. For example, the Work link uses `href="#work"`. The browser looks for an element with `id="work"` and scrolls to that section. That is why my selected work section has `<section id="work">`.

The same pattern is used for Identity, Experience, Stack, and Contact. The link and the section have to spell the name the same way. If the nav says `href="#contact"` but the footer does not have `id="contact"`, the link will not know where to go.

I also use this pattern outside the top nav. In the hero section, the `View work` button points to `#work`, and the `Contact` button points to `#contact`. That keeps the page focused on my main actions: show the work or contact me.

The JavaScript also finds these section links with:

```js
document.querySelectorAll(".nav-links a[href^='#']")
```

That means: find every link inside `.nav-links` where the `href` starts with `#`. The script can then treat those as page-section links, not outside links like email, GitHub, or the CV download.

In my own words, the system is simple: the HTML gives every important section a name, the nav links call those names, and the browser handles the jump. The JavaScript only adds behavior on top of that. The basic navigation would still make sense because the page structure is already clear in the HTML.

## What Codex Tutored Me On

Codex helped me separate two things I was mixing up:

- `href="#work"` is the browser's built-in same-page navigation.
- JavaScript is only an enhancement that can track or style those links.

That helped me understand that the site is not dependent on complicated routing. It is one page with named sections and links that point to those names.
