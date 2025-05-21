const taskColumns = ['id', 'objet', 'personne', 'telephone', 'date', 'destinataire', 'mail', 'envoi', 'fait'];

async function loadTasks() {
  const { data, error } = await supabase.from('rappels').select('*');
  if (error) {
    console.error('Erreur de chargement des rappels :', error.message);
    return;
  }

  const container = document.getElementById('tasksContainer');
  container.innerHTML = '';

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  taskColumns.forEach(col => {
    const th = document.createElement('th');
    th.textContent = col.toUpperCase();
    if (col === 'id') th.style.display = 'none';
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  data.forEach(row => {
    const tr = document.createElement('tr');
    taskColumns.forEach(col => {
      const td = document.createElement('td');
      td.contentEditable = col !== 'id' && col !== 'envoi';

      if (col === 'date' && row[col]) {
        const dateObj = new Date(row[col]);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        td.textContent = `${day}/${month}/${year}`;
      } else if (col === 'mail') {
        td.textContent = row[col] || '';
        td.addEventListener('click', () => setupMailSelector(td, tr));
      } else {
        td.textContent = row[col] || '';
      }

      if (col === 'id') td.style.display = 'none';

      td.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          td.blur();
        }
      });

      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}

// remplissage d’e-mail dépendant de destinataire
function setupMailSelector(td, tr) {
  const destIndex = taskColumns.indexOf('destinataire');
  const destCell = tr.cells[destIndex];
  const destinataire = destCell?.textContent.trim().toLowerCase();

  if (destinataire === 'sarra') {
    td.textContent = 'sarrakharroubi30@gmail.com';
  } else if (destinataire === 'ferid') {
    td.textContent = 'feridfreud@gmail.com';
  } else {
    td.textContent = '';
  }
}


// Ajouter une ligne vide
document.getElementById('addtask').addEventListener('click', () => {
  const tbody = document.querySelector('#tasksContainer table tbody');
  const tr = document.createElement('tr');
  taskColumns.forEach(col => {
    const td = document.createElement('td');
    td.contentEditable = col !== 'id';
    td.textContent = '';
    if (col === 'id') td.style.display = 'none';
    tr.appendChild(td);
  });
  tbody.appendChild(tr);
  document.getElementById('savetaskWarning').style.display = 'block';
});

// Enregistrement des tâches
document.getElementById('savetask').addEventListener('click', async () => {
  const rows = document.querySelectorAll('#tasksContainer table tbody tr');
  const newRows = [], existingRows = [];

  for (const row of rows) {
    const cells = row.querySelectorAll('td');
    const rowData = {};
    let hasEmptyPhone = false;

    taskColumns.forEach((col, i) => {
      let text = cells[i].textContent.trim();

      if (col === 'telephone' && text === '') hasEmptyPhone = true;

      if (['telephone', 'envoi', 'fait'].includes(col) && text === '') {
        rowData[col] = null;
      } else if (col === 'date' && text.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        // Convertir JJ/MM/AAAA en AAAA-MM-DD
        const [jj, mm, aaaa] = text.split('/');
        rowData[col] = `${aaaa}-${mm}-${jj}`;
      } else {
        rowData[col] = text;
      }
    });

    if (hasEmptyPhone) {
      alert("Le champ TÉLÉPHONE est obligatoire pour tous les rappels.");
      return;
    }

    if (rowData.id) {
      rowData.id = parseInt(rowData.id);
      existingRows.push(rowData);
    } else {
      delete rowData.id;
      newRows.push(rowData);
    }
  }

  // MAJ des lignes existantes
  for (const row of existingRows) {
    const { id, ...updateData } = row;
    const { error } = await supabase.from('rappels').update(updateData).eq('id', id);
    if (error) console.error(`Erreur de mise à jour pour id=${id} :`, error.message);
  }

  // Insertion des nouvelles lignes
  if (newRows.length > 0) {
    const { error } = await supabase.from('rappels').insert(newRows);
    if (error) {
      console.error('Erreur d’insertion :', error.message);
      return;
    }
  }

  document.getElementById('savetaskWarning').style.display = 'none';
  alert('Rappels enregistrés avec succès !');
  loadTasks();
});

// Charger les données au démarrage
window.addEventListener('DOMContentLoaded', loadTasks);
