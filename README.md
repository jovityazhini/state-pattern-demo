# State Design Pattern Interactive Guide 🔄

An interactive, educational web application designed to teach the **State Design Pattern** using clear conceptual guides, code comparisons, UML diagrams, tabbed Java code implementations, an interactive quiz, and a live **Vending Machine State Machine Simulation**.

---

## 🌟 Project Highlights

- **100% Vanilla Tech Stack**: Pure HTML5, CSS3, and Vanilla JavaScript (ES6+ OOP). Zero dependencies or frameworks.
- **Strict GoF State Pattern Implementation**: JavaScript code strictly follows Gang of Four OOP pattern architecture (`VendingMachine` context delegating to `IdleState`, `HasMoneyState`, `ProductSelectedState`, and `DispensingState`).
- **Interactive Vending Machine Simulator**:
  - Live State Indicators (`IDLE` ➔ `HAS_MONEY` ➔ `PRODUCT_SELECTED` ➔ `DISPENSING`)
  - Inventory Stock Management (Soda, Chips, Candy)
  - Balance counter & coin/bill insertion
  - Dispense flap drop animation & change return
  - Real-time **Pattern Event Console Log** tracking every state transition
  - Visual **State Diagram Tracker** that highlights the active node live
- **Tabbed Java Code Viewer**: Syntax-styled view of all classes (`VendingMachine`, `VendingMachineState`, `IdleState`, `HasMoneyState`, `ProductSelectedState`, `DispensingState`).
- **Interactive Quiz**: 5 multiple-choice questions with instant explanations and score reports.
- **Modern Academic UX/UI**: Clean typography, responsive CSS Grid layout, and smooth animations across desktop, tablet, and mobile.

---

## 📂 Project Structure

```
state-pattern-interactive-guide/
├── index.html   # Entry point web page containing all educational sections
├── style.css    # Academic theme CSS styling, layout grid, and VM graphics
├── script.js    # OOP JavaScript implementing State Pattern & UI controllers
├── test-check.js# Local automated integrity test suite
└── README.md    # Documentation and deployment guide
```

---

## 🚀 Static Site Deployment Guide

This project is 100% static and requires no backend or build step. `index.html` is the entry point.

### Deployment Options

1. **GitHub Pages**:
   - Push this directory to a GitHub repository.
   - Go to **Settings > Pages**.
   - Select the `main` branch as source and root `/` folder.
   - Save. Your site will be live at `https://<username>.github.io/<repo-name>/`.

2. **Netlify / Vercel**:
   - Import the repository into Netlify or Vercel.
   - Build Command: *(Leave blank - pure static HTML/CSS/JS)*
   - Publish Directory: `.` (root directory)

3. **Local Preview**:
   - Open `index.html` directly in any web browser, or launch a local static HTTP server:
     ```bash
     python -m http.server 8000
     # Then visit http://localhost:8000 in your browser
     ```

---

## 💡 State Pattern Summary

### The Problem It Solves
When an object's behavior depends on its internal state, traditional code relies on messy, brittle `if-else` or `switch` statements across every single method:
```java
// ❌ Brittle Approach
if (state == IDLE) { ... }
else if (state == HAS_MONEY) { ... }
```

### The State Pattern Solution
Extract each state into its own class implementing a common interface. The `Context` object delegates requests directly to its `currentState`:
```java
// ✅ Clean State Pattern Approach
public void selectProduct(String item) {
    currentState.selectProduct(this, item);
}
```

---

## 📌 Workspace Recommendation
To work on this project as your main workspace, set your active workspace directory to:
`C:\Users\Jovit Yazhini\.gemini\antigravity\scratch\state-pattern-interactive-guide`
