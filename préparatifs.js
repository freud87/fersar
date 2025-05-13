document.addEventListener('DOMContentLoaded', function() {
    fetch('https://gist.github.com/freud87/87a8d16dfce5286aabd4496177b7e92b')
        .then(response => response.json())
        .then(data => {
            // Le reste de votre code pour créer le tableau HTML reste le même
            const table = document.getElementById('data-table');
            let headers = Object.keys(data[0]);

            let thead = table.createTHead();
            let headerRow = thead.insertRow();
            headers.forEach(headerText => {
                let th = document.createElement('th');
                th.textContent = headerText;
                headerRow.appendChild(th);
            });

            let tbody = table.createTBody();
            data.forEach(item => {
                let row = tbody.insertRow();
                headers.forEach(header => {
                    let cell = row.insertCell();
                    cell.textContent = item[header];
                });
            });
        })
        .catch(error => {
            console.error('Erreur lors de la récupération du fichier JSON:', error);
        });
});
