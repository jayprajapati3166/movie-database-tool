# Movie Database Tool

A React + Vite application for browsing a movie database with dynamic poster loading.

## Features

- 🎬 Browse 50+ classic and modern movies
- 🖼️ Dynamic poster loading from TMDB (The Movie Database)
- 📱 Responsive grid layout
- 🌙 Dark theme
- ⚡ Fast loading with image caching

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Get TMDB API Key (Required for posters):**
   - Visit [TMDB API Settings](https://www.themoviedb.org/settings/api)
   - Create a free account and request an API key
   - Copy your API key

3. **Configure API Key:**
   - Open `src/lib/tmdbService.js`
   - Replace `'your_tmdb_api_key_here'` with your actual TMDB API key:
   ```javascript
   const TMDB_API_KEY = 'YOUR_API_KEY_HERE';
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## Without API Key

If you don't set up the TMDB API key, the app will still work but show placeholder images instead of actual movie posters.

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- TMDB API

## Project Structure

```
src/
├── components/
│   ├── MovieCard.jsx      # Individual movie card with poster
│   └── Navbar.jsx         # Navigation header
├── lib/
│   └── tmdbService.js     # TMDB API integration
├── mocks/
│   └── movies.js          # Movie data
├── pages/
│   └── Home.jsx           # Main page with movie grid
└── App.jsx                # Root component
```