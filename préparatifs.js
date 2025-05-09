const scriptId = 'AKfycbxqcIzurBYiE8oggJ2NF-z35zLHEHl9WuAWRpnbyuoKOoBUzW51LDh4rkCR8X1bBTS5';
const sheetURL = `https://script.google.com/macros/s/${scriptId}/exec`;

async function loadTableFromSheet() {
  const sheetId = '1HBNk2OHy-GikbNhwQf8hD_QAx42rLqSNozpwMU9EPQM';
  const scriptId = 'AKfycbxqcIzurBYiE8oggJ2NF-z35zLHEHl9WuAWRpnbyuoKOoBUzW51LDh4rkCR8X1bBTS5';

  const url = `https://script.google.com/macros/s/${scriptId}/exec?action=read`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    console.log("Données reçues :", data);

    const prepSection = document.getElementById("Préparatifs");

    // Créer le conteneur du tableau si inexistant
    let tableContainer = prepSection.querySelector("#tableContainer");
    if (!tableContainer) {
      tableContainer = document.createElement("div");
      tableContainer.id = "tableContainer";
      prepSection.appendChild(tableContainer);
    }

    renderEditableTable(data);
  } catch (err) {
    console.error("Erreur lors du chargement des données :", err);
    alert("Impossible de charger les données depuis Google Sheets.");
  }
}

/**
 * Génère le tableau éditable à partir des données
 */
function renderEditableTable(data) {
  let html = `
    <table id="dataTable">
      <thead>
        <tr>
          ${data[0].map(title => `<th>${escapeHtml(title)}</th>`).join('')}
          <th>Action</th>
        </tr>
      </thead>
      <tbody>`;

  data.slice(1).forEach((row, index) => {
    html += `<tr>`;
    for (let i = 0; i < row.length; i++) {
      html += `<td><input type="text" value="${escapeHtml(row[i])}" onchange="markDirty()"/></td>`;
    }
    html += `<td><button onclick="removeRow(this)">Supprimer</button></td></tr>`;
  });

  html += `</tbody></table>`;
  document.getElementById("tableContainer").innerHTML = html;

  // Rattacher les événements aux boutons déjà dans le HTML
  document.getElementById("addRowBtn")?.addEventListener("click", () => {
    const table = document.querySelector("#dataTable tbody");
    const newRow = table.insertRow();
    const nbCols = data[0].length;
    for (let i = 0; i < nbCols; i++) {
      const cell = newRow.insertCell(i);
      cell.innerHTML = `<input type="text" onchange="markDirty()"/>`;
    }
    const actionCell = newRow.insertCell(nbCols);
    actionCell.innerHTML = `<button onclick="removeRow(this)">Supprimer</button>`;
    markDirty();
  });

  document.getElementById("saveBtn")?.addEventListener("click", async () => {
    const rows = document.querySelectorAll("#dataTable tbody tr");
    const newData = [];

    rows.forEach(row => {
      const cells = row.querySelectorAll("input");
      const rowData = Array.from(cells).map(cell => cell.value.trim());
      newData.push(rowData);
    });

    // Ajouter les en-têtes (ligne 0) en première ligne à réécrire dans Sheets
    const finalData = [data[0], ...newData];

    const url = `${sheetURL}?action=write`;

    try {
      const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ data: finalData })
      });

      const result = await res.json();
      if (result.status === "success") {
        alert("✅ Données enregistrées avec succès !");
        document.getElementById("saveWarning").style.display = "none";
      } else {
        alert("❌ Une erreur est survenue lors de l'enregistrement.");
      }
    } catch (err) {
      console.error("Erreur réseau :", err);
      alert("⚠️ Impossible d’enregistrer les données. Vérifiez votre connexion.");
    }
  });
}

function removeRow(btn) {
  const row = btn.parentNode.parentNode;
  row.parentNode.removeChild(row);
  markDirty();
}

function markDirty() {
  document.getElementById("saveWarning").style.display = "block";
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
document.getElementById("saveBtn")?.addEventListener("click", async () => {
  const rows = document.querySelectorAll("#dataTable tbody tr");
  const newData = [];

  rows.forEach(row => {
    const cells = row.querySelectorAll("input");
    const rowData = Array.from(cells).map(cell => cell.value.trim());
    newData.push(rowData);
  });

  // Ajouter la ligne d'en-tête au début
  const headers = Array.from(document.querySelectorAll("#dataTable thead th"))
    .slice(0, -1) // exclure "Action"
    .map(th => th.textContent.trim());
  const finalData = [headers, ...newData];

  const url = `https://script.google.com/macros/s/${scriptId}/exec?action=write`;
  
console.log("Données à enregistrer :", finalData);
console.log("URL appelée :", url);
  
  try {
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify({ data: finalData })
    });

    const result = await res.json();
    if (result.status === "success") {
      alert("✅ Données enregistrées avec succès !");
      document.getElementById("saveWarning").style.display = "none";
    } else {
      alert("❌ Une erreur est survenue lors de l'enregistrement.");
    }
  } catch (err) {
    console.error("Erreur réseau :", err);
    alert("⚠️ Impossible d’enregistrer les données. Vérifiez votre connexion.");
  }
});

