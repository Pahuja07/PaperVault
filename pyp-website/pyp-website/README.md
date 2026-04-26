# PYPVault — College Previous Year Papers

A professional, fully-responsive frontend for browsing and downloading college previous year exam papers. Built with **React + Vite + Tailwind CSS**.

---

## 🗂 Project Structure

```
src/
├── components/
│   ├── Navbar/         Navbar.jsx
│   ├── Footer/         Footer.jsx
│   ├── PaperCard/      PaperCard.jsx
│   ├── SubjectCard/    SubjectCard.jsx
│   ├── SearchBar/      SearchBar.jsx
│   └── Badge/          Badge.jsx
├── pages/
│   ├── Home/           Home.jsx        (Hero, Stats, Featured Papers, Departments)
│   ├── Papers/         Papers.jsx      (Filter, Search, Sort, Grid)
│   ├── Subjects/       Subjects.jsx    (Grouped by Department)
│   ├── Upload/         Upload.jsx      (PDF Upload + Validation)
│   ├── Login/          Login.jsx       (Auth Form)
│   └── Signup/         Signup.jsx      (Auth Form + Password Strength)
├── data/
│   └── dummyData.js    (papers, subjects, departments, stats)
├── hooks/
│   └── useDebounce.js
├── App.jsx
├── main.jsx
└── index.css
```

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🧩 Pages

| Route       | Description                               |
|-------------|-------------------------------------------|
| `/`         | Homepage — Hero, stats, featured papers   |
| `/papers`   | All papers with filter/search/sort        |
| `/subjects` | Subjects grouped by department            |
| `/upload`   | Upload PDF with full validation           |
| `/login`    | Login form (demo: demo@pypvault.com)      |
| `/signup`   | Signup form with password strength meter  |

---

## 🔌 Backend Integration

All pages are ready to connect to a Node.js/Express backend. Replace the dummy data in `src/data/dummyData.js` with API calls:

```js
// Example: fetch papers
const res = await fetch('/api/papers?dept=cse&year=2024')
const data = await res.json()
```

---

## 🎨 Design System

- **Font**: Playfair Display (headings) + DM Sans (body) + JetBrains Mono (code/labels)
- **Colors**: Deep navy background, amber accents, subtle white glass cards
- **Theme**: Dark editorial / academic SaaS
