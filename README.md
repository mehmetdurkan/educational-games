# 🎮 Educational Games Gallery

A colorful, playful website to showcase and play educational games created for learning and fun!

## 📁 Project Structure

```
educational-games-site/
├── index.html                    # Main gallery page
├── css/
│   └── shared.css               # Shared styles (reset, colors, buttons)
├── data/
│   └── games-list.json          # List of all available games
├── games/
│   └── sample-math-game/        # Example game
│       └── index.html
└── README.md
```

## 🚀 Phase 1: Deploy to GitHub Pages

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it something like `educational-games` or `family-games`
3. Make it **Public** (required for free GitHub Pages)
4. Don't initialize with README (we already have one)

### Step 2: Push Your Code

```bash
# Navigate to the project directory
cd educational-games-site

# Initialize git repository
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit - Phase 1: Basic setup"

# Add your GitHub repository as remote (replace with your repo URL)
git remote add origin https://github.com/YOUR-USERNAME/educational-games.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top right)
3. Click **Pages** (left sidebar)
4. Under "Source", select **main** branch
5. Click **Save**
6. Wait 1-2 minutes for deployment

### Step 4: Access Your Site

Your site will be available at:
```
https://YOUR-USERNAME.github.io/educational-games/
```

## 🎯 How It Works

### Adding New Games

1. Create a new folder in `games/` directory:
   ```bash
   mkdir games/my-new-game
   ```

2. Create your game's `index.html` in that folder (link `../../css/shared.css` for shared styles)

3. Update `data/games-list.json` to add your game:
   ```json
   {
     "id": "my-new-game",
     "name": "My Awesome Game",
     "description": "Learn something cool!",
     "icon": "🎯",
     "path": "./games/my-new-game/index.html"
   }
   ```

4. Commit and push:
   ```bash
   git add .
   git commit -m "Added new game: My Awesome Game"
   git push
   ```

5. Your site will automatically update in 1-2 minutes!

## 🛠️ Testing Locally

You can test your site locally before pushing to GitHub:

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Or use any local web server
```

Then open: `http://localhost:8000`

## ✨ Features

- **Gallery View**: Beautiful card-based layout showing all games
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Easy Navigation**: Click any game to play, easy back button
- **Simple Structure**: Just HTML/CSS/JS - no build process needed
- **Fast Loading**: Lightweight and optimized

## 📋 Next Steps (Future Phases)

- **Phase 2**: Add your actual games to the gallery
- **Phase 3**: Implement score tracking with localStorage
- **Phase 4**: (Optional) Add shared leaderboards

## 🤝 Adding Games as a Team

Your daughter can add games too! Just teach her to:
1. Create a new folder in `games/`
2. Add her game files
3. Update `games-list.json`
4. Commit and push to GitHub

## 💡 Tips

- Keep game folders organized (one game per folder)
- Use descriptive game IDs (e.g., `word-builder` not `game1`)
- Choose fun emojis for icons (🎨🔢📝🎯🧩)
- Test games locally before pushing
- Commit often with clear messages

## 🆘 Troubleshooting

**Site not updating after push?**
- Wait 2-3 minutes for GitHub Pages to rebuild
- Hard refresh your browser (Ctrl+F5 or Cmd+Shift+R)
- Check GitHub Actions tab for build status

**Games not loading?**
- Check `games-list.json` has correct paths
- Make sure game folders match the paths exactly
- Check browser console for errors (F12)

**404 Error?**
- Verify GitHub Pages is enabled in Settings
- Check the repository is public
- Confirm you're using the correct URL

## 📝 License

This is a personal family project. Feel free to use and modify as you wish!

---

**Created with ❤️ for learning and fun!**
