
const scriptURL = "https://script.google.com/macros/s/AKfycbxqcIzurBYiE8oggJ2NF-z35zLHEHl9WuAWRpnbyuoKOoBUzW51LDh4rkCR8X1bBTS5/exec";

fetch(scriptURL + "?action=get")
  .then(r => r.json())
  .then(data => {
    const table = document.getElementById("depensesTable");
    data.forEach((row, i) => {
      const tr = document.createElement("tr");
      row.forEach(cell => {
        const tag = i === 0 ? "th" : "td";
        const el = document.createElement(tag);
        el.textContent = cell;
        if (tag === "td") el.contentEditable = true;
        tr.appendChild(el);
      });
      table.appendChild(tr);
    });
  });

function saveTable() {
  const table = document.getElementById("depensesTable");
  const data = [...table.rows].map(row =>
    [...row.cells].map(cell => cell.textContent.trim())
  );

  fetch(scriptURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(r => r.text())
  .then(txt => alert("✅ Données enregistrées"))
  .catch(err => alert("❌ Erreur : " + err));
}

