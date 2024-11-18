document.addEventListener('DOMContentLoaded', () => {
    loadDatiCSV();
    loadPieCSV();
    loadLineeGuidaCSV();
    loadClusterCSV();
    loadCSV();
});

const githubRawURL = (repo, filePath) => `https://raw.githubusercontent.com/${repo}/main/${filePath}`;

function loadDatiCSV() {
    const repo = 'DarioSgolacchia/Verifiche2Dto6D';
    const filePath = 'FileCSV/Dati.csv';
    const csvUrl = githubRawURL(repo, filePath);

    fetch(csvUrl)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not OK');
            return response.text();
        })
        .then(data => {
            const parsedData = Papa.parse(data, { header: true }).data;
            const tableHeader = document.getElementById('DatiHeader');
            const tableBody = document.getElementById('DatiBody');

            if (tableHeader && tableBody) {
                tableHeader.innerHTML = '';
                tableBody.innerHTML = '';

                const headerRow = document.createElement('tr');
                Object.keys(parsedData[0]).forEach(key => {
                    const th = document.createElement('th');
                    th.textContent = key;
                    headerRow.appendChild(th);
                });
                tableHeader.appendChild(headerRow);

                parsedData.forEach(row => {
                    const tr = document.createElement('tr');
                    Object.values(row).forEach(cell => {
                        const td = document.createElement('td');
                        td.textContent = cell;
                        tr.appendChild(td);
                    });
                    tableBody.appendChild(tr);
                });
            } else {
                console.error('DatiHeader o DatiBody non trovati nel DOM');
            }
        })
        .catch(error => console.error('Error fetching CSV file:', error));
}

function loadPieCSV() {
    const repo = 'DarioSgolacchia/Verifiche2Dto6D';
    const filePath = 'FileCSV/CSVExport.csv';
    const csvUrl = githubRawURL(repo, filePath);

    fetch(csvUrl)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not OK');
            return response.text();
        })
        .then(data => {
            const parsedData = Papa.parse(data, { header: true }).data;
            createPieChart(parsedData);
        })
        .catch(error => console.error('Error fetching CSV file:', error));
}

function createPieChart(data) {
    const labels = ['Verifiche Corrette', 'Verifiche Incorrette'];
    const values = [0, 0];

    data.forEach(row => {
        if (row.Stato && row.Stato.trim() === '1') {
            values[0]++;
        } else if (row.Stato && row.Stato.trim() === '0') {
            values[1]++;
        }
    });

    const ctx = document.getElementById('GraficoATorta').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Distribuzione Stato',
                data: values,
                backgroundColor: ['#d4edda', '#FF6384'],
            }]
        }
    });
    displayStatistics(values[0] + values[1], values[0], values[1]);
}

function displayStatistics(total, stato1, stato0) {
    const percentCorrect = ((stato1 / total) * 100).toFixed(2); // Calcola la percentuale
    const stats = `Totale elementi: ${total}<br>Verifiche corrette: ${stato1} (${percentCorrect}%)<br>Verifiche da correggere: ${stato0}`;
    document.getElementById('statistics').innerHTML = stats;
}

function loadLineeGuidaCSV() {
    const repo = 'DarioSgolacchia/Verifiche2Dto6D';
    const filePath = 'FileCSV/LineeGuida.csv';
    const csvUrl = githubRawURL(repo, filePath);

    fetch(csvUrl)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not OK');
            return response.text();
        })
        .then(data => {
            const parsedData = Papa.parse(data, { header: false }).data;
            const tableHeader = document.getElementById('LineeGuidaHeader');
            const tableBody = document.getElementById('LineeGuidaBody');

            if (tableHeader && tableBody) {
                tableHeader.innerHTML = '';
                tableBody.innerHTML = '';

                parsedData[0].forEach(cell => {
                    const th = document.createElement('th');
                    th.textContent = cell;
                    tableHeader.appendChild(th);
                });

                parsedData.slice(1).forEach(row => {
                    if (row.some(cell => cell.trim() !== '')) { // Controllo per escludere le righe vuote
                        const tr = document.createElement('tr');
                        row.forEach(cell => {
                            const td = document.createElement('td');
                            td.textContent = cell;
                            tr.appendChild(td);
                        });
                        tableBody.appendChild(tr);
                    }
                });
            } else {
                console.error('LineeGuidaHeader o LineeGuidaBody non trovati nel DOM');
            }
        })
        .catch(error => console.error('Error fetching CSV file:', error));
}

function loadClusterCSV() {
    const repo = 'DarioSgolacchia/Verifiche2Dto6D';
    const filePath = 'FileCSV/Cluster.csv';
    const csvUrl = githubRawURL(repo, filePath);

    fetch(csvUrl)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not OK');
            return response.text();
        })
        .then(data => {
            const parsedData = Papa.parse(data, { header: false }).data;
            const tableHeader = document.getElementById('ClusterHeader');
            const tableBody = document.getElementById('ClusterBody');

            if (tableHeader && tableBody) {
                tableHeader.innerHTML = '';
                tableBody.innerHTML = '';

                parsedData[0].forEach(cell => {
                    const th = document.createElement('th');
                    th.textContent = cell;
                    tableHeader.appendChild(th);
                });

                parsedData.slice(1).forEach(row => {
                    const tr = document.createElement('tr');
                    row.forEach(cell => {
                        const td = document.createElement('td');
                        td.textContent = cell;
                        tr.appendChild(td);
                    });
                    tableBody.appendChild(tr);
                });
            } else {
                console.error('LineeGuidaHeader o LineeGuidaBody non trovati nel DOM');
            }
        })
        .catch(error => console.error('Error fetching CSV file:', error));
}

// Funzione per caricare il CSV da GitHub e visualizzarlo
async function loadCSV() {
    const repo = 'DarioSgolacchia/Verifiche2Dto6D';
    const filePath = 'FileCSV/CSVExport.csv';
    const csvUrl = githubRawURL(repo, filePath);

    try {
        // Carica il file CSV da GitHub
        const response = await fetch(csvUrl);
        if (!response.ok) throw new Error('Network response was not OK');
        const data = await response.text();

        // Parsa i dati CSV
        const rows = data.trim().split('\n').map(row => row.split(','));

        const tableHeader = document.getElementById('VerificheHeader');
        const tableBody = document.getElementById('VerificheBody');

        // Aggiungi l'intestazione della tabella
        const headerRow = document.createElement('tr');
        rows[0].forEach(headerCell => {
            const th = document.createElement('th');
            th.textContent = headerCell;
            headerRow.appendChild(th);
        });
        tableHeader.appendChild(headerRow);

        // Aggiungi i dati delle righe
        rows.slice(1).forEach(row => {
            const tr = document.createElement('tr');

            // Aggiungi una classe alla riga in base allo stato
            const statoCell = row[row.length - 1].trim(); // Ultima cella della riga (colonna "Stato")
            tr.classList.add(statoCell === '1' ? 'checked-row' : 'unchecked-row');

            row.forEach((cell, index) => {
                const td = document.createElement('td');

                // Gestisci la colonna "Stato" con una checkbox
                if (index === row.length - 1) {  // Se è la colonna "Stato"
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.disabled = true;
                    checkbox.checked = statoCell === '1';
                    td.appendChild(checkbox);
                } else {
                    td.textContent = cell;
                }
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        });
    } catch (error) {
        console.error('Errore durante il caricamento del CSV:', error);
    }
}