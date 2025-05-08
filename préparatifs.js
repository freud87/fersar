
const sheetUrl = "https://script.google.com/macros/s/AKfycbxqcIzurBYiE8oggJ2NF-z35zLHEHl9WuAWRpnbyuoKOoBUzW51LDh4rkCR8X1bBTS5/exec";

// Charger les données depuis Google Sheets
fetch(sheetUrl)
  .then(response => response.json())
  .then(data => {
    const tbody = document.getElementById('editableTable').getElementsByTagName('tbody')[0];
    tbody.innerHTML = ''; // Vide d'abord le tableau

    data.forEach(row => {
      const tr = document.createElement('tr');
      const cols = ['Eléments', 'Coté administratif', 'Coûts', 'Part Sarra', 'Part Ferid', 'Acompte Sarra', 'Acompte Ferid', 'Restant'];
      
      cols.forEach(col => {
        const td = document.createElement('td');
        td.contentEditable = "true";
        td.innerText = row[col] !== undefined ? row[col] : '';
        tr.appendChild(td);
      });
      
      tbody.appendChild(tr);
    });
  })
  .catch(error => {
    console.error('Erreur de chargement JSON :', error);
    alert('Erreur lors de l\'import des données');
  });


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

