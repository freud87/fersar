const filename = "preparatifs.json"; // fichier local dans le même dossier

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
        const response = await fetch(filename);
        if (!response.ok) throw new Error("Erreur HTTP " + response.status);
        const data = await response.json();
        currentData = data;
        renderTable(currentData);
      } catch (error) {
        console.error("Erreur lors du chargement du JSON local :", error);
        alert("Erreur de chargement du fichier JSON.");
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

          input.addEventListener("input", () => {
            currentData[rowIndex][col.key] = input.type === "number" ? parseFloat(input.value) || 0 : input.value;

            if (["cout", "partSarra", "partFerid", "acompteSarra", "acompteFerid"].includes(col.key)) {
              const d = currentData[rowIndex];
              d.restant = d.cout - (d.partSarra + d.partFerid + d.acompteSarra + d.acompteFerid);
              renderTable(currentData);
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

    fetchData();
