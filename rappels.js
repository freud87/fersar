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
      const isEditable = !['id', 'mail', 'envoi'].includes(col);
      td.contentEditable = isEditable;

      if (col === 'date' && row[col]) {
        const dateObj = new Date(row[col] + 'T00:00:00');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        td.textContent = `${day}/${month}/${year}`;
      } else if (col === 'mail') {
        td.textContent = row[col] || '';
        td.addEventListener('click', () => setupMailSelector(td, tr));
      } else if (col === 'fait') {
        td.textContent = row[col] === 'Oui' ? 'Oui' : '';
      
        const envoiValue = row['envoi'];
        if (envoiValue === 'Oui') {
          td.addEventListener('click', () => {
            td.textContent = td.textContent === 'Oui' ? '' : 'Oui';
            document.getElementById('savetaskWarning').style.display = 'block';
          });
        } else {
          td.style.color = 'gray';
          td.style.cursor = 'not-allowed';
        }
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

      if (isEditable) {
        td.addEventListener('input', () => {
          document.getElementById('savetaskWarning').style.display = 'block';
        });
      }

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
    td.contentEditable = !['id', 'mail', 'envoi'].includes(col);
    td.textContent = '';
    if (col === 'id') td.style.display = 'none';

    if (!['id', 'mail', 'envoi'].includes(col)) {
      td.addEventListener('input', () => {
        document.getElementById('savetaskWarning').style.display = 'block';
      });
    }

    if (col === 'fait') {
      td.addEventListener('click', () => {
        td.textContent = td.textContent === 'Oui' ? '' : 'Oui';
        document.getElementById('savetaskWarning').style.display = 'block';
      });
    }

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

      if (col === 'fait') {
        rowData[col] = text === 'Oui' ? 'Oui' : '';
      } else if (['telephone', 'envoi'].includes(col) && text === '') {
        rowData[col] = null;
      } else if (col === 'date' && text.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
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

  for (const row of existingRows) {
    const { id, ...updateData } = row;
    const { error } = await supabase.from('rappels').update(updateData).eq('id', id);
    if (error) console.error(`Erreur de mise à jour pour id=${id} :`, error.message);
  }

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
// Supprimer une ligne
document.getElementById('dlttask').addEventListener('click', async () => {
  const activeElement = document.activeElement;
  // Vérifie si on est dans une cellule de tableau
  if (!activeElement || activeElement.tagName !== 'TD') {
    alert('Veuillez placer le curseur dans une cellule pour supprimer la ligne correspondante.');
    return;
  }
  // Remonte à la ligne correspondante
  const row = activeElement.closest('tr');
  if (!row) {
    alert("Ligne non trouvée.");
    return;
  }
  // Trouve la cellule 'id' (même si cachée)
  const idIndex = taskColumns.indexOf('id');
  const idCell = row.cells[idIndex];
  const id = idCell?.textContent.trim();
  if (!id) {
    alert("Impossible de déterminer l'identifiant de la ligne.");
    return;
  }
  // Confirmation
  if (!confirm("Supprimer cette ligne ?")) return;
  // Suppression via Supabase
  const { error } = await supabase.from('rappels').delete().eq('id', parseInt(id));
  if (error) {
    console.error("Erreur de suppression :", error.message);
    alert("Erreur lors de la suppression.");
  } else {
    loadTasks();
  }
});
// Charger les données au démarrage
window.addEventListener('DOMContentLoaded', loadTasks);
