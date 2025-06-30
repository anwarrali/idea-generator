window.addEventListener("scroll", function () {
  const header = document.querySelector("header");
  if (window.scrollY > 50) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
});


// API
async function sendPrompt(event) {


  event.preventDefault(); // يمنع إعادة تحميل الصفحة

  const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
  const selectedFields = Array.from(checkboxes).map(cb => cb.value);

  const level = document.querySelector('input[name="ideaLevel"]:checked').value;

  const prompt = `
I want a ${level} project idea in the following fields: ${selectedFields.join(", ")}.

Please return a JSON object with the following structure:
{
  "idea": "A clear and concise project idea.",
  "requirements": {
    "functional": ["List of specific features the system must provide"],
    "non_functional": ["List of quality attributes, performance, security, scalability, etc."],
    "skills_needed": ["Technologies or knowledge areas required to build it"]
  },
  "technologies": ["List of languages, frameworks, tools"],
  "plan": [
    "Step 1: Description (e.g., Analyze requirements)",
    "Step 2: Description (e.g., Design system architecture)",
    "Step 3: Description (e.g., Build frontend using React)...",
    "Final Step: Complete testing and deployment"
  ]
}

Make sure the steps are clear, ordered, and include which technology/tool is used at each stage. Return **only** valid JSON without explanation.
`;

  try {
    const response = await fetch('https://idea-generator-i2z3.onrender.com/api/prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();
    const content = data.reply;
    const parsed = JSON.parse(content);

    document.querySelector(".results").classList.add("show");

    // Idea
    document.getElementById("ideaDescription").textContent = parsed.idea;

    // Requirements
    const reqList = document.getElementById("ideaRequirements");
    reqList.innerHTML = "";

    const fTitle = document.createElement("strong");
    fTitle.textContent = "Functional Requirements:";
    reqList.appendChild(fTitle);
    parsed.requirements.functional.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      reqList.appendChild(li);
    });

    const nfTitle = document.createElement("strong");
    nfTitle.textContent = "Non-Functional Requirements:";
    reqList.appendChild(nfTitle);
    parsed.requirements.non_functional.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      reqList.appendChild(li);
    });

    const sTitle = document.createElement("strong");
    sTitle.textContent = "Skills Needed:";
    reqList.appendChild(sTitle);
    parsed.requirements.skills_needed.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      reqList.appendChild(li);
    });

    // Technologies
    const techList = document.getElementById("ideaTechnologies");
    techList.innerHTML = "";
    parsed.technologies.forEach(t => {
      const li = document.createElement("li");
      li.textContent = t;
      techList.appendChild(li);
    });

    // Plan
    const planList = document.getElementById("ideaPlan");
    planList.innerHTML = "";
    parsed.plan.forEach(p => {
      const li = document.createElement("li");
      li.textContent = p;
      planList.appendChild(li);
    });
    // عرض النتائج
const resultsDiv = document.querySelector(".results");
resultsDiv.classList.add("show");

// تمرير سلس للنتائج
document.getElementById("resultsSection").scrollIntoView({
  behavior: "smooth"
});


  } catch (error) {
    console.error("Error:", error);
  }
}
