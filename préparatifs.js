// Fonction appelée quand on clique sur "Préparatifs"
window.showSection = (function(originalShowSection) {
  return function(button) {
    originalShowSection(button); // Appelle la fonction originale

    const sectionId = button.getAttribute("data-section");
    if (sectionId === "Préparatifs") {
      const prepSection = document.getElementById("Préparatifs");

      // Si le conteneur du tableau n'existe pas encore, on le crée
      let tableContainer = prepSection.querySelector("#tableContainer");
      if (!tableContainer) {
        const newDiv = document.createElement("div");
        newDiv.id = "tableContainer";
        prepSection.appendChild(newDiv);
        tableContainer = newDiv;
      }

      // Si le tableau n'a jamais été chargé, on le charge
      if (!prepSection.dataset.loaded) {
        prepSection.dataset.loaded = "true";
        loadTableFromSheet();
      }
    }
  };
})(window.showSection);

function loadTableFromSheet() {
  const sheetId = '1HBNk2OHy-GikbNhwQf8hD_QAx42rLqSNozpwMU9EPQM'; // ID de votre Google Sheet
  const scriptId = 'AKfycbxqcIzurBYiE8oggJ2NF-z35zLHEHl9WuAWRpnbyuoKOoBUzW51LDh4rkCR8X1bBTS5';

  const url = `https://script.google.com/macros/s/ ${scriptId}/exec?action=read`;

  fetch(url)
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
    <button id="addRowBtn">➕ Ajouter une ligne</button>
    <button id="saveBtn">💾 Enregistrer</button>
    <p class="save-warning" id="saveWarning">⚠️ Vous devez sauvegarder les modifications.</p>

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

  // Réattacher les écouteurs d'événements aux nouveaux boutons
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

  document.getElementById("saveBtn")?.addEventListener("click", async () => {
    const rows = document.querySelectorAll("#dataTable tbody tr");
    const newData = [];
    rows.forEach(row => {
      const cells = row.querySelectorAll("input");
      const rowData = Array.from(cells).map(cell => cell.value.trim());
      newData.push(rowData);
    });

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
}

function removeRow(btn) {
  const row = btn.parentNode.parentNode;
  row.parentNode.removeChild(row);
  markDirty();
}

function markDirty() {
  document.getElementById("saveWarning").style.display = "block";
}

// Évite les failles XSS en échappant le HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
