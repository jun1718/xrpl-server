import xrpl from "xrpl";
const { Wallet } = xrpl;

/**
 * 새로운 XRPL 지갑을 생성합니다.
 * @returns {Promise<Object>} 생성된 지갑 정보
 */
export async function createNewWallet() {
  try {
    console.log('🔑 Creating new wallet...');
    
    // 새 지갑 생성
    const newWallet = Wallet.generate();
    
    console.log('✅ New wallet created successfully');
    console.log(`📍 Address: ${newWallet.address}`);
    console.log(`🔐 Seed: ${newWallet.seed?.substring(0, 10)}...`);
    console.log(`🔑 Public Key: ${newWallet.publicKey?.substring(0, 20)}...`);
    
    return {
      address: newWallet.address,
      seed: newWallet.seed,
      publicKey: newWallet.publicKey,
      status: 'success'
    };
  } catch (error) {
    console.error('❌ Create new wallet error:', error);
    throw new Error(`Failed to create new wallet: ${error.message}`);
  }
}
