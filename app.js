/* Varija Manglik — site engine.
   All words, images and files live in /content/*.json and are edited in Pages CMS.
   You should never need to touch this file to update the site. */

(() => {
  "use strict";

  const FILES = ["settings", "about", "experience", "projects", "research", "portfolio",
    "achievements", "writing", "creative", "shop", "timeline", "pages"];

  const SECTIONS = [
    { id: "about", title: "About", blurb: "My story, education, timeline and the things I love" },
    { id: "experience", title: "Experience", blurb: "Jobs, internships, leadership and campus life" },
    { id: "projects", title: "Projects", blurb: "Things I have built, designed and shipped" },
    { id: "research", title: "Research", blurb: "Questions I have chased, and where I presented them" },
    { id: "portfolio", title: "Portfolio", blurb: "Work samples from consulting, marketing, data and design" },
    { id: "achievements", title: "Achievements", blurb: "Awards, honors and milestones" },
    { id: "writing", title: "Writing", blurb: "Essays, reports, letters and ideas in progress" },
    { id: "creative", title: "Creative", blurb: "Art, photography and travel" },
    { id: "shop", title: "Shop", blurb: "Prints, originals and things I make" },
    { id: "contact", title: "Contact", blurb: "Write to me or book a time" },
  ];
  const NAV_MAIN = ["about", "experience", "projects", "research", "writing", "creative", "contact"];

  let C = {};
  const app = document.getElementById("app");
  const head = document.getElementById("site-head");

  /* ---------- helpers ---------- */
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const slugify = (s) => String(s || "").toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/[\s_]+/g, "-").replace(/-+/g, "-");
  const slugOf = (it) => it.slug ? slugify(it.slug) : slugify(it.title || it.name);
  const arr = (x) => Array.isArray(x) ? x.filter((v) => v !== null && v !== undefined && v !== "") : [];
  const has = (s) => s !== undefined && s !== null && String(s).trim() !== "";
  const isExternal = (u) => /^(https?:)?\/\//.test(u) || /^mailto:|^tel:/.test(u);
  const hidden = (id) => arr(C.settings?.hidden_sections).map((s) => String(s).toLowerCase()).includes(id);
  const visibleSections = () => SECTIONS.filter((s) => !hidden(s.id));
  const assetUrl = (p) => {
    if (!has(p)) return "";
    if (isExternal(p) || p.startsWith("data:")) return p;
    return p.replace(/^\/+/, "");
  };

  function hash(str) { let h = 2166136261; for (const c of String(str)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  const ICON = {
    out: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 3h7v7M13 3 4 12"/></svg>',
    file: '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 1.5h5l3 3v10H4z M9 1.5v3h3"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
  };

  /* Mughal arch outline, in a w×h box */
  function archPath(x, y, w, h) {
    const s = y + h * 0.4, c = y + h * 0.08;
    return `M${x},${y + h} V${s} Q${x},${c} ${x + w / 2},${y} Q${x + w},${c} ${x + w},${s} V${y + h} Z`;
  }
  function starPath(cx, cy, R, r) {
    let d = "";
    for (let k = 0; k < 16; k++) {
      const a = (Math.PI / 8) * k - Math.PI / 2;
      const rad = k % 2 === 0 ? R : r;
      d += (k ? "L" : "M") + (cx + Math.cos(a) * rad).toFixed(1) + "," + (cy + Math.sin(a) * rad).toFixed(1);
    }
    return d + "Z";
  }

  /* Generative pietra-dura "inlay" covers for anything without an image */
  const STONES = ["var(--lapis)", "var(--jade)", "var(--marigold)", "var(--carnelian)", "var(--ink)"];
  function inlay(key) {
    const r = rng(hash(key));
    const pick = () => STONES[Math.floor(r() * STONES.length)];
    const kind = Math.floor(r() * 4);
    let g = "";
    if (kind === 0) { // central flower
      const n = 8, a = pick(), b = pick();
      for (let i = 0; i < n; i++) g += `<ellipse cx="150" cy="70" rx="13" ry="38" fill="${i % 2 ? a : b}" transform="rotate(${i * 45} 150 112)"/>`;
      g += `<circle cx="150" cy="112" r="16" fill="var(--marigold)"/><circle cx="150" cy="112" r="6" fill="var(--marble)"/>`;
      [[0, 0], [300, 0], [0, 225], [300, 225]].forEach(([x, y]) => g += `<circle cx="${x}" cy="${y}" r="44" fill="none" stroke="${pick()}" stroke-width="10"/>`);
    } else if (kind === 1) { // field of stars
      for (let y = 0; y < 4; y++) for (let x = 0; x < 6; x++) {
        const cx = 25 + x * 50, cy = 37 + y * 50;
        g += `<path d="${starPath(cx, cy, 22, 15)}" fill="${r() < .35 ? pick() : "none"}" stroke="var(--ink)" stroke-opacity=".25" stroke-width="1.2"/>`;
      }
    } else if (kind === 2) { // nested arches
      const cols = [pick(), pick(), pick(), pick()];
      for (let i = 0; i < 4; i++) {
        const w = 200 - i * 44, h = 200 - i * 40;
        g += `<path d="${archPath(150 - w / 2, 225 - h, w, h)}" fill="${cols[i]}"/>`;
      }
    } else { // arches as a bar chart
      const n = 6, w = 36, gap = 10;
      for (let i = 0; i < n; i++) {
        const h = 50 + r() * 140, x = 22 + i * (w + gap);
        g += `<path d="${archPath(x, 205 - h, w, h)}" fill="${pick()}"/>`;
      }
      g += `<rect x="16" y="205" width="268" height="3" fill="var(--ink)"/>`;
    }
    return `<svg viewBox="0 0 300 225" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true"><rect width="300" height="225" fill="var(--marble-2)"/>${g}</svg>`;
  }
  const coverHTML = (src, key, alt = "") => has(src)
    ? `<img src="${esc(assetUrl(src))}" alt="${esc(alt)}" loading="lazy">`
    : inlay(key);

  function linksHTML(links) {
    const items = arr(links).map((l) => {
      const href = assetUrl(l.file) || assetUrl(l.url);
      if (!href) return "";
      const isFile = has(l.file) || /\.(pdf|docx?|pptx?|xlsx?)$/i.test(href);
      const label = has(l.label) ? l.label : (isFile ? "Open file" : "Visit link");
      return `<a class="link-chip" href="${esc(href)}" target="_blank" rel="noopener">${esc(label)} ${isFile ? ICON.file : ICON.out}</a>`;
    }).join("");
    return items ? `<div class="links">${items}</div>` : "";
  }
  const tagsHTML = (tags) => arr(tags).length ? `<ul class="tags">${arr(tags).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : "";

  function emptyState(title, note) {
    return `<div class="empty"><svg viewBox="0 0 120 150" aria-hidden="true"><path d="${archPath(6, 6, 108, 138)}" fill="none" stroke="var(--lapis)" stroke-width="3"/><path d="${archPath(24, 34, 72, 110)}" fill="var(--marble-2)"/><path d="${starPath(60, 96, 18, 12)}" fill="var(--marigold)"/></svg><div><b>${esc(title)}</b><p>${esc(note)}</p></div></div>`;
  }

  let currentSec = "";
  function pageHead(title, lede, crumb) {
    const stone = SECTIONS.some((x) => x.id === currentSec) ? `<div class="head-3d" aria-hidden="true"></div>` : "";
    return `<header class="page-head"><div class="wrap head-grid"><div>${crumb ? `<a class="crumb" href="${crumb[1]}">${esc(crumb[0])}</a>` : ""}<h1>${esc(title)}</h1>${has(lede) ? `<p class="lede">${esc(lede)}</p>` : ""}</div>${stone}</div></header>`;
  }

  /* ---------- counts per section (for the jali captions) ---------- */
  function count(id) {
    switch (id) {
      case "experience": return arr(C.experience?.items).length;
      case "projects": return arr(C.projects?.items).length;
      case "research": return arr(C.research?.items).length + arr(C.research?.conferences).length;
      case "portfolio": return arr(C.portfolio?.items).length;
      case "achievements": return arr(C.achievements?.items).length;
      case "writing": return arr(C.writing?.posts).length + arr(C.writing?.ideas).length;
      case "creative": return arr(C.creative?.art).length + arr(C.creative?.photography).length + arr(C.creative?.travel).length;
      case "shop": return arr(C.shop?.items).length;
      default: return null;
    }
  }
  const countText = (id) => { const n = count(id); return n === null ? "" : n === 0 ? "Coming soon" : `${n} ${n === 1 ? "entry" : "entries"}`; };

  /* ---------- the jali: a lattice window that is also the site map ---------- */
  function jali() {
    const spots = { about: [1, 232], experience: [3, 232], projects: [0, 340], research: [2, 340], portfolio: [4, 340],
      achievements: [1, 448], writing: [3, 448], creative: [0, 556], shop: [2, 556], contact: [4, 556] };
    const used = {};
    visibleSections().forEach((s) => { const [c, y] = spots[s.id]; used[`${c},${y}`] = s; });
    const xs = [64, 172, 280, 388, 496], ys = [16, 124, 232, 340, 448, 556];
    const R = 54, r = 38;
    let cells = "", i = 0;
    ys.forEach((y) => xs.forEach((x, c) => {
      const s = used[`${c},${y}`];
      const d = i++;
      if (s) {
        cells += `<a class="cell" style="--d:${d}" href="#/${s.id}" data-id="${s.id}" aria-label="${esc(s.title)}: ${esc(s.blurb)}">
          <path class="hole" d="${starPath(x, y, R, r)}"/><path class="glow" d="${starPath(x, y, R - 4, r - 3)}"/>
          <text class="lbl" x="${x}" y="${y + 5}" text-anchor="middle">${esc(s.title)}</text></a>`;
      } else {
        cells += `<path class="cell hole" style="--d:${d}" d="${starPath(x, y, R, r)}"/>`;
      }
    }));
    const arch = archPath(10, 10, 540, 600);
    return `<svg class="jali" viewBox="0 0 560 620" role="navigation" aria-label="Site map">
      <defs><clipPath id="jali-clip"><path d="${arch}"/></clipPath></defs>
      <path class="stone" d="${arch}"/>
      <g clip-path="url(#jali-clip)">${cells}</g>
      <path class="frame" d="${archPath(2, 2, 556, 616)}"/>
    </svg>`;
  }
  function wireJali() {
    const cap = document.getElementById("jali-caption");
    if (!cap) return;
    const def = cap.innerHTML;
    document.querySelectorAll(".jali a").forEach((a) => {
      const s = SECTIONS.find((x) => x.id === a.dataset.id);
      const show = () => {
        const n = countText(s.id);
        cap.innerHTML = `<strong>${esc(s.title)}</strong><span>${esc(s.blurb)}${n ? `. ${esc(n)}.` : "."}</span>`;
      };
      a.addEventListener("mouseenter", show); a.addEventListener("focus", show);
      a.addEventListener("mouseleave", () => cap.innerHTML = def); a.addEventListener("blur", () => cap.innerHTML = def);
    });
  }

  /* ---------- pages ---------- */
  function home() {
    const s = C.settings || {};
    const [first, ...rest] = String(s.name || "").split(" ");
    const featured = arr(C.projects?.items).filter((p) => p.featured).slice(0, 3);
    const work = featured.length ? featured : arr(C.projects?.items).slice(0, 3);
    const posts = arr(C.writing?.posts).slice(0, 3);
    const stats = arr(s.stats).filter((x) => has(x.value));
    return `
    <section class="hero hero3d" aria-labelledby="hero-name">
      <div class="stage" id="stage3d"></div>
      <div class="wrap hero-grid">
      <div class="hero-copy">
        <h1 id="hero-name"><span>${esc(first)}</span><span>${esc(rest.join(" "))}</span></h1>
        ${has(s.tagline) ? `<p class="tagline">${esc(s.tagline)}</p>` : ""}
        ${has(s.intro) ? `<p class="intro">${esc(s.intro)}</p>` : ""}
        <div class="btn-row">
          <a class="btn solid" href="#/projects">See my work</a>
          ${has(s.resume) ? `<a class="btn" href="${esc(assetUrl(s.resume))}" target="_blank" rel="noopener">Download résumé</a>` : ""}
          <a class="btn" href="#/contact">Book a call</a>
        </div>
        <p class="clock" id="clock"></p>
      </div>
      <p class="jali-caption" id="jali-caption"><strong>Drag to spin the ring</strong><span>Each stone is a part of my work. Click one to step inside.</span></p>
    </div></section>

    ${arr(s.now).length ? `<section class="band"><div class="wrap now-grid">
      <h2>Right now</h2>
      <div><ul class="now-list">${arr(s.now).map((n) => `<li>${esc(n)}</li>`).join("")}</ul>
      ${has(s.open_to) ? `<p class="open-to">Open to: ${esc(s.open_to)}.</p>` : ""}</div>
    </div></section>` : ""}

    ${stats.length ? `<section class="band" aria-label="By the numbers"><div class="wrap"><div class="ledger">${stats.map((x) => `<div><b>${esc(x.value)}</b><span>${esc(x.label)}</span></div>`).join("")}</div></div></section>` : ""}

    ${work.length && !hidden("projects") ? `<section class="band"><div class="wrap">
      <div class="band-head"><h2>Selected work</h2><a href="#/projects">All projects</a></div>
      <div class="rows">${work.map(projectRow).join("")}</div>
    </div></section>` : ""}

    ${posts.length && !hidden("writing") ? `<section class="band"><div class="wrap">
      <div class="band-head"><h2>Recent writing</h2><a href="#/writing">All writing</a></div>
      ${postList(posts)}
    </div></section>` : ""}

    <section class="band"><div class="wrap">
      <div class="band-head"><h2>Everything here</h2></div>
      <ul class="index-list home-index">${indexItems(true)}</ul>
    </div></section>`;
  }

  function indexItems(light) {
    const custom = arr(C.pages?.items).filter((p) => p.show_in_nav !== false);
    return visibleSections().map((s) => `<li><a href="#/${s.id}"><span class="t">${esc(s.title)}</span><span class="d">${esc(countText(s.id) || s.blurb)}</span></a></li>`).join("")
      + custom.map((p) => `<li><a href="#/p/${slugOf(p)}"><span class="t">${esc(p.title)}</span><span class="d">${esc(p.intro || "")}</span></a></li>`).join("");
  }

  function projectRow(p) {
    const meta = [p.context, p.year].filter(has).join(", ");
    return `<a class="row" href="#/projects/${slugOf(p)}">
      <div class="cover">${coverHTML(p.cover, p.title, p.title)}</div>
      <div>${has(meta) ? `<div class="meta">${esc(meta)}${has(p.status) && p.status !== "Complete" ? ` <span class="status">${esc(p.status)}</span>` : ""}</div>` : ""}
      <h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p>${tagsHTML(p.tags)}</div></a>`;
  }

  function filtersHTML(values, name) {
    const uniq = [...new Set(values.filter(has))];
    if (uniq.length < 2) return "";
    return `<div class="filters" role="group" aria-label="Filter ${esc(name)}"><button type="button" data-f="*" aria-pressed="true">All</button>${uniq.map((v) => `<button type="button" data-f="${esc(v)}" aria-pressed="false">${esc(v)}</button>`).join("")}</div>`;
  }
  function wireFilters() {
    document.querySelectorAll(".filters").forEach((bar) => {
      const scope = bar.nextElementSibling;
      bar.addEventListener("click", (e) => {
        const b = e.target.closest("button"); if (!b) return;
        bar.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
        const f = b.dataset.f;
        scope.querySelectorAll("[data-cat]").forEach((el) => { el.hidden = !(f === "*" || el.dataset.cat === f); });
      });
    });
  }

  function about() {
    const a = C.about || {};
    const tl = arr(C.timeline?.items);
    return pageHead("About", "", null) + `
    <section class="band"><div class="wrap about-grid">
      <div class="arch">${has(a.photo) ? `<img src="${esc(assetUrl(a.photo))}" alt="Portrait of ${esc(C.settings?.name)}">` : inlay("portrait-" + (C.settings?.name || ""))}</div>
      <div class="prose">${a.bio || ""}</div>
    </div></section>
    <section class="band"><div class="wrap">
      <div class="band-head"><h2>Education</h2></div>
      <div class="edu"><h3>${esc(a.school)}</h3><span class="grad">${esc(a.grad)}</span>
        <p>${esc(a.degree)}${has(a.minors) ? `, minors in ${esc(a.minors)}` : ""}</p>
        ${has(a.programs) ? `<p>${esc(a.programs)}</p>` : ""}
        ${arr(a.honors).length ? `<ul class="honors">${arr(a.honors).map((h) => `<li>${esc(h)}</li>`).join("")}</ul>` : ""}
        ${has(a.previous) ? `<p style="margin-top:14px">Before UMass: ${esc(a.previous)}</p>` : ""}
      </div>
      <div class="facts" style="margin-top:40px">
        ${arr(a.coursework).map((g) => `<div><h3>${esc(g.group)} coursework</h3><p>${esc(g.courses)}</p></div>`).join("")}
      </div>
    </div></section>
    <section class="band"><div class="wrap">
      <div class="band-head"><h2>Skills</h2></div>
      <div class="facts">${arr(a.skills).map((g) => `<div><h3>${esc(g.group)}</h3><p>${esc(g.items)}</p></div>`).join("")}
      ${has(a.languages) ? `<div><h3>Languages</h3><p>${esc(a.languages)}</p></div>` : ""}</div>
    </div></section>
    ${arr(a.passions).length ? `<section class="band"><div class="wrap">
      <div class="band-head"><h2>What I love</h2></div>
      <div class="facts">${arr(a.passions).map((p) => `<div><h3>${esc(p.title)}</h3><p>${esc(p.note)}</p></div>`).join("")}</div>
    </div></section>` : ""}
    ${tl.length ? `<section class="band"><div class="wrap">
      <div class="band-head"><h2>Timeline</h2></div>
      <ol class="timeline">${tl.map((t) => `<li><span class="d">${esc(t.date)}</span><div><b>${esc(t.title)}</b>${has(t.note) ? `<span>${esc(t.note)}</span>` : ""}</div></li>`).join("")}</ol>
    </div></section>` : ""}`;
  }

  function experience() {
    const items = arr(C.experience?.items);
    const main = items.filter((e) => e.type !== "Campus");
    const campus = items.filter((e) => e.type === "Campus");
    const when = (e) => [e.start, e.end].filter(has).join(" to ");
    const entry = (e) => {
      const hl = arr(e.highlights);
      const body = has(e.summary) || hl.length || arr(e.links).length || arr(e.tags).length;
      return `<details data-cat="${esc(e.type || "Work")}"><summary>
        <span class="when">${esc(when(e))}</span>
        <span class="role">${esc(e.title)}<span class="org">${esc(e.org)}${has(e.location) ? `, ${esc(e.location)}` : ""}</span></span>
        ${body ? `<span class="plus" aria-hidden="true"></span>` : "<span></span>"}
      </summary>${body ? `<div class="body">${has(e.summary) ? `<p>${esc(e.summary)}</p>` : ""}${hl.length ? `<ul>${hl.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>` : ""}${tagsHTML(e.tags)}${linksHTML(e.links)}</div>` : ""}</details>`;
    };
    return pageHead("Experience", "Where I've worked, what I've led, and the communities I'm part of.") + `
    <section class="band"><div class="wrap">
      ${filtersHTML(main.map((e) => e.type || "Work"), "experience")}
      <div class="exp">${main.map(entry).join("") || emptyState("Nothing here yet", "Add your first role in the editor under Experience.")}</div>
    </div></section>
    ${campus.length ? `<section class="band"><div class="wrap">
      <div class="band-head"><h2>Campus life</h2></div>
      <div class="campus">${campus.map((e) => `<div><b>${esc(e.org)}</b><span>${esc([e.title, e.summary].filter(has).join(". "))}</span>${linksHTML(e.links)}</div>`).join("")}</div>
    </div></section>` : ""}`;
  }

  function projects() {
    const items = arr(C.projects?.items);
    const gh = C.settings?.github;
    return pageHead("Projects", "Things I've built, designed and shipped, alone and with teams.") + `
    <section class="band"><div class="wrap">
      ${has(gh) ? `<div class="links" style="margin-top:0"><a class="link-chip" href="${esc(gh)}" target="_blank" rel="noopener">See my code on GitHub ${ICON.out}</a></div>` : ""}
      ${filtersHTML(items.map((p) => p.category), "projects")}
      <div class="rows">${items.map((p) => projectRow(p).replace('<a class="row"', `<a class="row" data-cat="${esc(p.category || "")}"`)).join("") || emptyState("Projects are on their way", "Add your first project in the editor.")}</div>
    </div></section>`;
  }

  function detail(item, back, extraMeta) {
    if (!item) return notFound();
    const meta = extraMeta.filter(([, v]) => has(v));
    return pageHead(item.title, item.summary, back) + `
    <section class="band"><div class="wrap">
      ${meta.length ? `<div class="detail-meta" style="margin-top:0">${meta.map(([k, v]) => `<span>${esc(k)} <b>${esc(v)}</b></span>`).join("")}</div>` : ""}
      ${tagsHTML(item.tags)}
      <div class="cover detail-cover">${coverHTML(item.cover, item.title, item.title)}</div>
      ${item.question ? `<div class="prose"><h2>The question</h2><p>${esc(item.question)}</p>${has(item.methods) ? `<h2>How</h2><p>${esc(item.methods)}</p>` : ""}${has(item.findings) ? `<h2>What I found</h2><p>${esc(item.findings)}</p>` : ""}</div>` : ""}
      <div class="prose">${item.body || ""}</div>
      ${arr(item.gallery).length ? `<div class="gallery">${arr(item.gallery).map((g) => `<button type="button" data-lightbox="${esc(assetUrl(g))}"><img src="${esc(assetUrl(g))}" alt="" loading="lazy"></button>`).join("")}</div>` : ""}
      ${linksHTML(item.links)}
    </div></section>`;
  }

  function research() {
    const items = arr(C.research?.items);
    const conf = arr(C.research?.conferences);
    return pageHead("Research", "The questions I've chased, how I went after them, and where I've shared what I found.") + `
    <section class="band"><div class="wrap">
      <div class="research">${items.map((r) => `<a class="item" href="#/research/${slugOf(r)}">
        <p class="q">${esc(r.question || r.title)}</p>
        <div><h3>${esc(r.title)}</h3><div class="meta">${esc([r.role, r.period].filter(has).join(", "))}${has(r.status) ? ` <span class="status">${esc(r.status)}</span>` : ""}</div>
        <dl>${has(r.methods) ? `<dt>How</dt><dd>${esc(r.methods)}</dd>` : ""}${has(r.findings) ? `<dt>What I found</dt><dd>${esc(r.findings)}</dd>` : ""}</dl></div>
      </a>`).join("") || emptyState("Research coming soon", "Add a project in the editor under Research.")}</div>
    </div></section>
    <section class="band"><div class="wrap">
      <div class="band-head"><h2>Conferences and talks</h2></div>
      ${conf.length ? `<table class="simple"><thead><tr><th>Event</th><th>When</th><th>Role</th></tr></thead><tbody>${conf.map((c) => `<tr><td>${has(c.link) ? `<a href="${esc(assetUrl(c.link))}" target="_blank" rel="noopener">${esc(c.name)}</a>` : esc(c.name)}${has(c.location) ? `<br><span style="color:var(--ink-soft)">${esc(c.location)}</span>` : ""}${has(c.note) ? `<br><span style="color:var(--ink-soft)">${esc(c.note)}</span>` : ""}</td><td>${esc(c.date)}</td><td>${esc(c.role)}</td></tr>`).join("")}</tbody></table>`
        : emptyState("No talks listed yet", "Conferences you attend or present at will appear here.")}
    </div></section>`;
  }

  function portfolio() {
    const items = arr(C.portfolio?.items);
    return pageHead("Portfolio", "Work samples from consulting, marketing, data and design projects.") + `
    <section class="band"><div class="wrap">
      ${filtersHTML(items.map((p) => p.category), "portfolio")}
      <div class="grid">${items.map((p) => `<div class="tile" data-cat="${esc(p.category || "")}">
        <div class="cover">${coverHTML(p.cover, p.title, p.title)}</div>
        <h3>${esc(p.title)}</h3><div class="meta">${esc([p.category, p.client, p.year].filter(has).join(", "))}</div>
        <p>${esc(p.summary)}</p>${linksHTML(p.links)}</div>`).join("") || emptyState("Samples coming soon", "Add a work sample in the editor under Portfolio.")}</div>
    </div></section>`;
  }

  function achievements() {
    const items = arr(C.achievements?.items);
    return pageHead("Achievements", "Awards, honors and milestones along the way.") + `
    <section class="band"><div class="wrap">
      ${items.length ? `<ul class="awards">${items.map((a) => `<li><span class="yr">${esc(a.date)}</span><b>${has(a.link) ? `<a href="${esc(assetUrl(a.link))}" target="_blank" rel="noopener">${esc(a.title)}</a>` : esc(a.title)}</b><span class="by">${esc(a.issuer)}${has(a.note) ? `. ${esc(a.note)}` : ""}</span></li>`).join("")}</ul>`
        : emptyState("Nothing listed yet", "Add an achievement in the editor.")}
    </div></section>`;
  }

  function postList(posts) {
    return `<ul class="posts">${posts.map((p) => `<li><a href="#/writing/${slugOf(p)}"><span class="yr">${esc(p.date)}</span><div><h3>${esc(p.title)}</h3><p>${esc(p.summary)}</p></div><span class="k">${esc(p.kind)}</span></a></li>`).join("")}</ul>`;
  }
  function writing() {
    const posts = arr(C.writing?.posts);
    const ideas = arr(C.writing?.ideas);
    return pageHead("Writing", "Essays, reports, letters and speeches, plus the ideas I'm still turning over.") + `
    <section class="band"><div class="wrap">${posts.length ? postList(posts) : emptyState("First post coming soon", "Add a post in the editor under Writing.")}</div></section>
    <section class="band"><div class="wrap">
      <div class="band-head"><h2>Ideas in progress</h2></div>
      ${ideas.length ? `<div class="ideas">${ideas.map((i) => `<div class="idea s-${slugify(i.status)}"><span class="status">${esc(i.status)}</span><b>${esc(i.title)}</b><p>${esc(i.note)}</p></div>`).join("")}</div>`
        : emptyState("The idea board is empty", "Half-formed thoughts, business ideas and things to build will live here.")}
    </div></section>`;
  }

  function creative(tab) {
    const cr = C.creative || {};
    const t = ["art", "photography", "travel"].includes(tab) ? tab : "art";
    const tabs = [["art", "Art"], ["photography", "Photography"], ["travel", "Travel"]];
    let body = "";
    if (t === "travel") {
      const trips = arr(cr.travel);
      body = trips.length ? trips.map((tr) => `<article class="trip"><div><h3>${esc(tr.place)}</h3><p class="when">${esc(tr.when)}</p>${tr.story || ""}</div><div class="pics">${arr(tr.images).map((im) => `<button type="button" data-lightbox="${esc(assetUrl(im))}" style="padding:0;border:0;background:none;cursor:zoom-in"><img src="${esc(assetUrl(im))}" alt="${esc(tr.place)}" loading="lazy"></button>`).join("")}</div></article>`).join("")
        : emptyState("No trips yet", "Add a place, a few photos and a short story in the editor.");
    } else {
      const list = arr(cr[t]);
      body = list.length ? `<div class="masonry">${list.map((p) => `<figure><button type="button" data-lightbox="${esc(assetUrl(p.image))}" data-cap="${esc(p.title)}"><img src="${esc(assetUrl(p.image))}" alt="${esc(p.title)}" loading="lazy"></button><figcaption><b>${esc(p.title)}</b>${has(p.medium || p.place) ? `, ${esc(p.medium || p.place)}` : ""}${has(p.year) ? `, ${esc(p.year)}` : ""}${has(p.note) ? `<br>${esc(p.note)}` : ""}</figcaption></figure>`).join("")}</div>`
        : emptyState(t === "art" ? "The gallery is being hung" : "Photos coming soon", `Upload ${t === "art" ? "artwork" : "photos"} in the editor under Creative.`);
    }
    return pageHead("Creative", cr.intro) + `<section class="band"><div class="wrap">
      <div class="tabs" role="tablist">${tabs.map(([id, label]) => `<button role="tab" type="button" aria-selected="${id === t}" data-tab="${id}">${label}</button>`).join("")}</div>
      ${body}</div></section>`;
  }

  function shop() {
    const sh = C.shop || {};
    const items = arr(sh.items);
    return pageHead("Shop", sh.intro) + `<section class="band"><div class="wrap">
      ${items.length ? `<div class="grid">${items.map((p) => `<div class="tile">
        <div class="cover">${coverHTML(p.image, p.name, p.name)}</div>
        <h3>${esc(p.name)}</h3>
        <p><span class="price">${esc(p.price)}</span>${p.status && p.status !== "Available" ? ` <span class="sold">${esc(p.status)}</span>` : ""}</p>
        <p>${esc(p.description)}</p>
        ${p.status !== "Sold out" && has(p.buy_url) ? `<div class="links"><a class="link-chip" href="${esc(p.buy_url)}" target="_blank" rel="noopener">Buy ${ICON.out}</a></div>` : ""}
      </div>`).join("")}</div>`
        : emptyState("The shop opens soon", "Products will appear here with a secure checkout link for each one.")}
    </div></section>`;
  }

  function contact() {
    const s = C.settings || {};
    const channels = [["Email", s.email ? `mailto:${s.email}` : "", s.email], ["LinkedIn", s.linkedin, "Profile"], ["GitHub", s.github, "Code"], ["Instagram", s.instagram, "Art and photos"], ["Résumé", assetUrl(s.resume), "PDF"]].filter(([, u]) => has(u));
    return pageHead("Contact", "Questions, collaborations, commissions, or just to say hi.") + `
    <section class="band"><div class="wrap">
      ${has(s.email) ? `<p class="contact-hero"><a href="mailto:${esc(s.email)}">${esc(s.email)}</a></p><button class="btn" type="button" id="copy-email" style="margin-top:18px">Copy email address</button>` : ""}
    </div></section>
    <section class="band"><div class="wrap contact-grid">
      <div><h2 style="font-size:1.8rem;margin-bottom:18px">Find me</h2><ul class="channels">${channels.map(([n, u, d]) => `<li><a href="${esc(u)}" ${isExternal(u) && !u.startsWith("mailto") ? 'target="_blank" rel="noopener"' : ""}>${esc(n)}<span>${esc(d)}</span></a></li>`).join("")}</ul></div>
      <form class="mail" id="mail-form"><h2 style="font-size:1.8rem;margin-bottom:6px">Write a note</h2>
        <p style="color:var(--ink-soft);font-size:1rem">This opens your email app with the message ready to send.</p>
        <label for="mf-name">Your name</label><input id="mf-name" name="name" required autocomplete="name">
        <label for="mf-msg">Message</label><textarea id="mf-msg" name="msg" required></textarea>
        <button class="btn solid" type="submit" style="margin-top:16px">Open in email</button>
      </form>
    </div></section>
    <section class="band booking"><div class="wrap">
      <div class="band-head"><h2>Book a time</h2></div>
      ${has(s.booking_note) ? `<p class="lede" style="margin-bottom:24px">${esc(s.booking_note)}</p>` : ""}
      ${has(s.booking_url) ? `<iframe src="${esc(s.booking_url)}" title="Booking calendar" loading="lazy"></iframe><p style="margin-top:12px"><a href="${esc(s.booking_url)}" target="_blank" rel="noopener">Open the booking page in a new tab</a></p>`
        : emptyState("Booking opens soon", "Until then, email me and we'll find a time.")}
    </div></section>`;
  }

  function customPage(slug) {
    const p = arr(C.pages?.items).find((x) => slugOf(x) === slug);
    if (!p) return notFound();
    return pageHead(p.title, p.intro) + `<section class="band"><div class="wrap">
      ${has(p.cover) ? `<div class="cover detail-cover" style="margin-top:0">${coverHTML(p.cover, p.title, p.title)}</div>` : ""}
      <div class="prose">${p.body || ""}</div>${linksHTML(p.links)}</div></section>`;
  }

  function notFound() {
    return `<div class="error"><h1 style="font-size:3rem">Page not found</h1><p>This page may have moved. <a href="#/">Go to the home page</a>.</p></div>`;
  }

  /* ---------- chrome ---------- */
  function renderChrome() {
    const s = C.settings || {};
    const mark = `<svg viewBox="0 0 26 26" aria-hidden="true"><path d="${archPath(2, 1, 22, 24)}" fill="var(--marigold)"/><path d="${starPath(13, 15, 6.5, 4.4)}" fill="var(--lapis-deep)"/></svg>`;
    document.querySelector(".brand").innerHTML = `${mark}<span>${esc(s.name)}</span>`;
    document.querySelector(".index-panel .brand").innerHTML = `${mark}<span>${esc(s.name)}</span>`;
    document.getElementById("nav").innerHTML = NAV_MAIN.filter((id) => !hidden(id)).map((id) => `<a href="#/${id}" data-nav="${id}">${SECTIONS.find((x) => x.id === id).title}</a>`).join("");
    document.getElementById("index-list").innerHTML = `<li><a href="#/"><span class="t">Home</span><span class="d"></span></a></li>` + indexItems();
    const links = [["Email", s.email ? `mailto:${s.email}` : ""], ["LinkedIn", s.linkedin], ["GitHub", s.github], ["Instagram", s.instagram]].filter(([, u]) => has(u));
    document.getElementById("foot").innerHTML = `<div class="wrap"><div class="foot-grid">
      <p class="foot-cta">Have something in mind?<br><a href="#/contact">Let's talk.</a></p>
      <nav class="foot-links" aria-label="Elsewhere">${links.map(([n, u]) => `<a href="${esc(u)}" ${u.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>${n}</a>`).join("")}</nav>
    </div><p class="foot-small">© ${new Date().getFullYear()} ${esc(s.name)}. ${esc(s.location || "")}</p></div>`;
  }

  function route() {
    const parts = (location.hash.replace(/^#\/?/, "") || "").split("/").filter(Boolean).map(decodeURIComponent);
    const [sec, sub] = parts;
    let html, title = "";
    currentSec = sec || "";
    if (sec && hidden(sec)) { html = notFound(); }
    else switch (sec) {
      case undefined: html = home(); break;
      case "about": html = about(); title = "About"; break;
      case "experience": html = experience(); title = "Experience"; break;
      case "projects": {
        if (sub) { const p = arr(C.projects?.items).find((x) => slugOf(x) === sub); html = detail(p, ["All projects", "#/projects"], [["For", p?.context], ["Year", p?.year], ["Type", p?.category], ["Status", p?.status]]); title = p?.title; }
        else { html = projects(); title = "Projects"; }
        break;
      }
      case "research": {
        if (sub) { const r = arr(C.research?.items).find((x) => slugOf(x) === sub); html = detail(r, ["All research", "#/research"], [["Role", r?.role], ["When", r?.period], ["Status", r?.status]]); title = r?.title; }
        else { html = research(); title = "Research"; }
        break;
      }
      case "writing": {
        if (sub) { const p = arr(C.writing?.posts).find((x) => slugOf(x) === sub); html = detail(p, ["All writing", "#/writing"], [["Published", p?.date], ["Type", p?.kind]]); title = p?.title; }
        else { html = writing(); title = "Writing"; }
        break;
      }
      case "portfolio": html = portfolio(); title = "Portfolio"; break;
      case "achievements": html = achievements(); title = "Achievements"; break;
      case "creative": html = creative(sub); title = "Creative"; break;
      case "shop": html = shop(); title = "Shop"; break;
      case "contact": html = contact(); title = "Contact"; break;
      case "p": { const p = arr(C.pages?.items).find((x) => slugOf(x) === sub); html = customPage(sub); title = p?.title; break; }
      default: html = notFound();
    }
    app.innerHTML = html;
    document.title = title ? `${title} | ${C.settings?.name}` : `${C.settings?.name} | ${C.settings?.tagline || ""}`;
    head.classList.toggle("on-hero", !sec);
    document.querySelectorAll("#nav a").forEach((a) => {
      if (a.dataset.nav === sec) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    closeIndex();
    window.scrollTo(0, 0);
    afterRender(sec);
  }

  function mount3d(sec) {
    const S = window.Scene3D;
    const stage = document.getElementById("stage3d");
    if (stage) {
      if (S) {
        S.mount(stage, "home", {
          sections: visibleSections(),
          onPick: (id) => { location.hash = `#/${id}`; },
          onHover: (id) => {
            const cap = document.getElementById("jali-caption"); if (!cap) return;
            const s = SECTIONS.find((x) => x.id === id);
            cap.innerHTML = s ? `<strong>${esc(s.title)}</strong><span>${esc(s.blurb)}${countText(s.id) ? `. ${esc(countText(s.id))}.` : "."}</span>`
              : `<strong>Drag to spin the ring</strong><span>Each stone is a part of my work. Click one to step inside.</span>`;
          },
        });
      } else if (window.Scene3D === null) {
        stage.classList.add("flat"); stage.innerHTML = `<div class="wrap"><div class="jali-wrap">${jali()}</div></div>`;
        const cap = document.getElementById("jali-caption");
        if (cap) cap.innerHTML = "<strong>Step through the window</strong><span>Each opening leads to a part of my work.</span>";
        wireJali();
      }
      return;
    }
    const head3d = document.querySelector(".head-3d");
    if (head3d && S) S.mount(head3d, "solo", { id: sec });
  }
  window.addEventListener("scene3d-ready", () => mount3d(currentSec));
  window.addEventListener("scene3d-unavailable", () => mount3d(currentSec));

  function afterRender(sec) {
    mount3d(sec);
    wireJali();
    wireFilters();
    const clock = document.getElementById("clock");
    if (clock) {
      const tz = C.settings?.timezone || "America/New_York";
      const place = (C.settings?.location || "").split(",")[0];
      const tick = () => { try { clock.textContent = `It's ${new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: tz })} in ${place}.`; } catch (e) { clock.textContent = ""; } };
      tick(); clearInterval(window.__clock); window.__clock = setInterval(tick, 30000);
    }
    document.querySelectorAll(".tabs [data-tab]").forEach((b) => b.addEventListener("click", () => { location.hash = `#/creative/${b.dataset.tab}`; }));
    const copy = document.getElementById("copy-email");
    if (copy) copy.addEventListener("click", async () => { try { await navigator.clipboard.writeText(C.settings.email); copy.textContent = "Email address copied"; } catch (e) { copy.textContent = C.settings.email; } });
    const form = document.getElementById("mail-form");
    if (form) form.addEventListener("submit", (e) => {
      e.preventDefault();
      const n = form.name.value.trim(), m = form.msg.value.trim();
      location.href = `mailto:${C.settings.email}?subject=${encodeURIComponent("Hello from " + n)}&body=${encodeURIComponent(m)}`;
    });
  }

  /* ---------- index overlay, lightbox, theme ---------- */
  const panel = document.getElementById("index-panel");
  function openIndex() { panel.classList.add("open"); document.body.style.overflow = "hidden"; panel.querySelector(".menu-btn").focus(); }
  function closeIndex() { if (!panel.classList.contains("open")) return; panel.classList.remove("open"); document.body.style.overflow = ""; }
  document.getElementById("open-index").addEventListener("click", openIndex);
  panel.querySelector(".menu-btn").addEventListener("click", () => { closeIndex(); document.getElementById("open-index").focus(); });

  const lb = document.getElementById("lightbox");
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-lightbox]"); if (!b) return;
    lb.querySelector("img").src = b.dataset.lightbox;
    lb.querySelector("p").textContent = b.dataset.cap || "";
    lb.classList.add("open"); lb.querySelector("button").focus();
  });
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target.closest("button")) lb.classList.remove("open"); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { lb.classList.remove("open"); closeIndex(); } });

  const themeBtn = document.getElementById("theme");
  const currentTheme = () => document.documentElement.dataset.theme || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  const paintThemeBtn = () => { const d = currentTheme() === "dark"; themeBtn.innerHTML = d ? ICON.sun : ICON.moon; themeBtn.setAttribute("aria-label", d ? "Switch to light mode" : "Switch to dark mode"); };
  try { const saved = localStorage.getItem("theme"); if (saved) document.documentElement.dataset.theme = saved; } catch (e) { /* storage unavailable */ }
  themeBtn.addEventListener("click", () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) { /* storage unavailable */ }
    paintThemeBtn();
  });
  paintThemeBtn();

  /* ---------- boot ---------- */
  async function load() {
    if (window.__CONTENT__) return window.__CONTENT__;
    const out = {};
    await Promise.all(FILES.map(async (f) => {
      try {
        let r = await fetch(`${f}.json`, { cache: "no-cache" });
        if (!r.ok) r = await fetch(`content/${f}.json`, { cache: "no-cache" });
        out[f] = r.ok ? await r.json() : {};
      }
      catch (e) { out[f] = {}; }
    }));
    return out;
  }
  load().then((data) => {
    C = data;
    renderChrome();
    route();
    window.addEventListener("hashchange", route);
  }).catch(() => {
    app.innerHTML = `<div class="error"><h1>The site couldn't load its content.</h1><p>Check that the content folder was uploaded with the site, then refresh.</p></div>`;
  });
})();
