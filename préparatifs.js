const supabaseUrl = 'https://zhzeokjekgtgtsofxeyq.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoemVva2pla2d0Z3Rzb2Z4ZXlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NDQ0NTUsImV4cCI6MjA2MzIyMDQ1NX0.pu2UpCW3HuA0b68_HmiXyehNSLCn0pOHU6WuzklOlKw';
  const supabase = supabase.createClient(supabaseUrl, supabaseKey);

  async function loadData() {
    const { data, error } = await supabase.from('preparatifs').select('*');

    if (error) {
      console.error('Erreur lors du chargement :', error.message);
      return;
    }

    const container = document.getElementById('tableContainer');
    container.innerHTML = '';

    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>
          <th>Élément</th>
          <th>Description</th>
          <th>Coût</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');
    data.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td contenteditable="true">${row.element || ''}</td>
        <td contenteditable="true">${row.description || ''}</td>
        <td contenteditable="true">${row.cout || ''}</td>
      `;
      tbody.appendChild(tr);
    });

    container.appendChild(table);
  }

  document.getElementById('addRowBtn').addEventListener('click', () => {
    const table = document.querySelector('#tableContainer table tbody');
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td contenteditable="true"></td>
      <td contenteditable="true"></td>
      <td contenteditable="true"></td>
    `;
    table.appendChild(tr);
    document.getElementById('saveWarning').style.display = 'block';
  });

  async function saveData() {
    const rows = document.querySelectorAll('#tableContainer table tbody tr');
    const newData = [];

    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      const item = {
        element: cells[0].textContent.trim(),
        description: cells[1].textContent.trim(),
        cout: parseFloat(cells[2].textContent.trim()) || 0,
      };
      newData.push(item);
    });

    // Supprimer les anciennes données (si tu veux garder, utilise UPDATE/UPSERT au lieu)
    await supabase.from('preparatifs').delete().neq('id', 0);

    const { error } = await supabase.from('preparatifs').insert(newData);

    if (error) {
      console.error('Erreur d’enregistrement :', error.message);
    } else {
      document.getElementById('saveWarning').style.display = 'none';
      alert('Données enregistrées avec succès !');
      loadData(); // Recharge les données
    }
  }

  window.onload = loadData;
