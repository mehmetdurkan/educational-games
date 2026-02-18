# 🎮 Educational Games Gallery - Claude Code Context

## Project Overview
This is an educational games website created for family learning and fun. It features a gallery of interactive games built with vanilla HTML, CSS, and JavaScript - no build process required.

**Repository**: mehmetdurkan/educational-games
**Primary Developer**: Family project (parent + daughter collaboration)
**Tech Stack**: Pure HTML/CSS/JavaScript (no frameworks)

## 🚀 Quick Start

### Running the Server
```bash
cd /home/user/educational-games
python -m http.server 8000
```

### Access Points
- **Local Computer**: `http://localhost:8000/`
- **iPhone/Mobile** (same WiFi): `http://21.0.0.208:8000/`
- **Main Gallery**: `/index.html`
- **Individual Game**: `/games/{game-name}/index.html`

> **Important**: Mobile devices must be on the same WiFi network and use the computer's local IP address (not localhost)

## 📁 Project Structure

```
educational-games/
├── index.html              # Main gallery page with game cards
├── css/
│   └── shared.css          # Shared styles (reset, colors, buttons)
├── data/
│   └── games-list.json     # Game registry (auto-loaded by gallery)
├── games/
│   ├── sample-math-game/   # Math Adventure (🔢)
│   ├── cat-maze-adventure/ # Cat Maze game (🐱)
│   └── word-wizard/        # Word learning game (✨)
└── README.md               # User documentation
```

## 🎮 Current Games

1. **Math Adventure** (`sample-math-game`)
   - Practice addition and subtraction
   - Fun animations
   - Icon: 🔢

2. **Cat Maze Adventure** (`cat-maze-adventure`)
   - Navigate mazes with orange tabby cat
   - Collect fish, avoid dogs
   - Icon: 🐱

3. **Word Wizard** (`word-wizard`)
   - Learn synonyms and antonyms
   - Progressive levels
   - Streak bonuses
   - Icon: ✨

## 🛠️ Development Workflow

### Adding a New Game

1. **Create game folder**:
   ```bash
   mkdir games/new-game-name
   ```

2. **Create game file**: `games/new-game-name/index.html`
   - Link shared styles: `<link rel="stylesheet" href="../../css/shared.css">`
   - Use design system colors and components from shared.css
   - Include back button: `<button class="back-button" onclick="window.location.href='../../index.html'">← Back</button>`

3. **Register in games list**: Update `data/games-list.json`
   ```json
   {
     "id": "new-game-name",
     "name": "Display Name",
     "description": "Game description",
     "icon": "🎯",
     "path": "./games/new-game-name/index.html"
   }
   ```

4. **Test locally** at `http://localhost:8000/`

5. **Commit and push** (see Git Workflow below)

### Design System

All games use `css/shared.css` which provides:
- CSS reset and base styles
- Color variables (--primary, --secondary, --success, --danger, etc.)
- Reusable button styles (`.button`, `.back-button`, `.primary-button`, etc.)
- Consistent typography
- Responsive utilities

**Always link shared.css in new games for consistent styling.**

## 📱 Mobile Testing

The owner frequently tests on iPhone, so:
- **Always ensure responsive design**
- **Use touch-friendly button sizes** (minimum 44x44px)
- **Test gesture interactions** (swipe, tap, hold)
- **Provide clear visual feedback** for touch events
- **Consider landscape and portrait modes**

To share with iPhone: Server must be running, and provide the URL:
`http://21.0.0.208:8000/`

## 🔧 Git Workflow

### Branch Strategy
- **Main branch**: `main` (stable releases)
- **Feature branches**: Use `claude/feature-name-{sessionId}` format
- **Always develop on feature branches**, never directly on main

### Common Commands
```bash
# Create and switch to feature branch
git checkout -b claude/add-new-game-ABC123

# Stage and commit changes
git add .
git commit -m "Add new educational game: [Game Name]"

# Push to remote (use -u for first push)
git push -u origin claude/add-new-game-ABC123

# Create pull request (if needed)
gh pr create --title "Add [Game Name]" --body "Description"
```

### After PR Merge (IMPORTANT!)
**Always update local main branch after merging a PR to avoid conflicts:**
```bash
# Switch to main branch
git checkout main

# Pull latest changes from remote
git pull origin main
```

This ensures the next feature branch starts from the latest code and prevents merge conflicts.

### Commit Message Style
- Use clear, descriptive messages
- Start with verb: "Add", "Update", "Fix", "Refactor"
- Reference game names or features specifically
- Examples:
  - ✅ "Add Word Wizard game with synonym/antonym quiz"
  - ✅ "Update shared.css with new button styles"
  - ✅ "Fix mobile responsiveness in Cat Maze Adventure"

## 🎯 Development Principles

1. **Keep it simple**: Vanilla JS, no build process, no dependencies
2. **Family-friendly**: Games should be educational and appropriate for all ages
3. **Mobile-first**: Always test on iPhone (owner's primary testing device)
4. **Reuse shared styles**: Don't duplicate CSS, extend shared.css
5. **Self-contained games**: Each game in its own folder with all assets
6. **Progressive enhancement**: Basic functionality works everywhere, enhancements for modern browsers

## 🧪 Testing Checklist

Before committing a new game or feature:
- [ ] Works on localhost:8000
- [ ] Works on mobile (iPhone via local IP)
- [ ] Appears correctly in gallery (check games-list.json)
- [ ] Back button navigates to gallery
- [ ] Uses shared.css for consistent styling
- [ ] Responsive on different screen sizes
- [ ] No console errors (check browser dev tools)

## 💡 Common Tasks

### Starting Development Session
```bash
cd /home/user/educational-games
python -m http.server 8000
# Open http://localhost:8000/ in browser
```

### Viewing on iPhone
1. Ensure server is running
2. iPhone on same WiFi
3. Navigate to: `http://21.0.0.208:8000/`

### Adding Game Assets
Place images, sounds, or other assets in the game's folder:
```
games/my-game/
├── index.html
├── game-image.png
└── sounds/
    └── win.mp3
```

Reference relatively: `<img src="./game-image.png">`

## 🚫 What NOT to Do

- ❌ Don't add build processes or package.json (keep it simple)
- ❌ Don't add frameworks (React, Vue, etc.) - vanilla JS only
- ❌ Don't modify games-list.json without adding the actual game
- ❌ Don't push directly to main branch
- ❌ Don't add large asset files (keep games lightweight)
- ❌ Don't use external CDNs if possible (keep it self-contained)

## 📝 Notes for Claude Code

- **Owner uses iPhone frequently**: Always consider mobile experience
- **Family project**: Code should be readable and maintainable by non-experts
- **Educational focus**: Games should teach something (math, vocabulary, logic, etc.)
- **Fun and playful**: Use emojis, colors, animations to make it engaging
- **No deployment complexity**: Owner wants to just write code and play, no complicated deploys

## 🎨 Future Ideas (Owner Mentioned)

- Score tracking with localStorage
- Leaderboards (optional, future phase)
- More word games
- Math games with different operations
- Daughter contributing her own games

---

**Last Updated**: 2026-02-15
**Claude Code Session**: This file helps Claude understand the project context without re-explaining from scratch each session.
