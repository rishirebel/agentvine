/**
 * AgentVine SDK Usage Example
 * Run with: node example.js
 */

const { AgentVineClient } = require('./dist/index.js');

// Example usage
async function testSDK() {
  // Initialize the client
  const agentVine = new AgentVineClient({
    agentId: 'ak_vdt337btkrm',
    agentSecretKey: 'sk_va4n29t954',
    environment: 'local' // 'local' | 'development' | 'production'
  });

  try {
    // Test connection
    console.log('🧪 Testing connection...');
    const testResult = await agentVine.testConnection();
    console.log('✅ Connection successful:', testResult.agent?.name);

    // Get offers
    console.log('\n🎯 Getting offers for query...');
    const offersResponse = await agentVine.getOffers({
      query: 'productivity',
      sessionId: 'example-session-' + Date.now(),
      context: 'productivity_tools'
    });

    console.log(`📦 Found ${offersResponse.offers.length} offers:`);
    offersResponse.offers.forEach((offer, index) => {
      console.log(`  ${index + 1}. ${offer.title}`);
      console.log(`     ${offer.description}`);
      console.log(`     CTA: ${offer.callToAction}`);
      console.log(`     URL: ${offer.actionEndpoint}\n`);
    });

  } catch (error) {
    console.error('❌ SDK Error:', error.message);
    if (error.code) {
      console.error('   Error Code:', error.code);
    }
  }
}

// Run the test
testSDK();