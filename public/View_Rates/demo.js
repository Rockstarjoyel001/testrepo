// Fetch the branch name from local storage
const branchName = localStorage.getItem('branchName') || 'KARAMA'; // Default to 'Meydan' if no value is found

// Log the branch name
console.log(`Selected Branch: ${branchName}`);
if (branchName) {
    document.getElementById("branch-name-display").innerText = branchName;
} else {
    document.getElementById("branch-name-display").innerText = "Branch not found";
}

function saveOrder() {
    const rows = [...document.querySelectorAll('#country-rates-body tr')];
    const order = rows.map(row => row.getAttribute('data-index'));
    console.log('Saving order:', order);
    localStorage.setItem('countryRatesOrder', JSON.stringify(order));
}

function loadOrder() {
    const order = JSON.parse(localStorage.getItem('countryRatesOrder'));
    console.log('Loading order:', order);
    if (order) {
        const tableBody = document.getElementById('country-rates-body');
        const rows = [...document.querySelectorAll('#country-rates-body tr')];
        const orderedRows = order.map(index => rows.find(row => row.getAttribute('data-index') === index));
        orderedRows.forEach(row => {
            if (row) {
                tableBody.appendChild(row); // Reorder rows in table
            }
        });
    }
}










document.addEventListener("DOMContentLoaded", async function () {
    const branchName = localStorage.getItem("branchName");

    if (!branchName) return;

    try {
        const response = await fetch(`http://localhost:5000/get-files?branchName=${branchName}`);
        const data = await response.json();

        if (data.files) {
            console.log("Files:", data.files); // Handle UI display logic here
        }
    } catch (error) {
        console.error("Error fetching files:", error);
    }
});





document.addEventListener("DOMContentLoaded", function () {
    function fetchCountryRates() {
        const branchName = localStorage.getItem('branchName');
        if (!branchName) {
            console.error('Branch name is required in localStorage');
            return;
        }

        console.log('Selected Branch:', branchName);

        fetch("http://localhost:5000/selectedBranch", {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ branchName })
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.countries) {
                fetch("http://localhost:5000/country-rates")
                    .then((response) => response.json())
                    .then((ratesData) => {
                        const branchData = ratesData.filter(country => country.BranchName === branchName);

                        // Ensure 'Order' field is present for sorting (fallback to a default value)
                        branchData.forEach(country => {
                            if (country.Order === undefined) {
                                country.Order = 0; // Default value if 'Order' is missing
                            }
                        });

                        // Sort by 'Order' in ascending order
                        branchData.sort((a, b) => a.Order - b.Order);

                        const tableBody = document.getElementById("country-rates-body");

                        // Function to display all data if in portrait mode
                        function updateTableRow() {
                            // Clear the table body before updating
                            tableBody.innerHTML = '';

                            // Append all rows without chunking
                            branchData.forEach((country) => {
                                const row = document.createElement("tr");
                                row.classList.add("fade-in");
                                row.setAttribute("draggable", "true");

                                row.innerHTML = `
                                    <td><img src="${country.FlagUrl}" alt="${country.CountryName} Flag" class="flag" id="flag"> ${country.CountryName}
                                        ${country.CURRENCY_NAME_ARABIC && country.CURRENCY_NAME_ARABIC !== 'N/A' ? 
                                            `<span style="display: inline-flex; gap: 4px; align-items: center; font-size: 0.9em; color: #555;">
                                                <span style="white-space: nowrap; color: black;">
                                                    / <span style="direction: rtl; unicode-bidi: bidi-override; font-family: 'Tahoma', sans-serif;">
                                                        ${country.CURRENCY_NAME_ARABIC}
                                                    </span>
                                                </span>
                                            </span>` 
                                            : '' }
                                    </td>
                                    <td>${country.BuyRate}</td>
                                    <td>${country.SellRate}</td>
                                    <td>${country.TTRemittanceRate}</td>
                                `;
                                tableBody.appendChild(row);
                            });
                        }

                        // Check if the screen is in portrait mode
                        if (window.innerHeight > window.innerWidth) {
                            // Check if ads are enabled for the branch
                            fetch(`http://localhost:5000/check-ads?branchName=${branchName}`)
                                .then((response) => response.json())
                                .then((adsData) => {
                                    const adsEnabled = adsData.adsEnabled; // assuming response contains an 'adsEnabled' field

                                    if (adsEnabled) {
                                        // If ads are enabled, show rows in chunks (portrait mode)
                                        let currentIndex = 0;

                                        function updateChunkedTableRow() {
                                            const chunk = branchData.slice(currentIndex, currentIndex + 16); // Get the next 10 countries
                                            if (currentIndex + 16 >= branchData.length) {
                                                currentIndex = 0; // Reset index when we reach the end
                                            } else {
                                                currentIndex += 16; // Move the index for the next 10 countries
                                            }

                                            // Clear the table body before updating
                                            tableBody.innerHTML = '';

                                            // Append chunked rows
                                            chunk.forEach((country) => {
                                                const row = document.createElement("tr");
                                                row.classList.add("fade-in");
                                                row.setAttribute("draggable", "true");

                                                row.innerHTML = `
                                                  <td style="display: flex; align-items: center; gap: 60px; padding-left: 20px; border: 1px solid #dfdfdf; outline: none;">
                                                    <img src="${country.FlagUrl}" alt="${country.CountryName} Flag" class="flag">
                                                    <span style="font-weight: bold; text-align: left; display: block;">
                                                      ${country.CountryName}
                                                      ${country.CURRENCY_NAME_ARABIC && country.CURRENCY_NAME_ARABIC !== 'N/A' ? 
                                                          `<span style="display: inline-flex; gap: 4px; align-items: center; font-size: 0.9em; color: #555;">
                                                              <span style="white-space: nowrap; color: black;">
                                                                  / <span style="direction: rtl; unicode-bidi: bidi-override; font-family: 'Tahoma', sans-serif;">
                                                                      ${country.CURRENCY_NAME_ARABIC}
                                                                  </span>
                                                              </span>
                                                          </span>` 
                                                          : '' }
                                                    </span>
                                                  </td>
                                                  <td style="text-align: center; font-size: 45px">${country.BuyRate}</td>
                                                  <td style="text-align: center; font-size: 45px">${country.SellRate}</td>
                                                  <td style="text-align: center; font-size: 45px">${country.TTRemittanceRate}</td>
                                                `;
                                                tableBody.appendChild(row);
                                            });
                                        }

                                        // Initialize the table with the first set of data (10 rows)
                                        updateChunkedTableRow();

                                        // Fetch the timer interval from the server
                                        fetch("http://localhost:5000/get-timer-interval")
                                            .then((response) => response.json())
                                            .then((data) => {
                                                const interval = data.interval || 5000; // Fallback to 5000 if interval is missing
                                                console.log("Fetched interval:", interval); // Debug log to check the fetched value
                                                setInterval(updateChunkedTableRow, interval); // Update the rows every interval (from server)
                                            })
                                            .catch((error) => {
                                                console.error("Error fetching timer interval:", error);
                                                setInterval(updateChunkedTableRow, 5000); // Default to 5000ms if an error occurs
                                            });
                                    } else {
                                        // If ads are not enabled, show all rows without chunking
                                        updateTableRow();
                                    }
                                })
                                .catch((error) => {
                                    console.error("Error checking ads:", error);
                                    updateTableRow(); // Default to showing all rows without chunking if there is an error
                                });
                        } else {



                            // If in landscape mode, show rows in chunks (no changes)
                            let currentIndex = 0;

                            function updateChunkedTableRow() {
                                const chunk = branchData.slice(currentIndex, currentIndex + 10); // Get the next 10 countries
                                if (currentIndex + 10 >= branchData.length) {
                                    currentIndex = 0; // Reset index when we reach the end
                                } else {
                                    currentIndex += 10; // Move the index for the next 10 countries
                                }

                                // Clear the table body before updating
                                tableBody.innerHTML = '';

                                // Append chunked rows
                                chunk.forEach((country) => {
                                    const row = document.createElement("tr");
                                    row.classList.add("fade-in");
                                    row.setAttribute("draggable", "true");

                                    row.innerHTML = `
                                      <td style="display: flex; align-items: center; gap: 60px; padding-left: 20px; border: 1px solid #dfdfdf; outline: none;">
                                        <img src="${country.FlagUrl}" alt="${country.CountryName} Flag" class="flag">
                                        <span style="font-weight: bold; text-align: left; display: block;">
                                          ${country.CountryName}
                                          ${country.CURRENCY_NAME_ARABIC && country.CURRENCY_NAME_ARABIC !== 'N/A' ? 
                                              `<span style="display: inline-flex; gap: 4px; align-items: center; font-size: 0.9em; color: #555;">
                                                  <span style="white-space: nowrap; color: black;">
                                                      / <span style="direction: rtl; unicode-bidi: bidi-override; font-family: 'Tahoma', sans-serif;">
                                                          ${country.CURRENCY_NAME_ARABIC}
                                                      </span>
                                                  </span>
                                              </span>` 
                                              : '' }
                                        </span>
                                      </td>
                                      <td style="text-align: center; font-size: 45px">${country.BuyRate}</td>
                                      <td style="text-align: center; font-size: 45px">${country.SellRate}</td>
                                      <td style="text-align: center; font-size: 45px">${country.TTRemittanceRate}</td>
                                    `;
                                    tableBody.appendChild(row);
                                });
                            }

                            // Initialize the table with the first set of data (10 rows)
                            updateChunkedTableRow();

                            // Fetch the timer interval from the server
                            fetch("http://localhost:5000/get-timer-interval")
                                .then((response) => response.json())
                                .then((data) => {
                                    const interval = data.interval || 5000; // Fallback to 5000 if interval is missing
                                    console.log("Fetched interval:", interval); // Debug log to check the fetched value
                                    setInterval(updateChunkedTableRow, interval); // Update the rows every interval (from server)
                                })
                                .catch((error) => {
                                    console.error("Error fetching timer interval:", error);
                                    setInterval(updateChunkedTableRow, 5000); // Default to 5000ms if an error occurs
                                });
                        }
                    })
                    .catch((error) => {
                        console.error("Error fetching rates data:", error);
                    });
            } else {
                console.error('No countries found for this branch');
            }
        })
        .catch((error) => {
            console.error("Error fetching branch data:", error);
        });
    }

    fetchCountryRates(); 
});
















function enableRowReordering(tableBody) {
    tableBody.addEventListener('dragstart', (event) => {
        event.dataTransfer.setData('text/plain', event.target.getAttribute('data-index'));
    });

    tableBody.addEventListener('dragover', (event) => {
        event.preventDefault();
    });

    tableBody.addEventListener('drop', (event) => {
        event.preventDefault();
        const draggedIndex = event.dataTransfer.getData('text/plain');
        const target = event.target.closest('tr');
        const targetIndex = target.getAttribute('data-index');
        
        if (draggedIndex !== targetIndex) {
            const draggedRow = tableBody.querySelector(`tr[data-index="${draggedIndex}"]`);
            if (target.nextElementSibling) {
                tableBody.insertBefore(draggedRow, target.nextElementSibling);
            } else {
                tableBody.appendChild(draggedRow);
            }

            // Update row indices after dragging
            updateRowIndices(tableBody);

            // Save the new order after drop
            saveOrder();
        }
    });
}

function updateRowIndices(tableBody) {
    const rows = tableBody.querySelectorAll("tr");
    rows.forEach((row, index) => {
        row.setAttribute("data-index", index);
        const rankCell = row.querySelector("td:nth-child(7)"); // Assuming rank is in the 7th column
        if (rankCell) {
            rankCell.innerText = index + 1; // Update rank based on the position
        }
    });
}





document.addEventListener("DOMContentLoaded", function() {
    const currentDateElement = document.getElementById("currentDate");

    // Ensure the element exists before setting text content
    if (currentDateElement) {
        // Display current date in DD-MM-YYYY format
        const today = new Date();
        const formattedDate = today.toLocaleDateString("en-GB").replaceAll("/", "-");

        // Get the last saved date and time from localStorage
        const lastSavedTime = localStorage.getItem("lastSavedTime");

        if (lastSavedTime) {
            const savedDate = new Date(lastSavedTime);
            const formattedLastSavedTime = savedDate.toLocaleDateString("en-GB").replaceAll("/", "-");
            const formattedTime = savedDate.toLocaleTimeString("en-US", { hour: 'numeric', minute: 'numeric', hour12: true });

            // Combine current date and last saved time in a single text with breaks
            currentDateElement.innerHTML = `as on ${formattedLastSavedTime} | ${formattedTime}`;
            currentDateElement.style.fontSize = "15.8px";
        } else {
            // If no last saved time, show just the current date
            currentDateElement.innerHTML = `Updated as on: ${formattedDate}`;
        }

        // Check screen orientation and apply styles in portrait mode
        if (window.matchMedia("(orientation: portrait)").matches) {
            console.log("Portrait mode");

            // Apply styles in portrait mode
            currentDateElement.style.fontWeight = 'bold';
            currentDateElement.style.color = 'black';
            // Add any other styles you need here
            // Position the element at the bottom of the screen in portrait mode
            currentDateElement.style.position = 'fixed';
            currentDateElement.style.bottom = '20px';
            currentDateElement.style.left = '0';
            currentDateElement.style.width = '100%'; // To ensure it spans the full width of the screen
            currentDateElement.style.textAlign = 'center'; // Align text to the center
            currentDateElement.style.backgroundColor = 'lightblue'; // Set background color
            currentDateElement.style.borderRadius = '20px'; // Rounded edges for top and bottom
            
            

        } else {
            console.log("Landscape mode");

            // Optional: Reset styles if needed for landscape mode
            currentDateElement.style.fontWeight = 'bold';
            currentDateElement.style.color = 'black';
           
            currentDateElement.style.backgroundColor = 'lightblue'; // Set background color
            currentDateElement.style.borderRadius = '20px'; // Rounded edges for top and bottom


        }
    } else {
        console.error("Element with id 'currentDate' not found.");
    }
});




fetch('http://localhost:5000/marquee')
.then(response => response.json())
.then(data => {
    document.getElementById('marqueeText').innerHTML = data.marqueeText;
})
.catch(error => console.error('Error fetching marquee text:', error));










//    window.addEventListener('resize', function() {
//     if (window.innerWidth > window.innerHeight) {
//         console.log("Landscape mode");
//     } else {
//         console.log("Portrait mode");
//     }
// });
if (window.matchMedia("(orientation: portrait)").matches) {
    console.log("Portrait mode");
} else {
    console.log("Landscape mode");
}













// Function to retrieve and decode data from the URL and store it in localStorage
window.onload = function() {
    // Get query parameter from URL
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('data');  // Get the 'data' parameter
  
    if (encodedData) {
      // Decode the data and parse it back to JSON
      const decodedData = JSON.parse(decodeURIComponent(encodedData));
      
      console.log('Data received from URL:', decodedData);
    } else {
      console.log('No data found in the URL');
    }
  };

  

  


  // Function to load data from localStorage and populate the table
function loadDataFromLocalStorage() {
    const savedData = localStorage.getItem('exchangeRatesData');
  
    if (savedData) {
      const exchangeRatesData = JSON.parse(savedData);
      console.log(exchangeRatesData); // Now you can use the data
      // Populate your table with the retrieved data
      console.log('Data is present');
      console.log(exchangeRatesData);
    } else {
      console.log('No data found in local storage');
    }
  }
  
  // Call this function to load data when the page is loaded
  window.onload = function() {
    loadDataFromLocalStorage();
  };
  



  // JavaScript to dynamically set the height of the advertisement container
window.addEventListener('load', function() {
    const containerHeight = document.querySelector('.container').offsetHeight;
    const adContainer = document.querySelector('.advertisement-right');
    
    // Set the height of the advertisement container to match the main container
    adContainer.style.height = containerHeight + 'px';
});

// Re-adjust height on window resize
window.addEventListener('resize', function() {
    const containerHeight = document.querySelector('.container').offsetHeight;
    const adContainer = document.querySelector('.advertisement-right');
    
    adContainer.style.height = containerHeight + 'px';
});
async function populateBranches() {
    try {
        const response = await fetch('http://localhost:5000/api/branches');

        if (!response.ok) {
            console.error('Failed to fetch active branches');
            return;
        }

        const data = await response.json();
        console.log('Fetched Branch Data:', data); // Debugging log

        const branchSelect = document.getElementById('branchName');
        if (!branchSelect) {
            console.error("Dropdown not found!");
            return;
        }

        // Remove existing options
        branchSelect.innerHTML = '<option value="">Select Branch Name</option>';

        // Populate dropdown with fetched data
        data.forEach(branch => {
            const option = document.createElement('option');
            option.value = branch.BranchName;
            option.textContent = branch.BranchName;

            console.log("Adding option:", option); // Debugging log

            branchSelect.appendChild(option);
        });

        console.log('Dropdown updated successfully:', branchSelect.innerHTML);

    } catch (err) {
        console.error('Error fetching active branches:', err);
    }
}














let adsEnabled = false; // Default value
let adTimer = 10000; // Default 10 seconds (if API fails)

if (branchName) {
  fetch(`http://localhost:5000/check-ads?branchName=${encodeURIComponent(branchName)}`)
    .then(response => response.json())
    .then(data => {
      adsEnabled = data.adsEnabled;
      console.log(adsEnabled ? "✅ Ads are enabled for this branch." : "❌ Ads are not enabled for this branch.");

      // Fetch the ad timer duration from the API
      fetch("http://localhost:5000/get-ad-timer")
        .then(response => response.json())
        .then(timerData => {
          if (timerData.timerDuration) {
            adTimer = timerData.timerDuration * 1000; // Convert seconds to milliseconds
            console.log(`⏳ Timer set to: ${adTimer / 1000} seconds`);
          }














          
          const container = document.querySelector(".container");
          const companyInfo = document.querySelector(".company-info");
          const adDiv = document.getElementById("advertisement-right");
          const adBottom = document.getElementById("advertisement-bottom");
          const description = document.getElementById("branch-description");
          const countryratesbody = document.getElementById("country-rates-body");
          const title = document.getElementById(".title");
          const branchname = document.getElementById("branch-name-display");

          

 

          function toggleAdvertisement(show) {
            if (show) {
              adDiv.style.display = "block";
              adBottom.style.display = "none";  // Always hide bottom ad in landscape
              container.style.width = "92vw";
              companyInfo.style.marginRight = "350px";
              
              description.style.fontSize = "25px";
              
              console.log("📢 Ads are now visible.");
            } else {
              adDiv.style.display = "none";
              adBottom.style.display = "none";  // ✅ Ensure bottom ad is always hidden when toggled off
              container.style.width = "115vw";
              companyInfo.style.marginRight = "600px";
              
              description.style.fontSize = "25px";
              
              console.log("⏳ Ads hidden.");
            }
          }
          
          
         


          // Handle ads being disabled (landscape)
          if (!adsEnabled && window.innerHeight < window.innerWidth) {
            container.style.width = "117vw";
            adDiv.style.display = "none";
            adBottom.style.display = "none";  // ✅ Ensure bottom ad is hidden
            description.style.marginRight = "-100px";
            companyInfo.style.marginRight = "750px";
            
          }
          
          // Portrait Mode: Hide the bottom ad if ads are disabled
          if (!adsEnabled && window.innerHeight > window.innerWidth) {
            adDiv.style.display = "none";
            adBottom.style.display = "none";  // ✅ Ensure bottom ad is hidden in portrait
            console.log("📱 Ads hidden in portrait mode.");
          }
          
          // ✅ Update resize handler to hide bottom ad consistently
          window.addEventListener("resize", () => {
            if (window.innerWidth === 1768 && window.innerHeight === 992 && window.matchMedia("(orientation: landscape)").matches) {
              if (adsEnabled) {
                container.style.width = "92vw";
                companyInfo.style.marginRight = "450px";
              } else {
                container.style.width = "117vw";
                companyInfo.style.marginRight = "750px";
                adDiv.style.display = "none";
                adBottom.style.display = "none";  // ✅ Ensure bottom ad hidden here too
                container.style.Top = "50%";
              }
            } else {
              adDiv.style.display = "none";
              adBottom.style.display = "none";  // ✅ Hide bottom ad on other sizes as well
            }
          });
          

          if (adsEnabled == false && window.innerHeight > window.innerWidth) {
            
            container.style.height = "350vw";
          }





// Check if ads are enabled and the screen is in portrait mode with 992x1768 resolution
if (adsEnabled && window.innerWidth === 992 && window.innerHeight === 1768 && window.matchMedia("(orientation: portrait)").matches) {
    const container = document.querySelector(".container");
    const description = document.getElementById("branch-description");
    const adBottom = document.getElementById("advertisement-bottom");
    const bottomimg = document.getElementById("bottom-ad-image");
  
    // Adjust container and description positioning
    container.style.position = 'absolute';
    container.style.setProperty("marginTop", "-800px", "important");
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '90%';
    
    adBottom.style.height= "280px";
    bottomimg.style.height = "280px";
  
    description.style.marginTop = '-12px !important';  // Adjust the description margin top
    console.log("📱 Ads enabled in portrait mode at 992x1768, container adjusted to top.");
  }
  else if (!adsEnabled && window.innerWidth === 992 && window.innerHeight === 1768 && window.matchMedia("(orientation: portrait)").matches) {
    const container = document.querySelector(".container");
    const description = document.getElementById("branch-description");
    const companyLogo = document.getElementById("companyLogo");
    const adBottom = document.getElementById("advertisement-bottom");
    const companyInfo = document.getElementById("title");
    // Adjust container and description positioning when ads are not enabled
    


   
    console.log("📱 Ads not enabled in portrait mode, default container adjustments applied.");
}

































// Check for 1280x720 resolution in portrait mode
if (adsEnabled && window.innerWidth === 1920 && window.innerHeight === 1080 && window.matchMedia("(orientation: landscape)").matches) {
    const container = document.querySelector(".container");
    const description = document.getElementById("branch-description");
    const adBottom = document.getElementById("advertisement-bottom");
    const bottomimg = document.getElementById("bottom-ad-image");
    const companyLogo = document.getElementById("companyLogo");
    const header = document.getElementById("header");
    const title = document.getElementById("title");

    // Adjust container and description positioning when ads are enabled
    // container.style.setProperty("margin-top", "-50px", "important");
    // bottomimg.style.setProperty("display", "block", "important");
    // adBottom.style.setProperty("height", "390px", "important");
    // bottomimg.style.setProperty("height", "390px", "important");
    // adBottom.style.setProperty("margin-bottom", "10px", "important");
    
    description.style.setProperty("font-size", "30px", "important");

    
} else if (!adsEnabled && window.innerWidth === 1920 && window.innerHeight === 1080 && window.matchMedia("(orientation: landscape)").matches) {
    const container = document.querySelector(".container");
    const description = document.getElementById("branch-description");
    const companyLogo = document.getElementById("companyLogo");
    const adBottom = document.getElementById("advertisement-bottom");
    const header = document.getElementById("header");
    // Adjust container and description positioning when ads are not enabled
    // container.style.setProperty("margin-top", "-60px", "important");
   
     
 
    console.log("📱 Ads not enabled in portrait mode (1280x720), default container adjustments applied.");
}


















// Check if ads are enabled and the screen is in portrait mode with 768x1366 resolution
if (adsEnabled && window.innerWidth === 1280 && window.innerHeight === 768 && window.matchMedia("(orientation: landscape)").matches) {
    const container = document.querySelector(".container");
    const description = document.getElementById("branch-description");
    const adBottom = document.getElementById("advertisement-bottom");
    const bottomimg = document.getElementById("bottom-ad-image");
    const rates = document.getElementById("country-rates-body");
    // Adjust container and description positioning
    


    rates.style.setProperty("font-size", "5px", "important");

    
    // bottomimg.style.setProperty("height", "2px", "important");

    console.log("📱 Ads enabled in portrait mode, container adjusted to top.");
}





// Check if ads are enabled and the screen is in portrait mode with 768x1366 resolution
if (adsEnabled && window.innerWidth === 1280 && window.innerHeight === 768 && window.matchMedia("(orientation: landscape)").matches) {
    const container = document.querySelector(".container");
    const description = document.getElementById("branch-description");
    const adBottom = document.getElementById("advertisement-bottom");
    const bottomimg = document.getElementById("bottom-ad-image");
    const rates = document.getElementById("country-rates-body");
    const title = document.getElementById("title");
    // Adjust container and description positioning
    const header = document.getElementById("header");
    title.style.setProperty("font-size","26px", "important");
    console.log("📱 Ads enabled in portrait mode, container adjusted to top.");
} else if (!adsEnabled && window.innerWidth === 1280 && window.innerHeight === 768 && window.matchMedia("(orientation: landscape)").matches) {
    const container = document.querySelector(".container");
    const description = document.getElementById("branch-description");
    const header = document.getElementById("header");

    // Adjust container and description positioning when ads are not enabled
 
    console.log("📱 Ads not enabled in portrait mode, default container adjustments applied.");
}






// Check if ads are enabled and the screen is in portrait mode with 768x1366 resolution
if (adsEnabled && window.innerWidth === 1280 && window.innerHeight === 1024 && window.matchMedia("(orientation: landscape)").matches) {
    const container = document.querySelector(".container");
    const description = document.getElementById("branch-description");
    const adBottom = document.getElementById("advertisement-bottom");
    const bottomimg = document.getElementById("bottom-ad-image");
    const header = document.getElementById("header");
    const title = document.getElementById("title");
    const flag = document.getElementById("flag");
    const companyLogo = document.getElementById("companyLogo");
    // Adjust container and description positioning
    description.style.setProperty("top", "500px", "important");
    
    companyLogo.style.setProperty("height", "180px", "important");
  
    container.style.setProperty("height", "1100px", "important");
    container.style.setProperty("margin-top", "80px", "important");
    header.style.setProperty("height", "180px", "important");
    
    companyLogo.style.setProperty("width", "320px", "important");
    title.style.setProperty("font-size", "28px", "important");
     


 
     


    adBottom.style.height = "220px";
    // bottomimg.style.setProperty("height", "2px", "important");

    console.log("📱 Ads enabled in portrait mode, container adjusted to top.");
}











// Check if ads are enabled and the screen is in portrait mode with 768x1366 resolution
if (adsEnabled && window.innerWidth === 1400 && window.innerHeight === 1050 && window.matchMedia("(orientation: landscape)").matches) {
    const container = document.querySelector(".container");
    const description = document.getElementById("branch-description");
    const adBottom = document.getElementById("advertisement-bottom");
    const bottomimg = document.getElementById("bottom-ad-image");
    const rates = document.getElementById("country-rates-body");
    const companyLogo = document.getElementById("companyLogo");
    // Adjust container and description positioning
    const header = document.getElementById("header");
    const title = document.getElementById("title");
   
    companyInfo.style.setProperty("font-size", "30px", "important");
    title.style.setProperty("font-size", "46px", "important");

    console.log("📱 Ads enabled in portrait mode, container adjusted to top.");
} else if (!adsEnabled && window.innerWidth === 1400 && window.innerHeight === 1050 && window.matchMedia("(orientation: portrait)").matches) {
    const container = document.querySelector(".container");
    const description = document.getElementById("branch-description");
    const header = document.getElementById("header");

    // Adjust container and description positioning when ads are not enabled
    
    container.style.setProperty("margin-top", "80px", "important");
    header.style.setProperty("height", "270px", "important");
    description.style.setProperty("display", "none", "important");

    console.log("📱 Ads not enabled in portrait mode, default container adjustments applied.");
}



















// Check if ads are enabled and the screen is in portrait mode with 768x1366 resolution
if (adsEnabled && window.innerWidth === 1280 && window.innerHeight === 800 && window.matchMedia("(orientation: landscape)").matches) {
    const container = document.querySelector(".container");
    const description = document.getElementById("branch-description");
    const adBottom = document.getElementById("advertisement-bottom");
    const bottomimg = document.getElementById("bottom-ad-image");
    const rates = document.getElementById("country-rates-body");
    const companyLogo = document.getElementById("companyLogo");
    // Adjust container and description positioning
    const header = document.getElementById("header");
    const title = document.getElementById("title");
   
  
    title.style.setProperty("font-size", "21px", "important");

    console.log("📱 Ads enabled in portrait mode, container adjusted to top.");
} else if (!adsEnabled && window.innerWidth === 800 && window.innerHeight === 1280 && window.matchMedia("(orientation: portrait)").matches) {
    const container = document.querySelector(".container");
    const description = document.getElementById("branch-description");
    const header = document.getElementById("header");

    // Adjust container and description positioning when ads are not enabled
    
    container.style.setProperty("margin-top", "80px", "important");
    header.style.setProperty("height", "270px", "important");
    description.style.setProperty("display", "none", "important");

    console.log("📱 Ads not enabled in portrait mode, default container adjustments applied.");
}










if (adsEnabled && window.innerWidth === 1080 && window.innerHeight === 1920 && window.matchMedia("(orientation: portrait)").matches) {
  container.style.marginTop = "-300px"; // Move container to top
  description.style.marginTop = "50px";
  console.log("📱 Container moved to top (-300px) as ads are enabled in portrait mode (1080x1920).");
}


          // Handle ads being disabled
          if (adsEnabled == false && window.innerHeight < window.innerWidth) {
            container.style.width = "117vw";
            adDiv.style.display = "none";
            description.style.marginRight = "-1px";
            companyInfo.style.marginRight = "650px";
            description.style.marginTop = "-30px";
            adBottom.style.display = "none";  // Hide bottom ad when ads are disabled
          }

          // Portrait Mode: Hide the bottom ad if ads are disabled
          if (adsEnabled == false && window.innerHeight > window.innerWidth) {
            adDiv.style.display = "none";
            adBottom.style.display = "none";  // Hide bottom ad in portrait if ads disabled
            console.log("📱 Ads hidden in portrait mode.");
          }

          function startAdLoop() {
            if (adsEnabled && window.matchMedia("(orientation: landscape)").matches) {
              function loopAds(show) {
                toggleAdvertisement(show);
                console.log(show ? `📢 Ads visible for ${adTimer / 1000} seconds` : `⏳ Ads hidden for ${adTimer / 1000} seconds`);

                setTimeout(() => {
                  loopAds(!show); // Toggle state after `adTimer` milliseconds
                }, adTimer);
              }

              loopAds(false); // Start with ads hidden
            }
          }

          // Initial check & start the ad loop
          startAdLoop();

          // Handle screen resize events
          window.addEventListener("resize", () => {
            // Check if it's the specific screen size of 1768 x 992 in landscape mode
            if (window.innerWidth === 1768 && window.innerHeight === 992 && window.matchMedia("(orientation: landscape)").matches) {
              if (adsEnabled) {
                container.style.width = "92vw"; // Apply custom styling when ads are enabled
                companyInfo.style.marginRight = "450px";
              } else {
                container.style.width = "117vw"; // Apply custom styling when ads are disabled
                companyInfo.style.marginRight = "750px";
                adDiv.style.display = "none";
                adBottom.style.display = "none"
                container.style.Top = "50%";
              }
            } else {
              adDiv.style.display = "none"; 
                   }
          });
        })
        .catch(error => console.error("Error fetching timer duration:", error));
    })
    .catch(error => console.error("Error fetching ads status:", error));
} else {
  console.error("Branch name not found in local storage!");
}








// Function to adjust container position in landscape mode for screen size 1768x992
function adjustContainerPosition() {
    const container = document.querySelector(".container");


    if (window.innerWidth > window.innerHeight && window.innerWidth === 1920 && window.innerHeight === 1080) {
        // Move the container a little down from the top (adjust the value as needed)
        container.style.marginTop = "200px"; // You can adjust this value
    }


    // Check if in landscape mode and screen size is 1768x992
    if (window.innerWidth > window.innerHeight && window.innerWidth === 1768 && window.innerHeight === 992) {
        // Move the container a little down from the top (adjust the value as needed)
        container.style.marginTop = "90px"; // You can adjust this value
    } else {
        // Reset the marginTop if the conditions are not met
        container.style.marginTop = "0";
    }


    
}

// Initial check
adjustContainerPosition();

// Listen for resize event to handle screen size and orientation changes
window.addEventListener("resize", adjustContainerPosition);











function adjustResponsiveLayout() {
    var screenWidth = window.innerWidth;
    var title = document.getElementById('title');
    var description = document.getElementById('branch-description');
    var container = document.getElementById('container');

    // For screen width up to 1366px
    if (screenWidth <= 1366) {
        title.style.fontSize = "60px"; // Increase font size for smaller screens
        title.style.marginTop = "50px"; // Adjust top margin
        container.style.width = "100%"; // Set container width to 90% for smaller screens
        container.style.textAlign = "left"; // Align text to the left

        // Move the content slightly to the right by adding left padding or margin
        title.style.paddingLeft = "10px"; // Slightly move the title to the right
        description.style.paddingLeft = "10px"; // Slightly move the description to the right

        description.style.fontSize = "30px"; // Decrease font size for better readability
        description.style.lineHeight = "1.4"; // Adjust line height
    } 
    // For screen width up to 768px (more mobile-friendly)
    else if (screenWidth <= 768) {
        title.style.fontSize = "1.8em"; // Decrease font size further
        title.style.marginTop = "20px"; // Adjust margin
        container.style.width = "100%"; // Set container width to 95% for mobile screens
        container.style.textAlign = "left"; // Align text to the left

        // Move the content slightly to the right
        title.style.paddingLeft = "10px"; // Slightly move the title to the right
        description.style.paddingLeft = "10px"; // Slightly move the description to the right
        

        description.style.fontSize = "1em"; // Further decrease font size
        description.style.lineHeight = "1.3"; // Adjust line height for mobile
    } 



     // For screen width up to 1440px x 900px (adjustments for mid-size screens)
     else if (screenWidth <= 1440) {
        title.style.fontSize = "21px"; // Set a medium font size for 1440px width screens
        title.style.marginTop = "70px"; // Adjust top margin
        container.style.width = "85%"; // Set container width to 85% for 1440px width screens
        container.style.marginTop = "100px"; // Align text to the left

        // Slightly move content to the right
        title.style.paddingLeft = "8%"; // Move title slightly to the right
        description.style.paddingLeft = "8%"; // Move description slightly to the right

        description.style.fontSize = "20px"; // Set a larger font size for the description
        description.style.lineHeight = "1.5"; // Adjust line height for better readability
    } 





    // For larger screens (greater than 1366px)
    else {
    
        
    }
}

// Call the function to apply initial responsiveness
adjustResponsiveLayout();

// Listen for window resize events to adjust the layout dynamically
window.onresize = function() {
    adjustResponsiveLayout();
};










document.addEventListener("DOMContentLoaded", function () {
    if (window.innerWidth < window.innerHeight) { // Checks if the device is in portrait mode
        let thElements = document.querySelectorAll("th"); // Select all <th> elements

        thElements.forEach((th, index) => {
            if (th.textContent.trim().toUpperCase() === "CURRENCY") {
                th.style.width = "3500px";
                th.style.textAlign = "center";
                

                // Select the td elements in the same column as the current th
              
            }
        });
    }
});




let lastOrientation = window.innerWidth < window.innerHeight ? "portrait" : "landscape";

window.addEventListener('resize', function() {
    let currentOrientation = window.innerWidth < window.innerHeight ? "portrait" : "landscape";

    if (currentOrientation !== lastOrientation) {
        // The orientation has changed
        location.reload(); // Reload the page
        lastOrientation = currentOrientation; // Update the last orientation to the current one
    }
});











