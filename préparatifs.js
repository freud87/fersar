 const supabaseUrl = 'https://zhzeokjekgtgtsofxeyq.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoemVva2pla2d0Z3Rzb2Z4ZXlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NDQ0NTUsImV4cCI6MjA2MzIyMDQ1NX0.pu2UpCW3HuA0b68_HmiXyehNSLCn0pOHU6WuzklOlKw';
  const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

  const columns = ['id', 'element', 'administratif', 'couts', 'part_sarra', 'part_ferid', 'acompte_sarra', 'acompte_ferid', 'restant'];

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

  async function loadData() {
    const { data, error } = await supabase.from('depenses').select('*');
    if (error) {
      console.error('Erreur de chargement :', error.message);
      return;
    }

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
        td.textContent = row[col] || '';
        if (col === 'id') td.style.display = 'none';
        tr.appendChild(td);
//////////////////////
       td.addEventListener('keydown', (e) => {
       if (e.key === 'Enter') {
         e.preventDefault();
         td.blur();
       }
     });
////////////////////////////
        if (['couts', 'acompte_ferid', 'acompte_sarra'].includes(col)) {
          td.addEventListener('input', () => {
            updateRestantForRow(tr);
            document.getElementById('saveWarning').style.display = 'block';
          });
        }
      });
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);
  }

  document.getElementById('addRowBtn').addEventListener('click', () => {
    const tbody = document.querySelector('#tableContainer table tbody');
    const tr = document.createElement('tr');
    columns.forEach(col => {
      const td = document.createElement('td');
      td.contentEditable = col !== 'id' && col !== 'restant';
      td.textContent = '';
      if (col === 'id') td.style.display = 'none';
      tr.appendChild(td);

      if (['couts', 'acompte_ferid', 'acompte_sarra'].includes(col)) {
        td.addEventListener('input', () => {
          updateRestantForRow(tr);
          document.getElementById('saveWarning').style.display = 'block';
        });
      }
    });

    tbody.appendChild(tr);
    document.getElementById('saveWarning').style.display = 'block';
  });

  document.getElementById('saveBtn').addEventListener('click', async () => {
    const rows = document.querySelectorAll('#tableContainer table tbody tr');
    const newRows = [];
    const existingRows = [];

    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      const rowData = {};
      columns.forEach((col, i) => {
        const text = cells[i].textContent.trim();
        rowData[col] = (col === 'id' || isNaN(text)) ? text : parseFloat(text);
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
      const { error } = await supabase.from('depenses').update(updateData).eq('id', id);
      if (error) {
        console.error(`Erreur de mise à jour pour id=${id} :`, error.message);
      }
    }

    if (newRows.length > 0) {
      const { error } = await supabase.from('depenses').insert(newRows);
      if (error) {
        console.error('Erreur d’insertion :', error.message);
      }
    }

    document.getElementById('saveWarning').style.display = 'none';
    alert('Données enregistrées avec succès !');
    loadData();
  });

  window.addEventListener('DOMContentLoaded', loadData);
