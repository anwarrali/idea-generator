// utils.js
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
  const loader = document.getElementById("loadingIndicatorAnalyze");
  if (loader) {
    loader.style.display = show ? "block" : "none";
  }
}
