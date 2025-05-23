let lastFocusedCell = null;
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
      td.addEventListener('focus', () => lastFocusedCell = td);

      const isEditable = !['id', 'mail', 'envoi'].includes(col);
      td.contentEditable = isEditable;

      if (col === 'date' && row[col]) {
        const dateObj = new Date(row[col] + 'T00:00:00');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        td.textContent = `${day}/${month}/${year}`;
      } else {
        td.textContent = row[col] || '';
      }

      if (col === 'mail') {
        // Pas éditable, mise à jour automatique via destinataire
      }

      if (col === 'fait') {
        td.textContent = row[col] === 'Oui' ? 'Oui' : '';
        if (row['envoi'] === 'Oui') {
          td.addEventListener('click', () => {
            td.textContent = td.textContent === 'Oui' ? '' : 'Oui';
            document.getElementById('savetaskWarning').style.display = 'block';
          });
        } else {
          td.style.color = 'gray';
          td.style.cursor = 'not-allowed';
        }
      }

      if (col === 'destinataire') {
        td.addEventListener('click', () => {
          const current = td.textContent.trim().toLowerCase();
          if (current === '') {
            td.textContent = 'Ferid';
          } else if (current === 'ferid') {
            td.textContent = 'Sarra';
          } else if (current === 'sarra') {
            td.textContent = '';
          }
          // Met à jour la colonne mail correspondante automatiquement
          const mailIndex = taskColumns.indexOf('mail');
          const mailCell = tr.cells[mailIndex];
          if (td.textContent.toLowerCase() === 'sarra') {
            mailCell.textContent = 'sarrakharroubi30@gmail.com';
          } else if (td.textContent.toLowerCase() === 'ferid') {
            mailCell.textContent = 'feridfreud@gmail.com';
          } else {
            mailCell.textContent = '';
          }
          document.getElementById('savetaskWarning').style.display = 'block';
        });
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

    if (col === 'destinataire') {
      td.addEventListener('click', () => {
        const current = td.textContent.trim().toLowerCase();
        if (current === '') {
          td.textContent = 'Ferid';
        } else if (current === 'ferid') {
          td.textContent = 'Sarra';
        } else if (current === 'sarra') {
          td.textContent = '';
        }
        // Met à jour mail automatiquement aussi
        const mailIndex = taskColumns.indexOf('mail');
        const mailCell = tr.cells[mailIndex];
        if (td.textContent.toLowerCase() === 'sarra') {
          mailCell.textContent = 'sarrakharroubi30@gmail.com';
        } else if (td.textContent.toLowerCase() === 'ferid') {
          mailCell.textContent = 'feridfreud@gmail.com';
        } else {
          mailCell.textContent = '';
        }
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
  if (!lastFocusedCell || lastFocusedCell.tagName !== 'TD') {
    alert('Veuillez placer le curseur dans une cellule pour supprimer la ligne correspondante.');
    return;
  }

  const row = lastFocusedCell.closest('tr');
  if (!row) {
    alert("Ligne non trouvée.");
    return;
  }

  const idIndex = taskColumns.indexOf('id');
  const idCell = row.cells[idIndex];
  const id = idCell?.textContent.trim();

  if (!id) {
    alert("Impossible de déterminer l'identifiant de la ligne.");
    return;
  }

  if (!confirm("Supprimer cette ligne ?")) return;

  const { error } = await supabase.from('rappels').delete().eq('id', parseInt(id));
  if (error) {
    console.error("Erreur de suppression :", error.message);
    alert("Erreur lors de la suppression.");
  } else {
    loadTasks();
  }
});

window.addEventListener('DOMContentLoaded', loadTasks);
