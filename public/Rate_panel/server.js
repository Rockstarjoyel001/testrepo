// const { CompositionContextImpl } = require("twilio/lib/rest/video/v1/composition");
// CompositionContextImpl
// const PORT = 4002;
// const express = require("express");
// const luxon = require("luxon");
// const { SigningRequestConfigurationListInstance } = require("twilio/lib/rest/numbers/v1/signingRequestConfiguration");
// const { DateTime } = require("mssql");
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: true}));
// app.post('/logs', async (req, res) => {
//     const logData = req.body;
//     const roundToDecimalPlaces = (value, decimals) => {
//         const numberValue = Number(value); 
//         if (isNaN(numberValue)) {
//             return null; 
//         }
//         return parseFloat(numberValue.toFixed(decimals)); 
//     };
//     try {
//         const pool = await sql.connect(config);  
//         const oldBuyRate = roundToDecimalPlaces(logData.OldBuyRate, 4);
//         const newBuyRate = roundToDecimalPlaces(logData.NewBuyRate, 4);
//         const oldSellRate = roundToDecimalPlaces(logData.OldSellRate, 4);
//         const newSellRate = roundToDecimalPlaces(logData.NewSellRate, 4);
//         const oldTTRemittanceRate = roundToDecimalPlaces(logData.OldTTRemittanceRate, 4);
//         const newTTRemittanceRate = roundToDecimalPlaces(logData.NewTTRemittanceRate, 4);
//         const createdAtDubai = DateTime.now().setZone("Asia/Dubai").toFormat("yyyy-MM-dd HH:mm");
//         await pool.request()
//             .input('BranchName', sql.NVarChar, logData.BranchName)
//             .input('CountryID', sql.Int, logData.CountryID)
//             .input('OldBuyRate', sql.Decimal(9, 4), oldBuyRate)
//             .input('OldSellRate', sql.Decimal(9, 4), oldSellRate)
//             .input('OldTTRemittanceRate', sql.Decimal(9, 4), oldTTRemittanceRate)
//             .input('OldRank', sql.Int, logData.OldRank)
//             .input('NewBuyRate', sql.Decimal(9, 4), newBuyRate)
//             .input('NewSellRate', sql.Decimal(9, 4), newSellRate)
//             .input('NewTTRemittanceRate', sql.Decimal(9, 4), newTTRemittanceRate)
//             .input('NewRank', sql.Int, logData.NewRank)
//             .input('CreatedAt', sql.NVarChar, createdAtDubai) 
//             .input('UpdatedBy', sql.NVarChar, logData.UpdatedBy)
//             .query(`
//                 INSERT INTO Log
//                 (BranchName, CountryID, OldBuyRate, OldSellRate, OldTTRemittanceRate, 
//                  NewBuyRate, NewSellRate, NewTTRemittanceRate, CreatedAt, UpdatedBy)
//                 VALUES
//                 (@BranchName, @CountryID, @OldBuyRate, @OldSellRate, @OldTTRemittanceRate, 
//                  @NewBuyRate, @NewSellRate, @NewTTRemittanceRate, @CreatedAt, @UpdatedBy)
//             `);
//         await pool.request()
//             .input('CountryID', sql.Int, logData.CountryID)
//             .input('BranchName', sql.NVarChar, logData.BranchName)
//             .query(`
//                 UPDATE r
//                 SET r.CurrecnyName = c.CountryName
//                 FROM Log r
//                 JOIN countryrates c ON r.CountryID = c.CountryID
//                 WHERE r.CountryID = @CountryID AND r.BranchName = @BranchName
//             `);
//         res.status(200).send({
//             message: 'Log saved successfully with Dubai time (YYYY-MM-DD HH:mm) and CurrencyName updated',
//             createdAt: createdAtDubai
//         });
//     } catch (err) {
//         console.error('Error logging change:', err);
//         res.status(500).send('Error logging change');
//     }
// });


// app.get('/logs', async(req,res)=>{
//     const receivedlogs = Number(value);
//     if(isNaN(value.json)){
//         return value;
//         return roundToDecimalPlaces(numberValue.tofixed(decimals));
//     };
//   try{
//     const pool = await sql.connect(config);
//     const oldBuyRate = roundToDecimalPlaces(logData.NewBuyRate,9);
//     const newBuyRate = roundToDecimalPlaces(logData.OldBuyRate, 9);
//     const newSellRate = roundToDecimalPlaces(logData.NewSellRate, 9);
//     const oldSellRate = roundToDecimalPlaces(logData.oldSellRate, 9);
//     const oldTTRemittanceRate = roundToDecimalPlaces(logData.oldTTRemittanceRate, 9);
//     const newTTRemittanceRate = roundToDecimalPlaces(logData.newTTRemittanceRate,9);
//     const luxon_Time = DateTime.now().setZone("Asia/United Arab Emirates")
//     .toFormat("YYYY-MM-DD HH:MM");
//     await pool.request()
//     .input('BranchName', sql.NVarChar, logData.BranchName)
//     .input('CountryID', sql.Int, logData.CountryID)
//     .input('oldbuyrate', sql.decimal(9,4), oldBuyRate)
//     .input('oldsellrate', sql.decimal(9,4), oldSellRate)
//     .input('oldTTRemittanceRate', sql.decimal(9,4), oldTTRemittanceRate)
//     .input('NewBuyRate', sql.decimal(9,4), NewBuyRate)
//     .input('NewSellRate', sql.decimal(9,4), NewSellRate)
//     .input('NewTTRemittanceRate', sql.decimal(9,4), NewTTRemittanceRate)
//     .input('NewRank', sql.Int, logData.NewRank)
//     .input('createdAt', sql.Nvarchar, createdAtDubai)
//     .input('UpdatedBy', sql.NVarChar, logData.UpdatedBy)
//     .query(`INSERT INTO RateTableAlertslog 
//     (BranchName, CountryID, OldBuyRate, OldSellRate, OldTTREmittanceRate, NewBuyRate, NewSellRate, NewTTRemittanceRate, CreatedAt, UpdatedBy)
//      VALUES 
//      (@ BranchName, @CountryID, @oldBuyRate, @OldSellRate, @OldTRemittanceRate, @NewBuyRate, @NewSEllRate, NewTTRemittanceRate, @CreatedAt, @UpdatedBy)   
//         `);

//       await pool.request()
//       .input('CountryID', sql.Int, logData.CountryID)
//       .input('BranchName', sql.Nvarchar, logData,BranchName)
//       .query(`UPDATE r SET r.CurrecnyName = c.CountryName
//         FROM Log r
//         JOIN countryrates c ON r.countryID = c.countryID
//         WHERE r.countryID = @countryID AND r.BranchNAme = @BranchName
//         `);  
//         res.status(200).send({
//             message: 'RECEIVED LOGS ARE UPDATED TO FRONTEND...!!!',
//             createdAt: luxon_Time
//         });
//   } catch(err){
//     console.error('Error logging change: ', err);
//     res.status(500).send("Error logging change");
//   }
 
// });
 

