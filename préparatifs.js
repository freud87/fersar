const gistId = "87a8d16dfce5286aabd4496177b7e92b";
    const filename = "preparatifs.json";

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

    async function fetchData() {
      try {
        const response = await fetch(`https://api.github.com/gists/${gistId}`);
        const gist = await response.json();
        const content = gist.files[filename].content;
        currentData = JSON.parse(content);
        renderTable(currentData);
      } catch (error) {
        console.error("Erreur lors de la récupération du Gist :", error);
        alert("Erreur de chargement du fichier JSON depuis le Gist.");
      }
    }

    function renderTable(data) {
      const container = document.getElementById("tableContainer");
      const table = document.createElement("table");
      table.style.borderCollapse = "collapse";
      table.style.width = "100%";

      const header = document.createElement("tr");
      colonnes.forEach(col => {
        const th = document.createElement("th");
        th.textContent = col.label;
        th.style.border = "1px solid #ccc";
        th.style.padding = "6px";
        header.appendChild(th);
      });
      table.appendChild(header);

      data.forEach((item, rowIndex) => {
        const row = document.createElement("tr");
        colonnes.forEach(col => {
          const td = document.createElement("td");
          td.style.border = "1px solid #ddd";
          td.style.padding = "4px";

          const input = document.createElement("input");
          input.type = col.key.includes("cout") || col.key.includes("part") || col.key.includes("acompte") || col.key === "restant" ? "number" : "text";
          input.value = item[col.key] !== undefined ? item[col.key] : "";
          input.style.width = "100%";
          input.disabled = true; // lecture seule ici

          td.appendChild(input);
          row.appendChild(td);
        });
        table.appendChild(row);
      });

      container.innerHTML = "";
      container.appendChild(table);
    }

    fetchData();
