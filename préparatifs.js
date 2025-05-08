
const sheetUrl = "https://script.google.com/macros/s/AKfycbxqcIzurBYiE8oggJ2NF-z35zLHEHl9WuAWRpnbyuoKOoBUzW51LDh4rkCR8X1bBTS5/exec";

// Charger les données depuis Google Sheets
    fetch(sheetUrl)
      .then(response => response.json())
      .then(data => {
        const tbody = document.getElementById('editableTable').getElementsByTagName('tbody')[0];
        data.forEach(row => {
          const tr = document.createElement('tr');
          ['Éléments', 'Coté-administratif', 'Coûts', 'Part-Sarra', 'Part-Ferid', 'Acompte-Sarra', 'Acompte-Ferid', 'Restant'].forEach(col => {
            const td = document.createElement('td');
            td.contentEditable = "true";
            td.innerText = row[col] || '';
            tr.appendChild(td);
          });
          tbody.appendChild(tr);
        });
      });

    // Ajouter une ligne vide
    function addRow() {
      const tbody = document.getElementById('editableTable').getElementsByTagName('tbody')[0];
      const tr = document.createElement('tr');
      for (let i = 0; i < 8; i++) {
        const td = document.createElement('td');
        td.contentEditable = "true";
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }

    // Sauvegarder les données vers Google Sheets
    function saveTable() {
      const table = document.getElementById('editableTable');
      const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
      let data = [];

      for (let row of rows) {
        let rowData = [];
        for (let cell of row.getElementsByTagName('td')) {
          rowData.push(cell.innerText.trim());
        }
        data.push(rowData);
      }

      fetch(sheetUrl, {
        method: 'POST',
        body: JSON.stringify({data: data}),
        headers: {
          'Content-Type': 'application/json',
        }
      })
      .then(response => response.text())
      .then(result => {
        alert('Tableau enregistré avec succès !');
      })
      .catch(error => {
        console.error('Erreur:', error);
        alert('Erreur lors de la sauvegarde.');
      });
    }

