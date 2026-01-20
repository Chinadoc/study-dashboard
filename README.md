# Study Dashboard

A simple, interactive study dashboard for tracking daily study tasks and time estimates.

## Features

- **Daily Task Management**: View tasks organized by day (Wednesday, Thursday, Friday)
- **Time Tracking**: Automatic time calculations based on page count and subject type
- **Interactive Completion**: Mark tasks as complete with confetti celebration
- **Responsive Design**: Works on desktop and mobile devices
- **Color-Coded Subjects**: Each subject has a unique color for easy identification

## Time Calculation Rules

- **Short tasks (< 10 pages)**: 5 minutes per page
- **Long tasks (≥ 10 pages)**: 50 minutes flat rate
- **Spanish lessons**: 7 minutes per page + 15 minutes for tests

## Deployment

This is a static HTML/CSS/JavaScript website that can be deployed to any static hosting service:

### Option 1: GitHub Pages (Free)
1. Create a new repository on GitHub
2. Upload these files to the repository
3. Go to Settings → Pages → Source → Deploy from a branch
4. Select "main" branch and "/ (root)" folder
5. Your site will be available at `https://yourusername.github.io/repository-name`

### Option 2: Netlify (Free)
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop the entire folder or connect your GitHub repository
3. Your site will be live instantly with a custom URL

### Option 3: Vercel (Free)
1. Go to [vercel.com](https://vercel.com)
2. Import your project from GitHub or upload the files directly
3. Get a custom URL or use their domain

## Local Development

Simply open `index.html` in any modern web browser. No server required!

## Technologies Used

- **Tailwind CSS**: For styling and responsive design
- **Vanilla JavaScript**: For interactivity and data processing
- **Canvas Confetti**: For celebration effects
- **Google Fonts (Inter)**: For clean typography


