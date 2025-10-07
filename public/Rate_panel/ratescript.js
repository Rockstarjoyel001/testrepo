// Function to display the stored branch name
function displayBranchName() {
    const branchName = localStorage.getItem('branchName');
    if (branchName) {
        document.getElementById('branchName').textContent = branchName;
        getRates(branchName);  // Fetch rates based on the stored branch name
    } else {
        document.getElementById('branchName').textContent = 'No branch selected';
    }
}





// function getRates(branchName) {
//     fetch(`http://localhost:5000/api/rates?branchName=${branchName}`)
//         .then(response => response.json())
//         .then(data => {
//             if (data.length === 0) {
//                 document.getElementById('ratesTable').innerHTML = 'No rates available for this branch.';
//                 return;
//             }

//             // Sort data based on Rank in ascending order
//             data.sort((a, b) => (a.Rank || 9999) - (b.Rank || 9999));

//             let tableHTML = `
//             <table border="1" id="ratesTableEditable">
//                 <thead>
//                     <tr>
//                         <th>Country Code</th>
//                           <th>Currency Code</th>
//                         <th>Currency Name</th>
//                         <th>Buy Rate</th>
//                         <th>Sell Rate</th>
//                         <th>TTRemittance Rate</th>
//                         <th>Rank</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//             `;

//             data.forEach(rate => {
//                 tableHTML += `
//                     <tr data-country-id="${rate.CountryID}" data-rank="${rate.Rank}">
//                         <td>${rate.CountryCode}</td>
//                           <td>${rate.CurrencyCode}</td>
//                         <td>${rate.CountryName}</td>
//                         <td contenteditable="true" class="buyRate">${parseFloat(rate.BuyRate)}</td>
//                         <td contenteditable="true" class="sellRate">${parseFloat(rate.SellRate)}</td>
//                         <td contenteditable="true" class="ttRemittanceRate">${parseFloat(rate.TTRemittanceRate)}</td>
//                         <td contenteditable="true" class="rank">${rate.Rank || 'N/A'}</td>
//                     </tr>
//                 `;
//             });

//             tableHTML += '</tbody></table><br>';
//             tableHTML += '<button id="saveButton" >Save</button>';
//             document.getElementById('ratesTable').innerHTML = tableHTML;

//             // Attach event listener to detect rank changes
//             document.querySelectorAll(".rank").forEach(cell => {
//                 cell.addEventListener("blur", function () {
//                     updateRanks(this);
//                 });
//             });

//             // Attach event listeners for validation on the contenteditable fields
//             document.querySelectorAll('.buyRate, .sellRate, .ttRemittanceRate').forEach(input => {
//                 input.addEventListener('input', function () {
//                     validateInput(this);
//                 });
//             });

//             document.getElementById("saveButton").addEventListener("click", function() {
//                 saveChanges();
//                 const now = new Date();
//                 const formattedDateTime = formatDateTime(now);
//                 console.log("Saved at:", formattedDateTime);
//                 localStorage.setItem("lastSavedTime", formattedDateTime);
//             });
//         })
//         .catch(error => {
//             console.error('Error fetching rates:', error);
//             document.getElementById('ratesTable').innerHTML = 'Error fetching data.';
//         });
// }





function getRates(branchName) {
    fetch(`http://localhost:5000/api/rates?branchName=${branchName}`)
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                console.warn('No data received from API. Using dummy data.');
                data = getDummyData();
            }
            renderRatesTable(data);
        })
        .catch(error => {
            console.error('Error fetching rates:', error);
            const dummyData = getDummyData();
            renderRatesTable(dummyData);
        });
}

function getDummyData() {
    return [
        {
            CountryID: 1,
            CountryCode: 'IN',
            CurrencyCode: 'INR',
            CountryName: 'INDIAN RUPPEE',
            BuyRate: 0.00,
            SellRate: 0.00,
            TTRemittanceRate: 0.00,
            Rank: 2
        },
        {
            CountryID: 2,
            CountryCode: 'AE',
            CurrencyCode: 'AED',
            CountryName: 'UAE DIRHAM',
            BuyRate: 1.23,
            SellRate: 1.45,
            TTRemittanceRate: 1.34,
            Rank: 1
        }
    ];
}

function renderRatesTable(data) {
    data.sort((a, b) => (a.Rank || 9999) - (b.Rank || 9999));

    let tableHTML = `
        <table border="1" id="ratesTableEditable">
            <thead>
                <tr>
                    <th>Country Code</th>
                    <th>Currency Code</th>
                    <th>Currency Name</th>
                    <th>Buy Rate</th>
                    <th>Sell Rate</th>
                    <th>TTRemittance Rate</th>
                    <th>Rank</th>
                </tr>
            </thead>
            <tbody>
    `;

    data.forEach(rate => {
        tableHTML += `
            <tr data-country-id="${rate.CountryID}" data-rank="${rate.Rank}">
                <td>${rate.CountryCode}</td>
                <td>${rate.CurrencyCode}</td>
                <td>${rate.CountryName}</td>
                <td contenteditable="true" class="buyRate">${parseFloat(rate.BuyRate)}</td>
                <td contenteditable="true" class="sellRate">${parseFloat(rate.SellRate)}</td>
                <td contenteditable="true" class="ttRemittanceRate">${parseFloat(rate.TTRemittanceRate)}</td>
                <td contenteditable="true" class="rank">${rate.Rank || 'N/A'}</td>
            </tr>
        `;
    });

    tableHTML += '</tbody></table><br>';
tableHTML += `
  <button 
    onclick="document.getElementById('csvFileInput').click()" 
    style="font-family: 'Saira', sans-serif; margin-right: 10px; background-color: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 5px;">
    Upload
  </button>
  <input type="file" id="csvFileInput" accept=".csv" style="display:none" onchange="readCSV(event)">
`;

tableHTML += `
  <button 
    id="saveButton" 
    style="font-family: 'Saira', sans-serif; margin-right: 10px; background-color: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 5px;">
    Save
  </button>
`;

tableHTML += `
  <button 
    onclick="downloadCSV()" 
    style="font-family: 'Saira', sans-serif; margin-right: 10px; background-color: #ffc107; color: black; border: none; padding: 8px 16px; border-radius: 5px;">
    Download
  </button>
`;


    document.getElementById('ratesTable').innerHTML = tableHTML;

    document.querySelectorAll(".rank").forEach(cell => {
        cell.addEventListener("blur", function () {
            updateRanks(this);
        });
    });

    document.querySelectorAll('.buyRate, .sellRate, .ttRemittanceRate').forEach(input => {
        input.addEventListener('input', function () {
            validateInput(this);
        });
    });

    document.getElementById("saveButton").addEventListener("click", function() {
        saveChanges();
        const now = new Date();
        const formattedDateTime = formatDateTime(now);
        console.log("Saved at:", formattedDateTime);
        localStorage.setItem("lastSavedTime", formattedDateTime);
    });
}





// Validation to prevent more than one zero before decimal point
function validateInput(input) {
    const value = input.textContent;

    // Allow multiple zeros after decimal, but restrict leading zeros
    if (/^0[^\d.]/.test(value) || /^00/.test(value)) {
        // alert('Leading zeros are not allowed before the decimal point.');
        input.textContent = value.replace(/^0+/, ''); // Remove leading zeros
    }
}






function validateInput(input) {
    let value = input.textContent.trim();

    // Remove any letters and invalid characters (only digits and dot allowed)
    value = value.replace(/[^0-9.]/g, '');

    // If more than one dot exists, keep only the first
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('').slice(0, 5);
    }

    // Ensure only one leading zero before decimal
    if (parts[0].length > 1 && parts[0].startsWith('0')) {
        parts[0] = '0';
    }

    // Limit to 5 digits after decimal
    if (parts.length === 2) {
        parts[1] = parts[1].slice(0, 5);
        value = parts[0] + '.' + parts[1];
    } else {
        value = parts[0]; // integer only, no dot
    }

    // If value becomes empty or just a dot, reset it
    if (value === '' || value === '.') {
        value = '0.00000';
    }

    input.textContent = value;
}



// Function to update ranks (example placeholder function)
function updateRanks(cell) {
    // Implement your logic to update the ranks here
}

// Function to save changes (example placeholder function)
function saveChanges() {
    // Implement your save logic here
}

// Function to format the date/time (example placeholder function)
function formatDateTime(date) {
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}















function updateRanks(cell) {
    let newRank = parseInt(cell.innerText.trim());
    if (isNaN(newRank) || newRank <= 0) {
        console.log("Invalid rank! Please enter a positive number.");
        return;
    }

    let row = cell.closest("tr");
    let currentRank = parseInt(row.getAttribute("data-rank"));
    let allRows = [...document.querySelectorAll("tr[data-country-id]")];

    if (newRank === currentRank) return; // No change

    // Find the row that currently has the new rank
    let conflictingRow = allRows.find(tr => parseInt(tr.getAttribute("data-rank")) === newRank);

    if (conflictingRow) {
        // Swap their ranks
        conflictingRow.querySelector(".rank").innerText = currentRank;
        conflictingRow.setAttribute("data-rank", currentRank);
    }

    // Update the new rank in the current row
    row.setAttribute("data-rank", newRank);
    cell.innerText = newRank;

    // Re-sort the table based on updated ranks
    sortTable();
}

function sortTable() {
    let tbody = document.querySelector("#ratesTableEditable tbody");
    let rows = [...tbody.querySelectorAll("tr")];

    rows.sort((a, b) => parseInt(a.getAttribute("data-rank")) - parseInt(b.getAttribute("data-rank")));

    // Re-attach rows in correct order
    tbody.innerHTML = "";
    rows.forEach(row => tbody.appendChild(row));
}

function isValidRate(value) {
    value = value.trim();

    // Reject if it contains letters
    if (/[a-zA-Z]/.test(value)) return false;

    // Reject if it has multiple leading zeros before the decimal
    if (/^0{2,}/.test(value) || /^0[0-9]+/.test(value)) return false;

    // Allow: 0.12345 or 123.456 or 1
    return /^(\d+(\.\d{0,5})?)$/.test(value);
}
function readCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const text = e.target.result;
        const rows = text.trim().split('\n').map(row => row.split(','));

        if (rows.length < 2) {
            showToast("CSV does not contain valid data.");
            event.target.value = '';
            return;
        }

        const headers = rows[0].map(h => h.trim());
        const dataRows = rows.slice(1);

        const currencyCodeIndex = headers.findIndex(h => h.toLowerCase() === 'currency code');
        const buyRateIndex = headers.findIndex(h => h.toLowerCase() === 'buy rate');
        const sellRateIndex = headers.findIndex(h => h.toLowerCase() === 'sell rate');
        const ttRateIndex = headers.findIndex(h => h.toLowerCase() === 'ttremittance rate');
        const rankIndex = headers.findIndex(h => h.toLowerCase() === 'rank');

        if (currencyCodeIndex === -1) {
            showToast("Currency Code column is missing in CSV.");
            event.target.value = '';
            return;
        }

        const isInvalidRate = (value) => {
            const trimmed = value.trim();
            if (/[a-zA-Z]/.test(trimmed)) return true; // contains English letters
            if (/[^0-9.]/.test(trimmed)) return true;   // contains symbols
            if (/^0{2,}/.test(trimmed)) return true;    // multiple zeros before decimal
            if (!/^\d+(\.\d+)?$/.test(trimmed)) return true; // invalid number format
            return false;
        };

        for (let i = 0; i < dataRows.length; i++) {
            const row = dataRows[i];
            const currencyCode = row[currencyCodeIndex]?.trim();
            const buyRate = row[buyRateIndex]?.trim() || '0.00000';
            const sellRate = row[sellRateIndex]?.trim() || '0.00000';
            const ttRate = row[ttRateIndex]?.trim() || '0.00000';

            if (isInvalidRate(buyRate) || isInvalidRate(sellRate) || isInvalidRate(ttRate)) {
                showToast(`Invalid rate format.Upload aborted.`);
                event.target.value = '';
                return;
            }
        }

        dataRows.forEach(row => {
            const currencyCode = row[currencyCodeIndex]?.trim();
            if (!currencyCode) return;

            const tableRow = [...document.querySelectorAll('#ratesTableEditable tbody tr')].find(tr =>
                tr.cells[1].textContent.trim().toUpperCase() === currencyCode.toUpperCase()
            );

            if (tableRow) {
                if (buyRateIndex !== -1) tableRow.querySelector('.buyRate').textContent = row[buyRateIndex]?.trim() || '0.00000';
                if (sellRateIndex !== -1) tableRow.querySelector('.sellRate').textContent = row[sellRateIndex]?.trim() || '0.00000';
                if (ttRateIndex !== -1) tableRow.querySelector('.ttRemittanceRate').textContent = row[ttRateIndex]?.trim() || '0.00000';
                if (rankIndex !== -1) tableRow.querySelector('.rank').textContent = row[rankIndex]?.trim() || '';
            }
        });

        showToast("Rates updated from CSV successfully.");
        event.target.value = ''; // allow re-uploading the same file again
    };

    reader.readAsText(file);
}

function saveChanges() {
    const branchName = localStorage.getItem('branchName');
    let updatedBy = localStorage.getItem('username') || 'laos'; // Use actual username
    const updatedOn = new Date().toISOString();
    const rows = document.querySelectorAll('#ratesTableEditable tbody tr');
    let rankSet = new Set();
    let alertMessage = '';
    const changes = [];

    console.log("Fetching previous rates for:", branchName);

    // Fetch previous values from backend instead of localStorage
    fetch(`http://localhost:5000/api/rates?branchName=${branchName}`)
        .then(response => response.json())
        .then(previousRates => {
            console.log("Fetched previous rates:", previousRates);

            if (!Array.isArray(previousRates) || previousRates.length === 0) {
                console.warn("No previous rates found, defaulting to empty.");
                return;
            }

            const previousRatesMap = new Map();
            previousRates.forEach(rate => {
                previousRatesMap.set(String(rate.CountryID), {
                    BuyRate: parseFloat(rate.BuyRate) || 0,
                    SellRate: parseFloat(rate.SellRate) || 0,
                    TTRemittanceRate: parseFloat(rate.TTRemittanceRate) || 0,
                    Rank: parseInt(rate.Rank) || 0
                });
            });

            const updatedRates = [];
            rows.forEach(row => {
                const countryID = String(row.dataset.countryId);
                let buyRate = parseFloat(row.querySelector('.buyRate').textContent) || 0;
                let sellRate = parseFloat(row.querySelector('.sellRate').textContent) || 0;
                let ttRemittanceRate = parseFloat(row.querySelector('.ttRemittanceRate').textContent) || 0;
                let rank = parseInt(row.querySelector('.rank').textContent) || 0;

                if (rankSet.has(rank)) {
                    let newRank = rank;
                    while (rankSet.has(newRank)) newRank++;
                    rank = newRank;
                }
                rankSet.add(rank);

                const oldValues = previousRatesMap.get(countryID) || { BuyRate: 0, SellRate: 0, TTRemittanceRate: 0, Rank: 0 };

                if (buyRate !== oldValues.BuyRate || sellRate !== oldValues.SellRate || ttRemittanceRate !== oldValues.TTRemittanceRate || rank !== oldValues.Rank) {
                    alertMessage += `Country: ${countryID}\nOld Values - BuyRate: ${oldValues.BuyRate}, SellRate: ${oldValues.SellRate}, TTRemittanceRate: ${oldValues.TTRemittanceRate}, Rank: ${oldValues.Rank}\n`;
                    alertMessage += `New Values - BuyRate: ${buyRate}, SellRate: ${sellRate}, TTRemittanceRate: ${ttRemittanceRate}, Rank: ${rank}\n\n`;

                    changes.push({
                        countryID,
                        oldValues,
                        newValues: { BuyRate: buyRate, SellRate: sellRate, TTRemittanceRate: ttRemittanceRate, Rank: rank }
                    });
                }

                updatedRates.push({
                    CountryID: countryID,
                    BuyRate: buyRate,
                    SellRate: sellRate,
                    TTRemittanceRate: ttRemittanceRate,
                    Rank: rank,
                    Updated_BY: updatedBy,
                    Updated_On: updatedOn
                });
            });

            if (alertMessage) {
                fetch('http://localhost:5000/api/rates/alert', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ branchName, alertMessage, changes, updatedBy })  // ✅ include updatedBy here
                })
                .then(response => response.json())
                .then(data => console.log("Alert message sent:", data))
                .catch(error => console.error('Error sending alert message:', error));
            }
            

            return fetch('http://localhost:5000/api/rates/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ branchName, rates: updatedRates })
            });
        })
        .then(response => response.json())
        .then(() => {
            const statusDiv = document.getElementById('statusMessage');
            statusDiv.textContent = "Data changed successfully";
            statusDiv.style.display = 'block';

            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 3000);
        })
        .catch(error => console.error('Error updating rates:', error));
}




function formatDateTime(date) {
    const options = { 
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', hour12: true 
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
}

// Call the function on page load to display the branch name and rates
window.onload = function() {
    displayBranchName();
}












function downloadCSV() {
    const table = document.getElementById("ratesTableEditable");
    if (!table) {
        showToast("No data available to download.");
        return;
    }

    let csv = [];
    const rows = table.querySelectorAll("tr");

    rows.forEach(row => {
        let cols = row.querySelectorAll("th, td");
        let rowData = [];

        cols.forEach((col, index) => {
            // Only allow text content for download (skip editing logic)
            let headerText = cols[0].tagName === 'TH' ? col.innerText.trim() : null;

            // If this is a data row and the column is not editable based on class
            if (!col.classList.contains("buyRate") &&
                !col.classList.contains("sellRate") &&
                !col.classList.contains("ttRemittanceRate") &&
                !col.classList.contains("rank")) {
                // Treat these as non-editable in concept
                rowData.push(`"${col.innerText.replace(/"/g, '""').replace(/\n/g, ' ')}"`);
            } else {
                // Still include editable ones
                rowData.push(`"${col.innerText.replace(/"/g, '""').replace(/\n/g, ' ')}"`);
            }
        });

        csv.push(rowData.join(","));
    });

    const csvString = csv.join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rates_data.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}




function showToast(message, duration = 3000) {
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #333;
        color: #fff;
        padding: 12px 24px;
        border-radius: 8px;
        font-family: 'Saira', sans-serif;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.4s ease;
    `;
    document.body.appendChild(toast);

    setTimeout(() => { toast.style.opacity = 1; }, 100);
    setTimeout(() => {
        toast.style.opacity = 0;
        setTimeout(() => document.body.removeChild(toast), 400);
    }, duration);
}


// function saveChanges() {
//     const branchName = localStorage.getItem('branchName');
//     let updatedBy = localStorage.getItem('branchName');  // Fetch username from localStorage or default to 'laos'

//     const updatedOn = new Date().toISOString();  // Current timestamp
//     const rows = document.querySelectorAll('#ratesTableEditable tbody tr');
//     const updatedRates = [];
//     let rankSet = new Set();  // A Set to track unique ranks
//     let alertMessage = '';  // To store the alert message

//     // Prepare an array to store old and new values for each country
//     const changes = [];

//     rows.forEach(row => {
//         const countryID = row.dataset.countryId;  // Get the CountryID from the row's data attribute
//         let buyRate = row.querySelector('.buyRate').textContent;
//         let sellRate = row.querySelector('.sellRate').textContent;
//         let ttRemittanceRate = row.querySelector('.ttRemittanceRate').textContent;
//         let rank = row.querySelector('.rank').textContent; 

//         // Ensure rates are valid numbers, defaulting to 0 if invalid
//         buyRate = buyRate ? parseFloat(buyRate) : 0;
//         sellRate = sellRate ? parseFloat(sellRate) : 0;
//         ttRemittanceRate = ttRemittanceRate ? parseFloat(ttRemittanceRate) : 0;
//         rank = rank ? parseInt(rank) : 0; // Ensure rank is a valid number

//         // Log to check values being processed
//         console.log(`Processing row ${countryID}:`, buyRate, sellRate, ttRemittanceRate, rank);

//         // Check for duplicate ranks and adjust them
//         if (rankSet.has(rank)) {
//             let newRank = rank;
//             while (rankSet.has(newRank)) {
//                 newRank++;  // Increment rank until it becomes unique
//             }
//             rank = newRank;  // Assign the new unique rank
//         }

//         rankSet.add(rank);  // Add the unique rank to the Set

//         // Retrieve the previous values (check localStorage)
//         const oldBuyRate = parseFloat(localStorage.getItem(`buyRate_${countryID}`)) || 0;
//         const oldSellRate = parseFloat(localStorage.getItem(`sellRate_${countryID}`)) || 0;
//         const oldTTRemittanceRate = parseFloat(localStorage.getItem(`ttRemittanceRate_${countryID}`)) || 0;
//         const oldRank = parseInt(localStorage.getItem(`rank_${countryID}`)) || 0;

//         console.log(`Old Values for ${countryID}:`, oldBuyRate, oldSellRate, oldTTRemittanceRate, oldRank);  // Debugging

//         // Compare old and new values to generate the alert message
//         if (buyRate !== oldBuyRate || sellRate !== oldSellRate || ttRemittanceRate !== oldTTRemittanceRate || rank !== oldRank) {
//             alertMessage += `Country: ${countryID}\nOld Values - BuyRate: ${oldBuyRate}, SellRate: ${oldSellRate}, TTRemittanceRate: ${oldTTRemittanceRate}, Rank: ${oldRank}\n`;
//             alertMessage += `New Values - BuyRate: ${buyRate}, SellRate: ${sellRate}, TTRemittanceRate: ${ttRemittanceRate}, Rank: ${rank}\n\n`;

//             // Save the old and new values in changes array
//             changes.push({
//                 countryID,
//                 oldValues: { BuyRate: oldBuyRate, SellRate: oldSellRate, TTRemittanceRate: oldTTRemittanceRate, Rank: oldRank },
//                 newValues: { BuyRate: buyRate, SellRate: sellRate, TTRemittanceRate: ttRemittanceRate, Rank: rank }
//             });
//         } else {
//             console.log(`No changes for ${countryID}`);  // Debugging
//         }

//         updatedRates.push({
//             CountryID: countryID,
//             BuyRate: buyRate,
//             SellRate: sellRate,
//             TTRemittanceRate: ttRemittanceRate,
//             Rank: rank,  // Include Rank in the update
//             Updated_BY: updatedBy,  // Include Updated_BY
//             Updated_On: updatedOn   // Include Updated_On
//         });

//         // Store the updated values in localStorage for future comparisons
//         localStorage.setItem(`buyRate_${countryID}`, buyRate);
//         localStorage.setItem(`sellRate_${countryID}`, sellRate);
//         localStorage.setItem(`ttRemittanceRate_${countryID}`, ttRemittanceRate);
//         localStorage.setItem(`rank_${countryID}`, rank);
//     });

//     if (alertMessage) {
//         fetch('http://localhost:5000/api/rates/alert', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 branchName,
//                 alertMessage,
//                 changes
//             })
//         })
//         .then(response => response.json())
//         .then(data => {
//             console.log("Alert message sent to backend:", data);
//         })
//         .catch(error => {
//             console.error('Error sending alert message to backend:', error);
//         });
//     }

//     fetch('http://localhost:5000/api/rates/update', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ branchName, rates: updatedRates })
//     })
//     .then(response => response.json())
//     .then(data => {
//         location.reload();  // Refresh the page after saving
//     })
//     .catch(error => {
//         console.error('Error updating rates:', error);
//         console.log('Error updating rates');
//     });
// }














































// // Function to display the stored branch name
// function displayBranchName() {
//     const branchName = localStorage.getItem('branchName');
//     if (branchName) {
//         document.getElementById('branchName').textContent = branchName;
//         getRates(branchName);  // Fetch rates based on the stored branch name
//     } else {
//         document.getElementById('branchName').textContent = 'No branch selected';
//     }
// }





// function getRates(branchName) {
//     fetch(`http://localhost:5000/api/rates?branchName=${branchName}`)
//         .then(response => response.json())
//         .then(data => {
//             if (data.length === 0) {
//                 document.getElementById('ratesTable').innerHTML = 'No rates available for this branch.';
//                 return;
//             }

//             // Sort data based on Rank in ascending order
//             data.sort((a, b) => (a.Rank || 9999) - (b.Rank || 9999));

//             let tableHTML = `
//             <table border="1" id="ratesTableEditable">
//                 <thead>
//                     <tr>
//                         <th>Country Code</th>
//                           <th>Currency Code</th>
//                         <th>Currency Name</th>
//                         <th>Buy Rate</th>
//                         <th>Sell Rate</th>
//                         <th>TTRemittance Rate</th>
//                         <th>Rank</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//             `;

//             data.forEach(rate => {
//                 tableHTML += `
//                     <tr data-country-id="${rate.CountryID}" data-rank="${rate.Rank}">
//                         <td>${rate.CountryCode}</td>
//                           <td>${rate.CurrencyCode}</td>
//                         <td>${rate.CountryName}</td>
//                         <td contenteditable="true" class="buyRate">${parseFloat(rate.BuyRate)}</td>
//                         <td contenteditable="true" class="sellRate">${parseFloat(rate.SellRate)}</td>
//                         <td contenteditable="true" class="ttRemittanceRate">${parseFloat(rate.TTRemittanceRate)}</td>
//                         <td contenteditable="true" class="rank">${rate.Rank || 'N/A'}</td>
//                     </tr>
//                 `;
//             });

//             tableHTML += '</tbody></table><br>';
//             tableHTML += '<button id="saveButton" >Save</button>';
//             document.getElementById('ratesTable').innerHTML = tableHTML;

//             // Attach event listener to detect rank changes
//             document.querySelectorAll(".rank").forEach(cell => {
//                 cell.addEventListener("blur", function () {
//                     updateRanks(this);
//                 });
//             });

//             // Attach event listeners for validation on the contenteditable fields
//             document.querySelectorAll('.buyRate, .sellRate, .ttRemittanceRate').forEach(input => {
//                 input.addEventListener('input', function () {
//                     validateInput(this);
//                 });
//             });

//             document.getElementById("saveButton").addEventListener("click", function() {
//                 saveChanges();
//                 const now = new Date();
//                 const formattedDateTime = formatDateTime(now);
//                 console.log("Saved at:", formattedDateTime);
//                 localStorage.setItem("lastSavedTime", formattedDateTime);
//             });
//         })
//         .catch(error => {
//             console.error('Error fetching rates:', error);
//             document.getElementById('ratesTable').innerHTML = 'Error fetching data.';
//         });
// }










// // Validation to prevent more than one zero before decimal point
// function validateInput(input) {
//     const value = input.textContent;

//     // Allow multiple zeros after decimal, but restrict leading zeros
//     if (/^0[^\d.]/.test(value) || /^00/.test(value)) {
//         // alert('Leading zeros are not allowed before the decimal point.');
//         input.textContent = value.replace(/^0+/, ''); // Remove leading zeros
//     }
// }

// // Function to update ranks (example placeholder function)
// function updateRanks(cell) {
//     // Implement your logic to update the ranks here
// }

// // Function to save changes (example placeholder function)
// function saveChanges() {
//     // Implement your save logic here
// }

// // Function to format the date/time (example placeholder function)
// function formatDateTime(date) {
//     return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
// }










// function updateRanks(cell) {
//     let newRank = parseInt(cell.innerText.trim());
//     if (isNaN(newRank) || newRank <= 0) {
//         console.log("Invalid rank! Please enter a positive number.");
//         return;
//     }

//     let row = cell.closest("tr");
//     let currentRank = parseInt(row.getAttribute("data-rank"));
//     let allRows = [...document.querySelectorAll("tr[data-country-id]")];

//     if (newRank === currentRank) return; // No change

//     // Find the row that currently has the new rank
//     let conflictingRow = allRows.find(tr => parseInt(tr.getAttribute("data-rank")) === newRank);

//     if (conflictingRow) {
//         // Swap their ranks
//         conflictingRow.querySelector(".rank").innerText = currentRank;
//         conflictingRow.setAttribute("data-rank", currentRank);
//     }

//     // Update the new rank in the current row
//     row.setAttribute("data-rank", newRank);
//     cell.innerText = newRank;

//     // Re-sort the table based on updated ranks
//     sortTable();
// }

// function sortTable() {
//     let tbody = document.querySelector("#ratesTableEditable tbody");
//     let rows = [...tbody.querySelectorAll("tr")];

//     rows.sort((a, b) => parseInt(a.getAttribute("data-rank")) - parseInt(b.getAttribute("data-rank")));

//     // Re-attach rows in correct order
//     tbody.innerHTML = "";
//     rows.forEach(row => tbody.appendChild(row));
// }




// function saveChanges() {
//     const branchName = localStorage.getItem('branchName');
//     let updatedBy = localStorage.getItem('username') || 'laos'; // Use actual username
//     const updatedOn = new Date().toISOString();
//     const rows = document.querySelectorAll('#ratesTableEditable tbody tr');
//     let rankSet = new Set();
//     let alertMessage = '';
//     const changes = [];

//     console.log("Fetching previous rates for:", branchName);

//     // Fetch previous values from backend instead of localStorage
//     fetch(`http://localhost:5000/api/rates?branchName=${branchName}`)
//         .then(response => response.json())
//         .then(previousRates => {
//             console.log("Fetched previous rates:", previousRates);

//             if (!Array.isArray(previousRates) || previousRates.length === 0) {
//                 console.warn("No previous rates found, defaulting to empty.");
//                 return;
//             }

//             const previousRatesMap = new Map();
//             previousRates.forEach(rate => {
//                 previousRatesMap.set(String(rate.CountryID), {
//                     BuyRate: parseFloat(rate.BuyRate) || 0,
//                     SellRate: parseFloat(rate.SellRate) || 0,
//                     TTRemittanceRate: parseFloat(rate.TTRemittanceRate) || 0,
//                     Rank: parseInt(rate.Rank) || 0
//                 });
//             });

//             const updatedRates = [];
//             rows.forEach(row => {
//                 const countryID = String(row.dataset.countryId);
//                 let buyRate = parseFloat(row.querySelector('.buyRate').textContent) || 0;
//                 let sellRate = parseFloat(row.querySelector('.sellRate').textContent) || 0;
//                 let ttRemittanceRate = parseFloat(row.querySelector('.ttRemittanceRate').textContent) || 0;
//                 let rank = parseInt(row.querySelector('.rank').textContent) || 0;

//                 if (rankSet.has(rank)) {
//                     let newRank = rank;
//                     while (rankSet.has(newRank)) newRank++;
//                     rank = newRank;
//                 }
//                 rankSet.add(rank);

//                 const oldValues = previousRatesMap.get(countryID) || { BuyRate: 0, SellRate: 0, TTRemittanceRate: 0, Rank: 0 };

//                 if (buyRate !== oldValues.BuyRate || sellRate !== oldValues.SellRate || ttRemittanceRate !== oldValues.TTRemittanceRate || rank !== oldValues.Rank) {
//                     alertMessage += `Country: ${countryID}\nOld Values - BuyRate: ${oldValues.BuyRate}, SellRate: ${oldValues.SellRate}, TTRemittanceRate: ${oldValues.TTRemittanceRate}, Rank: ${oldValues.Rank}\n`;
//                     alertMessage += `New Values - BuyRate: ${buyRate}, SellRate: ${sellRate}, TTRemittanceRate: ${ttRemittanceRate}, Rank: ${rank}\n\n`;

//                     changes.push({
//                         countryID,
//                         oldValues,
//                         newValues: { BuyRate: buyRate, SellRate: sellRate, TTRemittanceRate: ttRemittanceRate, Rank: rank }
//                     });
//                 }

//                 updatedRates.push({
//                     CountryID: countryID,
//                     BuyRate: buyRate,
//                     SellRate: sellRate,
//                     TTRemittanceRate: ttRemittanceRate,
//                     Rank: rank,
//                     Updated_BY: updatedBy,
//                     Updated_On: updatedOn
//                 });
//             });

//             if (alertMessage) {
//                 fetch('http://localhost:5000/api/rates/alert', {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify({ branchName, alertMessage, changes, updatedBy })  // ✅ include updatedBy here
//                 })
//                 .then(response => response.json())
//                 .then(data => console.log("Alert message sent:", data))
//                 .catch(error => console.error('Error sending alert message:', error));
//             }
            

//             return fetch('http://localhost:5000/api/rates/update', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ branchName, rates: updatedRates })
//             });
//         })
//         .then(response => response.json())
//         .then(() => {
//             const statusDiv = document.getElementById('statusMessage');
//             statusDiv.textContent = "Data changed successfully";
//             statusDiv.style.display = 'block';

//             setTimeout(() => {
//                 statusDiv.style.display = 'none';
//             }, 3000);
//         })
//         .catch(error => console.error('Error updating rates:', error));
// }




// function formatDateTime(date) {
//     const options = { 
//         year: 'numeric', month: 'numeric', day: 'numeric',
//         hour: 'numeric', minute: 'numeric', hour12: true 
//     };
//     return new Intl.DateTimeFormat('en-US', options).format(date);
// }

// // Call the function on page load to display the branch name and rates
// window.onload = function() {
//     displayBranchName();
// }






















