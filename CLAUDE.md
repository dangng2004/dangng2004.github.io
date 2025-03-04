# Academic Website (al-folio theme) Code Guidelines

## Build Commands
- `bundle exec jekyll serve` - Local development server
- `bundle exec jekyll build` - Build static site
- `docker compose up` - Run with Docker (recommended)
- `bundle exec jekyll build --destination $HOME/repo/publishing-source` - Build to specific path
- `npm run prettier` - Run Prettier formatter

## Docker Setup for WSL
```yaml
services:
  jekyll:
    image: amirpourmand/al-folio:latest
    ports:
      - "4000:4000"
    extra_hosts:
      - "host.docker.internal:host-gateway"
    command: >
      sh -c "bundle install &&
             bundle exec jekyll serve --host 0.0.0.0 --port 4000 --baseurl=''"
```

## Style Guidelines
- Use liquid templating format following Jekyll conventions
- Follow YAML frontmatter format for all content pages
- Maintain consistent indentation in HTML/Markdown/SCSS files
- Use relative URLs with `{{ site.baseurl }}` prefix for internal links
- Follow BibTeX format for publication entries in `_bibliography/papers.bib`
- Organize new content in appropriate collections (`_posts`, `_projects`, etc.)

## Testing
- Check site appearance in both light and dark modes
- Verify responsive layouts on multiple screen sizes
- Test links, especially for publications and project items
- For local testing, run `bundle exec jekyll serve` and visit http://localhost:4000
