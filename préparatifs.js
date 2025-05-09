const scriptId = 'AKfycbxqcIzurBYiE8oggJ2NF-z35zLHEHl9WuAWRpnbyuoKOoBUzW51LDh4rkCR8X1bBTS5';
const sheetURL = `https://script.google.com/macros/s/${scriptId}/exec`;

// Charger les données depuis Google Sheets et générer le tableau
async function loadTableFromSheet() {
const url = `${sheetURL}?action=read`;

try {
const res = await fetch(url);
const data = await res.json();

```
console.log("Données reçues :", data);

const prepSection = document.getElementById("Préparatifs");

// Créer le conteneur du tableau s'il n'existe pas
let tableContainer = prepSection.querySelector("#tableContainer");
if (!tableContainer) {
  tableContainer = document.createElement("div");
  tableContainer.id = "tableContainer";
  prepSection.appendChild(tableContainer);
}

renderEditableTable(data);
```

} catch (err) {
console.error("Erreur lors du chargement des données :", err);
alert("Impossible de charger les données depuis Google Sheets.");
}
}

// Générer le tableau éditable
function renderEditableTable(data) {
let html = `    <table id="tableContainer">       <thead>         <tr>
          ${data[0].map(title =>`<th>\${escapeHtml(title)}</th>`).join('')}           <th>Action</th>         </tr>       </thead>       <tbody>`;

data.slice(1).forEach(row => {
html += `<tr>`;
row\.forEach(cell => {
html += `<td><input type="text" value="${escapeHtml(cell)}" oninput="markDirty()" /></td>`;
});
html += `<td><button onclick="removeRow(this)">Supprimer</button></td></tr>`;
});

html += `</tbody></table>`;

document.getElementById("tableContainer").innerHTML = html;
}

// Marquer le tableau comme modifié
function markDirty() {
document.getElementById("saveWarning").style.display = "block";
}

// Supprimer une ligne du tableau
function removeRow(button) {
if (confirm("❗ Voulez-vous vraiment supprimer cette ligne ?")) {
const row = button.closest("tr");
row\.remove();
markDirty();
}
}

// Échapper le HTML pour éviter les injections
function escapeHtml(text) {
const div = document.createElement('div');
div.textContent = text;
return div.innerHTML;
}

// Ajouter une nouvelle ligne vide
function addRow() {
const table = document.querySelector("#tableContainer tbody");
const nbCols = document.querySelectorAll("#tableContainer thead th").length - 1; // exclure "Action"
const newRow = table.insertRow();

for (let i = 0; i < nbCols; i++) {
const cell = newRow\.insertCell(i);
cell.innerHTML = `<input type="text" oninput="markDirty()" />`;
}

const actionCell = newRow\.insertCell(nbCols);
actionCell.innerHTML = `<button onclick="removeRow(this)">Supprimer</button>`;

markDirty();
}

// Sauvegarder les données dans Google Sheets
async function saveData() {
const rows = document.querySelectorAll("#tableContainer tbody tr");
const newData = Array.from(rows).map(row => {
const inputs = row\.querySelectorAll("input");
return Array.from(inputs).map(input => input.value.trim());
});

// Extraire les en-têtes
const headers = Array.from(document.querySelectorAll("#tableContainer thead th"))
.slice(0, -1)
.map(th => th.textContent.trim());

const finalData = \[headers, ...newData];

const url = `${sheetURL}?action=write`;

console.log("Données à enregistrer :", finalData);
console.log("URL appelée :", url);

try {
const res = await fetch(url, {
method: "POST",
body: JSON.stringify({ data: finalData }),
});

```
const result = await res.json();
if (result.status === "success") {
  alert("✅ Données enregistrées avec succès !");
  document.getElementById("saveWarning").style.display = "none";
} else {
  alert("❌ Une erreur est survenue lors de l'enregistrement.");
}
```

} catch (err) {
console.error("Erreur réseau :", err);
alert("⚠️ Impossible d’enregistrer les données. Vérifiez votre connexion.");
}
}

// Attacher les écouteurs une seule fois au chargement
document.addEventListener("DOMContentLoaded", () => {
document.getElementById("addRowBtn")?.addEventListener("click", addRow);
document.getElementById("saveBtn")?.addEventListener("click", saveData);
});
