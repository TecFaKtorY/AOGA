# If you haven't initialized git yet
git init
git add -A
git commit -m "🎉 Initial commit — Apostle Gabriel Olu Akintan site"

# Add your GitHub remote
git remote add origin https://github.com/TecFaKtorY/AOGA.git
git branch -M main
git push -u origin main

# Then go to Netlify → Add new site → Import from Git → Select repo → Deploy
# Add env vars: GITHUB_TOKEN, REPO_OWNER, REPO_NAME in Netlify dashboard
