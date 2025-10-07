

const tableBody = document.querySelector('tbody');
const addForm = document.getElementById('add-form');
const searchInput = document.getElementById('searchInput'); // Search input
const sortButtons = document.querySelectorAll('.sortable'); // Column headers for sorting

let tableData = []; // Store the data for sorting and filtering
let sortOrder = 'asc'; // Track the sorting order

// Fetch data from the server
const fetchData = async () => {
    try {
        const response = await fetch('http://localhost:5000/data');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        tableData = await response.json();
        renderTable(tableData);
    } catch (error) {
        console.error('Error fetching data:', error);
        console.log('There was an error fetching the data.');
    }
};

// Function to format values as decimals or 0
// const formatValue = (value) => {
//     if (value === 0) {
//         return '0'; // Explicitly show 0
//     }
//     return value.toString(); // Show the value as-is (string), including decimals
// };





  // Fetch and populate dropdown
  fetch('http://localhost:5000/branches')
    .then(res => res.json())
    .then(data => {
      branchesData = data;
      const branchSelect = document.getElementById('branch');
      branchSelect.innerHTML = '<option value="">-- Select Branch --</option>';

      data.forEach(branch => {
        const option = document.createElement('option');
        option.value = branch.BRANCH_NAME;
        option.textContent = branch.BRANCH_NAME;
        branchSelect.appendChild(option);
      });

      const savedBranch = localStorage.getItem('branchName');
      if (savedBranch) {
        branchSelect.value = savedBranch;
        updateControls(savedBranch);
      }
    });

  document.getElementById('branch').addEventListener('change', function () {
    const selectedBranch = this.value;
    localStorage.setItem('branchName', selectedBranch);
    updateControls(selectedBranch);
  });

  function updateControls(branchName) {
    const branch = branchesData.find(b => b.BRANCH_NAME === branchName);

    if (branch) {
      document.getElementById('agreement').checked = branch.Ads === 'Enabled';
      document.getElementById('option1').checked = branch.ORIENTATION === 'LANDSCAPE';
      document.getElementById('option2').checked = branch.ORIENTATION === 'PORTRAIT';
    }
  }

  // Update DB when checkbox changes
  document.getElementById('agreement').addEventListener('change', function () {
    const selectedBranch = document.getElementById('branch').value;
    if (!selectedBranch) return;

    const adsStatus = this.checked ? 'Enabled' : 'Disabled';
    const orientation = document.querySelector('input[name="options"]:checked')?.value === 'option1'
      ? 'LANDSCAPE'
      : 'PORTRAIT';

    updateBranchInDB(selectedBranch, adsStatus, orientation);
  });

  // Update DB when orientation changes
  document.querySelectorAll('input[name="options"]').forEach(radio => {
    radio.addEventListener('change', function () {
      const selectedBranch = document.getElementById('branch').value;
      if (!selectedBranch) return;

      const orientation = this.id === 'option1' ? 'LANDSCAPE' : 'PORTRAIT';
      const adsStatus = document.getElementById('agreement').checked ? 'Enabled' : 'Disabled';

      updateBranchInDB(selectedBranch, adsStatus, orientation);
    });
  });

  // Function to update DB
  function updateBranchInDB(branchName, adsStatus, orientation) {
    fetch('http://localhost:5000/update-branch', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        BRANCH_NAME: branchName,
        Ads: adsStatus,
        ORIENTATION: orientation
      })
    })
      .then(res => res.json())
      .then(response => {
        console.log('Update success:', response);
      })
      .catch(error => {
        console.error('Update failed:', error);
      });
  }





const formatValue = (value) => {
    if (value === null || value === undefined) {
        return '0'; // Default value for null or undefined
    }
    if (value === 0) {
        return '0'; // Explicitly show 0
    }
    return value.toString(); // Return as string
};


// Render the table data
const renderTable = (data) => {
    tableBody.innerHTML = ''; // Clear the table before rendering

    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = 
            `<td>${row.CountryID}</td>
            <td>${row.BranchName}</td>
            <td>${row.CountryName}</td>
            <td>${row.CountryCode}</td>
            <td>${row.CurrencyCode}</td>
            <td contenteditable="true" data-column="BuyRate" data-old-value="${row.BuyRate || ''}">${formatValue(row.BuyRate) || ''}</td>
            <td contenteditable="true" data-column="SellRate" data-old-value="${row.SellRate || ''}">${formatValue(row.SellRate) || ''}</td>
            <td contenteditable="true" data-column="TTRemittanceRate" data-old-value="${row.TTRemittanceRate || ''}">${formatValue(row.TTRemittanceRate) || ''}</td>
            <td>
                <div class="button-container">
                    <button 
                        onclick="editData(
                            ${row.CountryID}, 
                            '${row.BranchName}', 
                            '${row.CountryName}', 
                            '${row.CountryCode}', 
                            ${row.BuyRate || ''}, 
                            ${row.SellRate || ''}, 
                            ${row.TTRemittanceRate || ''}
                        )" 
                        class="edit-button">
                        Edit
                    </button>
                    <button 
                        onclick="deleteData(${row.CountryID})" 
                        class="delete-button">
                        Delete
                    </button>
                </div>
            </td>`;

        tableBody.appendChild(tr);
    });

    const validateRateInput = (value) => {
        const regex = /^(0|[1-9]\d*)(\.\d+)?$/; // Ensures proper number format
        return regex.test(value);
    };
    
    const editableCells = document.querySelectorAll('[contenteditable="true"]');
    editableCells.forEach(cell => {
        cell.addEventListener('blur', async () => {
            let newValue = cell.textContent.trim();
    
            // Ensure valid number format
            if (!validateRateInput(newValue)) {
                console.log("Invalid input: Leading zeros before a non-decimal number are not allowed.");
                cell.textContent = cell.getAttribute('data-old-value'); // Reset to old value
                return;
            }
    
            newValue = newValue === '' || isNaN(newValue) ? 'null' : newValue;
    
            // Get old value
            const oldValue = cell.getAttribute('data-old-value');
    
            if (oldValue !== newValue) {
                const row = cell.closest('tr');
    
                // Get correct column values
                const CountryID = Number(row.querySelector('td:nth-child(1)').textContent.trim());
                const BranchName = row.querySelector('td:nth-child(2)').textContent.trim();
                const CountryName = row.querySelector('td:nth-child(3)').textContent.trim();
                const CurrencyName = row.querySelector('td:nth-child(5)').textContent.trim();
    
                // Fetch old values correctly
                const OldBuyRate = row.querySelector('[data-column="BuyRate"]').getAttribute('data-old-value') || 'null';
                const OldSellRate = row.querySelector('[data-column="SellRate"]').getAttribute('data-old-value') || 'null';
                const OldTTRemittanceRate = row.querySelector('[data-column="TTRemittanceRate"]').getAttribute('data-old-value') || 'null';
    
                // Get new values
                const NewBuyRate = row.querySelector('[data-column="BuyRate"]').textContent.trim() || 'null';
                const NewSellRate = row.querySelector('[data-column="SellRate"]').textContent.trim() || 'null';
                const NewTTRemittanceRate = row.querySelector('[data-column="TTRemittanceRate"]').textContent.trim() || 'null';
    
                // Fetch the username from local storage
                const username = localStorage.getItem('username') || 'Unknown User';
    
                // Prepare data for update
                const updateData = {
                    CountryID,
                    BranchName,
                    CountryName,
                    CurrencyName,
                    OldBuyRate: OldBuyRate !== 'null' ? OldBuyRate : null,
                    NewBuyRate: NewBuyRate !== 'null' ? NewBuyRate : null,
                    OldSellRate: OldSellRate !== 'null' ? OldSellRate : null,
                    NewSellRate: NewSellRate !== 'null' ? NewSellRate : null,
                    OldTTRemittanceRate: OldTTRemittanceRate !== 'null' ? OldTTRemittanceRate : null,
                    NewTTRemittanceRate: NewTTRemittanceRate !== 'null' ? NewTTRemittanceRate : null,
                    UpdatedBy: username
                };
    
                try {
                    const response = await fetch('http://localhost:5000/update-rate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(updateData)
                    });
    
                    if (response.ok) {
                        const result = await response.json();
                        console.log('Data updated successfully:', result);
    
                        // Update data-old-value **ONLY AFTER SUCCESS**
                        row.querySelector('[data-column="BuyRate"]').setAttribute('data-old-value', NewBuyRate);
                        row.querySelector('[data-column="SellRate"]').setAttribute('data-old-value', NewSellRate);
                        row.querySelector('[data-column="TTRemittanceRate"]').setAttribute('data-old-value', NewTTRemittanceRate);
                    } else {
                        console.error('Error updating data:', await response.text());
                    }
                } catch (error) {
                    console.error('Error sending update request:', error);
                    console.log('There was an error updating the data.');
                }
            }
        });
    });
};

// Fetch data when the page loads
fetchData();

// Filter the data based on the search query
const filterData = () => {
    const searchQuery = searchInput.value.toLowerCase();
    const filteredData = tableData.filter(row => 
        row.BranchName.toLowerCase().includes(searchQuery)
    );
    renderTable(filteredData);
};

// Sort the table data
const sortTable = (column) => {
    const sortedData = [...tableData].sort((a, b) => {
        if (a[column] < b[column]) return sortOrder === 'asc' ? -1 : 1;
        if (a[column] > b[column]) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    // Toggle sort order
    sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    
    renderTable(sortedData);
};












// Function to edit data
const editData = (CountryID, BranchName, CountryName, CountryCode, BuyRate, SellRate, TTRemittanceRate) => {
    // Decode the country name and country code if necessary
    CountryName = decodeURIComponent(CountryName);
    CountryCode = decodeURIComponent(CountryCode);

    // Set the form values with decoded data
    document.getElementById('countryName').value = CountryName;
    document.getElementById('countryCode').value = CountryCode;
    document.getElementById('branchName').value = BranchName;
    document.getElementById('buyRate').value = BuyRate;
    document.getElementById('sellRate').value = SellRate;
    document.getElementById('ttRemittanceRate').value = TTRemittanceRate;
    
    // Set the form submit handler for updating the data
    addForm.removeEventListener('submit', addData);
    addForm.addEventListener('submit', (event) => updateData(event, CountryID));
};

// Update existing data
const updateData = async (event, id) => {
    event.preventDefault();

    const submitButton = document.querySelector('#submitButton'); // Assuming you have a submit button with id="submitButton"
    submitButton.disabled = true; // Disable submit button during update

    // Decode the values immediately after retrieving them from the input fields
    let branchName = document.getElementById('branchName').value;
    let countryName = decodeURIComponent(document.getElementById('countryName').value); // Decoding countryName
    let countryCode = decodeURIComponent(document.getElementById('countryCode').value); // Decoding countryCode
    
    const buyRate = parseFloat(document.getElementById('buyRate').value || 0).toFixed(9);
    const sellRate = parseFloat(document.getElementById('sellRate').value || 0).toFixed(9);
    const ttRemittanceRate = parseFloat(document.getElementById('ttRemittanceRate').value || 0).toFixed(9);

    const updatedBy = localStorage.getItem('username') || 'Default User';
    
    // Get local time in Dubai format
    const updatedOn = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dubai' });

    // Prepare the updated data with conditional updates
    const updatedData = {};

    if (branchName) updatedData.BranchName = branchName;
    if (countryName) updatedData.CountryName = countryName;
    if (countryCode) updatedData.CountryCode = countryCode;
    if (buyRate !== "0.000000000") updatedData.BuyRate = buyRate;  // Only include if changed
    if (sellRate !== "0.000000000") updatedData.SellRate = sellRate;
    if (ttRemittanceRate !== "0.000000000") updatedData.TTRemittanceRate = ttRemittanceRate;
    
    updatedData.Updated_BY = updatedBy;
    updatedData.Updated_On = updatedOn;

    // Find the specific data to update (use a unique identifier)
    const oldData = tableData.find(item => item.CountryID === id);

    // If old data doesn't exist, log an error
    if (!oldData) {
        console.error("Old data not found.");
        submitButton.disabled = false; // Re-enable submit button in case of error
        return;
    }

    // Debugging the data
    console.log("Old Data:", oldData);
    console.log("Updated Data:", updatedData);

    try {
        // Send the update to the server
        const response = await fetch(`http://localhost:5000/data/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('Data updated successfully');
        fetchData(); // Fetch data again to reflect changes

        // Log the change to the database
        await logChangeToDatabase(oldData, updatedData, id);

        // Reset form and event listeners
        addForm.reset();
        addForm.removeEventListener('submit', updateData);
        addForm.addEventListener('submit', addData);
    } catch (error) {
        console.error('Error updating data:', error);
        console.log('There was an error updating the data.');
    } finally {
        submitButton.disabled = false; // Re-enable submit button after operation
    }
};

// Function to log changes to the database
const logChangeToDatabase = async (oldData, updatedData, id) => {
    try {
        // Check if oldData and updatedData have valid values
        console.log("Logging data:", oldData, updatedData);

        const logData = {
            BranchName: updatedData.BranchName || 'N/A', // Default value if null or undefined
            CountryID: id, // Ensure we are passing the right CountryID
            OldBuyRate: oldData.BuyRate || 0, // Default to 0 if undefined
            OldSellRate: oldData.SellRate || 0, // Default to 0 if undefined
            OldTTRemittanceRate: oldData.TTRemittanceRate || 0, // Default to 0 if undefined
            OldRank: oldData.Rank || null, // Default to null if undefined
            NewBuyRate: updatedData.BuyRate || 0, // Default to 0 if undefined
            NewSellRate: updatedData.SellRate || 0, // Default to 0 if undefined
            NewTTRemittanceRate: updatedData.TTRemittanceRate || 0, // Default to 0 if undefined
            NewRank: updatedData.Rank || null, // Default to null if undefined
            CreatedAt: new Date().toLocaleString('en-US', { timeZone: 'Asia/Dubai' }),
            UpdatedBy: updatedData.Updated_BY || 'Default User', // Default to a user if not found
        };

        const response = await fetch('http://localhost:5000/logs', { // Assuming there's an endpoint for logging
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(logData),
        });

        if (!response.ok) {
            throw new Error('Failed to log change to the database');
        }

        console.log('Change logged to database');
    } catch (error) {
        console.error('Error logging change:', error);
    }
};














// const deleteData = async (countryID) => {
//     if (confirm("Are you sure you want to delete this entry?")) {
//         try {
//             const response = await fetch(`http://localhost:5000/data/${countryID}`, {
//                 method: "DELETE",
//                 headers: { "Content-Type": "application/json" },
//             });

//             if (!response.ok) {
//                 throw new Error(`Failed with status: ${response.status}`);
//             }

//             console.log("Record deleted successfully.");

//             // Fetch deleted data for standard message
//             const deletedData = tableData.find(item => item.CountryID === countryID);

//             if (deletedData) {
//                 console.log(`Data deleted successfully!\n\nDeleted Data:\nBranch: ${deletedData.BranchName}\nCountry: ${deletedData.CountryName}\nCountry Code: ${deletedData.CountryCode}\nBuy Rate: ${deletedData.BuyRate}\nSell Rate: ${deletedData.SellRate}\nTT Remittance Rate: ${deletedData.TTRemittanceRate}`);
//                 fetchData();

//                 // Get local system time (in your time zone)
//                 const localTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dubai' });

//                 // Send the log request with local time
//                 const logResponse = await fetch('http://localhost:5000/log-deletion', {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify({
//                         username: localStorage.getItem('username'),
//                         deletedData: {
//                             BranchName: deletedData.BranchName,
//                             CountryName: deletedData.CountryName,
//                             CountryCode: deletedData.CountryCode,
//                             BuyRate: deletedData.BuyRate,
//                             SellRate: deletedData.SellRate,
//                             TTRemittanceRate: deletedData.TTRemittanceRate,
//                         },
//                         deletedOn: localTime, // Send local time (in your time zone)
//                     }),
//                 });

//                 if (!logResponse.ok) {
//                     throw new Error(`Failed to log deletion: ${logResponse.status}`);
//                 }

//             } else {
//                 console.log("Data not found for deletion.");
//             }

//         } catch (error) {
//             console.error("Error deleting record:", error);
//             console.log("An error occurred while deleting the record.");
//         }
//     }
// };






// Add new data



const deleteData = async (countryID) => {
    try {
        const response = await fetch(`http://localhost:5000/data/${countryID}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            throw new Error(`Failed with status: ${response.status}`);
        }

        console.log("Record deleted successfully.");

        // Fetch deleted data for standard message
        const deletedData = tableData.find(item => item.CountryID === countryID);

        if (deletedData) {
            console.log(`Data deleted successfully!\n\nDeleted Data:\nBranch: ${deletedData.BranchName}\nCountry: ${deletedData.CountryName}\nCountry Code: ${deletedData.CountryCode}\nBuy Rate: ${deletedData.BuyRate}\nSell Rate: ${deletedData.SellRate}\nTT Remittance Rate: ${deletedData.TTRemittanceRate}`);
            fetchData();

            // Get local system time (in your time zone)
            const localTime = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dubai' });

            // Send the log request with local time
            const logResponse = await fetch('http://localhost:5000/log-deletion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: localStorage.getItem('username'),
                    deletedData: {
                        BranchName: deletedData.BranchName,
                        CountryName: deletedData.CountryName,
                        CountryCode: deletedData.CountryCode,
                        BuyRate: deletedData.BuyRate.toString(),
                        SellRate: deletedData.SellRate.toString(),
                        TTRemittanceRate: deletedData.TTRemittanceRate.toString(),
                    },
                    
                    deletedOn: localTime, // Send local time (in your time zone)
                }),
            });

            if (!logResponse.ok) {
                throw new Error(`Failed to log deletion: ${logResponse.status}`);
            }

            // Display success message
            const successMessage = document.createElement('div');
            successMessage.textContent = 'Data deleted successfully!';
            successMessage.style.position = 'fixed';
            successMessage.style.top = '20px';
            successMessage.style.left = '50%';
            successMessage.style.transform = 'translateX(-50%)';
            successMessage.style.padding = '10px 20px';
            successMessage.style.backgroundColor = 'green';
            successMessage.style.color = 'white';
            successMessage.style.borderRadius = '5px';
            successMessage.style.fontSize = '16px';
            successMessage.style.zIndex = '9999';
            document.body.appendChild(successMessage);

            // Hide success message after 3 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 3000);

        } else {
            console.log("Data not found for deletion.");
        }

    } catch (error) {
        console.error("Error deleting record:", error);
        console.log("An error occurred while deleting the record.");
    }
};









// const addData = async (event) => {
//     event.preventDefault();

//     const branchName = document.getElementById('branchName').value;
//     const countryName = document.getElementById('countryName').value;
//     const countryCode = document.getElementById('countryCode').value;
    
//     const buyRate = Number(document.getElementById('buyRate').value) || 0;
//     const sellRate = Number(document.getElementById('sellRate').value) || 0;
//     const ttRemittanceRate = Number(document.getElementById('ttRemittanceRate').value) || 0;

//     const updatedBy = localStorage.getItem('username') || 'Default User';
//     const updatedOn = new Date().toISOString();

//     const newData = {
//         BranchName: branchName,
//         CountryName: countryName,
//         CountryCode: countryCode,
//         BuyRate: buyRate,
//         SellRate: sellRate,
//         TTRemittanceRate: ttRemittanceRate,
//         Updated_BY: updatedBy,
//         Updated_On: updatedOn
//     };

//     try {
//         const response = await fetch('http://localhost:5000/data', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(newData),
//         });

//         if (!response.ok) {
//             const errorMessage = await response.text();
//             throw new Error(errorMessage);
//         }

//         const entryData = {
//             BranchName: branchName,
//             CountryID: '0',  
//             OldBuyRate: 0, 
//             OldSellRate: 0,
//             OldTTRemittanceRate: 0,
//             NewBuyRate: buyRate,  
//             NewSellRate: sellRate,
//             NewTTRemittanceRate: ttRemittanceRate,
//             CreatedAt: updatedOn,
//             CurrencyName: countryName,  
//             UpdatedBy: updatedBy
//         };

//         const entryResponse = await fetch('http://localhost:5000/entry', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(entryData),
//         });

//         if (!entryResponse.ok) {
//             const errorMessage = await entryResponse.text();
//             throw new Error(errorMessage);
//         }

//         fetchData();
//         addForm.reset();
//         displaySuccessMessage(`Data saved successfully!`);
//         console.log(`${updatedBy} has added new data: ${JSON.stringify(newData)}.`);

//     } catch (error) {
//         console.error('Error adding data:', error);
//         alert(`Error: ${error.message}`);
//     }
// };

// // Function to display success message
// const displaySuccessMessage = (message) => {
//     const successMessage = document.createElement('div');
//     successMessage.className = 'success-message';
//     successMessage.innerText = message;
    
//     // Style the message (you can customize this part)
//     successMessage.style.position = 'fixed';
//     successMessage.style.top = '20px';
//     successMessage.style.right = '20px';
//     successMessage.style.backgroundColor = '#28a745';
//     successMessage.style.color = 'white';
//     successMessage.style.padding = '10px 20px';
//     successMessage.style.borderRadius = '5px';
//     successMessage.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
//     successMessage.style.zIndex = '1000';
    
//     // Add it to the body
//     document.body.appendChild(successMessage);
    
//     // Remove the message after 5 seconds
//     setTimeout(() => {
//         successMessage.remove();
//     }, 5000);
// };

// // Initialize by fetching the data
// fetchData();

// // Add event listener to the form to handle adding new data
// addForm.addEventListener('submit', addData);

// // Search bar listener
// searchInput.addEventListener('input', filterData);

// // Sorting listener
// sortButtons.forEach(button => {
//     button.addEventListener('click', () => {
//         const column = button.dataset.column;
//         sortTable(column);
//     });
// });




const addData = async (event) => {
    event.preventDefault();

    const branchName = document.getElementById('branchName').value;
    const countryName = document.getElementById('countryName').value;
    const countryCode = document.getElementById('countryCode').value;

    const buyRate = Number(document.getElementById('buyRate').value) || 0;
    const sellRate = Number(document.getElementById('sellRate').value) || 0;
    const ttRemittanceRate = Number(document.getElementById('ttRemittanceRate').value) || 0;

    const updatedBy = localStorage.getItem('username') || 'Default User';
    const updatedOn = new Date().toISOString();

    const newData = {
        BranchName: branchName,
        CountryName: countryName,
        CountryCode: countryCode,
        BuyRate: buyRate,
        SellRate: sellRate,
        TTRemittanceRate: ttRemittanceRate,
        Updated_BY: updatedBy,
        Updated_On: updatedOn
    };

    try {
        const response = await fetch('http://localhost:5000/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newData),
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage);
        }

        const entryData = {
            BranchName: branchName,
            CountryID: '0',
            OldBuyRate: 0,
            OldSellRate: 0,
            OldTTRemittanceRate: 0,
            NewBuyRate: buyRate,
            NewSellRate: sellRate,
            NewTTRemittanceRate: ttRemittanceRate,
            CreatedAt: updatedOn,
            CurrencyName: countryName,
            UpdatedBy: updatedBy
        };

        const entryResponse = await fetch('http://localhost:5000/entry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entryData),
        });

        if (!entryResponse.ok) {
            const errorMessage = await entryResponse.text();
            throw new Error(errorMessage);
        }

        fetchData();
        addForm.reset();
        document.getElementById('branch').value = '';
        document.getElementById('currency').value = '';
        displaySuccessMessage(`Data saved successfully!`);
        console.log(`${updatedBy} has added new data: ${JSON.stringify(newData)}.`);

    } catch (error) {
        console.error('Error adding data:', error);
        displayErrorMessage(`Error: ${error.message}`);
    }
};

// Function to display success message
const displaySuccessMessage = (message) => {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerText = message;

    successMessage.style.position = 'fixed';
    successMessage.style.top = '20px';
    successMessage.style.right = '20px';
    successMessage.style.backgroundColor = '#28a745';
    successMessage.style.color = 'white';
    successMessage.style.padding = '10px 20px';
    successMessage.style.borderRadius = '5px';
    successMessage.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    successMessage.style.zIndex = '1000';

    document.body.appendChild(successMessage);

    setTimeout(() => {
        successMessage.remove();
    }, 3000);
};

// Function to display error message
const displayErrorMessage = (message) => {
    const errorMessage = document.createElement('div');
    errorMessage.className = 'error-message';
    errorMessage.innerText = message;

    errorMessage.style.position = 'fixed';
    errorMessage.style.top = '20px';
    errorMessage.style.right = '20px';
    errorMessage.style.backgroundColor = '#dc3545';
    errorMessage.style.color = 'white';
    errorMessage.style.padding = '10px 20px';
    errorMessage.style.borderRadius = '5px';
    errorMessage.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    errorMessage.style.zIndex = '1000';

    document.body.appendChild(errorMessage);

    setTimeout(() => {
        errorMessage.remove();
    }, 3000);
};

// Initialize by fetching the data
fetchData();

// Add event listener to the form to handle adding new data
addForm.addEventListener('submit', addData);

// Search bar listener
searchInput.addEventListener('input', filterData);

// Sorting listener
sortButtons.forEach(button => {
    button.addEventListener('click', () => {
        const column = button.dataset.column;
        sortTable(column);
    });
});



function saveData() {
    // Fetch username from local storage
    let username = localStorage.getItem("username");

    if (username) {
        // console.log("Username fetched from local storage: " + username);
        // You can use the username for further processing
    } else {
        console.log("No username found in local storage.");
    }


  
}








// Ensure both functions are called when the page loads
document.addEventListener('DOMContentLoaded', function () {
    loadBranches();
    loadCurrencies();
});

async function loadBranches() {
    try {
        console.log("Fetching branches...");
        const response = await fetch("http://localhost:5000/branches");

        // Check if the response status is OK
        if (!response.ok) {
            console.error("Failed to fetch branches. Status:", response.status);
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log("Fetched branch data:", data); // Log fetched data

        const dropdown = document.getElementById("branch");
        if (!dropdown) {
            console.error("Branch dropdown element not found");
            return;
        }

        dropdown.innerHTML = '<option value="" >Select Branch</option> '; // Default option

        // Add branch options to the dropdown
     // Add branch options to the dropdown (only where STATUS is "1")
        data
        .filter(branch => branch.STATUS === "1")
        .forEach(branch => {
        const option = document.createElement("option");
        option.value = branch.BRANCH_NAME;
        option.textContent = branch.BRANCH_NAME;
        dropdown.appendChild(option);
        });


        // Event listener to update branchName input field when branch is selected
        dropdown.addEventListener('change', function () {
            const branchNameInput = document.getElementById("branchName");
            if (branchNameInput) {
                branchNameInput.value = dropdown.value; // Set the input value to the selected branch
            }

            // You can add additional logic to set countryCode based on the branch
            // For now, I'll just set it to 'AE' for all branches as an example
            const countryCodeInput = document.getElementById("countryCode");
            if (countryCodeInput) {
                countryCodeInput.value = "AE"; // You can customize this value based on branch
            }
        });

    } catch (error) {
        console.error("Error fetching branch names:", error);
        const dropdown = document.getElementById("branch");
        if (dropdown) {
            dropdown.innerHTML = '<option value="">Error loading branches</option>';
        }
    }
}

async function loadCurrencies() {
    try {
        const response = await fetch("http://localhost:5000/api/currencies");
        
        // Log response to check if data is returned
        const data = await response.json();
        console.log("Fetched currency data:", data);

        const dropdown = document.getElementById("currency");
        if (!dropdown) {
            console.error("Currency dropdown element not found");
            return;
        }

        // Filter currencies with STATUS = "1"
        const activeCurrencies = data.filter(currency => currency.STATUS === "1");

        // Check if active currencies are available
        if (activeCurrencies.length > 0) {
            dropdown.innerHTML = '<option value="">Select Currency</option>'; // Default option

            // Add active currency options to the dropdown
            activeCurrencies.forEach(currency => {
                const option = document.createElement("option");
                option.value = currency.CURRENCY_NAME; // Currency name as value
                option.textContent = `${currency.CURRENCY_NAME} (${currency.CURRENCY_NAME_ARABIC})`; // Currency name and Arabic name as display text
                dropdown.appendChild(option);
            });

            // Event listener to update countryName and countryCode input fields when currency is selected
            dropdown.addEventListener('change', function () {
                const countryNameInput = document.getElementById("countryName");
                if (countryNameInput) {
                    countryNameInput.value = dropdown.value; // Set the input value to the selected currency
                }

                // For selected currency, update country code and currency code
                const countryCodeInput = document.getElementById("countryCode");
                const currencyCodeInput = document.getElementById("currencyCode");

                // Find selected currency in the filtered list
                const selectedCurrency = activeCurrencies.find(currency => currency.CURRENCY_NAME === dropdown.value);

                if (selectedCurrency) {
                    if (countryCodeInput) {
                        countryCodeInput.value = selectedCurrency.COUNTRY_CODE; // Display country code for the selected currency
                    }
                    if (currencyCodeInput) {
                        currencyCodeInput.value = selectedCurrency.CURRENCY_CODE; // Display currency code
                    }
                } else {
                    if (countryCodeInput) {
                        countryCodeInput.value = '';
                    }
                    if (currencyCodeInput) {
                        currencyCodeInput.value = '';
                    }
                }
            });

        } else {
            dropdown.innerHTML = '<option value="">No currencies available</option>';
        }
    } catch (error) {
        console.error("Error fetching currencies:", error);
        const dropdown = document.getElementById("currency");
        if (dropdown) {
            dropdown.innerHTML = '<option value="">Error loading currencies</option>';
        }
    }
}














function toggleTable() {
    let input = document.getElementById("searchInput").value;
    let table = document.getElementById("data-table");
    let tbody = table.querySelector("tbody");

    // Show table only when input has text
    if (input.trim()) {
        table.style.display = "table";
        populateTable(); // Call function to load data dynamically
    } else {
        table.style.display = "none";
        tbody.innerHTML = ""; // Clear table data when input is empty
    }
}

function populateTable() {
    let data = [
        { id: 1, branch: "Dubai Mall", currency: "USD", code: "USD", buy: 3.67, sell: 3.68, tt: 3.67 },
        { id: 2, branch: "Abu Dhabi", currency: "EUR", code: "EUR", buy: 4.00, sell: 4.05, tt: 4.02 }
    ]; // Example dynamic data (can be fetched from API)

    let tbody = document.querySelector("#data-table tbody");
    tbody.innerHTML = ""; // Clear previous data

    data.forEach(row => {
        let tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${row.id}</td>
            <td>${row.branch}</td>
            <td>${row.currency}</td>
            <td>${row.code}</td>
            <td>${row.buy}</td>
            <td>${row.sell}</td>
            <td>${row.tt}</td>
            <td><button>Edit</button></td>
        `;
        tbody.appendChild(tr);
    });
}





function triggerFileUpload() {
    document.getElementById("fileInput").click();
}

document.getElementById("fileInput").addEventListener("change", function() {
    const file = this.files[0];
    if (file) {
        const formData = new FormData();
        formData.append("file", file);

        fetch("http://localhost:5000/upload", {
            method: "POST",
            body: formData
        })
        .then(response => response.json())
        .then(data => console.log(data.message))
        .catch(error => console.error("Error uploading file:", error));
    }
});












const modal = document.getElementById("modal");
const openBtn = document.getElementById("openModal");
const closeBtn = document.getElementById("closeModal");

openBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
    fetchImages(); // Fetch images when opening modal
});

closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
});

async function fetchImages() {
const container = document.getElementById("imageContainer");
container.innerHTML = ""; // Clear previous images

try {
const response = await fetch("http://localhost:5000/api/images");
if (!response.ok) throw new Error("Failed to fetch images");

const images = await response.json();
images.forEach(img => {
    const imgElement = document.createElement("img");
    imgElement.src = `http://localhost:5000/images/${img}`;
    imgElement.classList.add("w-24", "h-24", "rounded-lg", "shadow-md", "object-cover", "m-1");

    // Add click event to show image in larger view
    imgElement.addEventListener("click", () => {
        const largeImageView = document.getElementById("largeImageView");
        const largeImage = document.getElementById("largeImage");

        largeImage.src = imgElement.src; // Set the source of the large image
        largeImageView.classList.remove("hidden"); // Show the large image view
    });

    // Add delete button to each image
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.classList.add("bg-red-500", "text-white", "px-2", "py-1", "rounded", "mt-2");
    deleteBtn.addEventListener("click", () => deleteImage(img)); // Delete image when clicked

    const imgWrapper = document.createElement("div");
    imgWrapper.classList.add("relative");
    imgWrapper.appendChild(imgElement);
    imgWrapper.appendChild(deleteBtn);

    container.appendChild(imgWrapper); // Append the image with delete button
});

} catch (error) {
console.error("Error fetching images:", error);
}
}
// Delete an image from the server and the UI
async function deleteImage(imageName) {
try {
const response = await fetch(`http://localhost:5000/api/delete/${imageName}`, {
    method: 'DELETE',
});

if (!response.ok) throw new Error("Failed to delete image");

// Remove the image from the UI
const imageElement = document.querySelector(`img[src='http://localhost:5000/images/${imageName}']`);
if (imageElement) {
    imageElement.parentElement.remove(); // Remove the image and its delete button from the DOM
}

console.log(`Image deleted: ${imageName}`);
} catch (error) {
console.error("Error deleting image:", error);
}
}

// Close the large image view when clicked
document.getElementById("largeImageView").addEventListener("click", () => {
document.getElementById("largeImageView").classList.add("hidden");
});











// Open file input when the button is clicked
document.getElementById("uploadImageBtn").addEventListener("click", () => {
document.getElementById("imageUploadInput").click();
});

// Handle file selection and upload
document.getElementById("imageUploadInput").addEventListener("change", async (event) => {
const file = event.target.files[0];
if (!file) {
console.log("No file selected");
return;
}

const formData = new FormData();
formData.append("image", file);

try {
const response = await fetch("http://localhost:5000/api/upload", {
    method: "POST",
    body: formData
});

console.log('Upload response:', response);

if (response.ok) {
    fetchImages(); // Refresh the image list after upload
} else {
    console.log("Failed to upload image.");
}
} catch (error) {
console.error("Error uploading image:", error);
console.log("Error uploading image.");
}
});







document.getElementById('myCheckbox').addEventListener('change', function() {
    let selectedBranch = document.getElementById('branch').value;
    let checkboxEnabled = this.checked;

    if (selectedBranch && checkboxEnabled) {
        console.log(`Advertisements enabled for branch: ${selectedBranch}`);

        // Send the selected branch to the server to update the database
        fetch('http://localhost:5000/update-ads', {  // Ensure it's the correct URL (including localhost:port)
            method: 'POST',  
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ branchName: selectedBranch }),  // Sending branch name as payload
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);  // Log success message from the server
        })
        .catch(error => console.error('Error:', error));  // Log any errors
        
    }
});






//  // Fetch the Ads status when the branch changes
//  document.getElementById('branch').addEventListener('change', async function() {
//     const selectedBranch = this.value;

//     if (selectedBranch) {
//         try {
//             const response = await fetch(`http://localhost:5000/get-ads-status?branchName=${selectedBranch}`);
//             const data = await response.json();

//             // Set the checkbox based on the ads status
//             document.getElementById('myCheckbox').checked = data.adsEnabled;
//         } catch (error) {
//             console.error('Error fetching ads status:', error);
//         }
//     }
// });




// Fetch the Ads status and Orientation when the branch changes

// document.getElementById('branch').addEventListener('change', async function() {
//     const selectedBranch = this.value;

//     if (selectedBranch) {
//         try {
//             const response = await fetch(`http://localhost:5000/get-ads-status?branchName=${selectedBranch}`);
//             const data = await response.json();

//             // Set the checkbox based on the ads status
//             document.getElementById('myCheckbox').checked = data.adsEnabled;

//             // Handle orientation if available
//             if (data.orientation) {
//                 console.log('Orientation:', data.orientation);
//                 // Use this value as needed, for example display it in a div
//                 document.getElementById('orientationDisplay').textContent = data.orientation;
//             } else {
//                 console.log('No orientation data available');
//                 // Optionally set a default message if orientation is null
//                 document.getElementById('orientationDisplay').textContent = 'Orientation data not available';
//             }

//         } catch (error) {
//             console.error('Error fetching ads status:', error);
//         }
//     }
// });







// Update the Ads status when the checkbox changes
document.getElementById('myCheckbox').addEventListener('change', async function() {
    const selectedBranch = document.getElementById('branch').value;
    const adsEnabled = this.checked;

    if (selectedBranch) {
        try {
            const response = await fetch('http://localhost:5000/update-ads-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    branchName: selectedBranch,
                    adsEnabled: adsEnabled
                })
            });

            const data = await response.json();
            console.log(data.message);
        } catch (error) {
            console.error('Error updating ads status:', error);
        }
    }
});









// Get the modal, button, and close elements
const adHideDurationModal = document.getElementById("adHideDurationModal");
const btn = document.getElementById("adHideDurationBtn");
const closeModal = document.getElementById("closeAdHideDurationModal");
const saveButton = document.getElementById("saveAdHideDuration");
const inputField = document.getElementById("adHideDuration");

// Open the modal when the button is clicked
btn.onclick = function() {
    adHideDurationModal.style.display = "block";
};

// Close the modal when the user clicks on the 'x'
closeModal.onclick = function() {
    adHideDurationModal.style.display = "none";
};

// Close the modal if the user clicks anywhere outside the modal
window.onclick = function(event) {
    if (event.target == adHideDurationModal) {
        adHideDurationModal.style.display = "none";
    }
};

saveButton.onclick = function() {
    const duration = inputField.value;
    if (duration) {
        console.log(`Ad Hide Duration: ${duration} seconds`);

        // Send the data to the server to update in the database
        fetch('http://localhost:5000/update-ad-hide-duration', {  // Ensure the correct path to your backend
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ duration })
        })
        .then(response => {
            // Check if the response is successful
            if (!response.ok) {
                throw new Error('Failed to update ad hide duration');
            }
            return response.json();
        })
        .then(data => {
            // Handle the successful response from the backend
            console.log("Ad hide duration updated successfully:", data);
            adHideDurationModal.style.display = "none"; // Close modal after saving
        })
        .catch(error => {
            // Handle any errors that occur during the fetch operation
            console.error("Error updating ad hide duration:", error);
        });
    } else {
        console.log("Please enter a valid duration.");
    }
};











// Trigger modal when the button is clicked
document.getElementById("adTransitionButton").addEventListener("click", function() {
    document.getElementById("AdTransitionSpeedModal").style.display = "flex";
  });
  
  // Convert seconds to milliseconds and send it to the server to update the database
  function convertToMilliseconds() {
    const input = document.getElementById("transitionSpeedInput").value;
    if (input) {
      const milliseconds = input * 1;
      console.log(`AdTransitionSpeed in milliseconds: ${milliseconds}`);
      updateDatabase(milliseconds);
      transitionCloseModal(); // Close the modal automatically after submitting
    } else {
      console.log("Please enter a valid number.");
    }
  }
  
  // Function to update the database with the new time interval
  function updateDatabase(milliseconds) {
    fetch('http://localhost:5000/update-time-interval', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ timeInterval: milliseconds })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log('Database updated successfully');
      } else {
        console.error('Failed to update the database');
      }
    })
    .catch(error => console.error('Error:', error));
  }
  
  // Close modal function with a new name
  function transitionCloseModal() {
    document.getElementById("AdTransitionSpeedModal").style.display = "none";
  }
  







   // Fetch the flow speed from the API and update the input value
   fetch('http://localhost:5000/get-interval')
   .then(response => response.json())
   .then(data => {
       console.log(data);  // Log the full response to check the structure
       const interval = data.interval;  // Use the 'interval' key as per your API response
       
       // Check if interval is available in the response
       if (interval !== undefined) {
           document.getElementById('transitionSpeed').value = interval / 1000; // Convert ms to seconds
       } else {
           console.error('Interval not found in the response');
       }
   })
   .catch(error => console.error('Error fetching flow speed:', error));






   fetch('http://localhost:5000/get-ad-timer')
   .then(response => response.json())
   .then(data => {
       console.log(data);  // Log response to confirm structure
       const timerDuration = data.timerDuration;  // Correct key as per API response
       
       // Check if timerDuration is available in the response
       if (timerDuration !== undefined) {
           document.getElementById('hideDuration').value = timerDuration / 1; // Convert to seconds
       } else {
           console.error('timerDuration not found in the response');
       }
   })
   .catch(error => console.error('Error fetching timer duration:', error));


   // Fetch the flow speed from the API and update the input value
   fetch('http://localhost:5000/get-timer-interval')
   .then(response => response.json())
   .then(data => {
       console.log(data);  // Log the full response to check the structure
       const interval = data.interval;  // Use the 'interval' key as per your API response
       
       // Check if interval is available in the response
       if (interval !== undefined) {
           document.getElementById('flowSpeed').value = interval / 1000; // Convert ms to seconds
       } else {
           console.error('Interval not found in the response');
       }
   })
   .catch(error => console.error('Error fetching flow speed:', error));










   document.getElementById("transitionSpeed").addEventListener("change", async function () {
    let timeInterval = this.value.trim();

    if (!timeInterval || isNaN(timeInterval) || timeInterval < 0) {
        showTemporaryMessage("Please enter a valid positive number for the transition speed.", "red");
        return;
    }

    timeInterval = parseFloat(timeInterval) * 1000; // Convert seconds to milliseconds

    try {
        const response = await fetch("http://localhost:5000/update-time-interval", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ timeInterval })
        });

        const result = await response.json();
        if (result.success) {
            showTemporaryMessage("Database updated successfully!", "green");
        } else {
            showTemporaryMessage("Error: " + result.message, "red");
        }
    } catch (error) {
        showTemporaryMessage("Failed to update database.", "red");
    }
});

// Function to show a temporary message
function showTemporaryMessage(message, bgColor) {
    const msgDiv = document.createElement("div");
    msgDiv.textContent = message;
    msgDiv.style.position = "fixed";
    msgDiv.style.top = "50%";
    msgDiv.style.left = "50%";
    msgDiv.style.transform = "translate(-50%, -50%)";
    msgDiv.style.backgroundColor = bgColor || "black";
    msgDiv.style.color = "white";
    msgDiv.style.padding = "10px 20px";
    msgDiv.style.borderRadius = "5px";
    msgDiv.style.fontSize = "16px";
    msgDiv.style.zIndex = "1000";
    document.body.appendChild(msgDiv);

    // Remove message after 4 seconds
    setTimeout(() => {
        msgDiv.remove();
    }, 4000);
}





document.getElementById("hideDuration").addEventListener("change", async function () {
    let duration = this.value.trim();

    if (!duration || isNaN(duration) || duration < 0) {
        showTemporaryMessage("Please enter a valid positive number for the hide duration.", "red");
        return;
    }

    duration = parseFloat(duration) * 1; // Convert seconds to milliseconds

    try {
        const response = await fetch("http://localhost:5000/update-ad-hide-duration", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ duration })
        });

        const result = await response.json();
        if (response.ok) {
            showTemporaryMessage("Ad hide duration updated successfully!", "green");
        } else {
            showTemporaryMessage("Error: " + result.message, "red");
        }
    } catch (error) {
        showTemporaryMessage("Failed to update database.", "red");
    }
});

// Function to show a temporary message
function showTemporaryMessage(message, bgColor) {
    const msgDiv = document.createElement("div");
    msgDiv.textContent = message;
    msgDiv.style.position = "fixed";
    msgDiv.style.top = "50%";
    msgDiv.style.left = "50%";
    msgDiv.style.transform = "translate(-50%, -50%)";
    msgDiv.style.backgroundColor = bgColor || "black";
    msgDiv.style.color = "white";
    msgDiv.style.padding = "10px 20px";
    msgDiv.style.borderRadius = "5px";
    msgDiv.style.fontSize = "16px";
    msgDiv.style.zIndex = "1000";
    document.body.appendChild(msgDiv);

    // Remove message after 4 seconds
    setTimeout(() => {
        msgDiv.remove();
    }, 4000);
}





document.getElementById("flowSpeed").addEventListener("change", async function () {
    let time = this.value.trim();

    if (!time || isNaN(time) || time < 0) {
        showTemporaryMessage("Please enter a valid positive number for the flow speed.", "red");
        return;
    }

    time = parseFloat(time) * 1000; // Convert seconds to milliseconds

    try {
        const response = await fetch("http://localhost:5000/update-time", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ time })
        });

        const result = await response.json();
        if (response.ok) {
            showTemporaryMessage("Exchange rate flow speed updated successfully!", "green");
        } else {
            showTemporaryMessage("Error: " + result.error, "red");
        }
    } catch (error) {
        console.error("Error updating flow speed:", error);
        showTemporaryMessage("Failed to update database.", "red");
    }
});

// Function to show a temporary message
function showTemporaryMessage(message, bgColor) {
    const msgDiv = document.createElement("div");
    msgDiv.textContent = message;
    msgDiv.style.position = "fixed";
    msgDiv.style.top = "50%";
    msgDiv.style.left = "50%";
    msgDiv.style.transform = "translate(-50%, -50%)";
    msgDiv.style.backgroundColor = bgColor || "black";
    msgDiv.style.color = "white";
    msgDiv.style.padding = "10px 20px";
    msgDiv.style.borderRadius = "5px";
    msgDiv.style.fontSize = "16px";
    msgDiv.style.zIndex = "1000";
    document.body.appendChild(msgDiv);

    // Remove message after 4 seconds
    setTimeout(() => {
        msgDiv.remove();
    }, 4000);
}







  function validateInput(input) {
    let value = input.value;

    // Remove any non-numeric characters (except the decimal point)
    value = value.replace(/[^0-9.]/g, '');

    // Check if it starts with more than one zero before the decimal
    if (/^0{2,}/.test(value)) {
        value = value.replace(/^0+/, '0');  // Keep only one zero before the decimal
    }

    // If the value has multiple decimals, remove extra decimals
    if ((value.match(/\./g) || []).length > 1) {
        value = value.replace(/\.+$/, '');  // Remove all decimals if more than one
    }

    // Update the input field with the validated value
    input.value = value;
}














// Get elements
const adsModal = document.getElementById("ads-modal");
const openAdsModalBtn = document.getElementById("ads-openModalBtn");
const closeAdsModal = document.querySelector(".ads-close");
const branchDropdown = document.getElementById("ads-branchDropdown");

// Get file input elements
const landscapeUpload = document.getElementById("ads-landscapeUpload");
const portraitUpload = document.getElementById("ads-portraitUpload");

// Get preview divs
const landscapePreview = document.getElementById("landscapePreview");
const portraitPreview = document.getElementById("portraitPreview");

// Open modal when button is clicked
openAdsModalBtn.addEventListener("click", () => {
  adsModal.style.display = "block";
  fetchBranches(); // Load dropdown values
});

// Close modal when (X) is clicked
closeAdsModal.addEventListener("click", () => {
  adsModal.style.display = "none";
});

// Close modal when clicking outside of modal
window.addEventListener("click", (event) => {
  if (event.target === adsModal) {
    adsModal.style.display = "none";
  }
});

// Fetch branches and populate dropdown
async function fetchBranches() {
    try {
      const response = await fetch("http://localhost:5000/branches");
      const branches = await response.json();
  
      console.log("Fetched Branches:", branches); // Debugging
  
      // Clear existing options
      branchDropdown.innerHTML = '<option value="">Select a branch</option>';
  
      // Populate dropdown using BRANCH_NAME where STATUS == '1'
      branches.forEach((branch) => {
        if (branch.BRANCH_NAME && branch.STATUS === '1') {
          const option = document.createElement("option");
          option.value = branch.BRANCH_NAME;
          option.textContent = branch.BRANCH_NAME;
          branchDropdown.appendChild(option);
        }
      });
  
      // Ensure the first option is selected
      branchDropdown.selectedIndex = 0;
  
    } catch (error) {
      console.error("Error fetching branches:", error);
      branchDropdown.innerHTML = '<option value="">Failed to load branches</option>';
    }
  }
  

// Event listener for dropdown selection change
branchDropdown.addEventListener("change", async () => {
  const selectedBranch = branchDropdown.value;
  if (selectedBranch) {
    console.log(`Branch selected from drop down: ${selectedBranch}`);

    // Send selected branch to backend dynamically (no hardcoding)
    try {
      const response = await fetch("http://localhost:5000/save-branch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ branchName: selectedBranch }),
      });

      if (response.ok) {
        console.log("Branch name sent to backend successfully");
        fetchBranchFiles(selectedBranch); // Fetch and display files when branch is selected
      } else {
        console.error("Failed to send branch name to backend");
      }
    } catch (error) {
      console.error("Error sending branch name to backend:", error);
    }
  }
});

// Fetch and display branch files (landscape/portrait)
async function fetchBranchFiles(branchName) {
  try {
    const response = await fetch(`http://localhost:5000/get-branch-files?branchName=${branchName}`);
    const data = await response.json();

    if (data.files && data.files.length > 0) {
      displayImages(data.files); // Display images only if files are found
    } else {
      // If no files found, clear the preview areas
      landscapePreview.innerHTML = '';
      portraitPreview.innerHTML = '';
      console.log("No files found for the selected branch.");
    }
  } catch (error) {
    console.error("Error fetching branch files:", error);
  }
}
async function displayImages(files) {
  landscapePreview.innerHTML = '';
  portraitPreview.innerHTML = '';

  for (const file of files) {
    const fileExt = file.name.split('.').pop().toLowerCase();

    const container = document.createElement('div');
    container.style.position = 'relative';
    container.style.display = 'inline-block';
    container.style.margin = '5px';

    // Function to determine preview section based on width/height
    function appendToCorrectPreview(width, height) {
      if ((width === 648 && height === 1152) || (width === 640 && height === 992)) {
        landscapePreview.appendChild(container);
      } else if ((width === 1400 && height === 200) || (width === 1400 && height === 210)) {
        portraitPreview.appendChild(container);
      } else {
        console.log(`Skipping file: ${file.name} (Dimensions: ${width}x${height})`);
      }
    }

    // For images / GIFs
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(fileExt)) {
      const img = new Image();
      img.src = `http://localhost:5000${file.link}`;
      img.alt = file.name;
      img.style.width = '100px';
      img.style.cursor = 'pointer';

      await new Promise((resolve) => {
        img.onload = () => {
          appendToCorrectPreview(img.width, img.height);
          container.appendChild(img);
          resolve();
        };
        img.onerror = () => {
          console.log(`Failed to load image: ${file.name}`);
          resolve();
        };
      });

      img.addEventListener('click', () => {
        openPreviewModal(img.src);
      });
    }

    // For videos
    else if (fileExt === 'mp4') {
      const video = document.createElement('video');
      video.src = `http://localhost:5000${file.link}`;
      video.controls = true;
      video.style.width = '150px';
      video.style.cursor = 'pointer';

      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          appendToCorrectPreview(video.videoWidth, video.videoHeight);
          container.appendChild(video);
          resolve();
        };
        video.onerror = () => {
          console.log(`Failed to load video: ${file.name}`);
          resolve();
        };
      });

      video.addEventListener('click', () => {
        openPreviewModal(video.src);
      });
    }

    // Unsupported file types
    else {
      console.log(`Unsupported file type: ${file.name}`);
      continue;
    }

    // Create delete button for both images and videos
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.style.position = 'absolute';
    deleteBtn.style.bottom = '5px';
    deleteBtn.style.right = '5px';
    deleteBtn.style.padding = '2px 5px';
    deleteBtn.style.backgroundColor = 'red';
    deleteBtn.style.fontSize = '15px';
    deleteBtn.style.cursor = 'pointer';

    deleteBtn.addEventListener('click', () => {
      showDeleteConfirmation(file, container);
    });

    container.appendChild(deleteBtn);
  }
}

// Delete confirmation dialog function (improved)
function showDeleteConfirmation(file, container) {
  // Remove existing confirmation if any
  const existingBox = document.getElementById('delete-confirmation-box');
  if (existingBox) existingBox.remove();

  const confirmationBox = document.createElement('div');
  confirmationBox.id = 'delete-confirmation-box';
  confirmationBox.innerHTML = `
    <p style="font-size: 16px; font-weight: bold; color: #333; margin-bottom: 10px;">
      ⚠️ Are you sure you want to delete <br> 
      <span style="color: #d9534f;">${file.name}</span>?
    </p>
  `;

  Object.assign(confirmationBox.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#fff',
    padding: '20px',
    border: '2px solid #d9534f',
    borderRadius: '10px',
    zIndex: '1000',
    boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
    textAlign: 'center',
    minWidth: '280px',
  });

  const yesButton = document.createElement('button');
  yesButton.textContent = 'Yes, Delete';
  Object.assign(yesButton.style, {
    backgroundColor: '#d9534f',
    color: '#fff',
    border: 'none',
    padding: '8px 15px',
    margin: '5px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: '0.3s ease',
  });
  yesButton.onmouseover = () => yesButton.style.backgroundColor = '#c9302c';
  yesButton.onmouseleave = () => yesButton.style.backgroundColor = '#d9534f';

  const noButton = document.createElement('button');
  noButton.textContent = 'Cancel';
  Object.assign(noButton.style, {
    backgroundColor: '#5bc0de',
    color: '#fff',
    border: 'none',
    padding: '8px 15px',
    margin: '5px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: '0.3s ease',
  });
  noButton.onmouseover = () => noButton.style.backgroundColor = '#31b0d5';
  noButton.onmouseleave = () => noButton.style.backgroundColor = '#5bc0de';

  yesButton.addEventListener('click', async () => {
    try {
      const success = await deleteImage(file.name, file.link);
      if (success) {
        container.remove();
        confirmationBox.remove();
      } else {
        alert('Failed to delete file. Please try again.');
      }
    } catch (err) {
      alert('Error occurred while deleting file.');
      console.error(err);
    }
  });

  noButton.addEventListener('click', () => {
    confirmationBox.remove();
  });

  confirmationBox.appendChild(yesButton);
  confirmationBox.appendChild(noButton);

  document.body.appendChild(confirmationBox);
}

// Function to delete image or video via API
async function deleteImage(fileName, filePath) {
  try {
    const response = await fetch('http://localhost:5000/delete-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName, filePath }),
    });

    if (response.ok) {
      console.log(`Deleted ${fileName} successfully`);
      return true;
    } else {
      console.error('Failed to delete file');
      return false;
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

// Modal preview function (image/video)
function openPreviewModal(src) {
  const modal = document.createElement('div');
  Object.assign(modal.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100vw',
    height: '100vh',
    background: 'rgba(0,0,0,0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '1000',
    cursor: 'pointer',
  });

  let previewElement;
  if (src.endsWith('.mp4')) {
    previewElement = document.createElement('video');
    previewElement.src = src;
    previewElement.controls = true;
    previewElement.autoplay = true;
  } else {
    previewElement = document.createElement('img');
    previewElement.src = src;
  }
  Object.assign(previewElement.style, {
    maxWidth: '90%',
    maxHeight: '90%',
    borderRadius: '10px',
    border: '5px solid white',
  });

  modal.addEventListener('click', () => {
    modal.remove();
  });

  modal.appendChild(previewElement);
  document.body.appendChild(modal);
}


// Function to handle file uploads with validation
// function handleFileUpload(fileInput, previewDiv, requiredWidth1, requiredHeight1, requiredWidth2, requiredHeight2) {
//     const file = fileInput.files[0];
//     if (!file) return;
  
//     const reader = new FileReader();
//     reader.onload = function (e) {
//       const imgElement = new Image();
//       imgElement.src = e.target.result;
  
//       imgElement.onload = function () {
//         // Check if image matches any of the required dimensions
//         if (
//           (imgElement.width === requiredWidth1 && imgElement.height === requiredHeight1) ||
//           (imgElement.width === requiredWidth2 && imgElement.height === requiredHeight2)
//         ) {
//           // Clear previous preview
//           previewDiv.innerHTML = "";
  
//           // Append valid image
//           previewDiv.appendChild(imgElement);
//           uploadFile(fileInput);
//         } else {
//           showTemporaryMessage(`Invalid image dimensions. Required: ${requiredWidth1}x${requiredHeight1} or ${requiredWidth2}x${requiredHeight2}`, "red");
//           fileInput.value = ""; // Reset file input
//         }
//       };
//     };
  
//     reader.readAsDataURL(file);
//   }


function handleFileUpload(fileInput, previewDiv, requiredWidth1, requiredHeight1, requiredWidth2, requiredHeight2) {
  const file = fileInput.files[0];
  if (!file) return;

  previewDiv.innerHTML = ""; // Clear previous preview

  // ✅ Handle images
  if (file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const imgElement = new Image();
      imgElement.src = e.target.result;

      imgElement.onload = function () {
        if (
          (imgElement.width === requiredWidth1 && imgElement.height === requiredHeight1) ||
          (imgElement.width === requiredWidth2 && imgElement.height === requiredHeight2)
        ) {
          previewDiv.appendChild(imgElement);
          uploadFile(fileInput);
        } else {
          showTemporaryMessage(`Invalid image dimensions. Required: ${requiredWidth1}x${requiredHeight1} or ${requiredWidth2}x${requiredHeight2}`, "red");
          fileInput.value = ""; // Reset input
        }
      };
    };
    reader.readAsDataURL(file);
  } 

  // ✅ Handle MP4 videos with dimension validation
  else if (file.type === "video/mp4") {
    const videoElement = document.createElement("video");
    videoElement.src = URL.createObjectURL(file);
    videoElement.controls = true;
    videoElement.style.maxWidth = "200px";

    videoElement.onloadedmetadata = function () {
      if (
        (videoElement.videoWidth === requiredWidth1 && videoElement.videoHeight === requiredHeight1) ||
        (videoElement.videoWidth === requiredWidth2 && videoElement.videoHeight === requiredHeight2)
      ) {
        previewDiv.appendChild(videoElement);
        uploadFile(fileInput);
      } else {
        showTemporaryMessage(`Invalid video dimensions. Required: ${requiredWidth1}x${requiredHeight1} or ${requiredWidth2}x${requiredHeight2}`, "red");
        fileInput.value = ""; // Reset input
      }
    };

    videoElement.onerror = function () {
      showTemporaryMessage(`Failed to load video: ${file.name}`, "red");
      fileInput.value = "";
    };
  } 

  // ❌ Unsupported file type
  else {
    showTemporaryMessage("Unsupported file type. Please upload PNG, JPEG images or MP4 videos.", "red");
    fileInput.value = ""; // Reset input
  }
}

// Function to show temporary messages
function showTemporaryMessage(message, bgColor) {
  const msgDiv = document.createElement("div");
  msgDiv.textContent = message;
  msgDiv.style.position = "fixed";
  msgDiv.style.top = "50%";
  msgDiv.style.left = "50%";
  msgDiv.style.transform = "translate(-50%, -50%)";
  msgDiv.style.backgroundColor = bgColor || "black";
  msgDiv.style.color = "white";
  msgDiv.style.padding = "10px 20px";
  msgDiv.style.borderRadius = "5px";
  msgDiv.style.fontSize = "16px";
  msgDiv.style.zIndex = "1000";
  document.body.appendChild(msgDiv);

  setTimeout(() => msgDiv.remove(), 3000);
}

// Function to upload the file
async function uploadFile(fileInput) {
  const file = fileInput.files[0];
  const branchName = branchDropdown.value;  
  if (!file) return alert("Please select a file");
  if (!branchName) return alert("Please select a branch");

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("http://localhost:5000/upload-file", {
      method: "POST",
      headers: { "branch-name": branchName },
      body: formData
    });

    if (response.ok) {
      const data = await response.json();
      console.log("File uploaded successfully:", data);
    } else {
      console.error("File upload failed");
    }
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}

// Add event listeners with dimension validation
landscapeUpload.addEventListener("change", () => 
  handleFileUpload(landscapeUpload, landscapePreview, 648, 1152, 640, 992)
);

portraitUpload.addEventListener("change", () => 
  handleFileUpload(portraitUpload, portraitPreview, 1400, 200, 1400, 200)
);
