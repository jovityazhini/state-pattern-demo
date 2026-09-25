/**
 * State Design Pattern Interactive Guide
 * Object-Oriented Vanilla JavaScript Implementation
 * 
 * Demonstrates Gang of Four (GoF) State Pattern with 4 States:
 * - IdleState
 * - HasMoneyState
 * - ProductSelectedState
 * - DispensingState
 */

// ==========================================================================
// 1. STATE INTERFACE / BASE CLASS
// ==========================================================================
class VendingMachineState {
  constructor(name) {
    this.name = name;
  }

  insertMoney(machine, amount) {
    throw new Error("insertMoney() method must be implemented by subclass.");
  }

  selectProduct(machine, productName, price) {
    throw new Error("selectProduct() method must be implemented by subclass.");
  }

  dispense(machine) {
    throw new Error("dispense() method must be implemented by subclass.");
  }

  refund(machine) {
    throw new Error("refund() method must be implemented by subclass.");
  }
}

// ==========================================================================
// 2. CONCRETE STATE IMPLEMENTATIONS
// ==========================================================================

/**
 * IDLE STATE
 * Initial state when no money is inserted. Rejects product selection & dispensing.
 */
class IdleState extends VendingMachineState {
  constructor() {
    super("IDLE");
  }

  insertMoney(machine, amount) {
    machine.addBalance(amount);
    machine.log(`Accepted $${amount.toFixed(2)}. State changed: IDLE ➔ HAS_MONEY`, "success");
    machine.setStatusMessage(`Accepted $${amount.toFixed(2)}. Money added to machine balance.`);
    machine.setState(machine.hasMoneyState);
  }

  selectProduct(machine, productName, price) {
    machine.log(`⚠️ Invalid Action [IDLE]: Cannot select product in IDLE state. Insert money first!`, "warning");
    machine.setStatusMessage(`⚠️ Invalid Action: Cannot select product in IDLE state. Please insert money first!`);
  }

  dispense(machine) {
    machine.log(`⚠️ Invalid Action [IDLE]: Cannot dispense item in IDLE state. Insert money first!`, "error");
    machine.setStatusMessage(`⚠️ Invalid Action: Cannot dispense item in IDLE state. Please insert money first!`);
  }

  refund(machine) {
    machine.log(`ℹ️ Invalid Action [IDLE]: No money inserted to cancel or refund.`, "info");
    machine.setStatusMessage(`ℹ️ Invalid Action: No money inserted to cancel or refund.`);
  }
}

/**
 * HAS_MONEY STATE
 * Money has been inserted. User can insert more money, select a product, or cancel/refund.
 */
class HasMoneyState extends VendingMachineState {
  constructor() {
    super("HAS_MONEY");
  }

  insertMoney(machine, amount) {
    machine.addBalance(amount);
    machine.log(`Added $${amount.toFixed(2)}. Total balance: $${machine.balance.toFixed(2)}.`, "info");
    machine.setStatusMessage(`Total inserted balance: $${machine.balance.toFixed(2)}`);
  }

  selectProduct(machine, productName, price) {
    const currentStock = machine.inventory[productName] || 0;

    if (currentStock <= 0) {
      machine.log(`⚠️ Invalid Selection [HAS_MONEY]: "${productName}" is out of stock!`, "warning");
      machine.setStatusMessage(`⚠️ "${productName}" is out of stock. Please choose another item.`);
      return;
    }

    if (machine.balance < price) {
      const missing = (price - machine.balance).toFixed(2);
      machine.log(`⚠️ Insufficient Funds [HAS_MONEY]: ${productName} costs $${price.toFixed(2)} (Need +$${missing}).`, "warning");
      machine.setStatusMessage(`⚠️ Insufficient balance! ${productName} costs $${price.toFixed(2)}. Insert +$${missing} more.`);
      return;
    }

    machine.setSelectedProduct(productName, price);
    machine.log(`Selected "${productName}" ($${price.toFixed(2)}). State changed: HAS_MONEY ➔ PRODUCT_SELECTED`, "success");
    machine.setStatusMessage(`Selected "${productName}". Click "Dispense Product" to complete purchase.`);
    machine.setState(machine.productSelectedState);
  }

  dispense(machine) {
    machine.log(`⚠️ Invalid Action [HAS_MONEY]: Cannot dispense. Select a product from the menu first!`, "warning");
    machine.setStatusMessage(`⚠️ Invalid Action: Please select a product before clicking Dispense.`);
  }

  refund(machine) {
    const amount = machine.balance;
    machine.log(`💸 Cancelled action. Returned $${amount.toFixed(2)} cash. State changed: HAS_MONEY ➔ IDLE`, "info");
    machine.setBalance(0);
    machine.clearSelection();
    machine.setState(machine.idleState);
    machine.setStatusMessage(`💸 Action cancelled. Returned $${amount.toFixed(2)} cash.`);
  }
}

/**
 * PRODUCT_SELECTED STATE
 * Valid product selected. Ready to dispense or cancel.
 */
class ProductSelectedState extends VendingMachineState {
  constructor() {
    super("PRODUCT_SELECTED");
  }

  insertMoney(machine, amount) {
    machine.addBalance(amount);
    machine.log(`Added $${amount.toFixed(2)}. Total balance: $${machine.balance.toFixed(2)}.`, "info");
    machine.setStatusMessage(`Updated balance: $${machine.balance.toFixed(2)}`);
  }

  selectProduct(machine, productName, price) {
    if (machine.balance < price) {
      const missing = (price - machine.balance).toFixed(2);
      machine.log(`⚠️ Cannot change to "${productName}". Need +$${missing} more.`, "warning");
      machine.setStatusMessage(`⚠️ Cannot change to "${productName}". Insert +$${missing} more.`);
      return;
    }
    machine.setSelectedProduct(productName, price);
    machine.log(`Updated product selection to "${productName}" ($${price.toFixed(2)}).`, "info");
    machine.setStatusMessage(`Product selection updated to "${productName}".`);
  }

  dispense(machine) {
    machine.log(`Dispensing "${machine.selectedProduct.name}"... State changed: PRODUCT_SELECTED ➔ DISPENSING`, "success");
    machine.setState(machine.dispensingState);
    machine.dispense(); // Immediately execute dispense logic in new state
  }

  refund(machine) {
    const amount = machine.balance;
    machine.log(`💸 Cancelled purchase. Returned $${amount.toFixed(2)}. State changed: PRODUCT_SELECTED ➔ IDLE`, "info");
    machine.setBalance(0);
    machine.clearSelection();
    machine.setState(machine.idleState);
    machine.setStatusMessage(`💸 Purchase cancelled. Returned $${amount.toFixed(2)} cash.`);
  }
}

/**
 * DISPENSING STATE
 * Releasing product into chute. Block all other actions while motor spins.
 */
class DispensingState extends VendingMachineState {
  constructor() {
    super("DISPENSING");
  }

  insertMoney(machine, amount) {
    machine.log(`⚠️ Invalid Action [DISPENSING]: Machine busy dispensing item. Please wait!`, "warning");
    machine.setStatusMessage(`⚠️ Invalid Action: Machine busy dispensing item. Please wait!`);
  }

  selectProduct(machine, productName, price) {
    machine.log(`⚠️ Invalid Action [DISPENSING]: Machine busy dispensing item. Please wait!`, "warning");
    machine.setStatusMessage(`⚠️ Invalid Action: Machine busy dispensing item. Please wait!`);
  }

  dispense(machine) {
    const item = machine.selectedProduct;
    machine.setStatusMessage(`⚙️ Motor spinning... Dispensing ${item.name}!`);

    // Deduct stock and calculate change
    machine.inventory[item.name] -= 1;
    const change = machine.balance - item.price;
    machine.setBalance(0);

    // Trigger UI dispensing animation
    triggerDispenseAnimation(item.name);

    setTimeout(() => {
      let changeMsg = change > 0 ? ` Returned change: $${change.toFixed(2)}.` : "";
      machine.log(`🎁 Dispensed ${item.name}!${changeMsg} Resetting state to IDLE.`, "success");
      machine.setStatusMessage(`🎁 Grab your ${item.name}!${changeMsg}`);
      machine.clearSelection();
      machine.setState(machine.idleState);
    }, 1500);
  }

  refund(machine) {
    machine.log(`⚠️ Invalid Action [DISPENSING]: Cannot cancel or refund while item is dispensing!`, "warning");
    machine.setStatusMessage(`⚠️ Invalid Action: Cannot cancel while item is dispensing!`);
  }
}

// ==========================================================================
// 3. CONTEXT CLASS: VENDING MACHINE
// ==========================================================================
class VendingMachine {
  constructor() {
    // Instantiate all concrete state singletons
    this.idleState = new IdleState();
    this.hasMoneyState = new HasMoneyState();
    this.productSelectedState = new ProductSelectedState();
    this.dispensingState = new DispensingState();

    // Initial State
    this.currentState = this.idleState;

    // Attributes
    this.lastAction = "Initialized Machine";
    this.balance = 0.0;
    this.selectedProduct = null; // { name: '', price: 0 }
    this.inventory = {
      Soda: 5,
      Chips: 3,
      Candy: 4
    };

    // Initial UI render
    this.updateUI();
  }

  // --- State Pattern Delegation Methods ---
  insertMoney(amount) {
    this.currentState.insertMoney(this, amount);
    this.updateUI();
  }

  selectProduct(productName, price) {
    this.currentState.selectProduct(this, productName, price);
    this.updateUI();
  }

  dispense() {
    this.currentState.dispense(this);
    this.updateUI();
  }

  refund() {
    this.currentState.refund(this);
    this.updateUI();
  }

  // --- Mutators & Helper Methods ---
  setState(newState) {
    this.currentState = newState;
    this.updateUI();
  }

  setLastAction(actionStr) {
    this.lastAction = actionStr;
    this.updateUI();
  }

  addBalance(amount) {
    this.balance += amount;
  }

  setBalance(amount) {
    this.balance = amount;
  }

  setSelectedProduct(name, price) {
    this.selectedProduct = { name, price };
  }

  clearSelection() {
    this.selectedProduct = null;
  }

  restock() {
    this.inventory = { Soda: 5, Chips: 3, Candy: 4 };
    this.balance = 0.0;
    this.selectedProduct = null;
    this.lastAction = "Restocked & Reset Machine";
    this.setState(this.idleState);
    this.log(`🔄 Vending Machine restocked and reset to IDLE state.`, "info");
    this.setStatusMessage(`Restocked & Ready. Insert money.`);
    this.updateUI();
  }

  log(message, type = "info") {
    addConsoleLog(message, type);
  }

  setStatusMessage(msg) {
    const el = document.getElementById("displayStatusMsg");
    if (el) el.textContent = msg;
  }

  // --- UI Synchronizer ---
  updateUI() {
    const stateName = this.currentState.name;

    // 1. Update display state badge
    const badge = document.getElementById("displayStateBadge");
    if (badge) {
      badge.textContent = stateName;
      badge.className = `screen-value state-badge ${stateName}`;
    }

    // 2. Update last action display
    const lastActionEl = document.getElementById("displayLastAction");
    if (lastActionEl) {
      lastActionEl.textContent = this.lastAction || "None";
    }

    // 3. Update balance display
    const balanceEl = document.getElementById("displayBalance");
    if (balanceEl) balanceEl.textContent = `$${this.balance.toFixed(2)}`;

    // 4. Update selected item display
    const itemEl = document.getElementById("displaySelectedItem");
    if (itemEl) {
      itemEl.textContent = this.selectedProduct 
        ? `${this.selectedProduct.name} ($${this.selectedProduct.price.toFixed(2)})`
        : "None";
    }

    // 5. Update Stock Counts
    const sodaStock = document.getElementById("stock-soda");
    const chipsStock = document.getElementById("stock-chips");
    const candyStock = document.getElementById("stock-candy");
    if (sodaStock) sodaStock.textContent = this.inventory.Soda;
    if (chipsStock) chipsStock.textContent = this.inventory.Chips;
    if (candyStock) candyStock.textContent = this.inventory.Candy;

    // 6. Highlight active item card
    document.querySelectorAll(".vm-item-card").forEach(card => card.classList.remove("selected"));
    if (this.selectedProduct) {
      const cardKey = `itemCard-${this.selectedProduct.name.toLowerCase()}`;
      const activeCard = document.getElementById(cardKey);
      if (activeCard) activeCard.classList.add("selected");
    }

    // 7. Highlight active node in State Flow visualizer
    document.querySelectorAll(".flow-node").forEach(node => node.classList.remove("active"));
    const activeNode = document.getElementById(`node-${stateName}`);
    if (activeNode) activeNode.classList.add("active");
  }
}

// Global Vending Machine Context Instance
let vendingMachine;

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  vendingMachine = new VendingMachine();
  setupCodeTabs();
  setupMobileNav();
  initQuiz();
});

// ==========================================================================
// 4. GLOBAL UI EVENT HANDLERS (Invoked by HTML Buttons)
// ==========================================================================
function handleInsertMoney(amount) {
  vendingMachine.setLastAction(`Clicked "Insert Money" (+$${amount.toFixed(2)})`);
  vendingMachine.insertMoney(amount);
}

function handleSelectProduct(productName, price) {
  vendingMachine.setLastAction(`Clicked "Select Product" (${productName})`);
  vendingMachine.selectProduct(productName, price);
}

function handleDispense() {
  vendingMachine.setLastAction(`Clicked "Dispense Product"`);
  vendingMachine.dispense();
}

function handleRefund() {
  vendingMachine.setLastAction(`Clicked "Cancel / Return Cash"`);
  vendingMachine.refund();
}

function handleResetMachine() {
  vendingMachine.restock();
  const tray = document.getElementById("dispensedTray");
  if (tray) tray.innerHTML = "";
}

// Helper: Dispense Animation in HTML Tray
function triggerDispenseAnimation(item) {
  const tray = document.getElementById("dispensedTray");
  if (!tray) return;

  const iconMap = { Soda: "🥤", Chips: "🍿", Candy: "🍫" };
  const icon = iconMap[item] || "🎁";

  tray.innerHTML = `<span title="${item}">${icon}</span>`;
}

// Helper: Console Log Appender
function addConsoleLog(message, type = "info") {
  const consoleBody = document.getElementById("consoleLog");
  if (!consoleBody) return;

  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const entry = document.createElement("div");
  entry.className = `log-entry ${type}`;
  entry.textContent = `[${time}] ${message}`;

  consoleBody.appendChild(entry);
  consoleBody.scrollTop = consoleBody.scrollHeight;
}

function clearConsoleLog() {
  const consoleBody = document.getElementById("consoleLog");
  if (consoleBody) {
    consoleBody.innerHTML = `<div class="log-entry info">[SYSTEM] Console log cleared.</div>`;
  }
}

// ==========================================================================
// 5. CODE VIEWER TABS
// ==========================================================================
function setupCodeTabs() {
  const tabBtns = document.querySelectorAll("#codeTabs .tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");

      tabBtns.forEach(b => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      tabContents.forEach(c => c.classList.remove("active"));

      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      const activeContent = document.getElementById(targetTab);
      if (activeContent) activeContent.classList.add("active");
    });
  });
}

// ==========================================================================
// 6. MOBILE NAVIGATION MENU
// ==========================================================================
function setupMobileNav() {
  const toggleBtn = document.getElementById("mobileToggle");
  const navMenu = document.getElementById("navMenu");

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("active");
      toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    document.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        toggleBtn.setAttribute("aria-expanded", "false");
      });
    });
  }
}

// ==========================================================================
// 7. INTERACTIVE QUIZ LOGIC
// ==========================================================================
const quizQuestions = [
  {
    question: "What primary software design problem does the State Pattern solve?",
    options: [
      "It prevents classes from having private fields.",
      "It eliminates complex, nested if-else or switch conditional blocks dependent on object state.",
      "It allows objects to be saved directly into an SQL database.",
      "It forces all functions to run asynchronously."
    ],
    correct: 1,
    explanation: "The State Pattern replaces large conditional blocks (if/else or switch) by encapsulating state behaviors into separate concrete state objects."
  },
  {
    question: "According to the State Pattern, what is the role of the 'Context' class (e.g., VendingMachine)?",
    options: [
      "It defines the database schema for all states.",
      "It holds a reference to the active State object and delegates user requests to it.",
      "It compiles Java source code to JavaScript.",
      "It renders HTML graphics on the web page."
    ],
    correct: 1,
    explanation: "The Context maintains a reference to the current state object and forwards incoming method requests to it."
  },
  {
    question: "In our Vending Machine demo, what happens when you click 'Dispense' while in the IDLE state?",
    options: [
      "The machine dispenses a free item immediately.",
      "The application crashes with an unhandled exception.",
      "The IdleState object handles the invalid action, displays an error message, and remains in IDLE.",
      "The machine automatically inserts money for the user."
    ],
    correct: 2,
    explanation: "Concrete states explicitly handle invalid actions for their state, outputting friendly error messages without illegal state transitions."
  },
  {
    question: "Which SOLID principle is best supported when adding a new state (e.g., 'OutOfOrderState') using the State Pattern?",
    options: [
      "Open/Closed Principle (OCP) - Open for extension, closed for modification.",
      "Single Responsibility Principle only.",
      "Interface Segregation Principle only.",
      "Dependency Inversion Principle only."
    ],
    correct: 0,
    explanation: "Adding a new state simply requires creating a new Concrete State class without modifying existing state classes or context code (OCP)."
  },
  {
    question: "How does the Context machine change its state at runtime?",
    options: [
      "By editing its source code file on disk.",
      "By calling a method like setState(newState) which updates its internal currentState variable.",
      "By restarting the computer operating system.",
      "By converting all object variables into global strings."
    ],
    correct: 1,
    explanation: "The Context maintains a reference variable (currentState) pointing to a State object, which is updated via setState(newState)."
  },
  {
    question: "What is the State Interface (e.g., VendingMachineState) responsible for?",
    options: [
      "Connecting the application to an SQL database.",
      "Defining the common contract (method signatures) that all concrete state classes must implement.",
      "Rendering CSS animations in the user browser.",
      "Creating background worker threads."
    ],
    correct: 1,
    explanation: "The State Interface establishes a unified contract (insertMoney, selectProduct, dispense, refund) that all concrete states implement."
  },
  {
    question: "When should you AVOID using the State Design Pattern?",
    options: [
      "When an object has complex state transitions.",
      "When writing object-oriented Java or JavaScript programs.",
      "When a machine only has 1 or 2 static states that rarely change.",
      "When building web user interfaces."
    ],
    correct: 2,
    explanation: "If a machine has very few static states with minimal logic, applying the State Pattern may add unnecessary class overhead."
  },
  {
    question: "In our Vending Machine demo, which state is active immediately after a user inserts money?",
    options: [
      "IDLE",
      "HAS_MONEY",
      "PRODUCT_SELECTED",
      "DISPENSING"
    ],
    correct: 1,
    explanation: "Inserting money into the machine while in IDLE state transitions the Context to the HAS_MONEY state."
  }
];

let currentQuestionIndex = 0;
let score = 0;
let selectedOptionIndex = null;
let userAnswers = [];

function initQuiz() {
  currentQuestionIndex = 0;
  score = 0;
  userAnswers = [];
  showQuestion(currentQuestionIndex);

  const nextBtn = document.getElementById("btnNextQuestion");
  if (nextBtn && !nextBtn.dataset.listenerAttached) {
    nextBtn.addEventListener("click", handleNextQuestion);
    nextBtn.dataset.listenerAttached = "true";
  }
}

function showQuestion(index) {
  selectedOptionIndex = null;
  const q = quizQuestions[index];

  const progressEl = document.getElementById("quizProgress");
  const questionEl = document.getElementById("quizQuestion");
  const optionsEl = document.getElementById("quizOptions");
  const feedbackEl = document.getElementById("quizFeedback");
  const nextBtn = document.getElementById("btnNextQuestion");

  if (!q) return;

  progressEl.textContent = `Question ${index + 1} of ${quizQuestions.length}`;
  questionEl.textContent = q.question;
  feedbackEl.className = "quiz-feedback hidden";
  feedbackEl.textContent = "";
  nextBtn.disabled = true;
  nextBtn.textContent = (index === quizQuestions.length - 1) ? "Finish Quiz & View Results 🏆" : "Next Question ➔";

  optionsEl.innerHTML = "";
  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option-btn";
    btn.textContent = `${String.fromCharCode(65 + i)}. ${opt}`;
    btn.onclick = () => selectQuizOption(i);
    optionsEl.appendChild(btn);
  });
}

function selectQuizOption(optionIdx) {
  if (selectedOptionIndex !== null) return; // Prevent changing after selection
  selectedOptionIndex = optionIdx;

  const q = quizQuestions[currentQuestionIndex];
  const optionBtns = document.querySelectorAll(".quiz-option-btn");
  const feedbackEl = document.getElementById("quizFeedback");
  const nextBtn = document.getElementById("btnNextQuestion");

  const isCorrect = (optionIdx === q.correct);
  if (isCorrect) score++;

  userAnswers.push({
    questionIndex: currentQuestionIndex,
    selectedOptionIndex: optionIdx,
    isCorrect: isCorrect
  });

  optionBtns.forEach((btn, idx) => {
    btn.disabled = true;
    if (idx === q.correct) {
      btn.classList.add("correct");
    } else if (idx === optionIdx) {
      btn.classList.add("wrong");
    }
  });

  if (isCorrect) {
    feedbackEl.textContent = `✅ ${q.explanation}`;
    feedbackEl.className = "quiz-feedback success";
  } else {
    feedbackEl.textContent = `❌ Incorrect. ${q.explanation}`;
    feedbackEl.className = "quiz-feedback error";
  }

  nextBtn.disabled = false;
}

function handleNextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < quizQuestions.length) {
    showQuestion(currentQuestionIndex);
  } else {
    showQuizResults();
  }
}

function showQuizResults() {
  const quizCard = document.getElementById("quizCard");
  const resultCard = document.getElementById("quizResultCard");
  const scoreEl = document.getElementById("finalScore");
  const msgEl = document.getElementById("resultMessage");
  const reviewContainer = document.getElementById("quizReviewContainer");

  if (quizCard) quizCard.classList.add("hidden");
  if (resultCard) resultCard.classList.remove("hidden");
  if (scoreEl) scoreEl.textContent = score;

  if (msgEl) {
    if (score === 8) {
      msgEl.textContent = "🎉 Perfect Score (8/8)! You are a State Design Pattern Master!";
    } else if (score >= 5) {
      msgEl.textContent = "👍 Great Job! You passed with a solid understanding of the State Pattern.";
    } else {
      msgEl.textContent = "📚 Keep Learning! Review the breakdown below and try the quiz again.";
    }
  }

  // Render Question-by-Question Review Breakdown
  if (reviewContainer) {
    reviewContainer.innerHTML = `<h4 style="margin-bottom: 1rem; color: var(--slate-900);">📋 Detailed Question Review:</h4>`;
    quizQuestions.forEach((q, idx) => {
      const userAnsObj = userAnswers.find(a => a.questionIndex === idx);
      const userSelected = userAnsObj ? userAnsObj.selectedOptionIndex : null;
      const isCorrect = userAnsObj ? userAnsObj.isCorrect : false;

      const card = document.createElement("div");
      card.className = `review-card ${isCorrect ? 'correct' : 'incorrect'}`;

      const userAnsText = userSelected !== null ? q.options[userSelected] : "No answer selected";
      const correctAnsText = q.options[q.correct];

      card.innerHTML = `
        <div class="review-question-title">${idx + 1}. ${q.question}</div>
        <div class="review-answer-text ${isCorrect ? 'correct-ans' : 'user-ans'}">
          ${isCorrect ? '✅ Your Answer:' : '❌ Your Answer:'} ${userAnsText}
        </div>
        ${!isCorrect ? `<div class="review-answer-text correct-ans">✓ Correct Answer: ${correctAnsText}</div>` : ''}
        <div class="review-explanation-box">💡 ${q.explanation}</div>
      `;
      reviewContainer.appendChild(card);
    });
  }
}

function restartQuiz() {
  const quizCard = document.getElementById("quizCard");
  const resultCard = document.getElementById("quizResultCard");

  if (quizCard) quizCard.classList.remove("hidden");
  if (resultCard) resultCard.classList.add("hidden");

  initQuiz();
}
