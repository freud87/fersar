const scriptURL = "https://script.google.com/macros/s/TON_ID/exec"; // ← à remplacer

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
      .then(res => res.text())
      .then(txt => alert("✅ Données enregistrées !"))
      .catch(err => alert("❌ Erreur : " + err));
    }
  