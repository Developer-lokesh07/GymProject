# 🏋️ Conqueror Fitness Hub

> **Rise. Conquer. Transform.** — The official website for Conqueror Fitness Hub, Jalgaon's most premium gym.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-Private-red)

---

## 📖 About

A modern, responsive single-page landing website built with **React**, **TypeScript**, and **Vite** for Conqueror Fitness Hub — a premium fitness center in Jalgaon featuring fully air-conditioned facilities, steam room, advanced machines, and certified trainers. Rated 4.9★ on Google.

### ✨ Features

- **Hero Section** — Eye-catching landing with call-to-action
- **About Section** — Gym story and mission
- **Facilities Showcase** — Highlight premium amenities
- **Pricing Plans** — Membership tiers with clear pricing
- **BMI Calculator** — Interactive body mass index tool
- **Reviews & Testimonials** — Real member reviews
- **Contact Form** — Get in touch with the gym
- **Responsive Design** — Looks great on all devices

---

## 🛠️ Tech Stack

| Category       | Technology                    |
| -------------- | ----------------------------- |
| **Framework**  | React 19                      |
| **Language**   | TypeScript 6                  |
| **Bundler**    | Vite 8                        |
| **Linting**    | ESLint 10                     |
| **Formatting** | Prettier                      |
| **CI/CD**      | GitHub Actions                |
| **Fonts**      | Bebas Neue, DM Sans, DM Serif |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) **v20+**
- [npm](https://www.npmjs.com/) **v10+** (ships with Node)

### Installation

```bash
# Clone the repository
git clone https://github.com/lokesh07/GymProject.git
cd GymProject

# Install dependencies
npm ci
```

### Development

```bash
# Start the dev server (default: http://localhost:5173)
npm run dev
```

### Build

```bash
# Type-check and build for production
npm run build

# Preview the production build locally
npm run preview
```

### Linting

```bash
# Run ESLint across the project
npm run lint
```

---

## 📂 Project Structure

```
GYM Project/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI pipeline
├── public/
│   ├── favicon.svg             # Site favicon
│   ├── icons.svg               # SVG icon sprites
│   ├── robots.txt              # SEO — crawler rules
│   └── sitemap.xml             # SEO — sitemap
├── src/
│   ├── assets/                 # Static assets (images, etc.)
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx      # Navigation header
│   │   │   └── Footer.tsx      # Site footer
│   │   ├── sections/
│   │   │   ├── Hero.tsx        # Hero banner
│   │   │   ├── About.tsx       # About the gym
│   │   │   ├── Facilities.tsx  # Facilities showcase
│   │   │   ├── Pricing.tsx     # Pricing plans
│   │   │   ├── Reviews.tsx     # Testimonials
│   │   │   ├── Contact.tsx     # Contact form
│   │   │   ├── Timings.tsx     # Opening hours
│   │   │   ├── StatsBanner.tsx # Stats counter
│   │   │   └── Marquee.tsx     # Scrolling marquee
│   │   └── BmiCalculator.tsx   # BMI calculator widget
│   ├── data/
│   │   └── landingPageData.json # Content data
│   ├── styles/
│   │   ├── main.css            # Global styles
│   │   └── components.css      # Component styles
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   ├── App.tsx                 # Root application component
│   └── main.tsx                # Application entry point
├── index.html                  # HTML entry point
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript config (root)
├── tsconfig.app.json           # TypeScript config (app)
├── tsconfig.node.json          # TypeScript config (node)
├── eslint.config.js            # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

---

## 🌐 Deployment

### Static Hosting (Recommended)

This project builds to a static `dist/` folder, so it can be deployed to any static hosting provider:

#### Vercel

```bash
npm i -g vercel
vercel --prod
```

#### Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

#### GitHub Pages

1. Install the `gh-pages` package:
   ```bash
   npm install -D gh-pages
   ```
2. Add a deploy script to `package.json`:
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```
3. Run:
   ```bash
   npm run deploy
   ```

### Environment

No environment variables are required. All content is served statically from `src/data/landingPageData.json`.

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/my-feature`
3. **Commit** your changes: `git commit -m "feat: add my feature"`
4. **Push** to the branch: `git push origin feature/my-feature`
5. **Open** a Pull Request

### Code Style

- Run `npm run lint` before committing
- Format with Prettier (config in `.prettierrc`)
- Follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages

---

## 📄 License

This project is **private** and not licensed for public distribution.

---

<p align="center">
  Made with ❤️ for <strong>Conqueror Fitness Hub</strong>, Jalgaon
</p>
