document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM completamente caricato.");
    loadCoordinationCSV();
});

const githubRawURL = (repo, filePath) => `https://raw.githubusercontent.com/${repo}/main/${filePath}`;

// Georeferenziazione
function loadCoordinationCSV() {
    const repo = 'DarioSgolacchia/Verifiche2Dto6D';
    const filePath = 'FileCSV/CoordinationReport_Data.csv';
    const csvUrl = githubRawURL(repo, filePath);

    fetch(csvUrl)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not OK');
            return response.text();
        })
        .then(data => {
            const parsedData = Papa.parse(data, { header: true }).data;
            const tableHeader = document.getElementById('CoordinationHeader');
            const tableBody = document.getElementById('CoordinationBody');

            if (tableHeader && tableBody) {
                tableHeader.innerHTML = '';
                tableBody.innerHTML = '';

                // Crea la riga dell'intestazione della tabella
                const headerRow = document.createElement('tr');
                Object.keys(parsedData[0]).forEach(key => {
                    const th = document.createElement('th');
                    th.textContent = key;
                    headerRow.appendChild(th);
                });
                tableHeader.appendChild(headerRow);

                // Crea le righe dei dati della tabella
                parsedData.forEach(row => {
                    const tr = document.createElement('tr');
                    Object.values(row).forEach(cell => {
                        const td = document.createElement('td');
                        td.textContent = cell;
                        tr.appendChild(td);
                    });
                    tableBody.appendChild(tr);
                });

                // Aggiungi la riga di confronto sotto la tabella
                addComparisonRow(parsedData, tableBody);
            } else {
                console.error('CoordinationHeader o CoordinationBody non trovati nel DOM');
            }
        })
        .catch(error => console.error('Error fetching CSV file:', error));
}

function addComparisonRow(data, tableBody) {
    // Crea una nuova riga per le comparazioni
    const comparisonRow = document.createElement('tr');
    const keys = Object.keys(data[0]);

    // Contatori per il numero di checkbox selezionate (verdi) e non selezionate
    let stato1 = 0; // Checkbox selezionate (verdi)
    let stato0 = 0; // Checkbox non selezionate (rosse)

    keys.forEach((key, index) => {
        const td = document.createElement('td');

        // Se non è la prima colonna, procediamo con il controllo della checkbox
        if (index > 0) {  // Salta la prima colonna
            // Controlla se tutti i valori nella colonna sono identici
            const uniqueValues = new Set(data.map(row => row[key].trim()));
            const isUniform = uniqueValues.size === 1;

            // Crea una checkbox per mostrare il risultato della comparazione
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = isUniform;
            checkbox.disabled = true; // Disabilita la checkbox per renderla non interattiva

            // Incrementa i contatori in base allo stato della checkbox
            if (isUniform) {
                stato1++;
                td.classList.add('checked-row'); // Aggiunge una classe per stile (verde)
            } else {
                stato0++;
                td.classList.add('unchecked-row'); // Aggiunge una classe per stile (rosso)
            }

            td.appendChild(checkbox);
        } else {
            // Nella prima colonna non aggiungere il controllo della checkbox
            td.textContent = "Esito";  // Puoi scegliere di visualizzare "N/A" o lasciare vuoto
        }

        comparisonRow.appendChild(td);
    });

    // Aggiunge la riga di confronto sotto la tabella
    tableBody.appendChild(comparisonRow);

    // Chiama displayStatistics per visualizzare la percentuale di checkbox selezionate (verdi)
    const total = stato1 + stato0;
    displayStatistics(total, stato1, stato0);
}

function displayStatistics(total, stato1, stato0) {
    // Calcola la percentuale di checkbox selezionate
    const percentCorrect = ((stato1 / total) * 100).toFixed(2);
    // Mostra la frase con i risultati sotto la tabella
    const stats = `Totale elementi: ${total}<br>Verifiche corrette: ${stato1} (${percentCorrect}%)<br>Verifiche da correggere: ${stato0}`;
    document.getElementById('correctPercentage').innerHTML = stats;
}
