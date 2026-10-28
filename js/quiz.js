"use strict";

const STORAGE_KEY = "quizStats";
const SECONDS_PER_QUESTION = 30;
const MIN_QUESTIONS_FOR_BEST = 5;
const ALL = "all";

// Each question has one correct answer and three wrong ones.
// The answers are shuffled every time a question is shown.
const QUESTIONS = [
  {
    category: "Phishing & social engineering",
    difficulty: "Beginner",
    question: "Which of these is a common warning sign of a phishing email?",
    correct: "It creates urgency and asks you to click a link or enter your password",
    wrong: [
      "It is a newsletter you signed up for and it has an unsubscribe link",
      "It is an automatic out-of-office reply from a colleague",
      "It is a calendar invite for a meeting you already know about",
    ],
    explanation:
      "Phishing tries to rush you into acting before you think. An urgent tone combined with a link or a login request is a classic sign.",
  },
  {
    category: "Phishing & social engineering",
    difficulty: "Beginner",
    question:
      "You get an email saying your account will be locked unless you log in through a link. What is the safest thing to do?",
    correct:
      "Do not click the link. Open the service yourself by typing its address or using your bookmark, and report the email",
    wrong: [
      "Click the link and check whether the page looks right",
      "Reply to the email and ask whether it is real",
      "Forward it to all your colleagues so they can check it too",
    ],
    explanation:
      "Links in unexpected messages can lead to fake login pages. Going to the site yourself avoids that, and reporting helps the IT or security team protect others.",
  },
  {
    category: "Phishing & social engineering",
    difficulty: "Beginner",
    question: "What is social engineering?",
    correct: "Tricking people into giving away information or access",
    wrong: [
      "Building software that connects to social networks",
      "Breaking encryption with very powerful computers",
      "Installing security updates on many computers at once",
    ],
    explanation:
      "Social engineering targets people rather than technology. Attackers use trust, fear or urgency to get what they want.",
  },
  {
    category: "Phishing & social engineering",
    difficulty: "Intermediate",
    question: "What is \"smishing\"?",
    correct: "Phishing sent as an SMS text message",
    wrong: [
      "Phishing done over a phone call",
      "Malware that spreads through USB sticks",
      "Guessing passwords with a list of common words",
    ],
    explanation:
      "Smishing is SMS plus phishing. The phone-call version is called vishing.",
  },
  {
    category: "Phishing & social engineering",
    difficulty: "Intermediate",
    question:
      "Someone phones, says they are from IT support and asks you to read out the MFA code you just received. What should you do?",
    correct:
      "Refuse. A real IT team should not need your MFA code, so end the call and report it",
    wrong: [
      "Read it out, because they said they are from IT",
      "Read out only the first three digits",
      "Send it by email instead so there is a written record",
    ],
    explanation:
      "MFA codes are meant to stay secret. Attackers often start a login themselves and then ask the victim for the code that arrives.",
  },
  {
    category: "Phishing & social engineering",
    difficulty: "Intermediate",
    question: "Why can it be useful to hover over a link before you click it?",
    correct:
      "It can show the real destination, which may differ from the text that is displayed",
    wrong: [
      "It scans the link for viruses automatically",
      "It makes the website load faster",
      "It blocks the link if the site is unsafe",
    ],
    explanation:
      "On a computer, hovering usually shows the actual address in the browser. A link that says one thing but points somewhere else is a warning sign. It is not a guarantee, so stay careful.",
  },

  {
    category: "Passwords & access",
    difficulty: "Beginner",
    question: "Which password is the strongest?",
    correct: "plum-canyon-rocket-quiet-ladder",
    wrong: ["Wilhelm1994!", "Password123!", "Qwerty!!"],
    explanation:
      "Length and randomness matter most. A long passphrase of unrelated words is hard to guess and easier to remember than a short, complicated string. Names, years and keyboard patterns are guessed quickly.",
  },
  {
    category: "Passwords & access",
    difficulty: "Beginner",
    question: "What is a good way to manage many different passwords?",
    correct: "Use a password manager and a unique password for every account",
    wrong: [
      "Use one very strong password everywhere",
      "Use the same password and add a number at the end",
      "Keep them in a text file called passwords on the desktop",
    ],
    explanation:
      "A password manager can create and store long, unique passwords for you, so you only have to remember one strong main password.",
  },
  {
    category: "Passwords & access",
    difficulty: "Beginner",
    question: "What does MFA stand for?",
    correct: "Multi-factor authentication",
    wrong: [
      "Managed file access",
      "Mobile firewall application",
      "Master folder administration",
    ],
    explanation:
      "MFA asks for more than one proof of identity, for example a password plus a code or a security key.",
  },
  {
    category: "Passwords & access",
    difficulty: "Intermediate",
    question: "Which of these is NOT a standard type of authentication factor?",
    correct: "Something you posted",
    wrong: ["Something you know", "Something you have", "Something you are"],
    explanation:
      "The classic factor types are knowledge (a password), possession (a phone or security key) and inherence (a fingerprint or face). MFA combines at least two different types.",
  },
  {
    category: "Passwords & access",
    difficulty: "Intermediate",
    question: "What does the principle of least privilege mean?",
    correct: "People get only the access they need to do their job",
    wrong: [
      "Everyone gets administrator rights to avoid support calls",
      "Only the least experienced staff may change settings",
      "Users should have as few passwords as possible",
    ],
    explanation:
      "Limiting access reduces the damage from mistakes, malware and stolen accounts.",
  },
  {
    category: "Passwords & access",
    difficulty: "Intermediate",
    question: "Why is it risky to reuse the same password on several sites?",
    correct:
      "If one site is breached, attackers can try the same password on your other accounts",
    wrong: [
      "It makes websites run slower",
      "Websites lock your accounts automatically",
      "Passwords stop working after they have been used twice",
    ],
    explanation:
      "Trying leaked passwords on other sites is called credential stuffing. Unique passwords stop one breach from spreading.",
  },
  {
    category: "Passwords & access",
    difficulty: "Intermediate",
    question: "Which sign-in method is generally the most resistant to phishing?",
    correct: "A passkey or a hardware security key (FIDO2)",
    wrong: [
      "A code sent by SMS",
      "A code sent by email",
      "A security question such as \"first pet's name\"",
    ],
    explanation:
      "Passkeys and security keys are tied to the real website address, so a fake site cannot easily collect something that works. Codes can be typed into fake pages, and security answers are often easy to find or guess.",
  },

  {
    category: "Networking",
    difficulty: "Beginner",
    question: "What does DNS do?",
    correct: "Translates domain names like example.com into IP addresses",
    wrong: [
      "Gives devices an IP address automatically",
      "Encrypts web traffic",
      "Blocks unwanted network traffic",
    ],
    explanation:
      "DNS works like a phone book for the internet: you type a name and DNS finds the address of the server.",
  },
  {
    category: "Networking",
    difficulty: "Beginner",
    question: "What does DHCP do?",
    correct: "Automatically gives devices an IP address and other network settings",
    wrong: [
      "Translates domain names into IP addresses",
      "Checks websites for viruses",
      "Stores web pages closer to the users",
    ],
    explanation:
      "Thanks to DHCP, a laptop can join a network without anyone typing in an address by hand.",
  },
  {
    category: "Networking",
    difficulty: "Intermediate",
    question: "Which of these is a private IPv4 address?",
    correct: "192.168.1.25",
    wrong: ["8.8.8.8", "172.32.0.10", "203.0.113.7"],
    explanation:
      "The private ranges are 10.0.0.0 to 10.255.255.255, 172.16.0.0 to 172.31.255.255 and 192.168.0.0 to 192.168.255.255. 172.32.0.10 is just outside the second range.",
  },
  {
    category: "Networking",
    difficulty: "Beginner",
    question: "What does a firewall do?",
    correct: "Allows or blocks network traffic based on rules",
    wrong: [
      "Makes the internet connection faster",
      "Removes viruses from files",
      "Stores backups of your data",
    ],
    explanation:
      "A firewall sits between networks (or on a device) and decides which connections are allowed.",
  },
  {
    category: "Networking",
    difficulty: "Intermediate",
    question: "Which port does HTTPS use by default?",
    correct: "443",
    wrong: ["80", "22", "25"],
    explanation: "HTTPS uses port 443. Port 80 is HTTP, 22 is SSH and 25 is SMTP.",
  },
  {
    category: "Networking",
    difficulty: "Intermediate",
    question: "A PC shows an IP address starting with 169.254. What does that usually mean?",
    correct: "It could not get an address from a DHCP server and gave itself one",
    wrong: [
      "It is connected directly to the internet",
      "It is using a VPN",
      "Its address is reserved for the router",
    ],
    explanation:
      "Addresses in 169.254.0.0/16 are self-assigned (APIPA). Check the cable or Wi-Fi and whether the DHCP server is reachable.",
  },
  {
    category: "Networking",
    difficulty: "Beginner",
    question: "What does the ping command mainly test?",
    correct:
      "Whether another device can be reached over the network, and how long replies take",
    wrong: [
      "How much free storage a computer has",
      "Whether a password is strong enough",
      "Which programs start with Windows",
    ],
    explanation:
      "Ping sends small test messages and times the replies. If a ping fails it does not always mean the device is down, because some devices block ping.",
  },
  {
    category: "Networking",
    difficulty: "Intermediate",
    question: "What is a default gateway?",
    correct:
      "The router a device sends traffic to when the destination is on another network",
    wrong: [
      "The first website that opens in a browser",
      "A backup DNS server",
      "A firewall rule that blocks all traffic",
    ],
    explanation:
      "Traffic for addresses outside the local network goes to the default gateway, usually your router.",
  },

  {
    category: "Windows & Microsoft 365",
    difficulty: "Beginner",
    question:
      "Which Windows tool shows running programs and how much CPU and memory they use?",
    correct: "Task Manager",
    wrong: ["Device Manager", "Disk Cleanup", "Notepad"],
    explanation:
      "Task Manager (Ctrl+Shift+Esc) is often the first stop when a computer feels slow or a program has frozen.",
  },
  {
    category: "Windows & Microsoft 365",
    difficulty: "Beginner",
    question: "Which Microsoft 365 app is mainly used for chat, calls and online meetings?",
    correct: "Microsoft Teams",
    wrong: ["Excel", "OneNote", "Microsoft Entra ID"],
    explanation:
      "Teams combines chat, meetings and file sharing for groups of people.",
  },
  {
    category: "Windows & Microsoft 365",
    difficulty: "Beginner",
    question: "What is Microsoft Entra ID used for?",
    correct: "Cloud identity and access management, such as sign-in and MFA for users",
    wrong: [
      "Making video calls",
      "Writing and running scripts",
      "Creating spreadsheets",
    ],
    explanation:
      "Entra ID was previously called Azure Active Directory. It handles users, groups, sign-ins and conditions such as MFA.",
  },
  {
    category: "Windows & Microsoft 365",
    difficulty: "Intermediate",
    question: "Which command shows the IP configuration of a Windows computer?",
    correct: "ipconfig",
    wrong: ["ifconfig", "chkdsk", "tasklist"],
    explanation:
      "ifconfig is the older Linux and macOS tool. In Windows, ipconfig /all also shows details such as DNS servers and the MAC address.",
  },
  {
    category: "Windows & Microsoft 365",
    difficulty: "Intermediate",
    question: "What does the command sfc /scannow do?",
    correct: "Scans protected system files and repairs corrupted ones",
    wrong: [
      "Scans the network for other devices",
      "Checks how much free disk space is left",
      "Removes all malware from the computer",
    ],
    explanation:
      "sfc is System File Checker. It is usually run from a Command Prompt or PowerShell opened as administrator.",
  },
  {
    category: "Windows & Microsoft 365",
    difficulty: "Intermediate",
    question: "What does Safe Mode do in Windows?",
    correct:
      "Starts Windows with only basic drivers and services, which helps with troubleshooting",
    wrong: [
      "Encrypts the whole disk",
      "Starts Windows faster by skipping the sign-in",
      "Blocks all internet traffic permanently",
    ],
    explanation:
      "If a problem disappears in Safe Mode, a driver or a startup program is often the cause.",
  },
  {
    category: "Windows & Microsoft 365",
    difficulty: "Intermediate",
    question: "In a Windows domain, what is Group Policy used for?",
    correct: "Centrally configuring settings and restrictions for users and computers",
    wrong: [
      "Backing up user files to the cloud",
      "Creating group chats",
      "Updating the BIOS on every device",
    ],
    explanation:
      "Administrators can use Group Policy to apply the same settings to many computers, for example password rules or a desktop background.",
  },
  {
    category: "Windows & Microsoft 365",
    difficulty: "Beginner",
    question: "Which Microsoft 365 service provides business email and calendars?",
    correct: "Exchange Online",
    wrong: ["OneDrive", "Forms", "Planner"],
    explanation:
      "Exchange Online hosts mailboxes and calendars. Outlook is the app many people use to read them.",
  },

  {
    category: "Data & security basics",
    difficulty: "Beginner",
    question: "What is the 3-2-1 backup rule?",
    correct:
      "Keep 3 copies of your data, on 2 different types of storage, with 1 copy off-site",
    wrong: [
      "Use 3 passwords, 2 devices and 1 backup program",
      "Back up 3 times a day, 2 times a week and once a month",
      "Have 3 people, 2 approvals and 1 administrator",
    ],
    explanation:
      "Several copies in different places mean that one failure, theft or fire does not destroy all your data.",
  },
  {
    category: "Data & security basics",
    difficulty: "Beginner",
    question: "Why is it important to install software updates?",
    correct: "They often fix security holes that attackers could use",
    wrong: [
      "They always make the computer faster",
      "They delete old files to save space",
      "They are only needed on servers",
    ],
    explanation:
      "Many attacks use vulnerabilities that already have a fix. Updating closes those doors.",
  },
  {
    category: "Data & security basics",
    difficulty: "Intermediate",
    question: "What does ransomware do?",
    correct: "Encrypts your files and demands payment to unlock them",
    wrong: [
      "Only sends spam from your email account",
      "Shows adverts and slows the computer",
      "Silently records everything you type",
    ],
    explanation:
      "Good, tested backups are one of the best ways to recover without paying.",
  },
  {
    category: "Data & security basics",
    difficulty: "Intermediate",
    question: "Which backup is best protected against ransomware?",
    correct: "An offline or immutable copy that the infected computer cannot change",
    wrong: [
      "A copy in another folder on the same computer",
      "A copy on a USB drive that always stays plugged in",
      "A shortcut to the original files",
    ],
    explanation:
      "Ransomware also tries to encrypt reachable backups. Copies that are disconnected or cannot be modified survive.",
  },
  {
    category: "Data & security basics",
    difficulty: "Beginner",
    question: "What does encryption do?",
    correct: "Scrambles data so it can only be read with the right key",
    wrong: [
      "Compresses files so they take less space",
      "Removes duplicate files",
      "Deletes data after 30 days",
    ],
    explanation:
      "Encryption protects data on disks and while it travels over a network, as long as the key stays secret.",
  },
  {
    category: "Data & security basics",
    difficulty: "Intermediate",
    question: "What is a zero-day vulnerability?",
    correct: "A flaw that can be exploited before the vendor has released a fix",
    wrong: [
      "A flaw that was fixed within the last day",
      "A virus that only works for one day",
      "A bug that appears when the computer's date is wrong",
    ],
    explanation:
      "The vendor has had \"zero days\" to fix it. Until a patch exists, other protections such as monitoring and least privilege matter more.",
  },

  {
    category: "IT support practice",
    difficulty: "Beginner",
    question: "A user says \"my computer is slow\". What is a good first step?",
    correct:
      "Ask questions: when it started, what changed and which programs are affected",
    wrong: [
      "Reinstall Windows immediately",
      "Tell the user to buy a new computer",
      "Wait until they report it again",
    ],
    explanation:
      "Good questions narrow down the cause before you change anything, and they save time.",
  },
  {
    category: "IT support practice",
    difficulty: "Beginner",
    question: "Why should you document the steps you took in a ticket?",
    correct: "So others can understand the history and reuse the solution later",
    wrong: [
      "So the ticket looks longer",
      "Only to blame the user if it happens again",
      "It is only needed for hardware problems",
    ],
    explanation:
      "Clear notes help colleagues pick up the case and make the next, similar problem faster to solve.",
  },
  {
    category: "IT support practice",
    difficulty: "Intermediate",
    question: "Which ticket should usually be handled first?",
    correct: "Email is down for the whole company",
    wrong: [
      "One user wants a different desktop background",
      "A request for a new mouse next month",
      "A question about how to change a font",
    ],
    explanation:
      "Priority depends on impact and urgency. Problems that stop many people from working come first.",
  },
  {
    category: "IT support practice",
    difficulty: "Intermediate",
    question: "A caller asks you to reset their password. What is the best practice?",
    correct: "Verify their identity with your organisation's process before resetting",
    wrong: [
      "Reset it right away to be helpful",
      "Reset it only if they sound confident",
      "Tell them to ask a colleague to do it",
    ],
    explanation:
      "Attackers often pretend to be users. Checking identity first protects the account and the user.",
  },
  {
    category: "IT support practice",
    difficulty: "Intermediate",
    question: "What does it mean to escalate a ticket?",
    correct:
      "Pass it to a more specialised team or a senior person when you cannot resolve it",
    wrong: [
      "Close it to improve the statistics",
      "Lower its priority",
      "Delete it and ask the user to submit a new one",
    ],
    explanation:
      "Escalating is part of the job. Include what you have already tried so the next person does not start from zero.",
  },
];

const CATEGORIES = [...new Set(QUESTIONS.map((q) => q.category))];

const $ = (id) => document.getElementById(id);
const els = {
  status: $("status"),
  error: $("error"),
  setupSection: $("setup-section"),
  setupHeading: $("setup-heading"),
  setupForm: $("setup-form"),
  category: $("category"),
  difficulty: $("difficulty"),
  count: $("count"),
  timerToggle: $("timer-toggle"),
  matchInfo: $("match-info"),
  startButton: $("start-button"),
  quizSection: $("quiz-section"),
  progressText: $("progress-text"),
  timer: $("timer"),
  progressBar: $("progress-bar"),
  progressFill: $("progress-fill"),
  badges: $("question-badges"),
  questionText: $("question-text"),
  questionError: $("question-error"),
  options: $("options"),
  feedback: $("feedback"),
  feedbackResult: $("feedback-result"),
  feedbackExplanation: $("feedback-explanation"),
  submitAnswer: $("submit-answer"),
  nextButton: $("next-button"),
  quitButton: $("quit-button"),
  resultsSection: $("results-section"),
  resultsHeading: $("results-heading"),
  resultsScore: $("results-score"),
  resultsMessage: $("results-message"),
  resultsBest: $("results-best"),
  againButton: $("again-button"),
  settingsButton: $("settings-button"),
  reviewEmpty: $("review-empty"),
  reviewList: $("review-list"),
  statsSection: $("stats-section"),
  statPlayed: $("stat-played"),
  statBest: $("stat-best"),
  statAccuracy: $("stat-accuracy"),
  statsEmpty: $("stats-empty"),
  statsTable: $("stats-table"),
  statsBody: $("stats-body"),
  resetStats: $("reset-stats"),
};

let stats = loadStats();
let quiz = null;
let lastSettings = null;
let timerId = null;
let timeLeft = 0;

function announce(message) {
  els.status.textContent = "";
  els.status.textContent = message;
}

function showError(message) {
  els.error.textContent = message;
  els.error.hidden = false;
}

function shuffle(list) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/* ---------- Saved stats ---------- */

function emptyStats() {
  return { played: 0, best: null, categories: {} };
}

function isCount(value) {
  return Number.isInteger(value) && value >= 0;
}

function isValidStats(data) {
  if (!data || typeof data !== "object" || !isCount(data.played)) {
    return false;
  }
  if (data.best !== null) {
    const best = data.best;
    const validBest =
      best &&
      typeof best === "object" &&
      isCount(best.correct) &&
      isCount(best.total) &&
      best.total > 0 &&
      best.correct <= best.total;
    if (!validBest) {
      return false;
    }
  }
  if (!data.categories || typeof data.categories !== "object" || Array.isArray(data.categories)) {
    return false;
  }
  return Object.keys(data.categories).every((name) => {
    const entry = data.categories[name];
    return (
      CATEGORIES.includes(name) &&
      entry &&
      isCount(entry.correct) &&
      isCount(entry.answered) &&
      entry.correct <= entry.answered
    );
  });
}

function loadStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return emptyStats();
    }
    const data = JSON.parse(raw);
    if (isValidStats(data)) {
      return data;
    }
    showError("Your saved stats looked damaged, so they were reset.");
  } catch (error) {
    showError("Your saved stats could not be read, so they were reset.");
  }
  return emptyStats();
}

function saveStats() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    showError("Stats could not be saved. Your browser may be blocking storage.");
  }
}

function percent(correct, total) {
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

function isBetterScore(candidate, current) {
  if (current === null) {
    return true;
  }
  const a = candidate.correct / candidate.total;
  const b = current.correct / current.total;
  return a > b || (a === b && candidate.total > current.total);
}

function renderStats() {
  els.statPlayed.textContent = String(stats.played);

  els.statBest.textContent = stats.best
    ? `${stats.best.correct}/${stats.best.total} (${percent(stats.best.correct, stats.best.total)}%)`
    : "–";

  let correctTotal = 0;
  let answeredTotal = 0;
  els.statsBody.replaceChildren();

  CATEGORIES.forEach((name) => {
    const entry = stats.categories[name];
    if (!entry || entry.answered === 0) {
      return;
    }
    correctTotal += entry.correct;
    answeredTotal += entry.answered;

    const row = document.createElement("tr");
    const header = document.createElement("th");
    header.scope = "row";
    header.textContent = name;
    row.append(header);
    [entry.correct, entry.answered, `${percent(entry.correct, entry.answered)}%`].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = String(value);
      row.append(cell);
    });
    els.statsBody.append(row);
  });

  els.statAccuracy.textContent =
    answeredTotal > 0 ? `${percent(correctTotal, answeredTotal)}%` : "–";
  els.statsEmpty.hidden = answeredTotal > 0;
  els.statsTable.hidden = answeredTotal === 0;
}

/* ---------- Setup ---------- */

function fillCategories() {
  const all = document.createElement("option");
  all.value = ALL;
  all.textContent = "All categories";
  els.category.append(all);

  CATEGORIES.forEach((name) => {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    els.category.append(option);
  });
}

function readSettings() {
  return {
    category: els.category.value,
    difficulty: els.difficulty.value,
    count: Number(els.count.value),
    timed: els.timerToggle.checked,
  };
}

function matchingQuestions(settings) {
  return QUESTIONS.filter(
    (q) =>
      (settings.category === ALL || q.category === settings.category) &&
      (settings.difficulty === ALL || q.difficulty === settings.difficulty)
  );
}

function updateMatchInfo() {
  const settings = readSettings();
  const available = matchingQuestions(settings).length;
  const used = Math.min(settings.count, available);

  els.startButton.disabled = available === 0;
  if (available === 0) {
    els.matchInfo.textContent = "No questions match these choices. Try another category or level.";
  } else if (used < settings.count) {
    els.matchInfo.textContent = `Only ${available} questions match, so you will get ${used}.`;
  } else {
    els.matchInfo.textContent = `${available} questions match. You will get ${used}.`;
  }
}

function showSection(name) {
  els.setupSection.hidden = name !== "setup";
  els.quizSection.hidden = name !== "quiz";
  els.resultsSection.hidden = name !== "results";
  els.statsSection.hidden = name === "quiz";
}

/* ---------- Quiz ---------- */

function prepareQuestion(question) {
  const options = [{ text: question.correct, correct: true }].concat(
    question.wrong.map((text) => ({ text, correct: false }))
  );
  return { ...question, options: shuffle(options) };
}

function startQuiz(settings) {
  const pool = shuffle(matchingQuestions(settings)).slice(0, settings.count);
  if (pool.length === 0) {
    return;
  }
  lastSettings = settings;
  quiz = {
    settings,
    questions: pool.map(prepareQuestion),
    index: 0,
    score: 0,
    results: [],
    answered: false,
  };
  els.error.hidden = true;
  showSection("quiz");
  showQuestion();
}

function showQuestion() {
  const question = quiz.questions[quiz.index];
  const total = quiz.questions.length;
  quiz.answered = false;

  els.progressText.textContent = `Question ${quiz.index + 1} of ${total}`;
  els.progressBar.setAttribute("aria-valuemax", String(total));
  els.progressBar.setAttribute("aria-valuenow", String(quiz.index));
  els.progressFill.style.width = `${(quiz.index / total) * 100}%`;

  els.badges.replaceChildren();
  [question.category, question.difficulty].forEach((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    els.badges.append(item);
  });

  els.questionText.textContent = question.question;
  els.questionError.hidden = true;
  els.feedback.hidden = true;
  els.submitAnswer.hidden = false;
  els.nextButton.hidden = true;

  els.options.replaceChildren();
  question.options.forEach((option, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "option";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "answer";
    input.id = `option-${index}`;
    input.value = String(index);

    const label = document.createElement("label");
    label.htmlFor = input.id;
    const text = document.createElement("span");
    text.textContent = option.text;
    const flag = document.createElement("span");
    flag.className = "option-flag";
    label.append(text, flag);

    wrapper.append(input, label);
    els.options.append(wrapper);
  });

  startTimer();
  els.questionText.focus();
}

function selectedIndex() {
  const checked = els.options.querySelector("input:checked");
  return checked ? Number(checked.value) : null;
}

function submitAnswer(timedOut) {
  if (quiz.answered) {
    return;
  }
  const question = quiz.questions[quiz.index];
  const chosen = timedOut ? null : selectedIndex();

  if (chosen === null && !timedOut) {
    els.questionError.textContent = "Choose an answer first.";
    els.questionError.hidden = false;
    els.options.querySelector("input").focus();
    return;
  }

  stopTimer();
  quiz.answered = true;
  els.questionError.hidden = true;

  const isCorrect = chosen !== null && question.options[chosen].correct;
  if (isCorrect) {
    quiz.score += 1;
  }
  quiz.results.push({
    question,
    chosenText: chosen === null ? null : question.options[chosen].text,
    isCorrect,
  });

  question.options.forEach((option, index) => {
    const wrapper = els.options.children[index];
    wrapper.querySelector("input").disabled = true;
    const flag = wrapper.querySelector(".option-flag");
    if (option.correct) {
      wrapper.classList.add("is-correct");
      flag.textContent = " (correct answer)";
    } else if (index === chosen) {
      wrapper.classList.add("is-wrong");
      flag.textContent = " (your answer)";
    }
  });

  if (isCorrect) {
    els.feedbackResult.textContent = "Correct!";
  } else if (timedOut) {
    els.feedbackResult.textContent = `Time's up. The correct answer is: ${question.correct}`;
  } else {
    els.feedbackResult.textContent = `Not quite. The correct answer is: ${question.correct}`;
  }
  els.feedbackExplanation.textContent = question.explanation;
  els.feedback.hidden = false;

  els.submitAnswer.hidden = true;
  els.nextButton.textContent =
    quiz.index === quiz.questions.length - 1 ? "See results" : "Next question";
  els.nextButton.hidden = false;
  els.feedback.focus();
}

function nextQuestion() {
  quiz.index += 1;
  if (quiz.index >= quiz.questions.length) {
    finishQuiz();
  } else {
    showQuestion();
  }
}

function endQuiz() {
  stopTimer();
  quiz = null;
  showSection("setup");
  announce("Quiz ended. This attempt was not counted in your stats.");
  els.setupHeading.focus();
}

/* ---------- Timer ---------- */

function renderTimer() {
  els.timer.textContent = `Time left: ${timeLeft} s`;
}

function startTimer() {
  stopTimer();
  if (!quiz.settings.timed) {
    els.timer.hidden = true;
    return;
  }
  timeLeft = SECONDS_PER_QUESTION;
  renderTimer();
  els.timer.hidden = false;
  timerId = setInterval(() => {
    timeLeft -= 1;
    renderTimer();
    if (timeLeft === 10) {
      announce("10 seconds left.");
    }
    if (timeLeft <= 0) {
      submitAnswer(true);
    }
  }, 1000);
}

function stopTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

/* ---------- Results ---------- */

function finishQuiz() {
  const total = quiz.questions.length;
  const score = quiz.score;

  stats.played += 1;
  quiz.results.forEach((result) => {
    const name = result.question.category;
    const entry = stats.categories[name] || { correct: 0, answered: 0 };
    entry.answered += 1;
    if (result.isCorrect) {
      entry.correct += 1;
    }
    stats.categories[name] = entry;
  });

  const candidate = { correct: score, total };
  const isNewBest =
    total >= MIN_QUESTIONS_FOR_BEST && score > 0 && isBetterScore(candidate, stats.best);
  if (isNewBest) {
    stats.best = candidate;
  }
  saveStats();
  renderStats();
  renderResults(isNewBest);
}

function renderResults(isNewBest) {
  const total = quiz.questions.length;
  const score = quiz.score;
  const share = percent(score, total);

  els.resultsScore.textContent = `You scored ${score} out of ${total} (${share}%).`;
  if (share >= 80) {
    els.resultsMessage.textContent = "Strong result. Keep revisiting the questions you missed.";
  } else if (share >= 50) {
    els.resultsMessage.textContent = "A solid start. Read the explanations below and try again.";
  } else {
    els.resultsMessage.textContent = "Keep practising. The explanations below are a good place to start.";
  }

  if (isNewBest) {
    els.resultsBest.textContent = "New personal best!";
  } else if (total < MIN_QUESTIONS_FOR_BEST) {
    els.resultsBest.textContent = `Best score only counts quizzes with at least ${MIN_QUESTIONS_FOR_BEST} questions.`;
  } else if (stats.best) {
    els.resultsBest.textContent = `Your best score is ${stats.best.correct}/${stats.best.total}.`;
  } else {
    els.resultsBest.textContent = "";
  }

  els.reviewList.replaceChildren();
  const wrong = quiz.results.filter((result) => !result.isCorrect);
  els.reviewEmpty.hidden = wrong.length > 0;

  wrong.forEach((result) => {
    const item = document.createElement("li");
    const title = document.createElement("p");
    title.className = "review-question";
    title.textContent = result.question.question;

    const yours = document.createElement("p");
    yours.textContent =
      result.chosenText === null
        ? "Your answer: none (time ran out)"
        : `Your answer: ${result.chosenText}`;

    const right = document.createElement("p");
    right.textContent = `Correct answer: ${result.question.correct}`;

    const why = document.createElement("p");
    why.className = "review-why";
    why.textContent = result.question.explanation;

    item.append(title, yours, right, why);
    els.reviewList.append(item);
  });

  showSection("results");
  els.resultsHeading.focus();
}

function resetStats() {
  if (!window.confirm("Reset all saved quiz stats? This cannot be undone.")) {
    return;
  }
  stats = emptyStats();
  saveStats();
  renderStats();
  announce("Stats were reset.");
}

/* ---------- Events ---------- */

els.setupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  startQuiz(readSettings());
});

[els.category, els.difficulty, els.count].forEach((control) => {
  control.addEventListener("change", updateMatchInfo);
});

els.submitAnswer.addEventListener("click", () => submitAnswer(false));
els.nextButton.addEventListener("click", nextQuestion);
els.quitButton.addEventListener("click", endQuiz);
els.againButton.addEventListener("click", () => startQuiz(lastSettings));
els.settingsButton.addEventListener("click", () => {
  showSection("setup");
  els.setupHeading.focus();
});
els.resetStats.addEventListener("click", resetStats);

fillCategories();
updateMatchInfo();
renderStats();
