# Casino React App

A modern, full-stack casino web application built with React Router, TypeScript, and TailwindCSS.

## Features

- 🎲 **Multiple Games**: Includes Pig Mines, Bomb Drop, and Find The Card.
- 💰 **Balance Management**: User balance is stored and updated in localStorage.
- 📈 **Statistics & History**: Tracks wins, losses, money won/lost, and displays balance history with charts.
- 🏆 **Daily Rewards**: Users can claim daily rewards with streak tracking.
- 🌙 **Dark/Light Mode**: Toggle between dark and light themes, with persistent preference.
- 🔒 **JWT Authentication**: Integrates with a backend for token-based authentication and game result storage.
- 📊 **Game Results Table**: Shows a history of all game results fetched from the backend.
- 🚀 **Docker Support**: Ready for containerized deployment.
- 🎨 **Responsive UI**: Styled with TailwindCSS for a modern look.

## Implementation

### Frontend

- **React Router**: Handles routing and server-side rendering.
- **TypeScript**: Ensures type safety across the codebase.
- **TailwindCSS**: Provides utility-first styling.
- **Chart.js**: Used for rendering balance history charts.
- **LocalStorage**: Stores user balance, statistics, and reward streaks.
- **Axios**: Handles HTTP requests to the backend for authentication and game results.

### Games

- **Pig Mines**: A grid-based game where users avoid bombs to increase their multiplier.
- **Bomb Drop**: A crash-style game where users bet and try to withdraw before the multiplier crashes.
- **Find The Card**: Users pick cards in rows, aiming to avoid the wrong card and progress for higher multipliers.

### Statistics

- **Balance History**: Every balance change is recorded and visualized in a line chart.
- **Game Stats**: Wins, losses, money won/lost, and net profit are tracked per game.
- **Game Results Table**: Fetched from the backend and displayed in a sortable table.

### Daily Rewards

- Users can claim a daily reward, with the next claim time and streak level tracked in localStorage.

### Theming

- Dark and light modes are supported, with the preference saved in localStorage and synced across the app.

### Backend Integration

- **JWT Token**: Generated and stored in localStorage for authenticated requests.
- **Game Results**: Sent to and fetched from the backend using secure endpoints.

### Deployment

- **Docker**: Multi-stage Dockerfile for development, build, and production environments.
- **Vite**: Used for fast development and optimized production builds.

---

Built with ❤️ using React, TypeScript, and React Router.

LINK: https://chimerical-tarsier-a5f927.netlify.app/
