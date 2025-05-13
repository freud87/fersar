

// ⚠️ Variables de configuration
const gistId = "87a8d16dfce5286aabd4496177b7e92b";
const filename = "preparatifs.json";

// ⚠️ Ton token GitHub personnel (NE JAMAIS partager publiquement)
const token = "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"; // À remplacer par le tien

// Colonnes du tableau
const colonnes = [
  { label: "Éléments", key: "element" },
  { label: "Coté administratif", key: "admin" },
  { label: "Coûts", key: "cout" },
  { label: "Part Sarra", key: "partSarra" },
  { label: "Part Ferid", key: "partFerid" },
  { label: "Acompte Sarra", key: "acompteSarra" },
  { label: "Acompte Ferid", key: "acompteFerid" },
  { label: "Restant", key: "restant" }
];

let currentData = [];

// 🟡 Charger les données depuis le Gist
async function fetchData() {
  try {
    const res = await fetch(`https://api.github.com/gists/ ${gistId}`);
    if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
    
    const gist = await res.json();

    if (!gist.files || !gist.files[filename]) {
      throw new Error(`Fichier "${filename}" introuvable dans le Gist.`);
    }

    const content = gist.files[filename].content;
    currentData = JSON.parse(content);
    renderTable(currentData);
  } catch (err) {
    console.error("Erreur lors du chargement:", err);
    alert(`Erreur : Impossible de charger le tableau. ${err.message}`);
  }
}

// 🔵 Afficher le tableau
function renderTable(data) {
  const container = document.getElementById("tableContainer");
  if (!container) {
    console.error("Element tableContainer introuvable");
    return;
  }

  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.width = "100%";

  // En-tête
  const header = document.createElement("tr");
  colonnes.forEach(col => {
    const th = document.createElement("th");
    th.textContent = col.label;
    th.style.border = "1px solid #ccc";
    th.style.padding = "6px";
    header.appendChild(th);
  });
  table.appendChild(header);

  // Données
  data.forEach((item, rowIndex) => {
    const row = document.createElement("tr");
    colonnes.forEach(col => {
      const td = document.createElement("td");
      td.style.border = "1px solid #ddd";
      td.style.padding = "4px";

      const input = document.createElement("input");
      input.type = ["cout", "partSarra", "partFerid", "acompteSarra", "acompteFerid", "restant"].includes(col.key) 
        ? "number" 
        : "text";
      input.value = item[col.key] ?? "";
      input.style.width = "100%";
      input.min = "0";

      input.addEventListener("input", () => {
        // Mise à jour de la valeur
        currentData[rowIndex][col.key] = input.type === "number" 
          ? parseFloat(input.value) || 0 
          : input.value;

        // Recalcul du restant si un champ financier est modifié
        if (["cout", "partSarra", "partFerid", "acompteSarra", "acompteFerid"].includes(col.key)) {
          const d = currentData[rowIndex];
          d.restant = Math.max(0,
            (parseFloat(d.cout) || 0)
            - ((parseFloat(d.partSarra) || 0)
              + (parseFloat(d.partFerid) || 0)
              + (parseFloat(d.acompteSarra) || 0)
              + (parseFloat(d.acompteFerid) || 0))
          );
          renderTable(currentData); // Peut être optimisé pour mettre à jour qu'une ligne
        }
      });

      td.appendChild(input);
      row.appendChild(td);
    });
    table.appendChild(row);
  });

  container.innerHTML = "";
  container.appendChild(table);
}

// 🟢 Sauvegarder dans le Gist
async function saveData() {
  if (!token || token === "xxxxxxxxxxxxxxxxxxxx") {
    alert("❌ Token GitHub non configuré. Veuillez configurer un token valide.");
    return;
  }

  try {
    const updatedContent = JSON.stringify(currentData, null, 2);

    const res = await fetch(`https://api.github.com/gists/ ${gistId}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/vnd.github.v3+json"
      },
      body: JSON.stringify({
        files: {
          [filename]: {
            content: updatedContent
          }
        }
      })
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Erreur HTTP: ${res.status}`);
    }

    alert("✅ Données sauvegardées !");
  } catch (err) {
    console.error("Erreur lors de la sauvegarde:", err);
    alert(`❌ Échec de la sauvegarde: ${err.message}`);
  }
}

// 🔄 Lancer au démarrage
document.addEventListener('DOMContentLoaded', fetchData);
