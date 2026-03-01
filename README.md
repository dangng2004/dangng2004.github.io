# dangng2004.github.io

Personal academic website built with [al-folio](https://github.com/alshedivat/al-folio).

## Local development

```bash
docker compose up   # recommended
```

Or without Docker:

```bash
bundle exec jekyll serve
```

Visit http://localhost:4000.

## Structure

- `_pages/` — static pages (about, publications, etc.)
- `_posts/` — blog posts
- `_projects/` — project pages
- `_news/` — news items
- `_bibliography/papers.bib` — publications (BibTeX)
- `assets/` — images, PDFs, CSS
- `_config.yml` — site settings
