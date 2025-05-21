// Configuration Supabase
const supabaseUrl = 'https://zhzeokjekgtgtsofxeyq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoemVva2pla2d0Z3Rzb2Z4ZXlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NDQ0NTUsImV4cCI6MjA2MzIyMDQ1NX0.pu2UpCW3HuA0b68_HmiXyehNSLCn0pOHU6WuzklOlKw';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

const taskColumns = ['id', 'objet', 'personne', 'telephone', 'date', 'email'];

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
      td.contentEditable = col !== 'id';
      td.textContent = row[col] || '';
      if (col === 'id') td.style.display = 'none';
      tr.appendChild(td);
      td.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          td.blur();
        }
      });
    });
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}

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

document.getElementById('savetask').addEventListener('click', async () => {
  const rows = document.querySelectorAll('#tasksContainer table tbody tr');
  const newRows = [], existingRows = [];

  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    const rowData = {};
    taskColumns.forEach((col, i) => {
      const text = cells[i].textContent.trim();
      rowData[col] = text;
    });
    if (rowData.id) {
      rowData.id = parseInt(rowData.id);
      existingRows.push(rowData);
    } else {
      delete rowData.id;
      newRows.push(rowData);
    }
  });

  for (const row of existingRows) {
    const { id, ...updateData } = row;
    const { error } = await supabase.from('rappels').update(updateData).eq('id', id);
    if (error) console.error(`Erreur de mise à jour pour id=${id} :`, error.message);
  }

  if (newRows.length > 0) {
    const { error } = await supabase.from('rappels').insert(newRows);
    if (error) console.error('Erreur d’insertion :', error.message);
  }

  document.getElementById('savetaskWarning').style.display = 'none';
  alert('Rappels enregistrés avec succès !');
  loadTasks();
});

window.addEventListener('DOMContentLoaded', loadTasks);
