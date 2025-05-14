const axios = require('axios');

async function testAvgFee() {
  try {
    console.log('Počinjem dohvaćanje prosječne naknade s Dune API-ja (Query ID: 5134500)...');
    const duneApiKey = 'KbXKuJ2niPQF13TRf1e45ae4hshStmTy';
    const queryId = '5134500';
    
    // Pokrećemo upit
    console.log(`Pokrećem Dune upit ${queryId} za prosječnu naknadu...`);
    const executeResponse = await axios.post(
      `https://api.dune.com/api/v1/query/${queryId}/execute`,
      {},
      { headers: { 'x-dune-api-key': duneApiKey } }
    );
    
    console.log('Odgovor od Dune API-ja:', executeResponse.data);
    
    if (!executeResponse.data?.execution_id) {
      console.error('Nedostaje execution_id u odgovoru');
      return;
    }
    
    const executionId = executeResponse.data.execution_id;
    console.log(`Dobiven execution_id: ${executionId}`);
    
    // Čekamo da se upit izvrši
    let attempts = 0;
    while (attempts < 15) { // Povećavamo broj pokušaja
      attempts++;
      console.log(`Pokušaj ${attempts}/15 provjere statusa upita...`);
      await new Promise(resolve => setTimeout(resolve, 3000)); // Dulje čekamo
      
      const statusResponse = await axios.get(
        `https://api.dune.com/api/v1/execution/${executionId}/status`,
        { headers: { 'x-dune-api-key': duneApiKey } }
      );
      
      console.log(`Status upita: ${statusResponse.data?.state}`);
      
      if (statusResponse.data?.state === 'QUERY_STATE_COMPLETED') {
        // Dohvaćamo rezultate
        console.log('Upit je završen, dohvaćam rezultate...');
        const resultsResponse = await axios.get(
          `https://api.dune.com/api/v1/execution/${executionId}/results`,
          { headers: { 'x-dune-api-key': duneApiKey } }
        );
        
        console.log('Rezultati upita:', JSON.stringify(resultsResponse.data, null, 2));
        
        if (resultsResponse.data?.result?.rows?.length > 0) {
          const row = resultsResponse.data.result.rows[0];
          console.log('Prvi red rezultata:', JSON.stringify(row, null, 2));
          
          // Ispisujemo sve ključeve i vrijednosti
          console.log('Svi ključevi i vrijednosti:');
          for (const key in row) {
            console.log(`- ${key}: ${row[key]} (tip: ${typeof row[key]})`);
          }
          
          // Vraćamo prvu numeričku vrijednost koju nađemo
          for (const key in row) {
            if (typeof row[key] === 'number') {
              console.log(`Pronađena numerička vrijednost u polju ${key}: ${row[key]}`);
              return row[key].toString();
            }
          }
          
          // Ako nema numeričkih vrijednosti, vraćamo prvi string koji se može pretvoriti u broj
          for (const key in row) {
            if (typeof row[key] === 'string' && !isNaN(parseFloat(row[key]))) {
              console.log(`Pronađen string koji se može pretvoriti u broj u polju ${key}: ${row[key]}`);
              return row[key];
            }
          }
          
          console.error('Nema numeričkih vrijednosti u rezultatu');
        } else {
          console.error('Nema redova u rezultatu');
        }
        
        break;
      } else if (statusResponse.data?.state === 'QUERY_STATE_FAILED') {
        console.error('Upit za prosječnu naknadu nije uspio');
        break;
      }
    }
    
    console.error('Isteklo vrijeme za dohvaćanje prosječne naknade');
  } catch (error) {
    console.error('Greška pri direktnom dohvaćanju prosječne naknade:', error);
  }
}

testAvgFee();
