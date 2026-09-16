# Sofoste Archive

Sofoste Archive preserves the project’s earliest public explorations. This small static site began in September 2023 as a personal portfolio spanning music, software, pastimes and images.

The 2026 restoration keeps the handmade, old-time character of that first attempt while providing a responsive, accessible and self-contained experience. Today’s Sofoste lives at [sofoste.de](https://sofoste.de).

## Status

This repository is a **historical archive**. It does not represent Sofoste’s current work, projects or contact details.

## Contents

- `index.html` tells the project’s origin story and timeline;
- `musique.html` preserves the intentions behind the first music laboratory;
- `programmation.html` documents three learning prototypes;
- `loisirs.html` gathers field notes and sources of inspiration;
- `gallery.html` presents a selection from the visual collection;
- `contact.html` explains the transition to today’s Sofoste.

The site uses native HTML, CSS and JavaScript only. It has no framework, CDN, tracker, form or installable dependency.

## Run locally

From the repository root:

```powershell
node scripts/serve.mjs 8080
```

Then open [http://localhost:8080](http://localhost:8080).

Run the dependency-free checks with:

```powershell
node scripts/validate.mjs
node --check assets/js/archive.js
```

## Accessibility and restraint

The restoration includes keyboard navigation, visible focus states, strong contrast, a mobile menu, alternative text, an accessible gallery and `prefers-reduced-motion` support. Every required resource is served locally.

## Timeline

- **18 September 2023**: first commit;
- **20 September 2023**: music, prototypes, pastimes, contact details and images added;
- **21 September 2023**: first domain-name transition;
- **7 October 2024**: final changes to the historical version;
- **2026**: security audit, editorial restoration and visual modernisation.

## Publication history

The original history contained personal data and thousands of tracked dependency files. This public restoration therefore starts from a new, sanitised history. A complete private backup was retained separately before publication.

## Licence and media

Code and media remain the property of their respective rights holders. A file’s presence in this archive does not grant permission for external reuse.
