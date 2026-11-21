export function decodeFAQ(text) {
  if (new TextEncoder().encode(text).length > 65536) throw new Error("FAQ is too large.");
  const data = JSON.parse(text);
  if (data?.schemaVersion !== 1 || !Array.isArray(data.entries) || !data.entries.length || data.entries.length > 60) {
    throw new Error("Invalid FAQ document.");
  }
  const ids = new Set();
  const validText = (value, limit) => typeof value === "string" && value.trim() && value.length <= limit;
  return {
    schemaVersion: 1,
    entries: data.entries.map(({ id, question, answer, bold }) => {
      if (!validText(id, 80) || ids.has(id) || !validText(question, 180) || !validText(answer, 1600)) {
        throw new Error("Invalid FAQ entry.");
      }
      ids.add(id);
      return validText(bold, 1600) && answer.includes(bold)
        ? { id, question, answer, bold }
        : { id, question, answer };
    })
  };
}

async function showFAQ() {
  const list = document.querySelector("#faq-list");
  const status = document.querySelector("#faq-status");
  const search = document.querySelector("#faq-search");
  try {
    const response = await fetch(new URL("./faq.json", import.meta.url));
    if (!response.ok) throw new Error("FAQ data unavailable.");
    const { entries } = decodeFAQ(await response.text());
    function render() {
      const query = search.value.trim().toLowerCase();
      const rows = entries.filter(({ question, answer }) => `${question} ${answer}`.toLowerCase().includes(query));
      status.textContent = rows.length ? `${rows.length} ${rows.length === 1 ? "question" : "questions"}` : "No matching questions.";
      list.replaceChildren(...rows.map(({ id, question, answer, bold }) => {
        const panel = document.createElement("details");
        panel.className = "panel";
        panel.id = id;
        const summary = document.createElement("summary");
        summary.textContent = question;
        const text = document.createElement("p");
        if (bold) {
          const start = answer.indexOf(bold);
          const emphasis = document.createElement("strong");
          emphasis.textContent = bold;
          text.append(answer.slice(0, start), emphasis, answer.slice(start + bold.length));
        } else {
          text.textContent = answer;
        }
        panel.append(summary, text);
        return panel;
      }));
    }
    search.disabled = false;
    search.addEventListener("input", render);
    render();
    const linked = document.getElementById(location.hash.slice(1));
    if (linked?.tagName === "DETAILS") { linked.open = true; linked.scrollIntoView(); }
  } catch {
    status.textContent = "Questions could not be loaded. Try reloading, or use the support link below.";
  }
}

if (typeof document !== "undefined") void showFAQ();
