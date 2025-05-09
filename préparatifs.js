// Chargement du tableau au moment où la section Préparatifs devient active
document.addEventListener("DOMContentLoaded", () => {
  const observer = new MutationObserver(() => {
    const prepSection = document.getElementById("Préparatifs");
    if (prepSection && prepSection.classList.contains("active") && !prepSection.dataset.loaded) {
      prepSection.dataset.loaded = "true";
      loadTableFromSheet();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
});

function loadTableFromSheet() {
  // Remplacez par l'ID de votre Google Sheet (visible dans l'URL du fichier Sheets)
  const sheetId = '1HBNk2OHy-GikbNhwQf8hD_QAx42rLqSNozpwMU9EPQM';

  // ID de votre Web App récupéré depuis l'URL donnée
  const scriptId = 'AKfycbxqcIzurBYiE8oggJ2NF-z35zLHEHl9WuAWRpnbyuoKOoBUzW51LDh4rkCR8X1bBTS5';

  fetch(`https://script.google.com/macros/s/ ${scriptId}/exec?action=read`)
    .then(res => res.json())
    .then(data => {
      renderEditableTable(data);
    })
    .catch(err => {
      console.error("Erreur lors du chargement des données :", err);
      alert("Impossible de charger les données depuis Google Sheets.");
    });
}

function renderEditableTable(data) {
  let html = `
    <table id="dataTable">
      <thead>
        <tr>
          <th>Eléments</th>
          <th>Coté administratif</th>
          <th>Coûts</th>
          <th>Part Sarra</th>
          <th>Part Ferid</th>
          <th>Acompte Sarra</th>
          <th>Acompte Ferid</th>
          <th>Restant</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>`;

  data.forEach((row, index) => {
    html += `<tr>`;
    for (let i = 0; i < row.length; i++) {
      html += `<td><input type="text" value="${escapeHtml(row[i])}" onchange="markDirty()"/></td>`;
    }
    html += `<td><button onclick="removeRow(this)">Supprimer</button></td></tr>`;
  });

  html += `</tbody></table>`;
  document.getElementById("tableContainer").innerHTML = html;
}

document.getElementById("addRowBtn")?.addEventListener("click", () => {
  const table = document.querySelector("#dataTable tbody");
  const newRow = table.insertRow();
  const headers = ["", "", "", "", "", "", "", ""];
  headers.forEach((_, i) => {
    const cell = newRow.insertCell(i);
    cell.innerHTML = `<input type="text" onchange="markDirty()"/>`;
  });
  const actionCell = newRow.insertCell(headers.length);
  actionCell.innerHTML = `<button onclick="removeRow(this)">Supprimer</button>`;
  markDirty();
});

function removeRow(btn) {
  const row = btn.parentNode.parentNode;
  row.parentNode.removeChild(row);
  markDirty();
}

function markDirty() {
  document.getElementById("saveWarning").style.display = "block";
}

document.getElementById("saveBtn")?.addEventListener("click", async () => {
  const rows = document.querySelectorAll("#dataTable tbody tr");
  const newData = [];
  rows.forEach(row => {
    const cells = row.querySelectorAll("input");
    const rowData = Array.from(cells).map(cell => cell.value.trim());
    newData.push(rowData);
  });

  const scriptId = 'AKfycbxqcIzurBYiE8oggJ2NF-z35zLHEHl9WuAWRpnbyuoKOoBUzW51LDh4rkCR8X1bBTS5';
  const url = `https://script.google.com/macros/s/ ${scriptId}/exec?action=write`;

  try {
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify({ data: newData })
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

// Fonction pour éviter les failles XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
