const skillSections = [
  {
    title: "Languages",
    skills: ["Python", "SQL", "HTML", "CSS"],
  },

  {
    title: "Databases",
    skills: ["PostgreSQL", "MySQL", "SQLite", "SQLAlchemy"],
  },

  {
    title: "APIs",
    skills: ["Zendesk", "SendGrid", "Slack", "Google Sheets"],
  },

  {
    title: "Linux",
    skills: ["Bash", "Cron", "Nginx", "Gunicorn"],
  },

  {
    title: "Automation",
    skills: [
      "Workflow Automation",
      "Report Automation",
      "Bots",
      "Web Scraping",
    ],
  },

  {
    title: "Data Analysis",
    skills: [
      "Dashboards",
      "Ad Hoc Reporting",
      "Data Validation",
      "Extract, Transform, Load",
    ],
  },

  {
    title: "Documentation",
    skills: ["Technical Writing", "Wiki Management", "Technical Translation"],
  },
];

const rotatorTrack = document.querySelector("[data-rotator-track]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navLinks = document.querySelector("[data-nav-links]");
const demoTerminalOutput = document.querySelector(
  "[data-demo-terminal-output]",
);
const demoGeneratedOutput = document.querySelector(
  "[data-demo-generated-output]",
);
const demoButtons = document.querySelectorAll("[data-demo-command]");

const cycleDelay = 2600;
const deleteDelay = 55;
const typeDelay = 85;
const itemFadeDelay = 260;
const itemStaggerDelay = 70;
const demoTypeDelay = 18;

let activeSectionIndex = 0;
let demoRunId = 0;
let shuffledDemoModules = [];
let addedDemoModules = [];
let hasDemoProjectTree = false;

const demoModules = ["csv", "dates", "env", "files", "json", "txt"];

const demoTrees = {
  init: [
    ".",
    "|-- .fabricator/",
    "|   |-- project.toml",
    "|-- src/",
    "|   |-- main.py",
    "|-- .env.example",
    "|-- .gitignore",
    "|-- README.md",
    "|-- requirements.txt",
  ],
};

function buildSkillScreen(section) {
  const skillItems = section.skills
    .map((skill, index) => `<li style="--item-index: ${index}">${skill}</li>`)
    .join("");

  return `
    <div class="skill-screen">
      <h2 data-skill-title>${section.title}</h2>
      <ul data-skill-list>${skillItems}</ul>
    </div>
  `;
}

function buildRotatorDisplay() {
  rotatorTrack.innerHTML = buildSkillScreen(skillSections[activeSectionIndex]);
}

function wait(duration) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

function shuffleItems(items) {
  const shuffledItems = [...items];

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledItems[index], shuffledItems[randomIndex]] = [
      shuffledItems[randomIndex],
      shuffledItems[index],
    ];
  }

  return shuffledItems;
}

function getNextDemoModule() {
  const availableModules = demoModules.filter(
    (moduleName) => !addedDemoModules.includes(moduleName),
  );

  if (availableModules.length === 0) {
    return null;
  }

  shuffledDemoModules = shuffledDemoModules.filter((moduleName) =>
    availableModules.includes(moduleName),
  );

  if (shuffledDemoModules.length === 0) {
    shuffledDemoModules = shuffleItems(availableModules);
  }

  return shuffledDemoModules.shift();
}

function setDemoButtonsDisabled(isDisabled) {
  demoButtons.forEach((button) => {
    if (button.dataset.demoCommand !== "clear") {
      button.disabled = isDisabled;
    }
  });
}

async function typeDemoOutput(text, runId) {
  demoTerminalOutput.textContent = "";

  for (const character of text) {
    if (runId !== demoRunId) {
      return false;
    }

    demoTerminalOutput.textContent += character;
    await wait(demoTypeDelay);
  }

  return true;
}

function clearDemoOutput() {
  demoRunId += 1;
  demoTerminalOutput.textContent = "";
  demoGeneratedOutput.innerHTML = "";
  addedDemoModules = [];
  shuffledDemoModules = [];
  hasDemoProjectTree = false;
  setDemoButtonsDisabled(false);
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildGeneratedTree({
  modules = addedDemoModules,
  moduleToHighlight = null,
  highlightUtilsFolder = false,
} = {}) {
  const lines = [
    ".",
    "|-- .fabricator/",
    "|   |-- project.toml",
    "|-- src/",
    "|   |-- main.py",
  ];

  if (modules.length > 0) {
    lines.push("|-- utils/");

    modules.forEach((moduleName) => {
      lines.push(`|   |-- ${moduleName}.py`);
    });
  }

  lines.push(
    "|-- .env.example",
    "|-- .gitignore",
    "|-- README.md",
    "|-- requirements.txt",
  );

  return lines
    .map((line) => {
      const isUtilsFolder = line === "|-- utils/";
      const isAddedLine =
        moduleToHighlight && line === `|   |-- ${moduleToHighlight}.py`;

      if (isAddedLine) {
        return `<span class="demo-generated-added demo-generated-added--new">${escapeHtml(line)}</span>`;
      }

      if (isUtilsFolder && highlightUtilsFolder) {
        return `<span class="demo-generated-added">${escapeHtml(line)}</span>`;
      }

      return escapeHtml(line);
    })
    .join("\n");
}

function getDemoResult(command) {
  if (command === "init") {
    addedDemoModules = [];
    shuffledDemoModules = [];
    hasDemoProjectTree = true;

    return {
      terminal: `PS demo> fbr init
Created: .env.example
Created: .gitignore
Created: README.md
Created: requirements.txt
Created: src/main.py
Created marker: .fabricator/project.toml
Project initialized with Fabricator.`,
      generated: buildGeneratedTree(),
    };
  }

  if (command === "doctor") {
    if (!hasDemoProjectTree) {
      return {
        terminal: `PS demo> fbr doctor
== Fabricator Doctor ==

Checking marker... X Not found

  -> run: fbr init

X Issues detected`,
        generated: null,
      };
    }

    return {
      terminal: `PS demo> fbr doctor
== Fabricator Doctor ==
Checking marker... OK Found
Checking metadata... OK Readable
Checking template... OK Valid

OK Project is healthy`,
      generated: null,
    };
  }

  if (!hasDemoProjectTree) {
    return {
      terminal: `PS demo> fbr add [module]
Not a Fabricator project.

  -> run: fbr init`,
      generated: "",
    };
  }

  const moduleName = getNextDemoModule();

  if (!moduleName) {
    return {
      terminal: `PS demo> fbr add [module]
All available modules already added.

Available modules: ${demoModules.join(", ")}`,
      generated: buildGeneratedTree(),
    };
  }

  const isFirstDemoModule = addedDemoModules.length === 0;

  addedDemoModules.push(moduleName);
  addedDemoModules.sort();
  hasDemoProjectTree = true;

  return {
    terminal: `PS demo> fbr add ${moduleName}
Created: utils/${moduleName}.py
Added module: ${moduleName}`,
    generated: buildGeneratedTree({
      moduleToHighlight: moduleName,
      highlightUtilsFolder: isFirstDemoModule,
    }),
  };
}

async function runDemoCommand(command) {
  if (!demoTerminalOutput || !demoGeneratedOutput) {
    return;
  }

  if (command === "clear") {
    clearDemoOutput();
    return;
  }

  const runId = demoRunId + 1;
  const hadDemoProjectTree = hasDemoProjectTree;
  const previousDemoModules = [...addedDemoModules];
  const result = getDemoResult(command);

  demoRunId = runId;

  if (command === "add" && hadDemoProjectTree) {
    demoGeneratedOutput.innerHTML = buildGeneratedTree({
      modules: previousDemoModules,
    });
  } else if (command !== "add" && command !== "doctor") {
    demoGeneratedOutput.innerHTML = "";
  }

  setDemoButtonsDisabled(true);

  const didComplete = await typeDemoOutput(result.terminal, runId);

  if (didComplete && runId === demoRunId && result.generated !== null) {
    demoGeneratedOutput.innerHTML = result.generated;
    setDemoButtonsDisabled(false);
  } else if (didComplete && runId === demoRunId) {
    setDemoButtonsDisabled(false);
  }
}

function renderSkillList(skills) {
  const skillList = rotatorTrack.querySelector("[data-skill-list]");
  skillList.innerHTML = skills
    .map((skill, index) => `<li style="--item-index: ${index}">${skill}</li>`)
    .join("");
}

function getListAnimationDuration(skillList) {
  const staggeredItems = Math.max(skillList.children.length - 1, 0);
  return itemFadeDelay + staggeredItems * itemStaggerDelay;
}

async function deleteTitle(titleElement) {
  while (titleElement.textContent.length > 0) {
    titleElement.textContent = titleElement.textContent.slice(0, -1);
    await wait(deleteDelay);
  }
}

async function typeTitle(titleElement, title) {
  for (const character of title) {
    titleElement.textContent += character;
    await wait(typeDelay);
  }
}

async function rotateSkillDisplay() {
  const titleElement = rotatorTrack.querySelector("[data-skill-title]");
  const skillList = rotatorTrack.querySelector("[data-skill-list]");

  await wait(cycleDelay);
  await deleteTitle(titleElement);

  skillList.classList.add("is-fading-out");
  await wait(getListAnimationDuration(skillList));

  activeSectionIndex = (activeSectionIndex + 1) % skillSections.length;
  const nextSection = skillSections[activeSectionIndex];

  renderSkillList(nextSection.skills);
  skillList.classList.remove("is-fading-out");
  skillList.classList.add("is-fading-in");

  // Let the browser apply the hidden starting state before animating to visible.
  skillList.offsetHeight;
  await typeTitle(titleElement, nextSection.title);

  skillList.classList.remove("is-fading-in");
  await wait(getListAnimationDuration(skillList));

  rotateSkillDisplay();
}

if (rotatorTrack) {
  buildRotatorDisplay();
  rotateSkillDisplay();
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", isOpen);
  });
}

if (demoTerminalOutput && demoGeneratedOutput) {
  clearDemoOutput();

  demoButtons.forEach((button) => {
    button.addEventListener("click", () => {
      runDemoCommand(button.dataset.demoCommand);
    });
  });
}
