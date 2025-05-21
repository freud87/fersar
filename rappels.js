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
      td.textContent = row[col] || '';
      if (col === 'id') td.style.display = 'none';
      td.contentEditable = col !== 'id' && col !== 'mail' && col !== 'envoi';

      // Empêcher validation avec Entrée
      td.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          td.blur();
        }
      });

      // Mise à jour automatique du mail si 'destinataire' change
      if (col === 'destinataire') {
        td.addEventListener('blur', () => {
          const value = td.textContent.trim().toLowerCase();
          const mailCell = tr.querySelectorAll('td')[taskColumns.indexOf('mail')];
          if (value === 'sarra') {
            mailCell.textContent = 'sarrakharroubi30@gmail.com';
          } else if (value === 'ferid') {
            mailCell.textContent = 'feridfreud@gmail.com';
          } else {
            mailCell.textContent = '';
          }
        });
      }

      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}

// Ajouter un rappel
document.getElementById('addtask').addEventListener('click', () => {
  const tbody = document.querySelector('#tasksContainer table tbody');
  const tr = document.createElement('tr');

  taskColumns.forEach(col => {
    const td = document.createElement('td');
    td.textContent = '';
    if (col === 'id') td.style.display = 'none';
    td.contentEditable = col !== 'id' && col !== 'mail' && col !== 'envoi';

    // Empêcher validation avec Entrée
    td.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        td.blur();
      }
    });

    // Mise à jour automatique du mail
    if (col === 'destinataire') {
      td.addEventListener('blur', () => {
        const value = td.textContent.trim().toLowerCase();
        const mailCell = tr.querySelectorAll('td')[taskColumns.indexOf('mail')];
        if (value === 'sarra') {
          mailCell.textContent = 'sarrakharroubi30@gmail.com';
        } else if (value === 'ferid') {
          mailCell.textContent = 'feridfreud@gmail.com';
        } else {
          mailCell.textContent = '';
        }
      });
    }

    tr.appendChild(td);
  });

  tbody.appendChild(tr);
  document.getElementById('savetaskWarning').style.display = 'block';
});

// Enregistrer les rappels
document.getElementById('savetask').addEventListener('click', async () => {
  const rows = document.querySelectorAll('#tasksContainer table tbody tr');
  const newRows = [], existingRows = [];

  for (const row of rows) {
    const cells = row.querySelectorAll('td');
    const rowData = {};
    let hasEmptyPhone = false;

    taskColumns.forEach((col, i) => {
      let text = cells[i].textContent.trim();

      if (col === 'telephone' && text === '') {
        hasEmptyPhone = true;
      }

      if (['telephone', 'envoi', 'fait'].includes(col) && text === '') {
        rowData[col] = null;
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

// Charger les rappels au démarrage
window.addEventListener('DOMContentLoaded', loadTasks);
