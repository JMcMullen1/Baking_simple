# 🧁 Baking App - Simone's Kitchen Companion

A cute, friendly baking companion web app with timers, alarms, recipes, and helpful baking tools. Features Bailey (King Charles Cavalier) and Nellie (Golden Retriever) as your baking assistants!

## ✨ Features

### 📖 Recipe Book
- **Simone's Classics**: 10 pre-loaded delicious recipes
- **Search & Filter**: Find recipes by name, tags, or ingredients
- **Favorites**: Mark your go-to recipes with ⭐
- **Recipe Scaling**: Scale recipes by 0.5×, 1×, 2×, or 3×
- **Add/Edit/Delete**: Manage your own custom recipes
- **Full Details**: Ingredients, steps, temperature, time, and notes

### ⏲️ Multi-Timer
- **Quick Presets**: Preheat Oven, Take Butter Out, Check Cookies, Bread Proofing, Cake Cooldown
- **Multiple Timers**: Run several timers simultaneously
- **Custom Timers**: Set any duration with custom labels
- **Pause/Resume/Reset**: Full control over each timer
- **Notifications**: Visual and audio alerts when timers complete

### ⏰ Alarms
- **Scheduled Alarms**: Set specific times (HH:MM)
- **Repeat Options**: Once, Daily, Weekdays, Weekends, or Custom Days
- **Quick Presets**: Add alarms based on common baking tasks
- **Snooze**: 5 or 10 minute snooze options
- **Browser Notifications**: Get notified even when tab is in background

### ⏱️ Stopwatch
- **High Precision**: Displays to 1/10th second
- **Split/Lap Times**: Track multiple checkpoints
- **Copy Splits**: Export all split times to clipboard
- **Full Controls**: Start, Pause, Resume, Reset

### 🔧 Baking Helpers
- **Unit Converter**:
  - Weight (g, oz, lb, kg)
  - Volume (ml, L, cups, tbsp, tsp, fl oz)
  - Temperature (°C ↔ °F)
- **Pan Size Converter**: Adjust recipes for different pan sizes
- **Substitution Helper**: Common ingredient substitutions with safety notes

### 🐶 Bailey & Nellie
- Cute mascots throughout the app wearing baking hats!
- Rotating baking tips from your favorite kitchen companions
- Celebration animations when timers and alarms complete

## 🚀 Quick Start

### Local Usage (Offline-Ready)

1. **Download the files**:
   - Clone or download this repository
   - Or download the ZIP file

2. **Open in browser**:
   ```bash
   # Navigate to the folder
   cd Baking_simple

   # Open index.html in your browser
   # On macOS:
   open index.html

   # On Linux:
   xdg-open index.html

   # On Windows:
   start index.html
   ```

3. **That's it!** The app works completely offline.

### Using a Local Server (Optional)

For best results with Service Workers (future enhancement):

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## 📱 Deploy to GitHub Pages

### Method 1: Using GitHub Web Interface

1. **Create a new repository** on GitHub
   - Go to https://github.com/new
   - Name it `baking-app` (or any name you like)
   - Make it Public
   - Click "Create repository"

2. **Upload files**:
   - Click "uploading an existing file"
   - Drag and drop all files: `index.html`, `styles.css`, `app.js`, `README.md`
   - Commit the files

3. **Enable GitHub Pages**:
   - Go to repository Settings
   - Scroll to "Pages" section
   - Under "Source", select "main" branch
   - Click "Save"
   - Wait 1-2 minutes for deployment

4. **Access your app**:
   - Your app will be live at: `https://[your-username].github.io/baking-app/`

### Method 2: Using Git Command Line

```bash
# Navigate to the project folder
cd Baking_simple

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Baking App with timers, recipes, and helpers"

# Add your GitHub repository as remote
# (Replace with your actual repository URL)
git remote add origin https://github.com/YOUR-USERNAME/baking-app.git

# Push to GitHub
git branch -M main
git push -u origin main

# Enable GitHub Pages (via web interface as described above)
```

## 📲 Install as Progressive Web App (PWA)

While browsing the app, you can install it to your device:

**On Desktop (Chrome/Edge)**:
- Click the install icon in the address bar
- Or: Menu → "Install Baking App"

**On Mobile (iOS Safari)**:
1. Tap the Share button
2. Tap "Add to Home Screen"
3. Name it "Baking App"
4. Tap "Add"

**On Mobile (Android Chrome)**:
- Tap the menu (⋮)
- Tap "Add to Home Screen"

## 💾 Data Storage

All your data is stored locally in your browser:
- **Recipes**: Your custom recipes and favorites
- **Alarms**: Your scheduled alarms and settings
- **Settings**: Notification preferences

**Note**: Data is stored per-browser. If you clear browser data, your recipes and alarms will be reset.

## 🎨 Customization

### Change Colors

Edit `styles.css` and modify the CSS variables:

```css
:root {
    --color-primary: #FFB6C1;      /* Main pink color */
    --color-secondary: #B4E4FF;    /* Blue accent */
    --color-accent: #FFD4A3;       /* Orange/peach */
    --color-success: #B8E6B8;      /* Green */
    --color-warning: #FFE4B5;      /* Yellow */
    --color-danger: #FFAAA5;       /* Red */
}
```

### Add More Recipes

1. Open the app
2. Click "Recipes" tab
3. Click "+ Add Recipe"
4. Fill in the details
5. Click "Save Recipe"

Or edit `app.js` to add more to `loadSimonesClassics()`.

### Customize Dog Tips

Edit the `dogTips` array in `app.js`:

```javascript
this.dogTips = [
    { text: "Your custom tip here!", author: "- Bailey" },
    { text: "Another helpful tip!", author: "- Nellie" },
    // Add more...
];
```

## 🔔 Notifications

To receive browser notifications for timers and alarms:

1. Click "Enable Notifications" in the Alarms section
2. Click "Allow" when your browser asks for permission
3. Notifications will work even when the tab is in the background

**Important**: Keep the browser tab open for alarms and timers to work properly.

## 🐛 Troubleshooting

### Timers/Alarms not working
- Make sure the browser tab remains open
- Check if your browser is set to prevent autoplay sounds
- Try clicking on the page first to activate audio

### Notifications not appearing
- Grant notification permission in your browser settings
- Check if Do Not Disturb is enabled
- Some browsers block notifications in incognito mode

### Data not saving
- Check if cookies/localStorage are enabled
- Don't use incognito/private browsing mode for persistent data
- Make sure you're not clearing browser data

### App not loading
- Make sure all files (`index.html`, `styles.css`, `app.js`) are in the same folder
- Try opening in a different browser
- Check the browser console for errors (F12 → Console)

## 🛠️ Technical Details

- **Pure HTML/CSS/JavaScript**: No frameworks, no build process
- **Vanilla JS**: No dependencies or external libraries
- **LocalStorage**: All data stored client-side
- **Web Notifications API**: Browser notifications support
- **Web Audio API**: Beep sounds for alerts
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Offline-Ready**: Fully functional without internet

## 📝 Browser Compatibility

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari (iOS 11+)
- ✅ Samsung Internet
- ⚠️ Internet Explorer (not supported)

## 🎯 Future Enhancements

Potential features for future versions:
- [ ] Service Worker for true offline PWA
- [ ] Recipe import/export (JSON)
- [ ] Recipe photos
- [ ] Ingredient inventory tracking
- [ ] Meal planning calendar
- [ ] Recipe sharing via URL
- [ ] Dark mode toggle
- [ ] Voice commands
- [ ] Custom mascot selection

## 📄 License

Free to use, modify, and share! No attribution required.

Made with ❤️ for Simone and all passionate bakers!

## 🙏 Credits

- Bailey & Nellie: Our adorable mascot inspiration
- All the classic recipes: Time-tested favorites for every baker

---

**Happy Baking! 🧁👨‍🍳👩‍🍳**

*From Bailey, Nellie, and the Baking App team*
