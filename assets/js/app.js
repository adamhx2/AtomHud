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
    skills: [
      "Technical Writing",
      "Documentation",
      "Wiki Management",
      "Technical Translation",
    ],
  },
];

const rotatorTrack = document.querySelector("[data-rotator-track]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navLinks = document.querySelector("[data-nav-links]");

const cycleDelay = 2600;
const deleteDelay = 55;
const typeDelay = 85;
const itemFadeDelay = 260;
const itemStaggerDelay = 70;

let activeSectionIndex = 0;

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
