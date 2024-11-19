document.addEventListener('DOMContentLoaded', () => {
    loadpGICSV();          // Carica i dati CSV per pGI Allegati
    loadOffsetCSV();       // Carica i dati CSV per Offset
    loadPieOffsetCSV();    // Carica i dati CSV per il grafico a torta
    createBarChart();      // Crea l'istogramma
});

// Funzione per ottenere l'URL raw del file CSV da GitHub
const githubRawURL = (repo, filePath) => `https://raw.githubusercontent.com/${repo}/main/${filePath}`;

// Costanti e variabili
const rowsPerPage = 15; // Numero massimo di righe per pagina
let currentPage = 1;
let dataOffset = []; // Array per memorizzare i dati CSV caricati per Offset

// Funzione per caricare i dati CSV di pGI Allegati
function loadpGICSV() {
    const repo = 'DarioSgolacchia/Verifiche2Dto6D';
    const filePath = 'FileCSV/pGIAllegati.csv';
    const csvUrl = githubRawURL(repo, filePath);

    fetch(csvUrl)
        .then(response => response.ok ? response.text() : Promise.reject('Risposta di rete non OK'))
        .then(data => {
            const parsedData = Papa.parse(data, { header: false }).data;
            const tableHeader = document.getElementById('pGIHeader');
            const tableBody = document.getElementById('pGIBody');
            
            if (tableHeader && tableBody) {
                tableHeader.innerHTML = '';  // Pulisce l'intestazione della tabella
                tableBody.innerHTML = '';    // Pulisce il corpo della tabella
                
                // Aggiungi l'intestazione alla tabella
                parsedData[0].forEach(cell => {
                    const th = document.createElement('th');
                    th.textContent = cell;
                    tableHeader.appendChild(th);
                });

                // Aggiungi le righe dei dati alla tabella
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
                console.error('pGIHeader o pGIBody non trovato nel DOM');
            }
        })
        .catch(error => console.error('Errore nel caricamento del CSV:', error));
}

// Funzione per caricare i dati CSV di Offset
async function loadOffsetCSV() {
    const repo = 'DarioSgolacchia/Verifiche2Dto6D';
    const filePath = 'FileCSV/ElementOffset_Data.csv';
    const csvUrl = githubRawURL(repo, filePath);

    try {
        const response = await fetch(csvUrl);
        if (!response.ok) throw new Error('Risposta di rete non OK');
        const data = await response.text();
        const rows = data.trim().split('\n').map(row => row.split(','));
        const tableHeader = document.getElementById('OffsetHeader');
        dataOffset = rows.slice(1); // Memorizza i dati per la paginazione

        // Crea l'intestazione della tabella
        const headerRow = document.createElement('tr');
        rows[0].forEach(headerCell => {
            const th = document.createElement('th');
            th.textContent = headerCell;
            headerRow.appendChild(th);
        });
        tableHeader.appendChild(headerRow);

        // Visualizza la prima pagina e crea i pulsanti di paginazione
        displayPage(currentPage);
        createPaginationButtons();
    } catch (error) {
        console.error('Errore nel caricamento del CSV:', error);
    }
}

// Funzione per visualizzare una pagina specifica di dati
function displayPage(page, data = dataOffset) {
    const tableBody = document.getElementById('OffsetBody');
    tableBody.innerHTML = '';
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = data.slice(start, end);

    pageData.forEach(row => {
        const tr = document.createElement('tr');
        const statoCell = row[row.length - 1].trim(); // L'ultimo elemento della riga rappresenta lo stato
        tr.classList.add(statoCell === '1' ? 'checked-row' : 'unchecked-row');
        row.forEach((cell, index) => {
            const td = document.createElement('td');
            if (index === row.length - 1) {
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
}

// Funzione per creare i pulsanti di paginazione
function createPaginationButtons(data = dataOffset) {
    const tableContainer = document.querySelector('.Due');
    let paginationContainer = document.querySelector('.pagination');
    if (paginationContainer) paginationContainer.remove();

    paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination';

    const totalPages = Math.ceil(data.length / rowsPerPage);
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.addEventListener('click', () => {
            currentPage = i;
            displayPage(currentPage, data);
        });
        paginationContainer.appendChild(button);
    }
    tableContainer.appendChild(paginationContainer);
}

// Funzione di ricerca e filtraggio della tabella
function searchTable() {
    const input = document.getElementById('tableSearch').value.toLowerCase();
    const filteredData = dataOffset.filter(row =>
        row.some(cell => cell.toLowerCase().includes(input))
    );

    // Visualizza i risultati filtrati senza paginazione se si adattano a una sola pagina
    if (filteredData.length <= rowsPerPage) {
        currentPage = 1;
        displayPage(1, filteredData);
        document.querySelector('.pagination').style.display = 'none'; // Nasconde la paginazione
    } else {
        displayPage(currentPage, filteredData);
        createPaginationButtons(filteredData); // Mostra la paginazione per i risultati filtrati
        document.querySelector('.pagination').style.display = ''; // Mostra la paginazione
    }
}

// Funzione per caricare i dati del CSV e creare il grafico a torta
function loadPieOffsetCSV() {
    const repo = 'DarioSgolacchia/Verifiche2Dto6D';
    const filePath = 'FileCSV/ElementOffset_Data.csv';
    const csvUrl = githubRawURL(repo, filePath);

    fetch(csvUrl)
        .then(response => response.ok ? response.text() : Promise.reject('Risposta di rete non OK'))
        .then(data => {
            const parsedData = Papa.parse(data, { header: true }).data;
            createPieChart(parsedData);
        })
        .catch(error => console.error('Errore nel caricamento del CSV:', error));
}

// Funzione per creare il grafico a torta
function createPieChart(data) {
    const labels = ['Verifiche Corrette', 'Verifiche Incorrette'];
    const values = [0, 0];

    data.forEach(row => {
        if (row.Stato && row.Stato.trim() === '1') values[0]++;
        else if (row.Stato && row.Stato.trim() === '0') values[1]++;
    });

    // Crea il grafico a torta
    const ctx = document.getElementById('OffsetGraficoATorta').getContext('2d');
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

    // Mostra le statistiche sotto il grafico a torta
    displayStatistics(values[0] + values[1], values[0], values[1]);
}

// Funzione per mostrare le statistiche (totale, verificato, non verificato)
function displayStatistics(total, verified, unverified) {
    const verifiedPercentage = ((verified / total) * 100).toFixed(2);
    const unverifiedPercentage = ((unverified / total) * 100).toFixed(2);

    const statsContainer = document.getElementById('statistics');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <p><strong>Totale:</strong> ${total}</p>
            <p><strong>Verificato:</strong> ${verified} (${verifiedPercentage}%)</p>
            <p><strong>Non Verificato:</strong> ${unverified} (${unverifiedPercentage}%)</p>
        `;
    } else {
        console.warn('Container per le statistiche non trovato');
    }
}

// Funzione per caricare i dati e creare l'istogramma
function createBarChart() {
    const repo = 'DarioSgolacchia/Verifiche2Dto6D';
    const filePath = 'FileCSV/ElementOffset_Data.csv';
    const csvUrl = githubRawURL(repo, filePath);

    fetch(csvUrl)
        .then(response => response.ok ? response.text() : Promise.reject('Risposta di rete non OK'))
        .then(data => {
            const parsedData = Papa.parse(data, { header: true }).data;
            // Dati per il grafico a barre
            const labels = ['Verificato', 'Non Verificato'];
            const counts = [0, 0];

            parsedData.forEach(row => {
                if (row.Stato === '1') counts[0]++;
                else if (row.Stato === '0') counts[1]++;
            });

            const ctx = document.getElementById('OffsetGraficoBarre').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Verifiche Stato',
                        data: counts,
                        backgroundColor: ['#28a745', '#FF6384'],
                    }]
                }
            });
        })
        .catch(error => console.error('Errore nel caricamento del CSV:', error));
}