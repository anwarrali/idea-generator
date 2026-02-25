// Helper functions (must be defined at the top)
function getElement(id) {
  const el = document.getElementById(id);
  if (!el) {
    console.error(`Element not found: ${id}`);
  }
  return el;
}

function safeSetText(id, text) {
  const el = getElement(id);
  if (el) {
    el.textContent = text || "";
  }
}

function createSafeListItem(text) {
  const li = document.createElement("li");
  li.textContent = text;
  return li;
}

function populateList(listId, items, title = null) {
  const list = getElement(listId);
  if (!list) return;

  list.innerHTML = "";

  if (title) {
    const titleEl = document.createElement("strong");
    titleEl.textContent = title;
    list.appendChild(titleEl);
  }

  if (Array.isArray(items)) {
    items.forEach((item) => {
      if (item && typeof item === "string") {
        list.appendChild(createSafeListItem(item));
      }
    });
  }
}

function setLoading(show) {
  // Use the correct loading indicator ID from your HTML
  const loader = getElement("loadingIndicatorIndex");
  if (loader) {
    loader.style.display = show ? "block" : "none";
  }
}

// Main function
async function sendPrompt(event) {
  event.preventDefault();

  // Validate form elements
  const checkboxes = document.querySelectorAll(
    'input[type="checkbox"]:checked',
  );
  if (checkboxes.length === 0) {
    alert("Please select at least one field.");
    return;
  }

  const levelRadio = document.querySelector('input[name="ideaLevel"]:checked');
  if (!levelRadio) {
    alert("Please select an idea level.");
    return;
  }

  const selectedFields = Array.from(checkboxes).map((cb) => cb.value);
  const level = levelRadio.value;

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

  console.log("Sending prompt:", prompt); // Debug log
  setLoading(true);

  try {
    const API_URL = "https://idea-generator-i2z3.onrender.com"; // Hardcode for now to test

    const response = await fetch(`${API_URL}/api/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    console.log("Response status:", response.status); // Debug log

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.details || errorData.error || "Failed to generate idea",
      );
    }

    const data = await response.json();
    console.log("Response data:", data); // Debug log

    if (!data.reply) {
      throw new Error("Empty response from server");
    }

    let content = data.reply;
    let parsed;

    try {
      content = content.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(content);
      console.log("Parsed data:", parsed); // Debug log

      // Validate required fields
      if (
        !parsed.idea ||
        !parsed.requirements ||
        !parsed.technologies ||
        !parsed.plan
      ) {
        throw new Error("Invalid response structure");
      }
    } catch (parseError) {
      console.error("❌ Failed to parse JSON:", content);
      alert("The response was not valid JSON. Please try again.");
      return;
    }

    // Show results section
    const resultsSection = getElement("resultsSection");
    if (resultsSection) {
      resultsSection.classList.add("show");
    }

    // Display idea
    safeSetText("ideaDescription", parsed.idea);

    // Display requirements
    const reqList = getElement("ideaRequirements");
    if (reqList) {
      reqList.innerHTML = "";

      // Functional requirements
      if (parsed.requirements.functional) {
        const fTitle = document.createElement("strong");
        fTitle.textContent = "Functional Requirements:";
        reqList.appendChild(fTitle);
        parsed.requirements.functional.forEach((item) => {
          reqList.appendChild(createSafeListItem(item));
        });
      }

      // Non-functional requirements
      if (parsed.requirements.non_functional) {
        const nfTitle = document.createElement("strong");
        nfTitle.textContent = "Non-Functional Requirements:";
        reqList.appendChild(nfTitle);
        parsed.requirements.non_functional.forEach((item) => {
          reqList.appendChild(createSafeListItem(item));
        });
      }

      // Skills needed
      if (parsed.requirements.skills_needed) {
        const sTitle = document.createElement("strong");
        sTitle.textContent = "Skills Needed:";
        reqList.appendChild(sTitle);
        parsed.requirements.skills_needed.forEach((item) => {
          reqList.appendChild(createSafeListItem(item));
        });
      }
    }

    // Display technologies
    populateList("ideaTechnologies", parsed.technologies);

    // Display plan
    populateList("ideaPlan", parsed.plan);

    // Scroll to results
    if (resultsSection) {
      resultsSection.scrollIntoView({
        behavior: "smooth",
      });
    }
  } catch (error) {
    console.error("🔥 Error:", error);
    alert(error.message || "An error occurred. Please try again.");
  } finally {
    setLoading(false);
  }
}

// Initialize form event listeners
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded - initializing form"); // Debug log

  const fieldsForm = document.getElementById("fieldsForm");
  if (fieldsForm) {
    console.log("Form found, adding event listener"); // Debug log
    fieldsForm.addEventListener("submit", sendPrompt);
  } else {
    console.error("Form not found!"); // Debug log
  }
});
