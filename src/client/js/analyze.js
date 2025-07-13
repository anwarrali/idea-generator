const ideaForm = document.getElementById("ideaForm");
if (ideaForm) {
  ideaForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const idea = document.getElementById("ideaInput").value.trim();
    const description = document.getElementById("descInput").value.trim();

    if (!idea || !description) {
      alert("Please fill in both the idea and description.");
      return;
    }

    const prompt = `I have an idea: ${idea}. Description: ${description}. Please generate a project title, requirements (functional, non-functional), technologies, and a step-by-step plan in JSON format. Return only valid JSON without any explanation.`;
    console.log("Prompt sent to server:", prompt);
    document.getElementById("loadingIndicatorAnalyze").style.display = "block";
    try {
      const response = await fetch(
        "https://idea-generator-production.up.railway.app/api/analyze",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idea, description }),
        }
      );

      const data = await response.json();
      const result = JSON.parse(data.reply);

      document.getElementById("resultsSection").classList.add("show");
      document.getElementById("ideaDescription").innerText =
        result.idea || "No idea returned";
      document.getElementById("ideaRequirements").innerHTML =
        (result.requirements.functional || [])
          .map((req) => `<li>${req}</li>`)
          .join("") +
        (result.requirements.non_functional || [])
          .map((req) => `<li>${req}</li>`)
          .join("");
      const techContainer = document.getElementById("ideaTechnologies");
      techContainer.innerHTML = "";

      if (Array.isArray(result.technologies)) {
        techContainer.innerHTML = result.technologies
          .map((t) => `<li>${t}</li>`)
          .join("");
      } else if (typeof result.technologies === "string") {
        techContainer.innerHTML = result.technologies
          .split(",")
          .map((t) => `<li>${t.trim()}</li>`)
          .join("");
      } else {
        techContainer.innerHTML = "<li>No technologies provided.</li>";
      }

      document.getElementById("ideaPlan").innerHTML = (result.plan || [])
        .map((step) => `<li>${step}</li>`)
        .join("");
      document.getElementById("loadingIndicatorAnalyze").style.display = "none";
    } catch (err) {
      alert("Error generating idea: " + err.message);
      console.error("Fetch error:", err);
    } finally {
      document.getElementById("loadingIndicatorAnalyze").style.display = "none";
    }
  });
}
