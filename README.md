# The Baskeir Archives

A map-led encyclopedia for the fantasy world of A.J. Arestia: 151 cited entries, guides to all 36 chapters of *Wardens of the Abyss*, and its three appendices. Contains complete Book 1 spoilers.

## Website

The repository is owned by `Mr-Serp`, so its default GitHub Pages URL is:

**https://mr-serp.github.io/baskeir-archives.github.io/**

The standalone address `baskeir-archives.github.io` would require a GitHub user or organization named `baskeir-archives`; a repository name alone does not reserve that hostname.

Pages publishes the root of the `main` branch. `.nojekyll` keeps this a plain static site. All site assets use relative URLs so the atlas, search, chapter guide, and articles work under the project path. Navigation uses URL hashes, so deep article links do not require a server-side router.

## Editing

- `content/book1.json`: articles, sections, related links, aliases, and chapter/page citations.
- `content/updates.json`: newest-first home-page update log, with calendar dates.
- `content/book1-ui.js`: article layouts, bibliography, search matching, and chapter guide.
- `content/site-template.html`: layout template; the build replaces its empty article table with the sourced content.
- `map.jpg`: original world atlas.

After editing, run with Node.js 18 or later:

```sh
npm run build
npm test
```

There are no npm dependencies to install. Commit the source changes together with the generated `index.html` and `book1-v2/` assets, then push `main` to publish through the existing GitHub Pages configuration.

For a local preview, serve this folder with a static HTTP server; for example, `python -m http.server 8099`, then open `http://localhost:8099/`.

## Sources and scope

Article references use the second-edition Book 1 pagination, with eProof PDF page numbers alongside. The source manuscript itself is not included. Atlas labels, narrated events, characters’ testimony, mythology, and institutional doctrine are distinguished in the articles. The in-site Sources & Coverage page records editorial boundaries.

The repository contains the website and its build/validation files. Raspberry Pi administration scripts, network configuration, credentials, and manuscript extracts are not required for GitHub Pages.
