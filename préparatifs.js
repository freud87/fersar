// Remplacez cette URL par l'URL de votre application Web Google Apps Script après déploiement
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby0B259VopXelzGEJ9RVKPrcZa0u5pqKRUmmRp1XY4vWuyQw0LFY8oMdeHUb9HDbi5xqQ/exec';

const columns = ['element', 'administratif', 'couts', 'part_sarra', 'part_ferid', 'acompte_sarra', 'acompte_ferid', 'restant'];
const calculables = ['couts', 'acompte_ferid', 'acompte_sarra'];

function updateRestantForRow(tr) {
  const cells = tr.querySelectorAll('td');
  const getValue = (col) => {
    const index = columns.indexOf(col);
    if (index === -1) return 0;
    const value = parseFloat(cells[index].textContent.trim());
    return isNaN(value) ? 0 : value;
  };

  const cout = getValue('couts');
  const acompteFerid = getValue('acompte_ferid');
  const acompteSarra = getValue('acompte_sarra');
  const restant = cout - acompteFerid - acompteSarra;

  const restantIndex = columns.indexOf('restant');
  if (restantIndex !== -1) {
    cells[restantIndex].textContent = restant.toFixed(2);
  }
}

// Charger les données depuis GSheet
async function loadData() {
  try {
    const response = await fetch(`${SCRIPT_URL}?action=read`);
    const data = await response.json();

    const container = document.getElementById('tableContainer');
    container.innerHTML = '';

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    columns.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.replace('_', ' ').toUpperCase();
      if (col === 'id') th.style.display = 'none';
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    data.forEach(row => {
      const tr = document.createElement('tr');

      columns.forEach(col => {
        const td = document.createElement('td');
        td.contentEditable = col !== 'id' && col !== 'restant';
        td.textContent = row[col] !== undefined && row[col] !== null ? row[col] : '';
        if (col === 'id') td.style.display = 'none';

        // Empêche l'ajout de retour à la ligne avec Enter
        td.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            td.blur();
          }
        });

        if (td.isContentEditable) {
          td.addEventListener('input', () => {
            if (calculables.includes(col)) {
              updateRestantForRow(tr);
            }
            document.getElementById('saveWarning').style.display = 'block';
          });
        }

        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);
  } catch (error) {
    console.error('Erreur de chargement GSheet :', error);
  }
}

// Ajouter une nouvelle ligne vide
document.getElementById('addRowBtn').addEventListener('click', () => {
  const tbody = document.querySelector('#tableContainer table tbody');
  if (!tbody) return;
  const tr = document.createElement('tr');

  columns.forEach(col => {
    const td = document.createElement('td');
    td.contentEditable = col !== 'id' && col !== 'restant';
    td.textContent = '';
    if (col === 'id') td.style.display = 'none';

    if (td.isContentEditable) {
      td.addEventListener('input', () => {
        if (calculables.includes(col)) {
          updateRestantForRow(tr);
        }
        document.getElementById('saveWarning').style.display = 'block';
      });
    }

    tr.appendChild(td);
  });

  tbody.appendChild(tr);
  document.getElementById('saveWarning').style.display = 'block';
});

// Enregistrer (Mises à jour et Nouvelles lignes groupées)
document.getElementById('saveBtn').addEventListener('click', async () => {
  const rows = document.querySelectorAll('#tableContainer table tbody tr');
  const allRowsData = [];

  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    const rowData = {};
    columns.forEach((col, i) => {
      const text = cells[i].textContent.trim();
      rowData[col] = (col === 'id' || isNaN(text) || text === '') ? text : parseFloat(text);
    });
    
    allRowsData.push(rowData);
  });

  try {
    // On envoie les données sous forme de paramètre de formulaire pour éviter les blocages CORS
    const formData = new URLSearchParams();
    formData.append('action', 'save');
    formData.append('data', JSON.stringify(allRowsData));

    await fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // On le garde, mais cette fois-ci les données passeront dans le corps urlencoded
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    document.getElementById('saveWarning').style.display = 'none';
    alert('Données enregistrées avec succès dans Google Sheets !');
    
    // On recharge après un léger délai pour laisser à Google le temps de traiter l'écriture
    setTimeout(loadData, 1500);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde :', error);
    alert('Une erreur est survenue lors de la sauvegarde.');
  }
});

window.addEventListener('DOMContentLoaded', loadData);
