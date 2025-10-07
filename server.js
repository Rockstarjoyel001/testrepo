const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require("path"); // Add this line
const fs = require("fs");
const sql = require('mssql');
const app = express();
const moment = require('moment'); // install this via npm install moment

const PORT = process.env.PORT || 5000;
const config = require("./config");
// const PORT = process.env.PORT || Math.floor(Math.random() * (65535 - 1024) + 1024);
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization' , ' branch-name']
}));
app.use(bodyParser.json());

// Database Configuration
// const config = {
//     user: 'OECTEST',
//     password: 'TesT99$',
//     server: 'OECSERVER4',
//     database: 'DEV_TEST',
//     options: {
//         encrypt: false,
//         trustServerCertificate: true,
//         enableArithAbort: true
//     },
//     pool: {
//         max: 10,
//         min: 0,
//         idleTimeoutMillis: 30000 
//     }
// };

// Function to create a database connection pool
// Async DB connection function
async function getDbConnection() {
    try {
      const pool = await sql.connect(config);
      return pool;
    } catch (err) {
      console.error('Failed to connect to the database:', err);
      throw new Error('Database connection failed');
    }
  }

  app.put('/update-branch', async (req, res) => {
    const { BRANCH_NAME, Ads, ORIENTATION } = req.body;
  
    try {
      const result = await sql.query`
        UPDATE TBLM_BRANCHES
        SET Ads = ${Ads}, ORIENTATION = ${ORIENTATION}
        WHERE BRANCH_NAME = ${BRANCH_NAME}
      `;
  
      res.json({ message: 'Branch updated successfully', result });
    } catch (err) {
      console.error('DB error:', err);
      res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
  });

// Endpoint to update user status
app.patch('/update-status/:id', async (req, res) => {
  const userId = req.params.id;
  const { status } = req.body;

  // Validate the status value
  if (status !== '1' && status !== '0') {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }

  try {
    // Get the database connection pool
    const pool = await getDbConnection();

    // Perform the update query using prepared statements
    const result = await pool.request()
      .input('status', sql.VarChar, status) // Pass the status value
      .input('id', sql.Int, userId) // Pass the user ID
      .query('UPDATE RateTableUsers SET status = @status WHERE id = @id');

    // Check if any rows were affected
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Send success response
    res.json({ success: true, message: 'User status updated successfully' });
  } catch (err) {
    console.error('Error updating user status:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});
  // Route to update branch status
  app.post('/update-branch-status', async (req, res) => {
    try {
      const { branchName, status } = req.body;
      const pool = await sql.connect(config);
      const result = await pool.request()
        .input('branchName', sql.NVarChar, branchName)
        .input('status', sql.Int, status)
        .query(`
          UPDATE TBLM_BRANCHES
          SET STATUS = @status
          WHERE BRANCH_NAME = @branchName
        `);
  
      if (result.rowsAffected[0] > 0) {
        res.json({ success: true });
      } else {
        res.status(404).json({ success: false, message: 'Branch not found' });
      }
    } catch (err) {
      console.error('Error updating branch status:', err);
      res.status(500).json({ success: false, message: 'Database error' });
    }
  });
  
  // GET: Branch name and status
  app.get('/branchesstatus', async (req, res) => {
    try {
      const pool = await sql.connect(config);
      const result = await pool.request().query(`
        SELECT BRANCH_NAME, STATUS FROM TBLM_BRANCHES
      `);
  
      console.log('Fetched branch statuses:', result.recordset);  // Log the result
  
      res.json(result.recordset); // Send back all branches with their statuses
    } catch (err) {
      console.error('Error fetching branches:', err);
      res.status(500).json({ success: false, message: 'Database error' });
    }
  });
  
  
  
//   app.get('/branches', async (req, res) => {
//   try {
//     const pool = await getDbConnection();
//     const result = await pool.request().query('SELECT BRANCH_NAME, STATUS FROM TBLM_BRANCHES');
//     res.json(result.recordset);
//   } catch (err) {
//     console.error('Error fetching branches:', err);
//     res.status(500).json({ success: false, message: 'Database error' });
//   }
// });



  

// app.post("/login", async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     // Connect to MSSQL
//     const pool = await sql.connect(config);

//     // Query the database to fetch the encrypted password and branch
//     const result = await pool
//       .request()
//       .input("username", sql.VarChar, username)
//       .query("SELECT password, Branch FROM RateTableUsers WHERE username = @username");

//     if (result.recordset.length > 0) {
//       const dbPassword = result.recordset[0].password; // Fetch encrypted password from DB
//       const branchName = result.recordset[0].Branch;   // Fetch branch from the result

//       // First, attempt bcrypt comparison
//       const isMatch = await bcrypt.compare(password, dbPassword);

//       if (isMatch) {
//         // If bcrypt compare is successful
//         return res.json({
//           success: true,
//           message: "Login successful!",
//           username: username,
//           branchName: branchName
//         });
//       } else {
//         // If bcrypt comparison fails, fall back to normal string comparison
//         if (password === dbPassword) {
//           // If normal comparison is successful
//           return res.json({
//             success: true,
//             message: "Login successful!",
//             username: username,
//             branchName: branchName
//           });
//         }
//       }
//     }
    
//     // If no match found (either bcrypt or normal comparison)
//     return res.json({ success: false, message: "Invalid username or password!" });

//   } catch (err) {
//     console.error("Database query error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });
app.get('/check-user-status', async (req, res) => {
  const username = req.query.username;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  try {
    const pool = await getDbConnection();  // Get the database connection
    const query = `SELECT status FROM RateTableUsers WHERE username = @username`;
    
    // Create the request object and add the parameter
    const request = pool.request();
    request.input('username', sql.VarChar, username);

    // Execute the query
    const result = await request.query(query);

    // Log the result to see what data is being returned
    console.log('Database result:', result);

    if (result.recordset.length > 0) {
      const userStatus = result.recordset[0].status;
      console.log('Fetched status:', userStatus); // Log the status

      // Ensure the status is returned in the correct format
      if (userStatus === '1') {
        res.json({ status: 'active' });
      } else if (userStatus === '0') {
        res.json({ status: 'inactive' });
      } else {
        res.json({ status: 'unknown', message: `Invalid status value: ${userStatus}` });
      }
    } else {
      res.json({ status: 'user not found' });
    }
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});



// app.post("/login", async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     // Connect to MSSQL
//     const pool = await sql.connect(config);

//     // Query the database to fetch the encrypted password, branch, and status
//     const result = await pool
//       .request()
//       .input("username", sql.VarChar, username)
//       .query("SELECT password, Branch, status FROM RateTableUsers WHERE username = @username");

//     if (result.recordset.length > 0) {
//       const dbPassword = result.recordset[0].password; // Fetch encrypted password from DB
//       const branchName = result.recordset[0].Branch;   // Fetch branch from the result
//       const status = result.recordset[0].status;       // Fetch user status

//       // Check if account is disabled
//       if (status === 0) {
//         return res.json({
//           success: false,
//           message: "Your account is disabled. Please contact the administrator."
//         });
//       }

//       // If status is 1 (active), proceed with password comparison
//       const isMatch = await bcrypt.compare(password, dbPassword);

//       if (isMatch) {
//         return res.json({
//           success: true,
//           message: "Login successful!",
//           username: username,
//           branchName: branchName
//         });
//       } else {
//         // If bcrypt comparison fails, fall back to normal string comparison
//         if (password === dbPassword) {
//           return res.json({
//             success: true,
//             message: "Login successful!",
//             username: username,
//             branchName: branchName
//           });
//         }
//       }
//     }

//     // If no match found (either bcrypt or normal comparison)
//     return res.json({ success: false, message: "Invalid username or password!" });

//   } catch (err) {
//     console.error("Database query error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Connect to MSSQL
    const pool = await sql.connect(config);

    // Query the database to fetch the encrypted password and branch
    const result = await pool
      .request()
      .input("username", sql.NVarChar, username)
      .query("SELECT password, Branch FROM RateTableUsers WHERE username = @username");

    if (result.recordset.length > 0) {
      const dbPassword = result.recordset[0].password; // Fetch encrypted password from DB
      const branchName = result.recordset[0].Branch;   // Fetch branch from the result

      // First, attempt bcrypt comparison
      const isMatch = await bcrypt.compare(password, dbPassword);

      if (isMatch) {
        // If bcrypt compare is successful
        return res.json({
          success: true,
          message: "Login successful!",
          username: username,
          branchName: branchName
        });
      } else {
        // If bcrypt comparison fails, fall back to normal string comparison
        if (password === dbPassword) {
          // If normal comparison is successful
          return res.json({
            success: true,
            message: "Login successful!",
            username: username,
            branchName: branchName
          });
        }
      }
    }
    
    // If no match found (either bcrypt or normal comparison)
    return res.json({ success: false, message: "Invalid username or password!" });

  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});                   






const networkSharePath = '//192.168.140.154/share/0';

app.use('/flags', express.static(networkSharePath));
async function getCountryRates(req, res) {
    try {
        const pool = await sql.connect(config);

        const result = await pool.request().query(`
            SELECT CR.CountryName, CR.BranchName, 
                   CR.BuyRate, 
                   CR.SellRate, 
                   CR.TTRemittanceRate, 
                   CR.CountryCode, CR.Rank, CR.CurrencyCode, CR.CURRENCY_NAME_ARABIC, TC.FLAG_NAME
            FROM CountryRates CR
            LEFT JOIN TBLM_CURRENCY TC ON CR.CurrencyCode = TC.CURRENCY_CODE
            ORDER BY ISNULL(CR.Rank, 999999) ASC;
        `);

        const countryData = result.recordset.map(country => {
            const countryCode = country.CountryCode;
            let flagUrl = null;

            // 1️⃣ Priority: Check database for flag image
            if (country.FLAG_NAME) {
                const flagBase64 = Buffer.from(country.FLAG_NAME, 'binary').toString('base64');
                flagUrl = `data:image/png;base64,${flagBase64}`;
            }

            // 2️⃣ If no flag in DB, check shared folder
            if (!flagUrl) {
                const localFlagPath = path.join(networkSharePath, `${countryCode}.png`);
                if (fs.existsSync(localFlagPath)) {
                    flagUrl = `http://localhost:5000/flags/${countryCode}.png`; // Serve via Express
                }
            }

            // 3️⃣ If no flag in DB or shared folder, use external API
            if (!flagUrl) {
                flagUrl = `https://flagsapi.com/${countryCode}/shiny/64.png`;
            }

            return {
                CountryName: country.CountryName,
                BranchName: country.BranchName,
                BuyRate: country.BuyRate,  // No conversion, keeps original precision
                SellRate: country.SellRate, 
                TTRemittanceRate: country.TTRemittanceRate, 
                CountryCode: country.CountryCode,
                Rank: country.Rank,
                CurrencyCode: country.CurrencyCode,
                CURRENCY_NAME_ARABIC: country.CURRENCY_NAME_ARABIC,
                FlagUrl: flagUrl
            };
        });

        res.json(countryData);
    } catch (err) {
        console.error('Error fetching data: ', err);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
}

app.get('/country-rates', getCountryRates);




app.get('/country-rates', getCountryRates);


app.post('/api/getOrientation', async (req, res) => {
    const { branchName } = req.body;
    console.log('Received branchName:', branchName); // Log received branch name for debugging

    try {
        // Create a pool of connections for executing the query
        const pool = await sql.connect(config);

        // Query to fetch orientation from database based on branchName
        const result = await pool.request()
            .input('branchName', sql.NVarChar, branchName) // Safely pass branchName as input
            .query('SELECT ORIENTATION FROM TBLM_BRANCHES WHERE UPPER(BRANCH_NAME) = UPPER(@branchName)');  // Case-insensitive query

        const orientation = result.recordset[0]?.ORIENTATION;
        console.log(orientation); // Log the orientation for debugging

        // Return the orientation or an error if not found
        if (orientation) {
            res.json({ orientation });
        } else {
            console.log('No orientation found for branch:', branchName);
            res.status(404).json({ message: 'Orientation not found' });
        }

        // Close the pool after query execution
        pool.close();
    } catch (error) {
        console.error('Error fetching orientation:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});




// Endpoint to handle selected branch and fetch related countries
app.post('/selectedBranch', async (req, res) => {
    const { branchName } = req.body;

    if (!branchName) {
        return res.status(400).json({ error: 'Branch name is required' });
    }

    try {
        // Connect to the database
        const pool = await sql.connect(config);

        // Query to fetch countries for the given branch
        const result = await pool.request()
            .input('branchName', sql.NVarChar, branchName)
            .query('SELECT CountryName FROM CountryRates WHERE BranchName = @branchName');

        if (result.recordset.length > 0) {
            const countries = result.recordset.map(row => row.CountryName);  // Extract country names from result
            res.status(200).json({ countries });  // Send back an array of country names
        } else {
            res.status(404).json({ message: 'No countries found for this branch' });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Database query failed' });
    } finally {
        sql.close(); // Always close the connection after the query
    }
});







// Endpoint to get the exchange rates based on selected branch and countries
app.post('/getExchangeRates', async (req, res) => {
    const { branchName, countries } = req.body;

    if (!branchName || !Array.isArray(countries) || countries.length === 0) {
        return res.status(400).json({ error: 'Branch name and countries are required' });
    }

    try {
        const pool = await sql.connect(config);

        // Build the dynamic SQL query with placeholders for selected countries
        const countryPlaceholders = countries.map((_, index) => `@country${index}`).join(', ');
        const query = `
          SELECT CountryCode, CountryName, SellRate, BuyRate, TTRemittanceRate
          FROM CountryRates
          WHERE BranchName = @branchName AND CountryName IN (${countryPlaceholders});
        `;

        const request = pool.request();
        request.input('branchName', sql.NVarChar, branchName);

        // Add country parameters dynamically
        countries.forEach((country, index) => {
            request.input(`country${index}`, sql.NVarChar, country);
        });

        // Execute the query
        const result = await request.query(query);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'No exchange rates found for the selected countries' });
        }

        // Sort the results to match the order of selected countries
        const sortedRates = countries.map(country => {
            return result.recordset.find(rate => rate.CountryName === country);
        }).filter(rate => rate !== undefined); // Filter out any undefined entries

        res.json(sortedRates);  // Send exchange rate data to front-end
    } catch (error) {
        console.error('Error fetching exchange rates:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        sql.close(); // Always close the connection after the query
    }
});

// Route to update exchange rates
app.post('/updateRates', async (req, res) => {
    console.log('Request received:', req.body);

    const { branchName, countryCode, sellRate, buyRate, ttRemittanceRate } = req.body;

    if (!branchName || !countryCode || sellRate === undefined || buyRate === undefined || ttRemittanceRate === undefined) {
        console.log("Missing fields:", req.body);
        return res.status(400).json({ error: 'All fields are required' });
    }

    const parsedSellRate = Number(sellRate);
    const parsedBuyRate = Number(buyRate);
    const parsedTTRemittanceRate = Number(ttRemittanceRate);

    if (isNaN(parsedSellRate) || isNaN(parsedBuyRate) || isNaN(parsedTTRemittanceRate)) {
        return res.status(400).json({ error: 'Rates must be valid numbers' });
    }

    try {
        const pool = await sql.connect(config);

        console.log('Updating records for CountryCode:', countryCode, 'and BranchName:', branchName);

        const result = await pool.request()
            .input('branchName', sql.NVarChar, branchName)
            .input('countryCode', sql.NVarChar, countryCode)
            .input('sellRate', sql.Decimal(18, 9), parsedSellRate)
            .input('buyRate', sql.Decimal(18, 9), parsedBuyRate)
            .input('ttRemittanceRate', sql.Decimal(18, 9), parsedTTRemittanceRate)
            .query(`
                UPDATE CountryRates
                SET SellRate = @sellRate, BuyRate = @buyRate, TTRemittanceRate = @ttRemittanceRate
                WHERE CountryCode = @countryCode AND BranchName = @branchName
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(400).json({ error: 'No rows updated. Verify that both CountryCode and BranchName match an existing row.' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error updating exchange rates:', error);
        res.status(500).json({ error: 'Failed to update rates' });
    } finally {
        await sql.close();
    }
});









// Route to get exchange rates for a branch
app.get('/api/rates', async (req, res) => {
    const branchName = req.query.branchName;

    if (!branchName) {
        return res.status(400).send('Branch name is required');
    }

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('branchName', sql.NVarChar, branchName)
            .query(`
                SELECT CountryID, CountryCode, CurrencyCode, CountryName, 
                       BuyRate, SellRate, TTRemittanceRate, Rank 
                FROM CountryRates 
                WHERE BranchName = @branchName
            `);

        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching rates:', err);
        res.status(500).send('Error fetching data');
    }
});




  
app.post('/api/rates/update', async (req, res) => {
    const { branchName, rates } = req.body;

    if (!branchName || !rates || rates.length === 0) {
        return res.status(400).json({ error: 'Invalid data received' });
    }

    try {
        const pool = await sql.connect(config);
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            for (let rate of rates) {
                if (!rate.CountryID || isNaN(rate.CountryID)) {
                    return res.status(400).json({ error: 'Invalid CountryID' });
                }
                if (
                    rate.BuyRate === undefined || rate.SellRate === undefined || rate.TTRemittanceRate === undefined ||
                    isNaN(rate.BuyRate) || isNaN(rate.SellRate) || isNaN(rate.TTRemittanceRate)
                ) {
                    return res.status(400).json({ error: 'Invalid rates' });
                }

                // Ensure values are passed exactly as received
                const buyRate = Number(rate.BuyRate);
                const sellRate = Number(rate.SellRate);
                const ttRemittanceRate = Number(rate.TTRemittanceRate);

                // Fetch the current record
                const currentData = await transaction.request()
                    .input('branchName', sql.NVarChar, branchName)
                    .input('CountryID', sql.Int, rate.CountryID)
                    .query(`
                        SELECT CountryID, CountryName, BranchName, BuyRate, SellRate, TTRemittanceRate
                        FROM CountryRates
                        WHERE CountryID = @CountryID AND BranchName = @branchName
                    `);

                let countryName = rate.CountryName || (currentData.recordset.length > 0 ? currentData.recordset[0].CountryName : null);

                if (!countryName) {
                    return res.status(400).json({ error: 'CountryName is required' });
                }

                // Insert into history only if data changed
                if (
                    currentData.recordset.length > 0 &&
                    (currentData.recordset[0].BuyRate !== buyRate ||
                     currentData.recordset[0].SellRate !== sellRate ||
                     currentData.recordset[0].TTRemittanceRate !== ttRemittanceRate)
                ) {
                    await transaction.request()
                        .input('CountryID', sql.Int, rate.CountryID)
                        .input('CountryName', sql.NVarChar, countryName)
                        .input('BranchName', sql.NVarChar, branchName)
                        .input('BuyRate', sql.Decimal(18, 9), currentData.recordset[0].BuyRate)
                        .input('SellRate', sql.Decimal(18, 9), currentData.recordset[0].SellRate)
                        .input('TTRemittanceRate', sql.Decimal(18, 9), currentData.recordset[0].TTRemittanceRate)
                        .input('Updated_BY', sql.NVarChar, rate.Updated_BY)
                        .input('Updated_On', sql.DateTime, rate.Updated_On)
                        .query(`
                            INSERT INTO CountryRates_History (CountryID, CountryName, BranchName, BuyRate, SellRate, TTRemittanceRate, Updated_BY, Updated_On)
                            VALUES (@CountryID, @CountryName, @BranchName, @BuyRate, @SellRate, @TTRemittanceRate, @Updated_BY, @Updated_On)
                        `);
                }

                // Update CountryRates
                await transaction.request()
                    .input('CountryID', sql.Int, rate.CountryID)
                    .input('CountryName', sql.NVarChar, countryName)
                    .input('BranchName', sql.NVarChar, branchName)
                    .input('BuyRate', sql.Decimal(18, 9), buyRate)
                    .input('SellRate', sql.Decimal(18, 9), sellRate)
                    .input('TTRemittanceRate', sql.Decimal(18, 9), ttRemittanceRate)
                    .input('Rank', sql.Int, rate.Rank) // Keep Rank
                    .input('Updated_BY', sql.NVarChar, rate.Updated_BY)
                    .input('Updated_On', sql.DateTime, rate.Updated_On)
                    .query(`
                        UPDATE CountryRates
                        SET BuyRate = @BuyRate, 
                            SellRate = @SellRate, 
                            TTRemittanceRate = @TTRemittanceRate,
                            Rank = @Rank, -- Keep Rank
                            CountryName = @CountryName, 
                            Updated_BY = @Updated_BY,
                            Updated_On = @Updated_On
                        WHERE CountryID = @CountryID AND BranchName = @BranchName
                    `);
            }

            await transaction.commit();
            res.json({ message: 'Rates updated successfully' });

        } catch (error) {
            await transaction.rollback();
            console.error('Transaction error', error);
            res.status(500).json({ error: 'Error updating rates' });
        }
    } catch (err) {
        console.error('SQL connection error', err);
        res.status(500).json({ error: 'Database connection error' });
    } finally {
        sql.close();
    }
});



// API to get all data
app.get('/data', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query('SELECT * FROM CountryRates'); // Replace 'CountryRates' with actual table name
        res.json(result.recordset);
    } catch (err) {
        console.error(err.message);
        res.status(500).send(err.message);
    }
});
// API to update data
app.put('/data/:id', async (req, res) => {
    const { BuyRate, SellRate, TTRemittanceRate, Updated_BY, Updated_On } = req.body;  // Receive Updated_BY and Updated_On
    const { id } = req.params;

    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('BuyRate', sql.Float, BuyRate)
            .input('SellRate', sql.Float, SellRate)
            .input('TTRemittanceRate', sql.Float, TTRemittanceRate)
            .input('Updated_BY', sql.NVarChar, Updated_BY)  // Handle Updated_BY
            .input('Updated_On', sql.DateTime, Updated_On)  // Handle Updated_On
            .input('id', sql.Int, id)
            .query(`
                UPDATE CountryRates 
                SET 
                    BuyRate = @BuyRate, 
                    SellRate = @SellRate, 
                    TTRemittanceRate = @TTRemittanceRate,
                    Updated_BY = @Updated_BY,
                    Updated_On = @Updated_On
                WHERE CountryID = @id
            `); // Update SQL query to set Updated_BY and Updated_On

        res.send('Data updated');
    } catch (err) {
        console.error(err.message);
        res.status(500).send(err.message);
    }
});














app.post('/data', async (req, res) => {
    const { BranchName, CountryName, CountryCode, BuyRate, SellRate, TTRemittanceRate, Updated_BY, Updated_On } = req.body;

    // Generate a random number between 1 and 13
    const randomNumber = Math.floor(Math.random() * 13) + 1;

    try {
        let pool = await sql.connect(config);

        // Check if the record already exists for the same BranchName and CountryName
        const checkExisting = await pool.request()
            .input('BranchName', sql.NVarChar, BranchName)
            .input('CountryName', sql.NVarChar, CountryName)
            .query(`
                SELECT COUNT(*) AS count 
                FROM CountryRates 
                WHERE BranchName = @BranchName AND CountryName = @CountryName
            `);

        if (checkExisting.recordset[0].count > 0) {
            return res.status(400).send('Data already exists for this branch and country');
        }

        // Fetch the currency code and Arabic name from the TBLM_CURRENCY table
        const currencyData = await pool.request()
            .input('CountryCode', sql.NVarChar, CountryCode)
            .query(`
                SELECT CURRENCY_CODE, CURRENCY_NAME_ARABIC
                FROM TBLM_CURRENCY 
                WHERE COUNTRY_CODE = @CountryCode
            `);

        if (currencyData.recordset.length === 0) {
            return res.status(404).send('Currency data not found for the given country code');
        }

        const currencyCode = currencyData.recordset[0].CURRENCY_CODE;
        const currencyNameArabic = currencyData.recordset[0].CURRENCY_NAME_ARABIC;

        // Insert new data into CountryRates
        await pool.request()
            .input('BranchName', sql.NVarChar, BranchName)
            .input('CountryName', sql.NVarChar, CountryName)
            .input('CountryCode', sql.NVarChar, CountryCode)
            .input('BuyRate', sql.Float, BuyRate)
            .input('SellRate', sql.Float, SellRate)
            .input('TTRemittanceRate', sql.Float, TTRemittanceRate)
            .input('Updated_BY', sql.NVarChar, Updated_BY)
            .input('Updated_On', sql.DateTime, Updated_On)
            .input('Rank', sql.Int, randomNumber)
            .input('CurrencyCode', sql.NVarChar, currencyCode)
            .input('CurrencyNameArabic', sql.NVarChar, currencyNameArabic)
            .query(`
                INSERT INTO CountryRates 
                (BranchName, CountryName, CountryCode, BuyRate, SellRate, TTRemittanceRate, Updated_BY, Updated_On, Rank, CurrencyCode, 
CURRENCY_NAME_ARABIC
)
                VALUES 
                (@BranchName, @CountryName, @CountryCode, @BuyRate, @SellRate, @TTRemittanceRate, @Updated_BY, @Updated_On, @Rank, @CurrencyCode, @CurrencyNameArabic)
            `);

        // Update the CurrencyCode and CurrencyNameArabic in CountryRates if they're missing
        await pool.request().query(`
            UPDATE cr
            SET cr.CurrencyCode = t.CURRENCY_CODE, cr.
CURRENCY_NAME_ARABIC
 = t.CURRENCY_NAME_ARABIC
            FROM CountryRates cr
            INNER JOIN TBLM_CURRENCY t 
                ON LTRIM(RTRIM(cr.CountryCode)) = LTRIM(RTRIM(t.COUNTRY_CODE))
            WHERE (cr.CurrencyCode IS NULL OR cr.CurrencyCode = '') 
            AND cr.CountryCode = t.COUNTRY_CODE;
        `);

        res.send('New data added, CurrencyCode and CurrencyNameArabic updated, and rank number added');
    } catch (err) {
        console.error(err.message);
        res.status(500).send(err.message);
    }
});


















// DELETE API to remove data
// DELETE API to remove data
app.delete('/data/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Establish connection to the database
        let pool = await sql.connect(config);

        // Execute the DELETE query
        const result = await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM CountryRates WHERE CountryID = @id'); // Replace 'CountryRates'

        // Check if any rows were affected (i.e., record was deleted)
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Record not found' });
        }

        // Send success response
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (err) {
        console.error('Error deleting record:', err.message);
        res.status(500).send(err.message);
    }
});
















// // Set up static file serving from the network share
// app.use("/share", express.static("//192.168.140.154/share"));







// const SHARE_PATH = "\\\\192.168.140.154\\share\\ads";


const SHARE_PATH = config.SHARE_PATH;


// Middleware to serve static files
app.use("/ads", express.static(SHARE_PATH));

app.get("/get-files", (req, res) => {
    const branchName = req.query.branchName;
    if (!branchName) return res.status(400).json({ error: "Branch name is required" });

    const folderPath = path.join(SHARE_PATH, branchName);

    fs.access(folderPath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({ error: "Folder not found" });
        }

        fs.readdir(folderPath, (err, files) => {
            if (err) return res.status(500).json({ error: "Error reading folder" });

            // Create URLs to serve via Express
            const fileUrls = files
                .filter(file => !file.toLowerCase().endsWith(".db")) // Exclude system files
                .map(file => `http://localhost:${PORT}/ads/${branchName}/${encodeURIComponent(file)}`);

            // Prepare the JSON response
            const jsonResponse = { files: fileUrls };

            // Set headers to prompt download of the JSON file
            res.setHeader('Content-Disposition', 'attachment; filename="files.json"');
            res.setHeader('Content-Type', 'application/json');
            res.status(200).send(JSON.stringify(jsonResponse, null, 2)); // Pretty print the JSON file
        });
    });
});




// Set up static file serving for the network folder
app.use("/share", express.static("//192.168.140.154/share"));

// Endpoint to fetch all image files in the directory
// app.get("/get-images", (req, res) => {
//     const folderPath = path.join("//192.168.140.154", "share", "01234567890"); // Use path module to create path
    
//     // Read files in the directory
//     fs.readdir(folderPath, (err, files) => {
//         if (err) {
//             return res.status(500).json({ error: "Unable to read directory" });
//         }

//         // Filter to only return image files (e.g., .png, .jpg)
//         const images = files.filter(file => /\.(png|jpg|jpeg|gif|mp4|mov|avi|mkv|webm)$/i.test(file))
//                              .map(file => `http://localhost:5000/share/01234567890/${file}`);

//         res.json(images); // Send the image list as JSON
//     });
// });






// Filter to return image and video files (e.g., .png, .jpg, .mp4, .mov, etc.)


// const mediaFiles = files.filter(file => /\.(png|jpg|jpeg|gif|mp4|mov|avi|mkv|webm)$/i.test(file))
//                         .map(file => `http://localhost:5000/share/01234567890/${file}`);

// res.json(mediaFiles);


// API endpoint to fetch files from the shared folder based on branch name
// app.get('/get-files', (req, res) => {
//     const branchName = req.query.branchName; // Retrieve branch name from query parameters
//     const folderPath = path.join('\\\\192.168.140.154\\share\\ads', branchName); // Construct the path to the branch folder

//     if (fs.existsSync(folderPath)) {
//         fs.readdir(folderPath, (err, files) => {
//             if (err) {
//                 return res.status(500).send('Error reading directory');
//             }
//             res.json(files); // Send the list of files in the branch folder
//         });
//     } else {
//         res.status(404).send('Branch folder not found');
//     }
// });

// Endpoint to fetch all image files in the '54321' folder
// app.get("/get-images-54321", (req, res) => {
//     const folderPath = path.join("//192.168.140.154", "share", "54321");

//     // Read files in the directory
//     fs.readdir(folderPath, (err, files) => {
//         if (err) {
//             return res.status(500).json({ error: "Unable to read directory" });
//         }

//         // Filter to only return image files (e.g., .png, .jpg)
//         const images = files.filter(file => /\.(png|jpg|jpeg|gif)$/i.test(file))
//                              .map(file => `http://localhost:5000/share/54321/${file}`);

//         res.json(images); // Send the image list as JSON
//     });
// });














app.get('/fetch-branches', async (req, res) => {
    try {
      // Connect to the database
      await sql.connect(config);
      
      // Query to select branch names
      const result = await sql.query('SELECT BRANCH_NAME FROM TBLM_BRANCHES');
      
      // Send the branch names as a response
      const branchNames = result.recordset.map(row => row.BRANCH_NAME);
      res.json(branchNames);
    } catch (err) {
      console.error(err);
      res.status(500).send('Database connection error');
    } finally {
      // Close the connection
      sql.close();
    }
  });
  

  app.post("/add-branch", async (req, res) => {
    let { branchCode, branchName, status, ads, orientation } = req.body;

    try {
        await pool.request()
            .input("branchCode", branchCode)
            .input("branchName", branchName)
            .input("status", status)
            .input("ads", ads)
            .input("orientation", orientation)
            .query(`INSERT INTO TBLM_BRANCHES (BRANCH_CODE, BRANCH_NAME, STATUS, Ads, ORIENTATION) 
                    VALUES (@branchCode, @branchName, @status, @ads, @orientation)`);

        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error adding branch" });
    }
});

  
// POST endpoint to add user

// app.post('/add-user', async (req, res) => {
//     const { username, password, branchName, profession } = req.body;

//     if (!username || !password || !branchName || !profession) {
//         return res.status(400).json({ success: false, message: "All fields are required" });
//     }

//     try {
//         const pool = await getDbConnection();

//         // First, check if the branch already exists in TBLM_BRANCHES
//         const existingBranchResult = await pool.request()
//             .input('branchName', sql.NVarChar, branchName)
//             .query('SELECT COUNT(*) AS branchCount FROM TBLM_BRANCHES WHERE BRANCH_NAME = @branchName');
        
//         const branchExists = existingBranchResult.recordset[0].branchCount > 0;

//         // If branch exists, don't add it again
//         let newBranchCode = 50;  // Default value for branch code
        
//         if (!branchExists) {
//             // If the branch doesn't exist, get the maximum BRANCH_CODE from TBLM_BRANCHES
//             const branchCodeResult = await pool.request()
//                 .query('SELECT MAX(BRANCH_CODE) AS latestBranchCode FROM TBLM_BRANCHES');
            
//             // Get the latest branch code, and if null, default to 50 (starting value)
//             const latestBranchCode = branchCodeResult.recordset[0].latestBranchCode || 50;
            
//             // Increment the latest branch code
//             newBranchCode = latestBranchCode + 1;

//             // Insert the branch into the TBLM_BRANCHES table using the new branch code
//             await pool.request()
//                 .input('branchCode', sql.Int, newBranchCode)  // Use the new branch code
//                 .input('branchName', sql.NVarChar, branchName)
//                 .input('status', sql.NVarChar, '1') // Setting default status as ACTIVE
//                 .input('ads', sql.NVarChar, 'Disabled') // Default Ads as Disabled
//                 .input('orientation', sql.NVarChar, 'LANDSCAPE') // Default orientation as LANDSCAPE
//                 .query('INSERT INTO TBLM_BRANCHES (BRANCH_CODE, BRANCH_NAME, STATUS, Ads, ORIENTATION) VALUES (@branchCode, @branchName, @status, @ads, @orientation)');
//         }

//         // Insert the user into the RateTableUsers table
//         await pool.request()
//             .input('username', sql.NVarChar, username)
//             .input('password', sql.NVarChar, password)
//             .input('branchName', sql.NVarChar, branchName)
//             .input('profession', sql.NVarChar, profession)
//             .query('INSERT INTO RateTableUsers (username, password, branch, profession) VALUES (@username, @password, @branchName, @profession)');

//         res.json({ success: true, message: "User and branch added successfully" });
//     } catch (error) {
//         console.error('Error while inserting user and branch:', error);
//         res.status(500).json({ success: false, message: "Failed to add user and branch" });
//     }
// });


// const bcrypt = require('bcrypt'); // Make sure to import bcrypt at the top

app.post('/add-user', async (req, res) => {
    const { username, password, branchName, profession } = req.body;

    if (!username || !password || !branchName || !profession) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        const pool = await getDbConnection();

        // First, check if the branch already exists in TBLM_BRANCHES
        const existingBranchResult = await pool.request()
            .input('branchName', sql.NVarChar, branchName)
            .query('SELECT COUNT(*) AS branchCount FROM TBLM_BRANCHES WHERE BRANCH_NAME = @branchName');
        
        const branchExists = existingBranchResult.recordset[0].branchCount > 0;

        // If branch exists, don't add it again
        let newBranchCode = 50;  // Default value for branch code
        
        if (!branchExists) {
            const branchCodeResult = await pool.request()
                .query('SELECT MAX(BRANCH_CODE) AS latestBranchCode FROM TBLM_BRANCHES');
            
            const latestBranchCode = branchCodeResult.recordset[0].latestBranchCode || 50;
            newBranchCode = latestBranchCode + 1;

            await pool.request()
                .input('branchCode', sql.Int, newBranchCode)
                .input('branchName', sql.NVarChar, branchName)
                .input('status', sql.NVarChar, '1')
                .input('ads', sql.NVarChar, 'Disabled')
                .input('orientation', sql.NVarChar, 'LANDSCAPE')
                .query('INSERT INTO TBLM_BRANCHES (BRANCH_CODE, BRANCH_NAME, STATUS, Ads, ORIENTATION) VALUES (@branchCode, @branchName, @status, @ads, @orientation)');
        }

        // Hash the password before inserting
        const saltRounds = 10; // You can adjust the number of salt rounds (10 is common)
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert the user into the RateTableUsers table with hashed password
        await pool.request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, hashedPassword) // Use hashed password here
            .input('branchName', sql.NVarChar, branchName)
            .input('profession', sql.NVarChar, profession)
            .query('INSERT INTO RateTableUsers (username, password, branch, profession) VALUES (@username, @password, @branchName, @profession)');

        res.json({ success: true, message: "User and branch added successfully" });
    } catch (error) {
        console.error('Error while inserting user and branch:', error);
        res.status(500).json({ success: false, message: "Failed to add user and branch" });
    }
});


// Endpoint to update user status



app.get('/branches', async (req, res) => {
    try {
        console.log("Fetching branches...");
        const pool = await sql.connect(config);
        const result = await pool.request().query('SELECT BRANCH_NAME, STATUS, Ads, ORIENTATION FROM TBLM_BRANCHES');  // Modify the query as per your database

        if (result.recordset.length === 0) {
            console.log("No branches found in the database");
        } else {
            console.log("Branches fetched:", result.recordset);
        }

        res.json(result.recordset); // Send the fetched branches as a JSON response
    } catch (error) {
        console.error("Error fetching branches:", error);
        res.status(500).send(error.message); // Send error response
    }
});



// Update branch settings (Ads and Orientation)
app.post('/update-branch-settings', async (req, res) => {
  const { branchName, adsStatus, orientation } = req.body;

  try {
      const pool = await sql.connect(config);
      await pool.request()
          .input('ads', sql.VarChar, adsStatus)
          .input('orientation', sql.VarChar, orientation)
          .input('branchName', sql.VarChar, branchName)
          .query(`
              UPDATE TBLM_BRANCHES
              SET Ads = @ads, ORIENTATION = @orientation
              WHERE BRANCH_NAME = @branchName
          `);

      res.status(200).json({ message: 'Branch settings updated successfully' });
  } catch (error) {
      console.error('Error updating branch settings:', error);
      res.status(500).send(error.message);
  }
});








// Fetch currencies from the database
app.get('/api/currencies', async (req, res) => {
    try {
      console.log("Fetching currencies...");
      const pool = await sql.connect(config);
      const result = await pool.request().query('SELECT CURRENCY_NAME, CURRENCY_CODE, COUNTRY_CODE, CURRENCY_NAME_ARABIC, STATUS FROM TBLM_CURRENCY');
      
      if (result.recordset.length === 0) {
        console.log("No currencies found in the database");
      } else {
        console.log("Currencies fetched:", result.recordset);
      }
      
      res.json(result.recordset); // Send data as response
    } catch (error) {
      console.error("Error fetching currencies:", error);
      res.status(500).send(error.message); // Send error response
    }
  });
  
  // Update currency status
  app.put('/api/currencies/:currencyCode', async (req, res) => {
    const { currencyCode } = req.params;
    const { status } = req.body;  // status will be 0 (inactive) or 1 (active)
  
    try {
      const pool = await sql.connect(config);
      const query = `
        UPDATE TBLM_CURRENCY
        SET STATUS = @status
        WHERE CURRENCY_CODE = @currencyCode
      `;
      
      await pool.request()
        .input('currencyCode', sql.NVarChar, currencyCode)
        .input('status', sql.Bit, status)
        .query(query);
  
      console.log(`Currency with code ${currencyCode} status updated to ${status ? 'Active' : 'Inactive'}`);
      res.status(200).send('Currency status updated successfully');
    } catch (error) {
      console.error("Error updating currency status:", error);
      res.status(500).send(error.message);
    }
  });
  



  // app.post("/saveCurrency", async (req, res) => {
  //   try {
  //     const { currencyName, currencyCode, countryCode, currencyNameArabic, currencyImage } = req.body;
  //     const base64Data = currencyImage.split(',')[1]; // remove 'data:image/...;base64,'
  //     const buffer = Buffer.from(base64Data, 'base64');
      
  //     console.log("Received:", {
  //       currencyName,
  //       currencyCode,
  //       countryCode,
  //       currencyNameArabic,
  //       imageSize: buffer.length
  //     });
  
  //     await sql.connect(config);
  //     const request = new sql.Request();
  
  //     // Check if the currency code already exists
  //     request.input("CURRENCY_CODE", sql.VarChar(3), currencyCode);
  //     const checkQuery = `
  //       SELECT COUNT(*) AS CurrencyExists 
  //       FROM TBLM_CURRENCY
  //       WHERE CURRENCY_CODE = @CURRENCY_CODE
  //     `;
  
  //     const result = await request.query(checkQuery);
  
  //     if (result.recordset[0].CurrencyExists > 0) {
  //       return res.json({ success: false, error: "Currency already exists." });
  //     }
  
  //     // Proceed with inserting the new currency data
  //     request.input("CURRENCY_NAME", sql.VarChar(100), currencyName);
  //     request.input("COUNTRY_CODE", sql.VarChar(2), countryCode);
  //     request.input("CURRENCY_NAME_ARABIC", sql.NVarChar(100), currencyNameArabic);
  //     request.input("FLAG_NAME", sql.VarBinary(sql.MAX), buffer);
  //     request.input("STATUS", sql.Int, 1); // default status = 1
  
  //     await request.query(`
  //       INSERT INTO TBLM_CURRENCY 
  //       (CURRENCY_CODE, CURRENCY_NAME, COUNTRY_CODE, CURRENCY_NAME_ARABIC, FLAG_NAME, STATUS)
  //       VALUES (@CURRENCY_CODE, @CURRENCY_NAME, @COUNTRY_CODE, @CURRENCY_NAME_ARABIC, @FLAG_NAME, @STATUS)
  //     `);
  
  //     res.json({ success: true });
  //   } catch (error) {
  //     console.error("DB error:", error.message);
  //     res.json({ success: false, error: error.message });
  //   }
  // });



  app.post("/saveCurrency", async (req, res) => {
  try {
    let { currencyName, currencyCode, countryCode, currencyNameArabic, currencyImage } = req.body;

    // Convert to uppercase
    currencyName = currencyName.toUpperCase();
    currencyCode = currencyCode.toUpperCase();
    countryCode = countryCode.toUpperCase();

    const base64Data = currencyImage.split(',')[1]; // remove 'data:image/...;base64,'
    const buffer = Buffer.from(base64Data, 'base64');
    
    console.log("Received:", {
      currencyName,
      currencyCode,
      countryCode,
      currencyNameArabic,
      imageSize: buffer.length
    });

    await sql.connect(config);
    const request = new sql.Request();

    // Check if the currency code already exists
    request.input("CURRENCY_CODE", sql.VarChar(3), currencyCode);
    const checkQuery = `
      SELECT COUNT(*) AS CurrencyExists 
      FROM TBLM_CURRENCY
      WHERE CURRENCY_CODE = @CURRENCY_CODE
    `;

    const result = await request.query(checkQuery);

    if (result.recordset[0].CurrencyExists > 0) {
      return res.json({ success: false, error: "Currency already exists." });
    }

    // Proceed with inserting the new currency data
    request.input("CURRENCY_NAME", sql.VarChar(100), currencyName);
    request.input("COUNTRY_CODE", sql.VarChar(2), countryCode);
    request.input("CURRENCY_NAME_ARABIC", sql.NVarChar(100), currencyNameArabic);
    request.input("FLAG_NAME", sql.VarBinary(sql.MAX), buffer);
    request.input("STATUS", sql.Int, 1); // default status = 1

    await request.query(`
      INSERT INTO TBLM_CURRENCY 
      (CURRENCY_CODE, CURRENCY_NAME, COUNTRY_CODE, CURRENCY_NAME_ARABIC, FLAG_NAME, STATUS)
      VALUES (@CURRENCY_CODE, @CURRENCY_NAME, @COUNTRY_CODE, @CURRENCY_NAME_ARABIC, @FLAG_NAME, @STATUS)
    `);

    res.json({ success: true });
  } catch (error) {
    console.error("DB error:", error.message);
    res.json({ success: false, error: error.message });
  }
});


async function updateRanks() {
  try {
    // Connect to the database
    await sql.connect(config);

    // Define the query to reset ranks for each branch
    const query = `
      WITH RankedData AS (
        SELECT 
          CountryID,
          BranchName,
          CountryName,
          CountryCode,
          BuyRate,
          SellRate,
          TTRemittanceRate,
          Updated_BY,
          Updated_On,
          CurrencyCode,
          Rank,
          ROW_NUMBER() OVER (PARTITION BY BranchName ORDER BY Rank) AS NewRank
        FROM CountryRates
      )
      UPDATE CountryRates
      SET Rank = RankedData.NewRank
      FROM CountryRates
      INNER JOIN RankedData ON CountryRates.CountryID = RankedData.CountryID;
    `;

    // Execute the query
    await sql.query(query);

    console.log("Ranks updated successfully.");

  } catch (err) {
    console.error("Error updating ranks:", err);
  } finally {
    // Close the connection
    await sql.close();
  }
}

// Call the function to update ranks
updateRanks();



// API to Fetch Marquee Text
app.get('/marquee', async (req, res) => {
    try {
        await sql.connect(config);
        const result = await sql.query('SELECT TOP 1 text FROM RateTableMarqueeText');
        res.json({ marqueeText: result.recordset[0]?.text || 'Default marquee text' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Database Error');
    }
});


// API to Save Updated Marquee Text
app.post('/save-marquee', async (req, res) => {
    try {
      const { marqueeText } = req.body;  // Get the updated text from the request body
  
      // Check if the text is empty
      if (!marqueeText) {
        return res.status(400).json({ success: false, message: 'Marquee text cannot be empty.' });
      }
  
      await sql.connect(config);
      await sql.query`UPDATE RateTableMarqueeText SET text = ${marqueeText} WHERE id = 1`; // Assuming the id is 1
  
      res.json({ success: true, message: 'Marquee text updated successfully.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Database Error' });
    }
  });
  



const multer = require("multer");


// Configure multer for file upload (set destination to 'uploads/')
const upload = multer({
    dest: 'uploads/', // Temporary directory for uploaded files
}).single('image');

// Serve images from the network share
app.use("/images", express.static("\\\\192.168.140.154\\share\\01234567890")); 













app.get("/api/images", (req, res) => {
    console.log("Fetching images and videos from shared folder...");

    const folderPath = "\\\\192.168.140.154\\share\\01234567890";
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error("Error reading the folder:", err);
            return res.status(500).json({ error: "Unable to read folder" });
        }
        // Filter both images and video files
        const mediaFiles = files.filter(file => 
            /\.(jpg|jpeg|png|gif|mp4|avi|mov|mkv|webm)$/i.test(file)
        );
        console.log("Media files found:", mediaFiles);
        res.json(mediaFiles); // Return list of images and videos
    });
});




// //API to get image list
// app.get("/api/images", (req, res) => {
//     console.log("Fetching images from shared folder...");

//     const folderPath = "\\\\192.168.140.154\\share\\01234567890";
//     fs.readdir(folderPath, (err, files) => {
//         if (err) {
//             console.error("Error reading the folder:", err);
//             return res.status(500).json({ error: "Unable to read folder" });
//         }
//         const images = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
//         console.log("Images found:", images);
//         res.json(images); // Return list of images
//     });
// });

// API to upload image
app.post("/api/upload", (req, res) => {
    console.log("Upload request received...");

    // Call multer to handle file upload
    upload(req, res, (err) => {
        if (err) {
            console.error("Error with multer during file upload:", err);
            return res.status(500).json({ error: "Error with file upload" });
        }

        if (!req.file) {
            console.error("No file uploaded.");
            return res.status(400).json({ error: "No file uploaded" });
        }

        console.log("File uploaded successfully:", req.file);

        // Move the file to the shared network folder
        const targetPath = path.join("\\\\192.168.140.154\\share\\01234567890", req.file.originalname);
        console.log("Copying file to:", targetPath);

        // Use fs.copyFile() to copy the file to the shared network folder
        fs.copyFile(req.file.path, targetPath, (err) => {
            if (err) {
                console.error("Error copying the file:", err);
                return res.status(500).json({ error: "Error saving file" });
            }

            // Delete the temporary file after copying
            fs.unlink(req.file.path, (err) => {
                if (err) {
                    console.error("Error deleting the temporary file:", err);
                } else {
                    console.log("Temporary file deleted successfully.");
                }
            });

            console.log("File successfully copied to the shared folder.");
            res.status(200).json({ message: "File uploaded successfully" });
        });
    });
});



// API to delete image
app.delete("/api/delete/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join("\\\\192.168.140.154\\share\\01234567890", filename);

    console.log(`Delete request for file: ${filename}`);

    // Check if the file exists before attempting to delete
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error(`File not found: ${filename}`);
            return res.status(404).json({ error: "File not found" });
        }

        // Delete the file
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error("Error deleting the file:", err);
                return res.status(500).json({ error: "Error deleting file" });
            }

            console.log(`File deleted: ${filename}`);
            res.status(200).json({ message: "File deleted successfully" });
        });
    });
});






// Path to your shared folder
const folderPath = '\\\\192.168.140.154\\share\\54321'; // Shared folder path



// Serve static files from the shared folder
const staticFolderPath = path.join(folderPath.replace(/\\/g, '/'));

app.use('/images', express.static(staticFolderPath));




// Endpoint to get image files from the shared folder
app.get('/images-list', (req, res) => {
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error('Error reading shared folder:', err);
            return res.status(500).send('Error reading shared folder');
        }

        // Filter for image files based on extensions
        const imageFiles = files.filter(file => ['.jpg', '.jpeg', '.png', '.gif', '.mp4', '.avi', '.mov', '.mkv', '.webm'].includes(path.extname(file).toLowerCase()));

        // Generate URLs for each image (using the /images URL path to serve images)
        const imageUrls = imageFiles.map(file => `/images/${file}`);

        // Return the image URLs as JSON
        res.json(imageUrls);
    });
});




// Endpoint to handle image deletion
app.delete('/delete-image', (req, res) => {
    console.log("Received delete request body:", req.body); // Debugging log

    if (!req.body || !req.body.imageName) {
        console.error("Error: No imageName received.");
        return res.status(400).json({ error: "Image name is required" });
    }

    const { imageName } = req.body;
    const imagePath = path.join(folderPath, imageName);

    // Check if file exists
    fs.access(imagePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error(`File not found: ${imagePath}`);
            return res.status(404).json({ error: "File not found" });
        }

        // Delete the file
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error(`Error deleting image: ${err}`);
                return res.status(500).json({ error: "Error deleting image" });
            }
            console.log(`Successfully deleted: ${imagePath}`);
            res.json({ message: "Image deleted successfully" });
        });
    });
});





// // Fetch Ads status for the selected branch
// app.get('/get-ads-status', async (req, res) => {
//     const { branchName } = req.query;

//     try {
//         // Connect to the database
//         await sql.connect(config);

//         // Fetch Ads status for the selected branch
//         const result = await sql.query`
//             SELECT Ads, ORIENTATION
//             FROM TBLM_BRANCHES
//             WHERE BRANCH_NAME = ${branchName} AND STATUS = 'ACTIVE';
//         `;

//         if (result.recordset.length > 0) {
//             const adsStatus = result.recordset[0].Ads;
//             res.json({ adsEnabled: adsStatus === 'Enabled' });
//         } else {
//             res.json({ adsEnabled: false });
//         }
//     } catch (error) {
//         console.error('Database error:', error);
//         res.status(500).json({ message: 'Error fetching advertisements status' });
//     }
// });

app.get('/check-ads', async (req, res) => {
  const { branchName } = req.query;

  try {
    const pool = await sql.connect('mssql://username:password@server/database');
    const result = await pool.request()
      .input('branchName', sql.NVarChar, branchName)
      .query('SELECT Ads FROM TBLM_BRANCHES WHERE Branch_Name = @branchName');
    
    if (result.recordset.length > 0) {
      const adsStatus = result.recordset[0].Ads;
      res.json({ ads: adsStatus });
    } else {
      res.json({ ads: 'Disabled' });
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});



app.get('/get-ads-status', async (req, res) => {
    const { branchName } = req.query;
    console.log('Branch Name:', branchName);  // Log branch name for debugging

    try {
        // Connect to the database
        await sql.connect(config);

        // Fetch Ads status and Orientation for the selected branch
        const result = await sql.query`
            SELECT Ads, ORIENTATION
            FROM TBLM_BRANCHES
            WHERE BRANCH_NAME = ${branchName} AND STATUS = 'ACTIVE';
        `;

        console.log('Query result:', result.recordset);  // Log query result for debugging

        if (result.recordset.length > 0) {
            const adsStatus = result.recordset[0].Ads;
            const orientation = result.recordset[0].ORIENTATION;
            res.json({
                adsEnabled: adsStatus === 'Enabled',  // Check if the Ads status is "Enabled"
                orientation: orientation || null      // Return null if orientation is missing
            });
        } else {
            res.json({ adsEnabled: false, orientation: null });
        }
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Error fetching advertisements status' });
    }
});


app.post('/update-orientation', async (req, res) => {
    const { branchName, orientation } = req.body;

    console.log('Updating Orientation:', { branchName, orientation });

    if (!branchName || !orientation) {
        return res.status(400).json({ message: 'Missing parameters' });
    }

    try {
        // Connect to the database
        await sql.connect(config);

        // Update the ORIENTATION for the selected branch
        const result = await sql.query`
            UPDATE TBLM_BRANCHES
            SET ORIENTATION = ${orientation}
            WHERE BRANCH_NAME = ${branchName} AND STATUS = 'ACTIVE';
        `;

        console.log('Update Result:', result);
        res.json({ success: true, message: 'Orientation updated successfully' });

    } catch (error) {
        console.error('Database update error:', error);
        res.status(500).json({ success: false, message: 'Error updating orientation' });
    }
});


// Update Ads status in the database
app.post('/update-ads-status', async (req, res) => {
    const { branchName, adsEnabled } = req.body;

    try {
        // Connect to the database
        await sql.connect(config);

        // Update Ads field based on the checkbox state
        const adsStatus = adsEnabled ? 'Enabled' : 'Disabled';
        const result = await sql.query`
            UPDATE TBLM_BRANCHES
            SET Ads = ${adsStatus}
            WHERE BRANCH_NAME = ${branchName} AND STATUS = 'ACTIVE';
        `;

        // Respond with a success message
        res.json({ message: `Advertisements ${adsStatus} for branch: ${branchName}` });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ message: 'Error updating advertisements' });
    }
});








app.get('/check-ads-status', (req, res) => {
    const branchName = req.query.branchName;

    if (!branchName) {
        return res.status(400).json({ error: 'Branch name is required' });
    }

    const query = `
        SELECT Ads
        FROM TBLM_BRANCHES
        WHERE BRANCH_NAME = @branchName
    `;

    sql.connect(config)
        .then(pool => pool.request()
            .input('branchName', sql.NVarChar, branchName)
            .query(query))
        .then(result => {
            const adsStatus = result.recordset[0]?.Ads;
            // Assuming Ads = 'Enabled' means ads are ON
            const adsEnabled = (adsStatus && adsStatus.toUpperCase() === 'ENABLED');
            res.json({ adsEnabled });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Database error' });
        });
});





app.get("/check-ads", async (req, res) => {
    const { branchName } = req.query;
  
    if (!branchName) {
      return res.status(400).json({ error: "Branch name is required" });
    }
  
    try {
      const pool = await sql.connect(config);
      const result = await pool
        .request()
        .input("BranchName", sql.VarChar, branchName)
        .query("SELECT Ads FROM TBLM_BRANCHES WHERE BRANCH_NAME = @BranchName");
  
      if (result.recordset.length > 0 && result.recordset[0].Ads === "Enabled") {
        res.json({ adsEnabled: true });
      } else {
        res.json({ adsEnabled: false });
      }
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  



// Endpoint to update TIME_INTERVAL
app.post("/update-time", async (req, res) => {
    const { time } = req.body;

    try {
        let pool = await sql.connect(config);
        let result = await pool.request().query(`UPDATE RATE_TBLM_MASTER SET TIME_INTERVAL = ${time}`);
        
        res.json({ message: "Time Interval Updated Successfully" });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Database Update Failed" });
    }
});


// API route to fetch the timer interval
app.get("/get-timer-interval", async (req, res) => {
    try {
        // Connect to the database
        const pool = await sql.connect(config);

        // Fetch the interval from the database
        const result = await pool.request().query("SELECT TIME_INTERVAL FROM RATE_TBLM_MASTER");

        // Ensure data is retrieved correctly
        if (result.recordset.length > 0) {
            const interval = result.recordset[0].TIME_INTERVAL || 5000; // Default to 5000ms if NULL
            res.json({ interval });
        } else {
            res.json({ interval: 5000 }); // Default if no data is found
        }
    } catch (error) {
        console.error("Error fetching timer interval:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});







const uploadFolder = "\\\\192.168.140.154\\share\\54321"; // Shared folder path

// Ensure the folder exists
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload2 = multer({ storage });

// Upload API endpoint
app.post("/upload", upload2.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    res.json({ message: "File uploaded successfully", filename: req.file.filename });
});








app.get("/get-ad-timer", async (req, res) => {
    try {
      await sql.connect(config);
  
      // Fetch the first available timer duration from the AdSettings table
      const result = await sql.query`SELECT TOP 1 TimerDuration FROM AdSettings`;
  
      if (result.recordset.length > 0) {
        const timerDuration = result.recordset[0].TimerDuration;
        res.json({ timerDuration });
      } else {
        res.status(404).json({ message: "No timer found" });
      }
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  });
  



// Endpoint to update the Ad Hide Duration
app.post('/update-ad-hide-duration', async (req, res) => {
    const { duration } = req.body;  // Duration from the front-end

    if (!duration || isNaN(duration)) {
        return res.status(400).json({ message: "Invalid duration" });  // Return a proper error response
    }

    try {
        await sql.connect(config);
        // Assuming the column for Ad Hide Duration is named "AdHideDuration" in your table
        const result = await sql.query`
            UPDATE AdSettings
            SET TimerDuration = ${duration}
            WHERE ID = 1;  -- or whichever ID you want to update
        `;

        // Return success response
        res.json({ message: "Ad hide duration updated successfully", duration });
    } catch (error) {
        console.error("Database error:", error);

        // Return error response
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});






app.post('/update-time-interval', async (req, res) => {
    const { timeInterval } = req.body;
  
    if (timeInterval !== undefined) {
      try {
        await sql.connect(config);
        const result = await sql.query`UPDATE AdvertisementSettings SET  IntervalTime = ${timeInterval}`;
  
        if (result.rowsAffected[0] > 0) {
          res.json({ success: true, message: 'Database updated successfully.' });
        } else {
          res.status(400).json({ success: false, message: 'Failed to update the database.' });
        }
      } catch (err) {
        console.error('Error updating database:', err);
        res.status(500).json({ success: false, message: 'Internal server error.' });
      } finally {
        await sql.close();
      }
    } else {
      res.status(400).json({ success: false, message: 'Invalid time interval.' });
    }
  });
  





// Endpoint to fetch the time interval
app.get('/get-interval', async (req, res) => {
    try {
        await sql.connect(config);
        const result = await sql.query`SELECT IntervalTime FROM AdvertisementSettings`;
        const intervalTime = result.recordset[0]?.IntervalTime || 5000; // Default to 5000ms if not found
        res.json({ interval: intervalTime });
    } catch (err) {
        console.error('Error fetching interval:', err);
        res.status(500).json({ error: 'Failed to fetch interval' });
    }
});








app.post('/api/rates/alert', async (req, res) => {
    const { branchName, alertMessage, changes, updatedBy } = req.body;  // Include updatedBy from frontend

    if (alertMessage && changes) {
        console.log(`Alert message for branch ${branchName}:`);
        console.log(alertMessage);

        try {
            const updatedOn = moment().format('YYYY-MM-DD HH:mm:ss');

            const pool = await sql.connect(config);

            for (const change of changes) {
                const { countryID, oldValues, newValues } = change;

                const isValuesChanged = (
                    oldValues.BuyRate !== newValues.BuyRate ||
                    oldValues.SellRate !== newValues.SellRate ||
                    oldValues.TTRemittanceRate !== newValues.TTRemittanceRate ||
                    oldValues.Rank !== newValues.Rank
                );

                if (isValuesChanged) {
                    console.log(`Processing changes for CountryID: ${countryID}`);

                    const oldBuyRate = oldValues.BuyRate ? parseFloat(oldValues.BuyRate) : null;
                    const oldSellRate = oldValues.SellRate ? parseFloat(oldValues.SellRate) : null;
                    const oldTTRemittanceRate = oldValues.TTRemittanceRate ? parseFloat(oldValues.TTRemittanceRate) : null;

                    const newBuyRate = newValues.BuyRate ? parseFloat(newValues.BuyRate) : null;
                    const newSellRate = newValues.SellRate ? parseFloat(newValues.SellRate) : null;
                    const newTTRemittanceRate = newValues.TTRemittanceRate ? parseFloat(newValues.TTRemittanceRate) : null;

                    const countryResult = await pool.request()
                        .input('CountryID', sql.Int, countryID)
                        .query(`
                            SELECT r.CountryName
                            FROM CountryRates r
                            WHERE r.CountryID = @CountryID
                        `);

                    if (countryResult.recordset.length > 0) {
                        const countryData = countryResult.recordset[0];
                        const countryName = countryData.CountryName;

                        await pool.request()
                            .input('BranchName', sql.NVarChar, branchName)
                            .input('CountryID', sql.Int, countryID)
                            .input('OldBuyRate', sql.Decimal(18, 9), oldBuyRate)
                            .input('OldSellRate', sql.Decimal(18, 9), oldSellRate)
                            .input('OldTTRemittanceRate', sql.Decimal(18, 9), oldTTRemittanceRate)
                            .input('NewBuyRate', sql.Decimal(18, 9), newBuyRate)
                            .input('NewSellRate', sql.Decimal(18, 9), newSellRate)
                            .input('NewTTRemittanceRate', sql.Decimal(18, 9), newTTRemittanceRate)
                            .input('UpdatedOn', sql.DateTime, updatedOn)
                            .input('UpdatedBy', sql.NVarChar, updatedBy) // Corrected
                            .input('CurrecnyName', sql.NVarChar, countryName)
                            .query(`
                                INSERT INTO RateAlertsLog 
                                    (BranchName, CountryID, OldBuyRate, OldSellRate, OldTTRemittanceRate, 
                                     NewBuyRate, NewSellRate, NewTTRemittanceRate, CreatedAt, UpdatedBy, CurrecnyName)
                                VALUES 
                                    (@BranchName, @CountryID, @OldBuyRate, @OldSellRate, @OldTTRemittanceRate,  
                                     @NewBuyRate, @NewSellRate, @NewTTRemittanceRate, GETDATE(), @UpdatedBy, @CurrecnyName);
                            `);

                        console.log(`Changes processed for CountryID: ${countryID}`);
                    } else {
                        console.log(`Country details not found for CountryID: ${countryID}`);
                    }
                } else {
                    console.log(`No changes detected for CountryID: ${countryID}, skipping.`);
                }
            }

            res.status(200).json({ message: 'Changes logged successfully' });
        } catch (err) {
            console.error('Error processing changes:', err);
            res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        res.status(400).json({ message: 'No changes provided' });
    }
});















const { DateTime } = require("luxon");

app.post('/logs', async (req, res) => {
    const logData = req.body;

    // Function to round a number to 4 decimal places
    const roundToDecimalPlaces = (value, decimals) => {
        const numberValue = Number(value); // Convert the value to a number
        if (isNaN(numberValue)) {
            return null; // Return null if the value is not a valid number
        }
        return parseFloat(numberValue.toFixed(decimals)); // Round to the desired decimal places
    };

    try {
        const pool = await sql.connect(config);

        // Round rates to 4 decimal places without checking for valid numbers
        const oldBuyRate = roundToDecimalPlaces(logData.OldBuyRate, 4);
        const newBuyRate = roundToDecimalPlaces(logData.NewBuyRate, 4);
        const oldSellRate = roundToDecimalPlaces(logData.OldSellRate, 4);
        const newSellRate = roundToDecimalPlaces(logData.NewSellRate, 4);
        const oldTTRemittanceRate = roundToDecimalPlaces(logData.OldTTRemittanceRate, 4);
        const newTTRemittanceRate = roundToDecimalPlaces(logData.NewTTRemittanceRate, 4);

        // Get current timestamp in Dubai time (YYYY-MM-DD HH:mm)
        const createdAtDubai = DateTime.now().setZone("Asia/Dubai").toFormat("yyyy-MM-dd HH:mm");

        // Insert the log data into RateAlertsLog table
        await pool.request()
            .input('BranchName', sql.NVarChar, logData.BranchName)
            .input('CountryID', sql.Int, logData.CountryID)
            .input('OldBuyRate', sql.Decimal(9, 4), oldBuyRate)
            .input('OldSellRate', sql.Decimal(9, 4), oldSellRate)
            .input('OldTTRemittanceRate', sql.Decimal(9, 4), oldTTRemittanceRate)
            .input('OldRank', sql.Int, logData.OldRank)
            .input('NewBuyRate', sql.Decimal(9, 4), newBuyRate)
            .input('NewSellRate', sql.Decimal(9, 4), newSellRate)
            .input('NewTTRemittanceRate', sql.Decimal(9, 4), newTTRemittanceRate)
            .input('NewRank', sql.Int, logData.NewRank)
            .input('CreatedAt', sql.NVarChar, createdAtDubai)  // Trimmed format
            .input('UpdatedBy', sql.NVarChar, logData.UpdatedBy)
            .query(`
                INSERT INTO RateAlertsLog
                (BranchName, CountryID, OldBuyRate, OldSellRate, OldTTRemittanceRate, 
                 NewBuyRate, NewSellRate, NewTTRemittanceRate, CreatedAt, UpdatedBy)
                VALUES
                (@BranchName, @CountryID, @OldBuyRate, @OldSellRate, @OldTTRemittanceRate, 
                 @NewBuyRate, @NewSellRate, @NewTTRemittanceRate, @CreatedAt, @UpdatedBy)
            `);

        // Update the CurrencyName in RateAlertsLog table from countryrates
        await pool.request()
            .input('CountryID', sql.Int, logData.CountryID)
            .input('BranchName', sql.NVarChar, logData.BranchName)
            .query(`
                UPDATE r
                SET r.CurrecnyName = c.CountryName
                FROM RateAlertsLog r
                JOIN countryrates c ON r.CountryID = c.CountryID
                WHERE r.CountryID = @CountryID AND r.BranchName = @BranchName
            `);

        res.status(200).send({
            message: 'Log saved successfully with Dubai time (YYYY-MM-DD HH:mm) and CurrencyName updated',
            createdAt: createdAtDubai
        });

    } catch (err) {
        console.error('Error logging change:', err);
        res.status(500).send('Error logging change');
    }
});


app.get('/getRateAlertsLog', async (req, res) => {
  try {
    await sql.connect(config);

    const result = await sql.query(`
      SELECT 
        Id,
        BranchName,
        OldBuyRate,
        OldSellRate,
        OldTTRemittanceRate,
        NewBuyRate,
        NewSellRate,
        NewTTRemittanceRate,
        CreatedAt,
        UpdatedBy,
        CurrecnyName 
      FROM RateAlertsLog
    `);

    // Format the rates to 4 decimal places, and if NaN, make it '0.0000'
    const formattedData = result.recordset.map(row => ({
      ...row,
      OldBuyRate: isNaN(parseFloat(row.OldBuyRate)) ? "0.0000" : parseFloat(row.OldBuyRate).toFixed(5),
      OldSellRate: isNaN(parseFloat(row.OldSellRate)) ? "0.0000" : parseFloat(row.OldSellRate).toFixed(5),
      OldTTRemittanceRate: isNaN(parseFloat(row.OldTTRemittanceRate)) ? "0.0000" : parseFloat(row.OldTTRemittanceRate).toFixed(5),
      NewBuyRate: isNaN(parseFloat(row.NewBuyRate)) ? "0.0000" : parseFloat(row.NewBuyRate).toFixed(5),
      NewSellRate: isNaN(parseFloat(row.NewSellRate)) ? "0.0000" : parseFloat(row.NewSellRate).toFixed(5),
      NewTTRemittanceRate: isNaN(parseFloat(row.NewTTRemittanceRate)) ? "0.0000" : parseFloat(row.NewTTRemittanceRate).toFixed(5),
    }));

    res.json(formattedData);
    console.log(formattedData);

  } catch (err) {
    console.error('Error querying the database:', err);
    res.status(500).send('Server error');
  }
});



  app.use(express.json());  // Important: Parses JSON body
app.use(express.urlencoded({ extended: true }));  // Handles URL-encoded forms

// POST request handler





// POST request handler
app.post('/entry', async (req, res) => {
    const { 
        BranchName, 
        CountryID, 
        OldBuyRate, 
        OldSellRate, 
        OldTTRemittanceRate, 
        NewBuyRate, 
        NewSellRate, 
        NewTTRemittanceRate, 
        CreatedAt, 
        CurrencyName,  
        UpdatedBy 
    } = req.body;

    console.log("Received POST request with data:", req.body);
    const createdAtDubai = DateTime.now().setZone("Asia/Dubai").toFormat("yyyy-MM-dd HH:mm");

    try {
        const pool = await sql.connect(config);
        console.log("Connected to database successfully");

        // Prepare the SQL query to insert the data into RateAlertsLog
        const result = await pool.request()
            .input('BranchName', sql.NVarChar, BranchName)
            .input('CountryID', sql.Int, CountryID)
            .input('OldBuyRate', sql.Decimal(18, 9), OldBuyRate)  
            .input('OldSellRate', sql.Decimal(18, 9), OldSellRate)
            .input('OldTTRemittanceRate', sql.Decimal(18, 9), OldTTRemittanceRate)
            .input('NewBuyRate', sql.Decimal(18, 9), NewBuyRate)
            .input('NewSellRate', sql.Decimal(18, 9), NewSellRate)
            .input('NewTTRemittanceRate', sql.Decimal(18, 9), NewTTRemittanceRate)
            .input('CreatedAt', sql.NVarChar, createdAtDubai) 
            .input('CurrecnyName', sql.NVarChar, CurrencyName)  
            .input('UpdatedBy', sql.NVarChar, UpdatedBy)
            .query(`
                INSERT INTO RateAlertsLog 
                (BranchName, CountryID, OldBuyRate, OldSellRate, OldTTRemittanceRate, NewBuyRate, NewSellRate, NewTTRemittanceRate, CreatedAt, CurrecnyName, UpdatedBy)
                VALUES 
                (@BranchName, @CountryID, @OldBuyRate, @OldSellRate, @OldTTRemittanceRate, @NewBuyRate, @NewSellRate, @NewTTRemittanceRate, @CreatedAt, @CurrecnyName, @UpdatedBy);
            `);

        console.log("Data inserted successfully:", result);
        
        res.status(200).send('Data saved successfully');
    } catch (error) {
        console.error('Error inserting data into database:', error);
        res.status(500).send(`Error inserting data into database: ${error.message}`);
    } finally {
        sql.close();
    }
});




// app.post('/log-deletion', async (req, res) => {
//     const { username, deletedData, deletedOn } = req.body;
//     const createdAtDubai = DateTime.now().setZone("Asia/Dubai").toFormat("yyyy-MM-dd HH:mm");

//     // Prepare the SQL query to insert the deletion details into the RatesAlertsLog table
//     const query = `
//         INSERT INTO RateAlertsLog (BranchName, CountryID, OldBuyRate, OldSellRate, OldTTRemittanceRate, NewBuyRate, NewSellRate, NewTTRemittanceRate, CreatedAt, CurrecnyName, UpdatedBy)
//         VALUES (@BranchName, @CountryID, @OldBuyRate, @OldSellRate, @OldTTRemittanceRate, @NewBuyRate, @NewSellRate, @NewTTRemittanceRate, @CreatedAt, @CurrecnyName, @UpdatedBy)
//     `;

//     try {
//         // Create a new SQL request object using the pool (assuming the pool is already connected)
//         const request = new sql.Request(); // This creates a new request object

//         // Set inputs for the query
//         request.input('BranchName', sql.NVarChar, deletedData.BranchName);
//         request.input('CountryID', sql.Int, 0);  // Using 0 as the CountryID as per your request
//         request.input('OldBuyRate', sql.Decimal, deletedData.BuyRate);
//         request.input('OldSellRate', sql.Decimal, deletedData.SellRate);
//         request.input('OldTTRemittanceRate', sql.Decimal, deletedData.TTRemittanceRate);
//         request.input('NewBuyRate', sql.Decimal, 0);  // New rates are set to 0
//         request.input('NewSellRate', sql.Decimal, 0);
//         request.input('NewTTRemittanceRate', sql.Decimal, 0);
//         request.input('CreatedAt', sql.NVarChar, createdAtDubai);  // Timestamp for the deletion
//         request.input('CurrecnyName', sql.NVarChar, deletedData.CountryName);
//         request.input('UpdatedBy', sql.NVarChar, username);

//         // Execute the query
//         await request.query(query);

//         // Respond with success
//         res.status(200).send({ message: 'Deletion logged and data added successfully' });
//     } catch (error) {
//         console.error('Error inserting deletion log:', error);
//         res.status(500).send({ message: 'Error logging the deletion' });
//     }
// });






app.post('/log-deletion', async (req, res) => {
    const { username, deletedData, deletedOn } = req.body;

    const createdAtDubai = DateTime.now().setZone("Asia/Dubai").toFormat("yyyy-MM-dd HH:mm");

    const query = `
        INSERT INTO RateAlertsLog (
            BranchName,
            CountryID,
            OldBuyRate,
            OldSellRate,
            OldTTRemittanceRate,
            NewBuyRate,
            NewSellRate,
            NewTTRemittanceRate,
            CreatedAt,
            CurrecnyName,
            UpdatedBy
        )
        VALUES (
            @BranchName,
            @CountryID,
            @OldBuyRate,
            @OldSellRate,
            @OldTTRemittanceRate,
            @NewBuyRate,
            @NewSellRate,
            @NewTTRemittanceRate,
            @CreatedAt,
            @CurrecnyName,
            @UpdatedBy
        )
    `;

    try {
        const request = new sql.Request();

        request.input('BranchName', sql.NVarChar, deletedData.BranchName);
        request.input('CountryID', sql.Int, 0);
        request.input('OldBuyRate', sql.Decimal(10, 4), parseFloat(deletedData.BuyRate));
        request.input('OldSellRate', sql.Decimal(10, 4), parseFloat(deletedData.SellRate));
        request.input('OldTTRemittanceRate', sql.Decimal(10, 4), parseFloat(deletedData.TTRemittanceRate));
        request.input('NewBuyRate', sql.Decimal(10, 4), 0);
        request.input('NewSellRate', sql.Decimal(10, 4), 0);
        request.input('NewTTRemittanceRate', sql.Decimal(10, 4), 0);
        request.input('CreatedAt', sql.NVarChar, createdAtDubai);
        request.input('CurrecnyName', sql.NVarChar, deletedData.CountryName);
        request.input('UpdatedBy', sql.NVarChar, username);

        await request.query(query);

        res.status(200).send({ message: 'Deletion logged and data added successfully' });
    } catch (error) {
        console.error('Error inserting deletion log:', error);
        res.status(500).send({ message: 'Error logging the deletion' });
    }
});






app.post('/update-rate', async (req, res) => {
    const {
        CountryID, BranchName, CountryName, CurrencyName,
        OldBuyRate, NewBuyRate, OldSellRate, NewSellRate,
        OldTTRemittanceRate, NewTTRemittanceRate, UpdatedBy
    } = req.body;

    try {
        const pool = await sql.connect(config); // Connect once to reuse

        // Update 'countryrates' table
        const updateQuery = `
            UPDATE countryrates
            SET 
                BuyRate = @NewBuyRate,
                SellRate = @NewSellRate,
                TTRemittanceRate = @NewTTRemittanceRate,
                Updated_BY = @UpdatedBy,
                Updated_On = GETDATE()
            WHERE
                CountryID = @CountryID AND
                BranchName = @BranchName`;

        const request = pool.request();
        request.input('CountryID', sql.Int, CountryID);
        request.input('BranchName', sql.NVarChar, BranchName);
        request.input('NewBuyRate', sql.Decimal(18, 9), NewBuyRate); // No rounding
        request.input('NewSellRate', sql.Decimal(18, 9), NewSellRate); // No rounding
        request.input('NewTTRemittanceRate', sql.Decimal(18, 9), NewTTRemittanceRate); // No rounding
        request.input('UpdatedBy', sql.NVarChar, UpdatedBy);

        await request.query(updateQuery); // Execute update query

        // Insert into RateAlertsLog
        const logQuery = `
            INSERT INTO RateAlertsLog
            (CountryID, BranchName, CurrecnyName, 
             OldBuyRate, NewBuyRate, OldSellRate, NewSellRate, 
             OldTTRemittanceRate, NewTTRemittanceRate, UpdatedBy, CreatedAt)
            VALUES
            (@CountryID, @BranchName, @CurrencyName, 
             @OldBuyRate, @NewBuyRate, @OldSellRate, @NewSellRate, 
             @OldTTRemittanceRate, @NewTTRemittanceRate, @UpdatedBy, GETDATE())`;

        const logRequest = pool.request();
        logRequest.input('CountryID', sql.Int, CountryID);
        logRequest.input('BranchName', sql.NVarChar, BranchName);
        logRequest.input('CurrencyName', sql.NVarChar, CountryName);
        logRequest.input('OldBuyRate', sql.Decimal(18, 9), OldBuyRate); // No rounding
        logRequest.input('NewBuyRate', sql.Decimal(18, 9), NewBuyRate); // No rounding
        logRequest.input('OldSellRate', sql.Decimal(18, 9), OldSellRate); // No rounding
        logRequest.input('NewSellRate', sql.Decimal(18, 9), NewSellRate); // No rounding
        logRequest.input('OldTTRemittanceRate', sql.Decimal(18, 9), OldTTRemittanceRate); // No rounding
        logRequest.input('NewTTRemittanceRate', sql.Decimal(18, 9), NewTTRemittanceRate); // No rounding
        logRequest.input('UpdatedBy', sql.NVarChar, UpdatedBy);

        await logRequest.query(logQuery); // Execute insert query

        // Send a single response after all operations are successful
        res.status(200).json({ message: 'Rate updated and log saved successfully' });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error updating rate or saving log' });
    }
});















// Define the route for logging data
app.post('/log-data', async (req, res) => {
    const logEntry = req.body;

    try {
        const pool = await mssql.connect(config); // Assuming 'config' is your MSSQL connection configuration
        await pool.request()
            .input('Action', mssql.NVarChar, logEntry.Action)
            .input('CountryID', mssql.Int, logEntry.CountryID)
            .input('BranchName', mssql.NVarChar, logEntry.BranchName)
            .input('CountryName', mssql.NVarChar, logEntry.CountryName)
            .input('CurrencyName', mssql.NVarChar, logEntry.CurrencyName)
            .input('OldBuyRate', mssql.Float, logEntry.OldBuyRate)
            .input('NewBuyRate', mssql.Float, logEntry.NewBuyRate)
            .input('OldSellRate', mssql.Float, logEntry.OldSellRate)
            .input('NewSellRate', mssql.Float, logEntry.NewSellRate)
            .input('OldTTRemittanceRate', mssql.Float, logEntry.OldTTRemittanceRate)
            .input('NewTTRemittanceRate', mssql.Float, logEntry.NewTTRemittanceRate)
            .input('UpdatedBy', mssql.NVarChar, logEntry.UpdatedBy)
            .input('Timestamp', mssql.DateTime, logEntry.Timestamp)
            .query(`
                INSERT INTO RateAlertsLog
                (Action, CountryID, BranchName, CountryName, CurrencyName, 
                 OldBuyRate, NewBuyRate, OldSellRate, NewSellRate, 
                 OldTTRemittanceRate, NewTTRemittanceRate, UpdatedBy, Timestamp)
                VALUES
                (@Action, @CountryID, @BranchName, @CountryName, @CurrencyName, 
                 @OldBuyRate, @NewBuyRate, @OldSellRate, @NewSellRate, 
                 @OldTTRemittanceRate, @NewTTRemittanceRate, @UpdatedBy, @Timestamp)
            `);

        res.status(200).json({ message: 'Log saved successfully' });
    } catch (error) {
        console.error('Error saving log:', error);
        res.status(500).json({ message: 'Error saving log' });
    }
});






app.get("/getUserProfession", async (req, res) => {
    const { username } = req.query;

    try {
        await sql.connect(config);
        const request = new sql.Request();
        request.input('username', sql.NVarChar, username);

        const result = await request.query(`
            SELECT Profession FROM RateTableUsers WHERE username = @username
        `);

        if (result.recordset.length > 0) {
            res.json(result.recordset[0]); // { Profession: "value" }
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ message: "Server error" });
    }
});
















// Store the folder paths for each branch in memory (to avoid needing to pass branch name during upload)
let branchFolderPaths = {};

// Set up multer for file uploads
const adsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const branchName = req.headers["branch-name"]; // Retrieve the branch name from headers

    if (!branchName || !branchFolderPaths[branchName]) {
      return cb(new Error("Branch folder is not created or invalid"));
    }

    const folderPath = branchFolderPaths[branchName]; // Use the already created folder path
    cb(null, folderPath); // Save the file to the branch folder
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Keep the original file name
  }
});

const adsUpload = multer({ storage: adsStorage });

// Handle POST request to save branch (folder creation logic)
app.post("/save-branch", (req, res) => {
  const { branchName } = req.body;
  console.log("Received branch name:", branchName);

  const sharedFolderPath = "\\\\192.168.140.154\\share\\ads";
  const branchFolderPath = path.join(sharedFolderPath, branchName);

  // Check if the folder exists
  if (fs.existsSync(branchFolderPath)) {
    console.log(`Folder already exists: ${branchFolderPath}`);
    branchFolderPaths[branchName] = branchFolderPath; // Store the folder path in memory
    return res.status(200).send({ message: "Folder already exists", folderPath: branchFolderPath });
  }

  // Create the folder if it doesn't exist
  try {
    fs.mkdirSync(branchFolderPath, { recursive: true });
    console.log(`Folder created: ${branchFolderPath}`);
    branchFolderPaths[branchName] = branchFolderPath; // Store the folder path in memory
    return res.status(200).send({ message: "Folder created successfully", folderPath: branchFolderPath });
  } catch (error) {
    console.error("Error creating folder:", error);
    return res.status(500).send({ message: "Failed to create folder" });
  }
});

// Handle file uploads
app.post("/upload-file", adsUpload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: "No file uploaded" });
  }

  console.log(`File uploaded successfully to ${req.file.path}`);
  res.status(200).send({ message: "File uploaded successfully", filePath: req.file.path });
});


const sharedFolderPath = "\\\\192.168.140.154\\share\\ads";
app.use('/share', express.static(sharedFolderPath));

// Get files for the selected branch
app.get("/get-branch-files", (req, res) => {
  const branchName = req.query.branchName;
  console.log("Received branch name:", branchName);

  if (!branchName) {
    return res.status(400).json({ error: "Branch name is required" });
  }

  const sanitizedBranchName = branchName.trim().replace(/\s+/g, ' ');
  console.log("Sanitized branch name:", sanitizedBranchName);

  const branchFolderPath = path.join(sharedFolderPath, sanitizedBranchName);
  console.log("Checking folder path:", branchFolderPath);

  if (!fs.existsSync(branchFolderPath)) {
    return res.status(404).json({ error: `Folder for branch '${branchName}' not found` });
  }

  fs.readdir(branchFolderPath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read files from the folder" });
    }

    console.log("Files found:", files);
    
    const filteredFiles = files.filter(file => !file.includes("Thumbs.db"));
    const fileData = filteredFiles.map(file => {
      const fileType = file.includes("landscape") ? "landscape" : "portrait";
      const fileLink = `/share/${sanitizedBranchName}/${file}`;
      return { name: file, link: fileLink, type: fileType };
    });

    res.json({ files: fileData });
  });
});


app.post("/delete-file", (req, res) => {
  const { fileName, filePath } = req.body;
  if (!fileName || !filePath) {
    return res.status(400).json({ error: "File name and path are required" });
  }

  // Decode file path
  const decodedFilePath = path.join(sharedFolderPath, decodeURIComponent(filePath.split("/share/")[1]));

  // Check if file exists
  if (!fs.existsSync(decodedFilePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  // Delete the file
  fs.unlink(decodedFilePath, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
      return res.status(500).json({ error: "Failed to delete file" });
    }

    console.log(`Deleted file: ${decodedFilePath}`);
    res.status(200).json({ message: "File deleted successfully" });
  });
});




const bcrypt = require('bcryptjs');


// Utility function to validate password format
function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(password);
  }


app.get('/usermanagement', async (req, res) => {
    try {
      await sql.connect(config);
      const result = await sql.query('SELECT * FROM RateTableUsers');
      
      
      const users = result.recordset.map(user => {
        return {
          ...user,
          password: ''  
        };
      });
      
      res.json(users);  
    } catch (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Internal Server Error');
    }
  });
  
  

// Delete User Endpoint
app.delete('/usermanagement/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        await sql.connect(config);
        const result = await sql.query`DELETE FROM RateTableUsers WHERE id = ${userId}`;
        if (result.rowsAffected[0] > 0) {
            res.status(200).send('User deleted successfully');
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).send('Internal Server Error');
    }
});


function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+]).{8,}$/;
    return regex.test(password);
  }
  
  // Update user API
  app.put('/usermanagement/:id', async (req, res) => {
    const { username, password, Branch, Profession } = req.body;
    const userId = req.params.id;
  
    try {
      let updates = [];
  
      if (username !== undefined) {
        updates.push(`username = '${username}'`);
      }
  
      if (password !== undefined) {
        if (!validatePassword(password)) {
          return res.status(400).send('Password must contain at least one uppercase letter, one lowercase letter, one number, one special character (!@#$%^&*()_+), and be at least 8 characters long.');
        }
        const encryptedPassword = await bcrypt.hash(password, 10);
        updates.push(`password = '${encryptedPassword}'`);
      }
  
      if (Branch !== undefined) {
        updates.push(`Branch = '${Branch}'`);
      }
  
      if (Profession !== undefined) {
        updates.push(`Profession = '${Profession}'`);
      }
  
      if (updates.length === 0) {
        return res.status(400).send('No valid fields to update.');
      }
  
      const updateQuery = `UPDATE RateTableUsers SET ${updates.join(', ')} WHERE id = ${userId}`;
  
      await sql.connect(config);
      await sql.query(updateQuery);
  
      res.status(200).send('User updated successfully');
    } catch (err) {
      console.error('Error updating user:', err);
      res.status(500).send('Failed to update user');
    }
  });
  





  app.get('/branch-names', async (req, res) => {
    try {
      await sql.connect(config);
      const result = await sql.query`SELECT BRANCH_NAME FROM TBLM_BRANCHES`;
      res.json(result.recordset); 
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    } finally {
      await sql.close();
    }
  });




  // Route to delete a branch
  app.delete('/delete-branch', async (req, res) => {
    const { branchName } = req.body; 
    if (!branchName) {
      return res.status(400).json({ error: 'Branch name is required' });
    }
  
    try {
      
      await sql.connect(config);
  
      
      const result = await sql.query`
        DELETE FROM TBLM_BRANCHES WHERE BRANCH_NAME = ${branchName}
      `;
  
      
      if (result.rowsAffected[0] > 0) {
        res.status(200).json({ message: 'Branch deleted successfully' });
      } else {
        res.status(404).json({ message: 'Branch not found' });
      }
    } catch (err) {
      console.error('Error deleting branch:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });



  
  app.post('/update-password', async (req, res) => {
    const { username, oldPassword, newPassword } = req.body;
  
    if (!username || !oldPassword || !newPassword) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
  
    try {
      
      await sql.connect(config);
  
      
      const result = await sql.query`
        SELECT password FROM RateTableUsers WHERE username = ${username}
      `;
  
      if (result.recordset.length === 0) {
        return res.status(404).json({ message: 'User not found.' });
      }
  
      const storedPassword = result.recordset[0].password;
  
      
      let isMatch = false;
  
      
      if (storedPassword.length === 60) {
        
        isMatch = await bcrypt.compare(oldPassword, storedPassword);
      } else {
        
        isMatch = storedPassword === oldPassword;
      }
  
      if (!isMatch) {
        return res.status(401).json({ message: 'Old password is incorrect.' });
      }
  
      
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
  
      
      await sql.query`
        UPDATE RateTableUsers SET password = ${hashedNewPassword} WHERE username = ${username}
      `;
  
    
      res.json({ message: 'Password updated successfully.' });
    } catch (err) {
      console.error('Error updating password:', err);
      res.status(500).json({ message: 'Internal server error.' });
    }
  });
 











  

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});













