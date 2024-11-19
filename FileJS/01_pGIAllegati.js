document.addEventListener('DOMContentLoaded', () => {
    loadpGICSV();
    loadOffsetCSV();
    loadPieOffsetCSV()
    createBarChartCSV();
});

const githubRawURL = (repo, filePath) => `https://raw.githubusercontent.com/${repo}/main/${filePath}`;

// Constants and Variables
const rowsPerPage = 15; // Maximum rows per page
let currentPage = 1;
let dataOffset = []; // Array for storing the CSV data

// Load pGI Allegati CSV : pGIAllegati.csv
function loadpGICSV() {
    const repo = 'DarioSgolacchia/Verifiche2Dto6D';
    const filePath = 'FileCSV/pGIAllegati.csv';
    const csvUrl = githubRawURL(repo, filePath);

    fetch(csvUrl)
        .then(response => response.ok ? response.text() : Promise.reject('Network response was not OK'))
        .then(data => {
            const parsedData = Papa.parse(data, { header: false }).data;
            const tableHeader = document.getElementById('pGIHeader');
            const tableBody = document.getElementById('pGIBody');
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
                console.error('pGIHeader or pGIBody not found in DOM');
            }
        })
        .catch(error => console.error('Error fetching CSV file:', error));
}

// Load Offset CSV : ElementOffset_Data.csv
async function loadOffsetCSV() {
    const repo = 'DarioSgolacchia/Verifiche2Dto6D';
    const filePath = 'FileCSV/ElementOffset_Data.csv';
    const csvUrl = githubRawURL(repo, filePath);

    try {
        const response = await fetch(csvUrl);
        if (!response.ok) throw new Error('Network response was not OK');
        const data = await response.text();
        const rows = data.trim().split('\n').map(row => row.split(','));
        const tableHeader = document.getElementById('OffsetHeader');
        dataOffset = rows.slice(1); // Store data for pagination

        // Create table header
        const headerRow = document.createElement('tr');
        rows[0].forEach(headerCell => {
            const th = document.createElement('th');
            th.textContent = headerCell;
            headerRow.appendChild(th);
        });
        tableHeader.appendChild(headerRow);

        // Display initial page and set pagination
        displayPage(currentPage);
        createPaginationButtons();
    } catch (error) {
        console.error('Error loading CSV:', error);
    }
}

// Display a specific page of data
function displayPage(page, data = dataOffset) {
    const tableBody = document.getElementById('OffsetBody');
    tableBody.innerHTML = '';
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = data.slice(start, end);

    pageData.forEach(row => {
        const tr = document.createElement('tr');
        const statoCell = row[row.length - 1].trim(); // Last cell in row
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

// Create pagination buttons
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

// Search and filter table function
function searchTable() {
    const input = document.getElementById('tableSearch').value.toLowerCase();
    const filteredData = dataOffset.filter(row =>
        row.some(cell => cell.toLowerCase().includes(input))
    );

    // Display filtered results, bypassing pagination if results fit in one page
    if (filteredData.length <= rowsPerPage) {
        currentPage = 1;
        displayPage(1, filteredData);
        document.querySelector('.pagination').style.display = 'none'; // Hide pagination
    } else {
        displayPage(currentPage, filteredData);
        createPaginationButtons(filteredData); // Show pagination for filtered results
        document.querySelector('.pagination').style.display = ''; // Show pagination
    }
}

// Load and create pie chart for offset data
function loadPieOffsetCSV() {
    const repo = 'DarioSgolacchia/Verifiche2Dto6D';
    const filePath = 'FileCSV/ElementOffset_Data.csv';
    const csvUrl = githubRawURL(repo, filePath);

    fetch(csvUrl)
        .then(response => response.ok ? response.text() : Promise.reject('Network response was not OK'))
        .then(data => {
            const parsedData = Papa.parse(data, { header: true }).data;
            createPieChart(parsedData);
        })
        .catch(error => console.error('Error fetching CSV file:', error));
}

// Create pie chart for the "Stato" column data
function createPieChart(data) {
    const labels = ['Verifiche Corrette', 'Verifiche Incorrette'];
    const values = [0, 0];

    data.forEach(row => {
        if (row.Stato && row.Stato.trim() === '1') values[0]++;
        else if (row.Stato && row.Stato.trim() === '0') values[1]++;
    });

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
    displayStatistics(values[0] + values[1], values[0], values[1]);
}

// Funzione per caricare i dati del CSV e creare l'istogramma per la colonna "Stato"
function createBarChartCSV() {
    const repo = 'DarioSgolacchia/Verifiche2Dto6D';
    const filePath = 'FileCSV/ElementOffset_Data.csv';
    const csvUrl = githubRawURL(repo, filePath);

    fetch(csvUrl)
        .then(response => response.ok ? response.text() : Promise.reject('Errore nel caricamento del CSV'))
        .then(data => {
            const parsedData = Papa.parse(data, { header: true }).data;

            // Raggruppa i dati per categoria e stato
            const categories = {};
            parsedData.forEach(row => {
                const category = row.Categoria || 'Altro';
                const stato = row.Stato && row.Stato.trim() === '1' ? 'checked' : 'unchecked';

                if (!categories[category]) {
                    categories[category] = { checked: 0, unchecked: 0 };
                }
                categories[category][stato]++;
            });

            // Prepara i dati per Chart.js
            const labels = Object.keys(categories);
            const checkedData = labels.map(label => categories[label].checked);
            const uncheckedData = labels.map(label => categories[label].unchecked);

            // Crea il grafico a barre
            const ctx = document.getElementById('pGIBarChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Checkati (Verdi)',
                            data: checkedData,
                            backgroundColor: '#28a745',
                        },
                        {
                            label: 'Non Checkati (Rossi)',
                            data: uncheckedData,
                            backgroundColor: '#dc3545',
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Istogramma'
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Categoria'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Numero di Elementi'
                            },
                            beginAtZero: true
                        }
                    }
                }
            });
        })
        .catch(error => console.error('Errore:', error));
}

// Carica il grafico all'avvio
document.addEventListener('DOMContentLoaded', createBarChart);