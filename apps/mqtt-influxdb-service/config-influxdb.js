/**
 * Script pour configurer et tester la connexion à InfluxDB
 * Exécuter avec: node config-influxdb.js
 */

const { InfluxDB, Point } = require('@influxdata/influxdb-client');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function main() {
  console.log('=== Configuration et test de connexion à InfluxDB ===');
  
  // Récupérer les paramètres actuels
  const currentUrl = process.env.INFLUXDB_URL || 'http://localhost:8086';
  const currentToken = process.env.INFLUXDB_TOKEN || '';
  const currentOrg = process.env.INFLUXDB_ORG || 'ecowatch';
  const currentBucket = process.env.INFLUXDB_BUCKET || 'iot_data';
  
  console.log('\nParamètres actuels:');
  console.log(`URL: ${currentUrl}`);
  console.log(`Token: ${currentToken ? '***' + currentToken.substring(currentToken.length - 5) : 'NON DÉFINI'}`);
  console.log(`Organisation: ${currentOrg}`);
  console.log(`Bucket: ${currentBucket}`);
  
  const url = await question(`\nURL InfluxDB [${currentUrl}]: `) || currentUrl;
  const token = await question('Token InfluxDB [requis]: ') || currentToken;
  const org = await question(`Organisation [${currentOrg}]: `) || currentOrg;
  const bucket = await question(`Bucket [${currentBucket}]: `) || currentBucket;
  
  if (!token) {
    console.error('Le token InfluxDB est requis!');
    process.exit(1);
  }
  
  // Afficher les paramètres
  console.log('\nParamètres à utiliser:');
  console.log(`URL: ${url}`);
  console.log(`Token: ***${token.substring(token.length - 5)}`);
  console.log(`Organisation: ${org}`);
  console.log(`Bucket: ${bucket}`);
  
  // Tester la connexion
  console.log('\nTest de connexion à InfluxDB...');
  try {
    const client = new InfluxDB({ url, token });
    const writeApi = client.getWriteApi(org, bucket);

    // Créer un point de test
    const point = new Point('test_measurement')
      .tag('test_tag', 'test_value')
      .floatField('test_field', Date.now());
    
    console.log('Écriture d\'un point test...');
    writeApi.writePoint(point);
    
    // Flush les données écrites
    await writeApi.flush();
    console.log('✅ Point écrit avec succès!');
    
    // Fermer la connexion
    await writeApi.close();
    
    // Afficher les instructions à suivre
    console.log('\n=== Instructions ===');
    console.log('Pour utiliser ces paramètres dans votre application, définissez les variables d\'environnement suivantes:');
    console.log('\nExportez ces variables:');
    console.log(`export INFLUXDB_URL="${url}"`);
    console.log(`export INFLUXDB_TOKEN="${token}"`);
    console.log(`export INFLUXDB_ORG="${org}"`);
    console.log(`export INFLUXDB_BUCKET="${bucket}"`);
    
    console.log('\nOu ajoutez-les au fichier .env:');
    console.log(`INFLUXDB_URL=${url}`);
    console.log(`INFLUXDB_TOKEN=${token}`);
    console.log(`INFLUXDB_ORG=${org}`);
    console.log(`INFLUXDB_BUCKET=${bucket}`);
    
  } catch (error) {
    console.error('❌ Erreur de connexion à InfluxDB:');
    console.error(error.message);
    console.error('\nAssurez-vous que:');
    console.error('1. InfluxDB est accessible à l\'URL indiquée');
    console.error('2. Le token a les permissions nécessaires');
    console.error('3. L\'organisation et le bucket existent');
  }
  
  rl.close();
}

function question(query) {
  return new Promise(resolve => {
    rl.question(query, answer => {
      resolve(answer.trim());
    });
  });
}

main().catch(error => {
  console.error('Erreur non gérée:', error);
  process.exit(1);
}); 