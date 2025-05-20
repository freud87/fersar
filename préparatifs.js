const supabaseUrl = 'https://zhzeokjekgtgtsofxeyq.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoemVva2pla2d0Z3Rzb2Z4ZXlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NDQ0NTUsImV4cCI6MjA2MzIyMDQ1NX0.pu2UpCW3HuA0b68_HmiXyehNSLCn0pOHU6WuzklOlKw';
  const supabase = supabase.createClient(supabaseUrl, supabaseKey);

  const columns = ['element', 'administratif', 'couts', 'part_sarra', 'part_ferid', 'acompte_sarra', 'acompte_ferid', 'restant'];

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
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    data.forEach(row => {
      const tr = document.createElement('tr');
      columns.forEach(col => {
        const td = document.createElement('td');
        td.contentEditable = true;
        td.textContent = row[col] || '';
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);
  }

  document.getElementById('addRowBtn').addEventListener('click', () => {
    const table = document.querySelector('#tableContainer table tbody');
    const tr = document.createElement('tr');
    columns.forEach(() => {
      const td = document.createElement('td');
      td.contentEditable = true;
      td.textContent = '';
      tr.appendChild(td);
    });
    table.appendChild(tr);
    document.getElementById('saveWarning').style.display = 'block';
  });

  document.getElementById('saveBtn').addEventListener('click', async () => {
    const rows = document.querySelectorAll('#tableContainer table tbody tr');
    const newData = [];

    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      const rowData = {};
      columns.forEach((col, i) => {
        const text = cells[i].textContent.trim();
        rowData[col] = isNaN(text) ? text : parseFloat(text);
      });
      newData.push(rowData);
    });

    await supabase.from('depenses').delete().neq('id', 0);

    const { error } = await supabase.from('depenses').insert(newData);
    if (error) {
      console.error('Erreur d’enregistrement :', error.message);
    } else {
      document.getElementById('saveWarning').style.display = 'none';
      alert('Données enregistrées avec succès !');
      loadData();
    }
  });

  window.onload = loadData;
