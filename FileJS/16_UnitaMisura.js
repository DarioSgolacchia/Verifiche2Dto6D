// Funzione per caricare il CSV da GitHub e visualizzarlo
document.addEventListener('DOMContentLoaded', () => {
    loadUnitaMisuraCSV();
});

const githubRawURL = (repo, filePath) => `https://raw.githubusercontent.com/${repo}/main/${filePath}`;
//Unità di misura
function loadUnitaMisuraCSV() {
    const repo = 'DarioSgolacchia/Verifiche2Dto6D';
    const filePath = 'FileCSV/UnitaMisura.csv';
    const csvUrl = githubRawURL(repo, filePath);

    fetch(csvUrl)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not OK');
            return response.text();
        })
        .then(data => {
            const parsedData = Papa.parse(data, { header: false }).data;
            const tableHeader = document.getElementById('UnitaMisuraHeader');
            const tableBody = document.getElementById('UnitaMisuraBody');

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