const ideaForm = document.getElementById("ideaForm");
if (ideaForm) {
  // Add this at the VERY TOP of analyze.js
  function setLoading(show) {
    const loader = document.getElementById("loadingIndicatorAnalyze");
    if (loader) {
      loader.style.display = show ? "block" : "none";
    }
  }

  // Your existing code continues...
  const ideaForm = document.getElementById("ideaForm");
  // ... etc
  ideaForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const ideaInput = document.getElementById("ideaInput");
    const descInput = document.getElementById("descInput");

    if (!ideaInput || !descInput) {
      console.error("Form inputs not found");
      return;
    }

    const idea = ideaInput.value.trim();
    const description = descInput.value.trim();

    if (!idea || !description) {
      alert("Please fill in both the idea and description.");
      return;
    }

    const prompt = `I have an idea: ${idea}. Description: ${description}. Please generate a project title, requirements (functional, non-functional, skills_needed), technologies, and a step-by-step plan in JSON format. Return only valid JSON without any explanation.`;

    console.log("Sending request...");
    setLoading(true);

    try {
      const API_URL =
        window.API_URL || "https://idea-generator-i2z3.onrender.com";

      const response = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea, description }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.details || errorData.error || "Failed to analyze idea",
        );
      }

      const data = await response.json();

      if (!data.reply) {
        throw new Error("Empty response from server");
      }

      let content = data.reply;
      let result;

      try {
        content = content.replace(/```json|```/g, "").trim();
        result = JSON.parse(content);
      } catch (parseError) {
        console.error("❌ Failed to parse JSON:", content);
        alert("The response was not valid JSON. Please try again.");
        return;
      }

      // Show results
      const resultsSection = getElement("resultsSection");
      if (resultsSection) {
        resultsSection.classList.add("show");
      }

      // Display idea
      safeSetText("ideaDescription", result.idea || "No idea returned");

      // Display requirements with all sections
      const reqList = getElement("ideaRequirements");
      if (reqList) {
        reqList.innerHTML = "";

        if (result.requirements?.functional) {
          const fTitle = document.createElement("strong");
          fTitle.textContent = "Functional Requirements:";
          reqList.appendChild(fTitle);
          result.requirements.functional.forEach((item) => {
            reqList.appendChild(createSafeListItem(item));
          });
        }

        if (result.requirements?.non_functional) {
          const nfTitle = document.createElement("strong");
          nfTitle.textContent = "Non-Functional Requirements:";
          reqList.appendChild(nfTitle);
          result.requirements.non_functional.forEach((item) => {
            reqList.appendChild(createSafeListItem(item));
          });
        }

        if (result.requirements?.skills_needed) {
          const sTitle = document.createElement("strong");
          sTitle.textContent = "Skills Needed:";
          reqList.appendChild(sTitle);
          result.requirements.skills_needed.forEach((item) => {
            reqList.appendChild(createSafeListItem(item));
          });
        }
      }

      // Display technologies
      const techContainer = getElement("ideaTechnologies");
      if (techContainer) {
        techContainer.innerHTML = "";

        if (Array.isArray(result.technologies)) {
          result.technologies.forEach((t) => {
            if (t && typeof t === "string") {
              techContainer.appendChild(createSafeListItem(t));
            }
          });
        } else if (typeof result.technologies === "string") {
          result.technologies.split(",").forEach((t) => {
            if (t && t.trim()) {
              techContainer.appendChild(createSafeListItem(t.trim()));
            }
          });
        } else {
          const li = document.createElement("li");
          li.textContent = "No technologies provided.";
          techContainer.appendChild(li);
        }
      }

      // Display plan
      populateList("ideaPlan", result.plan);
    } catch (err) {
      console.error("🔥 Error:", err);
      alert(err.message || "Error generating idea. Please try again.");
    } finally {
      setLoading(false);
    }
  });
}

// Initialize form event listeners
document.addEventListener("DOMContentLoaded", function () {
  const fieldsForm = document.getElementById("fieldsForm");
  if (fieldsForm) {
    fieldsForm.addEventListener("submit", sendPrompt);
  }
});
