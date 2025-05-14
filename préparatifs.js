
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbxqcIzurBYiE8oggJ2NF-z35zLHEHl9WuAWRpnbyuoKOoBUzW51LDh4rkCR8X1bBTS5/exec';

async function fetchData() {
  const res = await fetch(SHEET_URL);
  const data = await res.json();
  populateTable(data);
}

function populateTable(data) {
  const container = document.getElementById('tableContainer');
  const table = document.createElement('table');
  table.classList.add('data-table');

  data.forEach((row, i) => {
    const tr = document.createElement('tr');
    row.forEach(cell => {
      const td = document.createElement(i === 0 ? 'th' : 'td');
      td.contentEditable = i !== 0; // headers non éditables
      td.textContent = cell;
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });

  container.innerHTML = ''; // reset
  container.appendChild(table);
}

async function saveData() {
  const table = document.querySelector('#tableContainer table');
  const data = Array.from(table.rows).map(row =>
    Array.from(row.cells).map(cell => cell.textContent)
  );

  const res = await fetch(SHEET_URL, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  });

  if (res.ok) alert('Données enregistrées avec succès.');
  else alert('Erreur lors de l’enregistrement.');
}

document.getElementById('saveBtn').addEventListener('click', saveData);
window.addEventListener('load', fetchData);

document.getElementById('addRowBtn').addEventListener('click', () => {
  const table = document.querySelector('#tableContainer table');
  if (!table) return;

  const newRow = table.insertRow();
  const cols = table.rows[0].cells.length;
  for (let i = 0; i < cols; i++) {
    const cell = newRow.insertCell();
    cell.contentEditable = true;
    cell.textContent = '';
  }

  document.getElementById('saveWarning').style.display = 'block';
});
