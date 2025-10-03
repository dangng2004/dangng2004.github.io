export PATH="$(ruby -e 'print Gem.user_dir')/bin:$PATH"

bundle exec jekyll serve --host 0.0.0.0 --port 4000 --baseurl ''