🥘 Zaika Vault

Zaika Vault is a comprehensive, AI-powered culinary platform that combines social recipe sharing with advanced meal planning and nutrition tools.


🚀 Features

🤖 AI Chef Assistant: Personalized recipe recommendations and an AI Chatbot for culinary queries.

🥗 Smart Meal Planner: Drag-and-drop meal planning with nutritional analysis.

🛒 Automated Shopping Lists: Generate lists directly from meal plans or recipes.

📱 Social Recipe Feed: Share, like, bookmark, and review recipes from the community.

📝 Blog Platform: Rich text editor for food bloggers to share stories.

🔐 Secure Auth: Full user authentication system with Passport.js.

💳 Subscriptions: Premium features via payment integration.

🛠️ Tech Stack

Frontend

Framework: React (Vite)

Styling: Tailwind CSS

State Management: Zustand (implied from logs) / Context API

Routing: React Router

Backend

Runtime: Node.js

Framework: Express.js

Database: MongoDB & Mongoose

Authentication: Passport.js / JWT

DevOps & Quality

Containerization: Docker & Docker Compose

CI/CD: GitHub Actions

Linting: ESLint (Flat Config)

Formatting: Prettier

Hooks: Husky & Lint-staged

Conventions: Commitlint (Conventional Commits)

⚙️ Installation & Setup

Prerequisites

Node.js (v18+)

Docker Desktop (Optional, for containerized run)

MongoDB (Local or Atlas URL)

Option 1: Quick Start (Docker) 🐳

The easiest way to run the full stack (Frontend + Backend + Database).

Clone the repository:

git clone <git@github.com:shudhanshu002/Recipe-app.git>
cd zaika-vault

Run with Docker Compose:

docker-compose up --build

Access the App:

Frontend: http://localhost:3000

Backend API: http://localhost:5000

Option 2: Manual Setup (Local) 💻

Install Dependencies (Root, Frontend & Backend):

npm run install-all

Environment Variables:
Create a .env file in the Backend/ folder:

PORT=5000
MONGO_URI=mongodb://localhost:27017/zaika-vault
JWT_SECRET=your_super_secret_key

# Add other API keys (OpenAI, Cloudinary, etc.)

Start Development Servers:

npm run dev

(This runs both Frontend and Backend concurrently)

🔍 Code Quality & Commands

This project enforces strict code quality standards using Husky hooks.

Command

Description

npm run dev

Starts both Frontend and Backend in dev mode.

npm run lint-all

Runs ESLint on both projects.

npm run format

Formats all files using Prettier.

npm run release

Generates a generic CHANGELOG and bumps version.

git commit

We use Commitlint. Your commit messages must follow the Conventional Commits standard:

feat: add new login page

fix: resolve header crash

style: format code with prettier

chore: update dependencies

Note: If you try to commit messy code, Husky will block you until errors are fixed!

📂 Project Structure

```
zaika-vault/
├── Backend/ # Node.js API
│ ├── src/
│ │ ├── controllers/ # Route logic
│ │ ├── models/ # Mongoose schemas
│ │ ├── routes/ # API endpoints
│ │ └── utils/ # Helpers
│ ├── Dockerfile
│ └── package.json
├── Frontend/ # React App
│ ├── src/
│ │ ├── components/ # Reusable UI
│ │ ├── pages/ # Full views
│ │ └── api/ # Axios calls
│ ├── Dockerfile
│ └── package.json
├── .husky/ # Git Hooks
├── .github/ # CI Workflows
├── docker-compose.yml # Container orchestration
├── eslint.config.js # Global Lint rules
├── package.json # Root scripts
└── README.md # Documentation
```

🤝 Contributing

Fork the repository.

Create a feature branch (git checkout -b feat/amazing-feature).

Commit your changes (git commit -m 'feat: add amazing feature').

Push to the branch.

Open a Pull Request.

Made with ❤️ by the Zaika Vault Team
