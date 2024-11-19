document.addEventListener('DOMContentLoaded', () => {
    if (typeof createBarChart === 'function') {
        createBarChart(); // Richiama la funzione per creare il grafico a barre
    } else {
        console.error('createBarChart non è definita.');
    }

    loadpGICSV();
    loadOffsetCSV();
    loadPieOffsetCSV();
});

// Corregge il riferimento al canvas per l'istogramma
function createBarChart() {
    const repo = 'DarioSgolacchia/Verifiche2Dto6D';
    const filePath = 'FileCSV/ElementOffset_Data.csv';
    const csvUrl = githubRawURL(repo, filePath);

    fetch(csvUrl)
        .then(response => response.ok ? response.text() : Promise.reject('Risposta di rete non OK'))
        .then(data => {
            const parsedData = Papa.parse(data, { header: true }).data;
            const labels = ['Verificato', 'Non Verificato'];
            const counts = [0, 0];

            parsedData.forEach(row => {
                if (row.Stato === '1') counts[0]++;
                else if (row.Stato === '0') counts[1]++;
            });

            const ctx = document.getElementById('pGIBarChart').getContext('2d'); // ID corretto
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

// Funzione per caricare il CSV di pGI
function loadpGICSV() {
    const repo = 'DarioSgolacchia/Verifiche2Dto6D';
    const filePath = 'FileCSV/pGI_Data.csv';
    const csvUrl = githubRawURL(repo, filePath);

    Papa.parse(csvUrl, {
        download: true,
        header: true,
        complete: (results) => {
            populatepGITable(results.data);
        },
        error: (error) => {
            console.error('Errore nel caricamento del CSV di pGI:', error);
        }
    });
}

// Funzione per caricare il CSV degli Offset
function loadOffsetCSV() {
    const repo = 'DarioSgolacchia/Verifiche2Dto6D';
    const filePath = 'FileCSV/ElementOffset_Data.csv';
    const csvUrl = githubRawURL(repo, filePath);

    Papa.parse(csvUrl, {
        download: true,
        header: true,
        complete: (results) => {
            populateOffsetTable(results.data);
        },
        error: (error) => {
            console.error('Errore nel caricamento del CSV degli Offset:', error);
        }
    });
}

// Funzione per caricare i dati del grafico a torta e le statistiche
function loadPieOffsetCSV() {
    const repo = 'DarioSgolacchia/Verifiche2Dto6D';
    const filePath = 'FileCSV/ElementOffset_Data.csv';
    const csvUrl = githubRawURL(repo, filePath);

    Papa.parse(csvUrl, {
        download: true,
        header: true,
        complete: (results) => {
            const data = results.data;
            const total = data.length;
            const verified = data.filter(row => row.Stato === '1').length;
            const unverified = data.filter(row => row.Stato === '0').length;

            createPieChart(verified, unverified);
            displayStatistics(total, verified, unverified);
        },
        error: (error) => {
            console.error('Errore nel caricamento del CSV per il grafico a torta:', error);
        }
    });
}

// Funzione per creare il grafico a torta
function createPieChart(verified, unverified) {
    const ctx = document.getElementById('OffsetGraficoATorta').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Verificato', 'Non Verificato'],
            datasets: [{
                data: [verified, unverified],
                backgroundColor: ['#28a745', '#FF6384'],
            }]
        }
    });
}

// Funzione per visualizzare le statistiche
function displayStatistics(total, verified, unverified) {
    console.log("Statistiche:", { total, verified, unverified });
    const statsContainer = document.getElementById('statistics');
    if (!statsContainer) {
        console.warn('Elemento #statistics non trovato nel DOM.');
        return;
    }

    const verifiedPercentage = ((verified / total) * 100).toFixed(2);
    const unverifiedPercentage = ((unverified / total) * 100).toFixed(2);

    statsContainer.innerHTML = `
        <p><strong>Totale:</strong> ${total}</p>
        <p><strong>Verificato:</strong> ${verified} (${verifiedPercentage}%)</p>
        <p><strong>Non Verificato:</strong> ${unverified} (${unverifiedPercentage}%)</p>
    `;
}

// Funzione per popolare la tabella pGI
function populatepGITable(data) {
    const header = document.getElementById('pGIHeader');
    const body = document.getElementById('pGIBody');

    if (!header || !body) {
        console.error('Elementi della tabella pGI non trovati.');
        return;
    }

    header.innerHTML = '<tr>' + Object.keys(data[0]).map(col => `<th>${col}</th>`).join('') + '</tr>';
    body.innerHTML = data.map(row => `<tr>${Object.values(row).map(val => `<td>${val}</td>`).join('')}</tr>`).join('');
}

// Funzione per popolare la tabella Offset
function populateOffsetTable(data) {
    const header = document.getElementById('OffsetHeader');
    const body = document.getElementById('OffsetBody');

    if (!header || !body) {
        console.error('Elementi della tabella Offset non trovati.');
        return;
    }

    header.innerHTML = '<tr>' + Object.keys(data[0]).map(col => `<th>${col}</th>`).join('') + '</tr>';
    body.innerHTML = data.map(row => `<tr>${Object.values(row).map(val => `<td>${val}</td>`).join('')}</tr>`).join('');
}

// Funzione per ottenere l'URL raw di GitHub
function githubRawURL(repo, filePath) {
    return `https://raw.githubusercontent.com/${repo}/master/${filePath}`;
}