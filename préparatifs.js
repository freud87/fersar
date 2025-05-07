const scriptURL = "https://script.google.com/macros/s/AKfycbxqcIzurBYiE8oggJ2NF-z35zLHEHl9WuAWRpnbyuoKOoBUzW51LDh4rkCR8X1bBTS5/exec"; // ← à remplacer

// Charger données
fetch(scriptURL + "?action=get")
  .then(res => res.json())
  .then(data => renderTable(data));

function renderTable(data) {
  const table = document.getElementById("depensesTable");
  table.innerHTML = "";
  data.forEach((row, i) => {
    const tr = document.createElement("tr");
    row.forEach((cell, j) => {
      const tag = i === 0 ? "th" : "td";
      const td = document.createElement(tag);
      td.textContent = cell;
      if (i !== 0) td.contentEditable = true;
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });
}

function addRow() {
  const table = document.getElementById("depensesTable");
  const row = table.insertRow(-1);
  for (let i = 0; i < table.rows[0].cells.length; i++) {
    const cell = row.insertCell();
    cell.contentEditable = true;
    cell.textContent = "";
  }
}

function saveData() {
  const table = document.getElementById("depensesTable");
  const data = [];
  for (let i = 0; i < table.rows.length; i++) {
    const row = [];
    for (let j = 0; j < table.rows[i].cells.length; j++) {
      row.push(table.rows[i].cells[j].innerText.trim());
    }
    data.push(row);
  }

  fetch(scriptURL, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  })
  .then(res => res.json())
  .then(res => {
    if (res.status === "success") {
      alert("✅ Données enregistrées !");
    } else {
      alert("❌ Erreur : " + res.message);
    }
  })
  .catch(err => alert("❌ Erreur : " + err));
}

// ✅ Version alternative avec nom explicite
function saveTable() {
  const table = document.getElementById("depensesTable");
  const rows = Array.from(table.rows).map(row =>
    Array.from(row.cells).map(cell => cell.textContent.trim())
  );

  fetch(scriptURL, {
    method: "POST",
    body: JSON.stringify(rows),
    headers: {
      "Content-Type": "application/json"
    }
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      alert("✅ Données enregistrées avec succès !");
    } else {
      throw new Error(data.message);
    }
  })
  .catch(err => {
    alert("❌ Erreur : " + err.message);
  });
}
