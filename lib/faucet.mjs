import xrpl from "xrpl";
const { Client, Wallet } = xrpl;

export async function faucetAll(walletSeeds) {
  console.log('🔗 Connecting to XRPL network...');
  const client = new Client("wss://s.devnet.rippletest.net:51233");
  await client.connect();
  console.log('✅ Connected to XRPL network');

  try {
    const results = [];

    if (!walletSeeds || !Array.isArray(walletSeeds) || walletSeeds.length === 0) {
      throw new Error('walletSeeds array is required and must not be empty');
    }

    console.log(`🚰 Funding ${walletSeeds.length} wallets...`);

    for (let i = 0; i < walletSeeds.length; i++) {
      const walletSeed = walletSeeds[i];
      
      if (!walletSeed || typeof walletSeed !== 'string') {
        console.log(`❌ Invalid wallet seed at index ${i}:`, walletSeed);
        results.push({
          index: i,
          seed: walletSeed,
          status: 'error',
          error: 'Invalid wallet seed format'
        });
        continue;
      }

      try {
        console.log(`🔑 Creating wallet ${i + 1}/${walletSeeds.length} from seed: ${walletSeed.substring(0, 10)}...`);
        const wallet = Wallet.fromSeed(walletSeed.trim());
        console.log(`✅ Wallet ${i + 1} created, address: ${wallet.address}`);
        
        console.log(`🚰 Funding wallet ${i + 1}...`);
        await client.fundWallet(wallet);
        console.log(`✅ Wallet ${i + 1} funded successfully`);
        
        results.push({
          index: i,
          seed: walletSeed.substring(0, 10) + '...',
          address: wallet.address,
          status: 'success'
        });
      } catch (error) {
        console.error(`❌ Error funding wallet ${i + 1}:`, error.message);
        results.push({
          index: i,
          seed: walletSeed.substring(0, 10) + '...',
          status: 'error',
          error: error.message
        });
      }
    }

    console.log('✅ Faucet all completed');
    return results;
  } catch (error) {
    console.error('❌ Faucet all error:', error);
    throw error;
  } finally {
    console.log('🔌 Disconnecting from XRPL...');
    await client.disconnect();
    console.log('✅ Disconnected from XRPL');
  }
}

export async function faucetWallet(walletSeed) {
  console.log('🔗 Connecting to XRPL network...');
  const client = new Client("wss://s.devnet.rippletest.net:51233");
  await client.connect();
  console.log('✅ Connected to XRPL network');

  try {
    console.log('🔑 Creating wallet from seed...');
    const wallet = Wallet.fromSeed(walletSeed.trim());
    console.log('✅ Wallet created, address:', wallet.address);
    
    console.log('🚰 Funding wallet...');
    await client.fundWallet(wallet);
    console.log('✅ Wallet funded successfully');
    
    return {
      address: wallet.address,
      status: 'success'
    };
  } catch (error) {
    console.error('❌ Faucet wallet function error:', error);
    throw error;
  } finally {
    console.log('🔌 Disconnecting from XRPL...');
    await client.disconnect();
    console.log('✅ Disconnected from XRPL');
  }
}
