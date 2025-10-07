const branchName = localStorage.getItem('branchName') || 'Dubai Mall';
document.getElementById('branchDisplay').textContent = ` ${branchName}  BRANCH`;

const now = new Date();
const options = {
  // weekday: 'short',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  hour12: true
};
document.getElementById('datetime').textContent = now.toLocaleString('en-US', options);

// Function to load currency rates for KARAMA branch
async function loadCurrencyRates() {
  try {
    const response = await fetch('http://localhost:5000/country-rates');
    const data = await response.json();

    const tableBody = document.getElementById('currencyRateTable').getElementsByTagName('tbody')[0];
    let tickerText = '';

    // Filter data for KARAMA branch
    const branchName = localStorage.getItem('branchName');
    const karamaData = data.filter(item => item.BranchName === branchName);

    // const  = data.filter(item => item.BranchName === 'SATWA');

    // Dynamically set chunk size based on screen resolution
    let chunkSize = 13; // default
    const width = window.innerWidth;
    const height = window.innerHeight;

    if (width === 1280 && height === 720) chunkSize = 7;

    else if (width === 1176 && height === 664) chunkSize = 6;

    else if (width === 1152 && height === 864) chunkSize = 8;

    else if (width === 1024 && height === 768) chunkSize = 7;

    else if (width === 800 && height === 600) chunkSize = 10;

    else if (width === 1920 && height === 1080) chunkSize = 7;

    else if (width === 1600 && height === 900) chunkSize = 9;

    else if (width === 1440 && height === 900) chunkSize = 9;

    else if (width === 1400 && height === 1050) chunkSize = 10;

    else if (width === 1366 && height === 768) chunkSize = 6;

    else if (width === 1360 && height === 768) chunkSize = 6;

    else if (width === 1280 && height === 960) chunkSize = 10;

    else if (width === 1280 && height === 800) chunkSize = 7;

    else if (width === 1280 && height === 768) chunkSize = 7;

    else if (width === 1280 && height === 720) chunkSize = 4;

    else if (width === 1024 && height === 768) chunkSize = 4;

    else if (width === 2560 && height === 1440) chunkSize = 18;

    else if (width === 1768 && height === 992) chunkSize = 10;

    else if (width === 1680 && height === 1050) chunkSize = 10;

    else if (width === 1600 && height === 1024) chunkSize = 11;

    else if (width === 1600 && height === 900) chunkSize = 11;

    else if (width === 1280 && height === 1024) chunkSize = 10;

    else if (width === 3840 && height === 2160) chunkSize = 13;
    
    else if (width === 7680 && height === 4320) chunkSize = 10;
    
    let currentIndex = 0;

    // Fetch the timer interval from the backend
    const timerResponse = await fetch('http://localhost:5000/get-timer-interval');
    const timerData = await timerResponse.json();
    const interval = timerData.interval || 3000; // Default to 3000ms if no interval is provided

    // Function to display the next chunk of data
    function displayNextChunk() {
      const endIndex = Math.min(currentIndex + chunkSize, karamaData.length);
      const chunk = karamaData.slice(currentIndex, endIndex);

      // Clear existing table rows
      tableBody.innerHTML = '';

      // Populate table with the next chunk of KARAMA branch currency data
      chunk.forEach(item => {
        const row = tableBody.insertRow();
      
        // Currency Name with Flag and Arabic text
        const currencyCell = row.insertCell();
        currencyCell.classList.add('currency-name');
        currencyCell.innerHTML = `
          <div class="currency-info">
            ${item.FlagUrl ? `<img src="${item.FlagUrl}" class="flag-img"/>` : ''}
            <span class="country-name">${item.CountryName} / ${item.CURRENCY_NAME_ARABIC ? ' ' + item.CURRENCY_NAME_ARABIC : ''}</span>
          </div>
        `;
      
        // Buy Rate
        const buyRateCell = row.insertCell();
        buyRateCell.textContent = item.BuyRate;
      
        // Sell Rate
        const sellRateCell = row.insertCell();
        sellRateCell.textContent = item.SellRate;
      
        // TT Rate
        const ttRateCell = row.insertCell();
        ttRateCell.textContent = item.TTRemittanceRate;
      
        // Ticker Text: Arabic first, then English
        tickerText += `${item.CURRENCY_NAME_ARABIC ? item.CURRENCY_NAME_ARABIC : item.CountryName} - We Buy At : ${item.BuyRate} / We Sell At: ${item.SellRate} / Our TT Rate Is: ${item.TTRemittanceRate || '-'} | ${item.CountryName} - We Buy At: ${item.BuyRate} / We Sell At: ${item.SellRate} / Our TT Rate Is: ${item.TTRemittanceRate || '-'} &nbsp;&nbsp;&nbsp;&nbsp;`;
      });
      
      // // Update ticker text 

      
      // const ticker = document.getElementById('currencyTicker');
      // ticker.innerHTML = tickerText;





  
      const ticker = document.getElementById('currencyTicker');
    
      fetch('http://localhost:5000/marquee')
        .then(response => response.json())
        .then(data => {
          // marquee text first, then tickerText
          ticker.innerHTML = data.marqueeText + ' || ' + tickerText;
        })
        .catch(error => {
          console.error('Error fetching marquee text:', error);
          // default marquee text first if there's an error
          ticker.innerHTML = 'Default marquee text' + ' || ' + tickerText;
        });
  
    








      // Update the current index for the next chunk
      currentIndex = endIndex;

      // If we have more data, show the next chunk after the specified interval
      if (currentIndex < karamaData.length) {
        setTimeout(displayNextChunk, interval);
      } else {
        // If all data is shown, restart from the beginning
        currentIndex = 0;
        setTimeout(displayNextChunk, interval);
      }
    }

    // Start displaying the first chunk of data
    displayNextChunk();

  } catch (error) {
    console.error('Error loading currency rates:', error);
  }
}

// Load currency rates for KARAMA branch on page load
loadCurrencyRates();







// const branchName = localStorage.getItem('branchName') || 'Dubai Mall';
// document.getElementById('branchDisplay').textContent = ` ${branchName}  BRANCH`;

// const now = new Date();
// const options = {
//   weekday: 'short',
//   year: 'numeric',
//   month: 'long',
//   day: 'numeric',
//   hour: 'numeric',
//   minute: 'numeric',
//   hour12: true
// };
// document.getElementById('datetime').textContent = now.toLocaleString('en-US', options);

// // Function to load currency rates for the selected branch
// async function loadCurrencyRates() {
//   try {
//     const response = await fetch('http://localhost:5000/country-rates');
//     const data = await response.json();

//     const tableBody = document.getElementById('currencyRateTable').getElementsByTagName('tbody')[0];
//     let tickerText = '';

//     // Filter data for the selected branch
//     const branchName = localStorage.getItem('branchName');
//     const branchData = data.filter(item => item.BranchName === branchName);

//     // Dynamically set chunk size based on screen resolution
//     let chunkSize = 18; // default
//     const width = window.innerWidth;
//     const height = window.innerHeight;

//     // Adjust chunk size based on screen resolution

//     if (width === 1280 && height === 720) chunkSize = 7;

//     else if (width === 1176 && height === 664) chunkSize = 5;

//     else if (width === 1152 && height === 864) chunkSize = 8;

//     else if (width === 1024 && height === 768) chunkSize = 7;

//     else if (width === 800 && height === 600) chunkSize = 10;

//     else if (width === 1920 && height === 1080) chunkSize = 7;

//     else if (width === 1600 && height === 900) chunkSize = 9;

//     else if (width === 1440 && height === 900) chunkSize = 9;

//     else if (width === 1400 && height === 1050) chunkSize = 10;

//     else if (width === 1366 && height === 768) chunkSize = 6;

//     else if (width === 1360 && height === 768) chunkSize = 6;

//     else if (width === 1280 && height === 960) chunkSize = 10;

//     else if (width === 1280 && height === 800) chunkSize = 7;

//     else if (width === 1280 && height === 768) chunkSize = 7;

//     else if (width === 1280 && height === 720) chunkSize = 4;

//     else if (width === 1024 && height === 768) chunkSize = 4;

//     else if (width === 2560 && height === 1440) chunkSize = 18;

//     else if (width === 1768 && height === 992) chunkSize = 10;

//     else if (width === 1680 && height === 1050) chunkSize = 10;

//     else if (width === 1600 && height === 1024) chunkSize = 11;

//     else if (width === 1600 && height === 900) chunkSize = 11;

//     else if (width === 1280 && height === 1024) chunkSize = 10;

//     else if (width === 3840 && height === 2160) chunkSize = 15;
    
//     else if (width === 7680 && height === 4320) chunkSize = 15;

//     let currentChunkIndex = 0;
//     let currentIndex = 0;

//     // Fetch the timer interval from the backend
//     const timerResponse = await fetch('http://localhost:5000/get-timer-interval');
//     const timerData = await timerResponse.json();
//     const interval = timerData.interval || 3000; // Default to 3000ms if no interval is provided

//     // Function to load the chunk data into the table
//     function loadChunkData() {
//       // Clear the current table rows
//       tableBody.innerHTML = '';

//       // Determine the chunk data to display
//       const startIndex = currentChunkIndex * chunkSize;
//       const endIndex = Math.min(startIndex + chunkSize, branchData.length);
//       const chunk = branchData.slice(startIndex, endIndex);

//       // Populate table with the current chunk
//       chunk.forEach(item => {
//         const row = tableBody.insertRow();

//         // Currency Name with Flag and Arabic text
//         const currencyCell = row.insertCell();
//         currencyCell.classList.add('currency-name');
//         currencyCell.innerHTML = `
//           <div class="currency-info">
//             ${item.FlagUrl ? `<img src="${item.FlagUrl}" class="flag-img"/>` : ''}
//             <span class="country-name">${item.CountryName} / ${item.CURRENCY_NAME_ARABIC ? ' ' + item.CURRENCY_NAME_ARABIC : ''}</span>
//           </div>
//         `;

//         // Buy Rate
//         const buyRateCell = row.insertCell();
//         buyRateCell.textContent = item.BuyRate;

//         // Sell Rate
//         const sellRateCell = row.insertCell();
//         sellRateCell.textContent = item.SellRate;

//         // TT Rate
//         const ttRateCell = row.insertCell();
//         ttRateCell.textContent = item.TTRemittanceRate;

//         // Ticker Text
//         tickerText += `${item.CURRENCY_NAME_ARABIC ? item.CURRENCY_NAME_ARABIC : item.CountryName} - We Buy At : ${item.BuyRate} / We Sell At: ${item.SellRate} / Our TT Rate Is: ${item.TTRemittanceRate || '-'} | ${item.CountryName} - We Buy At: ${item.BuyRate} / We Sell At: ${item.SellRate} / Our TT Rate Is: ${item.TTRemittanceRate || '-'} &nbsp;&nbsp;&nbsp;&nbsp;`;
//       });

//       // Update the ticker text
//       const ticker = document.getElementById('currencyTicker');
//       fetch('http://localhost:5000/marquee')
//         .then(response => response.json())
//         .then(data => {
//           ticker.innerHTML = data.marqueeText + ' || ' + tickerText;
//         })
//         .catch(error => {
//           console.error('Error fetching marquee text:', error);
//           ticker.innerHTML = 'Default marquee text' + ' || ' + tickerText;
//         });

//       // Update the current chunk index for the next chunk
//       currentChunkIndex = (currentChunkIndex + 1) % Math.ceil(branchData.length / chunkSize); // Ensure cycling through all chunks
//     }

//     // Function to cycle through all data continuously
//     function scrollData() {
//       loadChunkData();
//     }

//     // Initial display of the first chunk
//     loadChunkData();

//     // Set up the interval to scroll the data
//     setInterval(scrollData, interval);

//   } catch (error) {
//     console.error('Error loading currency rates:', error);
//   }
// }

// // Load currency rates for the selected branch on page load
// loadCurrencyRates();









window.onload = function () {
  let adStatus = false;
  const adSection = document.querySelector('.ad-section');
  const rateTable = document.querySelector('.rate-table');
  const branchName = localStorage.getItem('branchName') || 'KARAMA';

  function showAd() {
    adSection.style.display = 'block';
    rateTable.style.width = '75%';
  }

  function hideAd() {
    adSection.style.display = 'none';
    rateTable.style.width = '100%';
  }

  function toggleAdVisibility() {
    if (adSection.style.display === 'none') {
      showAd();
    } else {
      hideAd();
    }
  }

  // Fetch branch data to determine ad status
  fetch("http://localhost:5000/branches")
    .then(response => response.json())
    .then(branches => {
      const branch = branches.find(
        b => b.BRANCH_NAME === branchName && b.STATUS === "1"
      );
      adStatus = branch && branch.Ads === "Enabled";

      // Now fetch the ad timer duration
      return fetch("http://localhost:5000/get-ad-timer");
    })
    .then(response => response.json())
    .then(data => {
      const timerInterval = (parseInt(data.timerDuration) || 5) * 1000;
      console.log('Timer Interval (ms):', timerInterval);

      if (adStatus) {
        showAd();
        setInterval(toggleAdVisibility, timerInterval);
      } else {
        adSection.remove();
        rateTable.style.width = '100%';
      }
    })
    .catch(error => {
      console.error('Error:', error);
      adSection.remove();
      rateTable.style.width = '100%';
    });

  // Load media for the branch
  loadBranchMedia(branchName);
};





async function loadBranchMedia(branchName) {
  try {
    const response = await fetch(`http://localhost:5000/get-files?branchName=${branchName}`);
    const data = await response.json();

    const adSection = document.querySelector('.ad-section');
    const adContent = adSection.querySelector('.ad-content');
    adContent.innerHTML = '';

    const validSizes = ['648x1152', '648x992', '640x992'];

    const mediaPromises = data.files.map(fileUrl => {
      const fileExtension = fileUrl.split('.').pop().toLowerCase();

      // ✅ IMAGES + GIF
      if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
        return new Promise(resolve => {
          const img = new Image();
          img.src = fileUrl;
          img.onload = () => {
            const size = `${img.width}x${img.height}`;
            if (validSizes.includes(size)) {
              resolve({ type: 'image', url: fileUrl });
            } else {
              resolve(null);
            }
          };
          img.onerror = () => resolve(null);
        });
      }

      // ✅ VIDEOS
      else if (['mp4', 'webm', 'ogg'].includes(fileExtension)) {
        return new Promise(resolve => {
          const video = document.createElement('video');
          video.src = fileUrl;
          video.onloadedmetadata = () => {
            const size = `${video.videoWidth}x${video.videoHeight}`;
            if (validSizes.includes(size)) {
              resolve({ type: 'video', url: fileUrl });
            } else {
              resolve(null);
            }
          };
          video.onerror = () => resolve(null);
        });
      }

      // ❌ Unsupported
      else {
        return Promise.resolve(null);
      }
    });

    const filteredMedia = (await Promise.all(mediaPromises)).filter(Boolean);
    let currentIndex = 0;

    async function getInterval() {
      try {
        const response = await fetch('http://localhost:5000/get-interval');
        const data = await response.json();
        return data.interval || 1000;
      } catch (error) {
        console.error('Error fetching interval:', error);
        return 1000;
      }
    }

    async function displayNextMedia() {
      if (filteredMedia.length === 0) {
        console.log('No valid media to display.');
        return;
      }

      const media = filteredMedia[currentIndex];
      adContent.innerHTML = '';

      // IMAGE
      if (media.type === 'image') {
        const interval = await getInterval();
        const img = document.createElement('img');
        img.src = media.url;
        img.alt = 'Advertisement Image';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'fill';
        img.style.borderRadius = '6px';
        adContent.appendChild(img);

        setTimeout(() => {
          currentIndex = (currentIndex + 1) % filteredMedia.length;
          displayNextMedia();
        }, interval);
      }

      // VIDEO
      else if (media.type === 'video') {
        const video = document.createElement('video');
        video.src = media.url;
        video.controls = false;
        video.autoplay = true;
        video.muted = true;
        video.loop = false;
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'contain';
        adContent.appendChild(video);

        video.onended = () => {
          currentIndex = (currentIndex + 1) % filteredMedia.length;
          displayNextMedia();
        };
      }
    }

    if (filteredMedia.length > 0) {
      displayNextMedia();
    }

  } catch (error) {
    console.error('Error loading media files:', error);
  }
}





  fetch('http://localhost:5000/marquee')
  .then(response => response.json())
  .then(data => {
    // Assuming the server returns { marqueeText: "Today's rates: USD - 3.67, EUR - 4.12" }
    document.getElementById('marqueeText').textContent = data.marqueeText;
  })
  .catch(error => {
    console.error('Error fetching marquee text:', error);
    document.getElementById('marqueeText').textContent = 'Default marquee text';
  });
