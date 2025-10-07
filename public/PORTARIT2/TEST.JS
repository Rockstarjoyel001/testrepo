

// const branchName = localStorage.getItem("branchName") || "KARAMA";
// // Fetch the interval first
// fetch('http://localhost:5000/get-interval')
//   .then(res => res.json())
//   .then(intervalData => {
//     const intervalTime = parseInt(intervalData.interval); // Example response: { "interval": 3000 }

//     if (isNaN(intervalTime) || intervalTime <= 0) {
//       throw new Error('Invalid interval received from server');
//     }

//     // Fetch files based on branch name
//     fetch(`http://localhost:5000/get-files?branchName=${branchName}`)
//       .then(response => {
//         if (!response.ok) {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         return response.json();
//       })
//       .then(data => {
//         console.log('Fetched data:', data);

//         const adSection = document.querySelector('.ad-section');
        
//         if (!adSection) {
//           console.error('The ad-section is not available in the DOM!');
//           return;
//         }

//         // Check if files are available in the response
//         if (data && Array.isArray(data.files) && data.files.length > 0) {
//           let currentImageIndex = 0;

//           // Function to check and log image dimensions
//           function checkImageDimensions(imgSrc, callback) {
//             const img = new Image();
//             img.onload = function () {
//               console.log(`Image loaded: ${imgSrc}`);
//               console.log(`Dimensions: ${img.width}x${img.height}`);
              
//               // If the image matches the required dimensions (1400x200), call the callback
//               if (img.width === 1400 && img.height === 200) {
//                 callback(true);
//               } else {
//                 callback(false);
//               }
//             };
//             img.onerror = function () {
//               console.error(`Error loading image: ${imgSrc}`);
//               callback(false);
//             };
//             img.src = imgSrc;
//           }

//           function replaceImage() {
//             const fileUrl = data.files[currentImageIndex];
//             const img = document.querySelector('.ad-section img');

//             console.log(`Attempting to load image: ${fileUrl}`);

//             checkImageDimensions(fileUrl, function(isValid) {
//               if (isValid) {
//                 img.src = fileUrl;
//                 img.alt = 'Advertisement Image';

//                 img.onload = () => {
//                   console.log(`Image loaded successfully: ${fileUrl}`);
//                 };
//                 img.onerror = (error) => {
//                   console.error(`Error loading image: ${fileUrl}`, error);
//                 };
//               } else {
//                 console.warn(`Skipping image: ${fileUrl}, invalid dimensions`);
//               }

//               // Move to the next image index after the interval
//               currentImageIndex++;

//               // If we've reached the end of the list, start from the first image immediately
//               if (currentImageIndex >= data.files.length) {
//                 currentImageIndex = 0;
//               }

//               setTimeout(replaceImage, intervalTime); // Set interval for the next image
//             });
//           }

//           // Start showing the images one by one
//           replaceImage();
//         } else {
//           adSection.innerHTML = 'No files available for this branch.';
//         }
//       })
//       .catch(error => {
//         console.error('Error fetching files:', error);
//         const adSection = document.querySelector('.ad-section');
//         if (adSection) {
//           adSection.textContent = 'Failed to load files.';
//         }
//       });
//   })
//   .catch(err => {
//     console.error('Error fetching interval:', err);
//   });


const branchName = localStorage.getItem("branchName") || "KARAMA";

// Fetch the interval first
fetch('http://localhost:5000/get-interval')
  .then(res => res.json())
  .then(intervalData => {
    const intervalTime = parseInt(intervalData.interval);

    if (isNaN(intervalTime) || intervalTime <= 0) {
      throw new Error('Invalid interval received from server');
    }

    // Fetch files based on branch name
    fetch(`http://localhost:5000/get-files?branchName=${branchName}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const adSection = document.querySelector('.ad-section');
        if (!adSection) {
          console.error('The ad-section is not available in the DOM!');
          return;
        }

        if (data && Array.isArray(data.files) && data.files.length > 0) {
          let currentIndex = 0;

          function replaceMedia() {
            const fileUrl = data.files[currentIndex];
            const fileExt = fileUrl.split('.').pop().toLowerCase();

            // Create a temporary container
            const newContent = document.createElement('div');

            // ✅ Images / GIFs → only if 1400x200
            if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExt)) {
              const img = new Image();
              img.src = fileUrl;
              img.alt = 'Advertisement Image';
              img.style.maxWidth = '100%';

              img.onload = () => {
                if (img.width === 1400 && img.height === 200) {
                  console.log(`Displaying image: ${fileUrl} (${img.width}x${img.height})`);
                  newContent.appendChild(img);
                  adSection.innerHTML = '';           // clear only now
                  adSection.appendChild(newContent);  // swap in
                } else {
                  console.warn(`Skipping image: ${fileUrl} (${img.width}x${img.height})`);
                }
              };

              img.onerror = () => {
                console.error(`Error loading image: ${fileUrl}`);
              };
            }

            // ✅ Videos → only if 1400x200
            else if (fileExt === 'mp4') {
              const video = document.createElement('video');
              video.src = fileUrl;
              video.controls = false;
              video.autoplay = true;
              video.loop = true;
              video.muted = true;
              video.style.maxWidth = '100%';

              video.onloadedmetadata = () => {
                if (video.videoWidth === 1400 && video.videoHeight === 200) {
                  console.log(`Displaying video: ${fileUrl} (${video.videoWidth}x${video.videoHeight})`);
                  newContent.appendChild(video);
                  adSection.innerHTML = '';           // clear only now
                  adSection.appendChild(newContent);  // swap in
                } else {
                  console.warn(`Skipping video: ${fileUrl} (${video.videoWidth}x${video.videoHeight})`);
                }
              };

              video.onerror = () => {
                console.error(`Error loading video: ${fileUrl}`);
              };
            }

            else {
              console.warn(`Unsupported file type: ${fileUrl}`);
            }

            // Move to next file
            currentIndex = (currentIndex + 1) % data.files.length;
            setTimeout(replaceMedia, intervalTime);
          }

          replaceMedia();
        } else {
          adSection.innerHTML = 'No files available for this branch.';
        }
      })
      .catch(error => {
        console.error('Error fetching files:', error);
        const adSection = document.querySelector('.ad-section');
        if (adSection) {
          adSection.textContent = 'Failed to load files.';
        }
      });
  })
  .catch(err => {
    console.error('Error fetching interval:', err);
  });


  let adsEnabled = false;
  let adCurrentlyVisible = false;
  let branchData = [];
  let currentIndex = 0;
  let tableBody = document.getElementById("country-rates-body");
  let displayInterval = 3000;
  
  function showAd() {
    const adSection = document.querySelector('.ad-section');
    const table = document.querySelector('table');
    adSection.style.display = 'flex';
    table.style.marginBottom = '40px';
    adCurrentlyVisible = true;
    refreshChunkDisplay(); // refresh display when ads show
  }
  
  function hideAd() {
    const adSection = document.querySelector('.ad-section');
    const table = document.querySelector('table');
    adSection.style.display = 'none';
    table.style.marginBottom = '0';
    adCurrentlyVisible = false;
    refreshChunkDisplay(); // refresh display when ads hide
  }
  
  function getChunkSize(width, height) {
    const isAdVisible = adsEnabled && adCurrentlyVisible;
  
    if (width <= 720 && height <= 480) return isAdVisible ? 3 : 8;
    if (width <= 800 && height <= 600) return isAdVisible ? 2 : 5;
    if (width <= 1024 && height <= 768) return isAdVisible ? 5 : 7;
    if (width <= 1152 && height <= 864) return isAdVisible ? 7 : 9;
    if (width <= 1176 && height <= 664) return isAdVisible ? 8 : 10;
    if (width <= 1280 && height <= 720) return isAdVisible ? 9 : 11;
    if (width <= 1280 && height <= 768) return isAdVisible ? 9 : 11;
    if (width <= 1280 && height <= 800) return isAdVisible ? 9 : 11;
    if (width <= 1280 && height <= 960) return isAdVisible ? 9 : 11;
    if (width <= 1280 && height <= 1024) return isAdVisible ? 9 : 12;
    if (width <= 1360 && height <= 768) return isAdVisible ? 8 : 9;
    if (width <= 1366 && height <= 768) return isAdVisible ? 8 : 9;
    if (width <= 1400 && height <= 1050) return isAdVisible ? 8 : 10;
    if (width <= 1440 && height <= 900) return isAdVisible ? 8 : 10;
    if (width <= 1600 && height <= 900) return isAdVisible ? 10 : 12;
    if (width <= 1600 && height <= 1024) return isAdVisible ? 10 : 12;
    if (width <= 1680 && height <= 1050) return isAdVisible ? 11 : 13;
    if (width <= 1768 && height <= 992) return isAdVisible ? 12 : 13;
    if (width <= 1920 && height <= 1080) return isAdVisible ? 13 : 15;
    if (width <= 2560 && height <= 1440) return isAdVisible ? 9 : 11;
    if (width <= 3840 && height <= 2160) return isAdVisible ? 10 : 12;
  
    return isAdVisible ? 13 : 6;
  }
  
  function createRow(country) {
    const row = document.createElement("tr");
  
    const flag = document.createElement("img");
    flag.src = country.FlagUrl;
    flag.alt = `${country.CountryName} Flag`;
    flag.classList.add("flag");
  
    row.innerHTML = `
      <td class="country-data">
        ${flag.outerHTML}
        <span class="country-name">
          ${country.CountryName}
          ${country.CURRENCY_NAME_ARABIC && country.CURRENCY_NAME_ARABIC !== 'N/A' ? `
            <span class="currency-arabic">
              / <span class="arabic-text">${country.CURRENCY_NAME_ARABIC}</span>
            </span>` : ''}
        </span>
      </td>
      <td>${country.BuyRate || ''}</td>
      <td>${country.SellRate || ''}</td>
      <td>${country.TTRemittanceRate || ''}</td>
    `;
    return row;
  }
  
  function refreshChunkDisplay() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const chunkSize = getChunkSize(width, height);
  
    if (!branchData.length) return;
  
    currentIndex = 0;
    tableBody.innerHTML = "";
  
    for (let i = 0; i < chunkSize; i++) {
      const index = (currentIndex + i) % branchData.length;
      const row = createRow(branchData[index]);
      tableBody.appendChild(row);
    }
  
    currentIndex = (currentIndex + chunkSize) % branchData.length;
  }
  
  function rotateRows() {
    const nextData = branchData[currentIndex];
    currentIndex = (currentIndex + 1) % branchData.length;
  
    if (tableBody.rows.length > 0) {
      tableBody.deleteRow(0); // Remove top row
    }
  
    const newRow = createRow(nextData); // Add new row
    tableBody.appendChild(newRow);
  
    setTimeout(rotateRows, displayInterval);
  }
  
  // Get ad timer and branch details
  fetch('http://localhost:5000/get-ad-timer')
    .then(response => response.json())
    .then(timerData => {
      const interval = (timerData.timerDuration || 2) * 1000;
  
      fetch('http://localhost:5000/branches')
        .then(response => response.json())
        .then(branches => {
          const branch = branches.find(
            b => b.BRANCH_NAME === branchName && b.STATUS === "1"
          );
  
          if (branch && branch.Ads === "Enabled") {
            adsEnabled = true;
  
            function startAdCycle() {
              showAd();
              setTimeout(() => {
                hideAd();
                setTimeout(startAdCycle, interval);
              }, interval);
            }
  
            startAdCycle();
          } else {
            adsEnabled = false;
            hideAd();
          }
        })
        .catch(error => {
          console.error('Error fetching branch data:', error);
          hideAd();
        });
    })
    .catch(error => {
      console.error('Error fetching timer:', error);
      const fallbackInterval = 2000;
  
      function startAdCycle() {
        showAd();
        setTimeout(() => {
          hideAd();
          setTimeout(startAdCycle, fallbackInterval);
        }, fallbackInterval);
      }
  
      startAdCycle();
    });
  
  // Load rates and start display
  Promise.all([
    fetch("http://localhost:5000/get-timer-interval").then(res => res.json()),
    fetch("http://localhost:5000/branches").then(res => res.json())
  ])
    .then(([timerData, branchesData]) => {
      displayInterval = parseInt(timerData.interval) || 3000; // fallback to 3000 if parsing fails
  
      const branch = branchesData.find(
        b => b.BRANCH_NAME === branchName && b.STATUS === "1"
      );
  
      if (branch && branch.Ads === "Enabled") {
        adsEnabled = true;
      }
  
      return fetch("http://localhost:5000/country-rates")
        .then(response => {
          if (!response.ok) throw new Error("Network response was not ok");
          return response.json();
        })
        .then(ratesData => {
          branchData = ratesData
            .filter(country => country.BranchName === branchName)
            .map(country => ({
              ...country,
              Order: country.Order !== undefined ? country.Order : 0
            }))
            .sort((a, b) => a.Order - b.Order);
  
          refreshChunkDisplay();
          setTimeout(rotateRows, displayInterval);
        });
    })
    .catch(error => {
      console.error("Error:", error);
    });
  



//       // Define smart chunk size logic using ranges
// function getChunkSize(width, height, adsEnabled) {
//   if (width <= 800 && height <= 600) return adsEnabled ? 2 : 5;
//   if (width <= 1024 && height <= 768) return adsEnabled ? 5 : 7;
//   if (width <= 1152 && height <= 864) return adsEnabled ? 7 : 9;
//   if (width <= 1176 && height <= 664) return adsEnabled ? 8 : 10;
//   if (width <= 1280 && height <= 720) return adsEnabled ? 9 : 11;
//   if (width <= 1280 && height <= 768) return adsEnabled ? 9 : 11;
//   if (width <= 1280 && height <= 800) return adsEnabled ? 9 : 11;
//   if (width <= 1280 && height <= 960) return adsEnabled ? 9 : 11;
//   if (width <= 1280 && height <= 1024) return adsEnabled ? 9 : 12;
//   if (width <= 1360 && height <= 768) return adsEnabled ? 7 : 9;
//   if (width <= 1366 && height <= 768) return adsEnabled ? 7 : 9;
//   if (width <= 1400 && height <= 1050) return adsEnabled ? 8 : 10;
//   if (width <= 1440 && height <= 900) return adsEnabled ? 8 : 10;
//   if (width <= 1600 && height <= 900) return adsEnabled ? 10 : 12;
//   if (width <= 1600 && height <= 1024) return adsEnabled ? 10 : 12;
//   if (width <= 1680 && height <= 1050) return adsEnabled ? 11 : 13;
//   if (width <= 1768 && height <= 992) return adsEnabled ? 12 : 13;
//   if (width <= 1920 && height <= 1080) return adsEnabled ? 13 : 15;
//   if (width <= 2560 && height <= 1440) return adsEnabled ? 9 : 11;

//   // Default fallback
//   return adsEnabled ? 13 : 6;
// }

// // Fetch timer and branches together
// Promise.all([
//   fetch("http://localhost:5000/get-timer-interval").then(res => res.json()),
//   fetch("http://localhost:5000/branches").then(res => res.json())
// ])
//   .then(([timerData, branchesData]) => {
//     const displayInterval = parseInt(timerData.interval) || 2000;

//     // Find the branch
//     const branch = branchesData.find(
//       b => b.BRANCH_NAME === branchName && b.STATUS === "1"
//     );

//     const adsEnabled = branch && branch.Ads === "Enabled";

//     const width = window.innerWidth;
//     const height = window.innerHeight;
//     const chunkSize = getChunkSize(width, height, adsEnabled);

//     console.log(`Screen: ${width}x${height} | Ads Enabled: ${adsEnabled} | Chunk Size: ${chunkSize}`);

//     // Now fetch country rates
//     return fetch("http://localhost:5000/country-rates")
//       .then(response => {
//         if (!response.ok) throw new Error("Network response was not ok");
//         return response.json();
//       })
//       .then(ratesData => {
//         const branchData = ratesData
//           .filter(country => country.BranchName === branchName)
//           .map(country => ({
//             ...country,
//             Order: country.Order !== undefined ? country.Order : 0
//           }))
//           .sort((a, b) => a.Order - b.Order);

//         const tableBody = document.getElementById("country-rates-body");
//         let currentIndex = 0;

//         function displayNextChunk() {
//           tableBody.innerHTML = "";

//           const chunk = branchData.slice(currentIndex, currentIndex + chunkSize);

//           chunk.forEach(country => {
//             const row = document.createElement("tr");

//             const flag = document.createElement("img");
//             flag.src = country.FlagUrl;
//             flag.alt = `${country.CountryName} Flag`;
//             flag.classList.add("flag");

//             row.innerHTML = `
//               <td class="country-data">
//                 ${flag.outerHTML}
//                 <span class="country-name">
//                   ${country.CountryName}
//                   ${country.CURRENCY_NAME_ARABIC && country.CURRENCY_NAME_ARABIC !== 'N/A' ? `
//                     <span class="currency-arabic">
//                       / <span class="arabic-text">${country.CURRENCY_NAME_ARABIC}</span>
//                     </span>` : ''}
//                 </span>
//               </td>
//               <td>${country.BuyRate || ''}</td>
//               <td>${country.SellRate || ''}</td>
//               <td>${country.TTRemittanceRate || ''}</td>
//             `;

//             tableBody.appendChild(row);
//           });

//           currentIndex += chunkSize;
//           if (currentIndex >= branchData.length) {
//             currentIndex = 0;
//           }

//           setTimeout(displayNextChunk, displayInterval);
//         }

//         displayNextChunk();
//       });
//   })
//   .catch(error => {
//     console.error("Error:", error);
//   });




















  



    // Fetch marquee text from backend
fetch('http://localhost:5000/marquee')
.then(response => response.json())
.then(data => {
  document.getElementById('marqueeText').innerHTML = data.marqueeText;
})
.catch(error => {
  console.error('Error fetching marquee text:', error);
  document.getElementById('marqueeText').innerHTML =
    '⚠️ Rates are subject to change without prior notice. Please confirm with branch staff before proceeding with any transactions. ⚠️';
});

// Detect screen orientation
window.addEventListener('resize', function () {
if (window.innerWidth > window.innerHeight) {
  console.log("Landscape mode");
} else {
  console.log("Portrait mode");
}
});
