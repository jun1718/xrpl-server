import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: false
}));
app.use(express.json());

// Payment APIs
app.post('/api/payment/send-xrp', async (req, res) => {
  try {
    console.log('🔍 Send XRP request received:', req.body);
    
    const { fromSeed, toAddress, amount } = req.body;
    
    if (!fromSeed || !toAddress || !amount) {
      console.log('❌ Missing required fields:', { fromSeed: !!fromSeed, toAddress: !!toAddress, amount: !!amount });
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: fromSeed, toAddress, amount',
        message: 'Missing required fields: fromSeed, toAddress, amount',
        status: 400,
        timestamp: new Date().toISOString(),
        path: '/api/payment/send-xrp'
      });
    }

    // XRPL 시드 형식 검증
    if (!fromSeed.startsWith('s') || fromSeed.length < 25) {
      console.log('❌ Invalid fromSeed format');
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid fromSeed format. XRPL seed must start with "s" and be at least 25 characters long.',
        message: 'Invalid fromSeed format. XRPL seed must start with "s" and be at least 25 characters long.',
        status: 400,
        timestamp: new Date().toISOString(),
        path: '/api/payment/send-xrp'
      });
    }

    // XRPL 주소 형식 검증 (r로 시작해야 함)
    if (!toAddress.startsWith('r') || toAddress.length < 25) {
      console.log('❌ Invalid toAddress format');
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid toAddress format. XRPL address must start with "r" and be at least 25 characters long.',
        message: 'Invalid toAddress format. XRPL address must start with "r" and be at least 25 characters long.',
        status: 400,
        timestamp: new Date().toISOString(),
        path: '/api/payment/send-xrp'
      });
    }

    console.log('📦 Importing payment module...');
    const { sendXRP } = await import('./lib/payment.mjs');
    console.log('✅ Payment module imported successfully');
    
    console.log('💰 Calling sendXRP with params:', {
      fromSeed: fromSeed.substring(0, 10) + '...',
      toAddress,
      amount
    });
    
    const result = await sendXRP(fromSeed, toAddress, amount);
    console.log('✅ Send XRP result:', result);
    
    res.json({ 
      success: true, 
      data: result, 
      message: 'XRP payment successful' 
    });
  } catch (error) {
    console.error('❌ Send XRP error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // 더 구체적인 에러 메시지 제공
    let errorMessage = error.message;
    if (error.message.includes('Unknown letter')) {
      errorMessage = 'Invalid wallet seed format. Please provide a valid XRPL seed that starts with "s".';
    } else if (error.message.includes('checksum_invalid')) {
      errorMessage = 'Invalid wallet seed checksum. The seed appears to be corrupted or invalid. Please provide a valid XRPL seed.';
    } else if (error.message.includes('Invalid seed')) {
      errorMessage = 'Invalid wallet seed format. Please provide a valid XRPL seed.';
    } else if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient funds in the sender wallet. Please ensure the wallet has enough XRP.';
    } else if (error.message.includes('invalid address')) {
      errorMessage = 'Invalid recipient address. Please provide a valid XRPL address.';
    } else if (error.message.includes('temREDUNDANT')) {
      errorMessage = 'Transaction is redundant. The sender and recipient addresses cannot be the same.';
    } else if (error.message.includes('temINVALID')) {
      errorMessage = 'Invalid transaction parameters. Please check your input values.';
    } else if (error.message.includes('tecUNFUNDED_PAYMENT')) {
      errorMessage = 'Insufficient funds. The sender wallet does not have enough XRP for this transaction.';
    }
    
    // Spring WebClient 호환성을 위한 에러 응답
    const errorResponse = {
      success: false,
      error: errorMessage,
      message: errorMessage,
      status: 500,
      timestamp: new Date().toISOString(),
      path: '/api/payment/send-xrp',
      details: {
        originalError: error.message,
        endpoint: '/api/payment/send-xrp'
      }
    };
    
    console.log('📤 Sending error response:', JSON.stringify(errorResponse, null, 2));
    res.status(500).json(errorResponse);
  }
});

app.post('/api/payment/send-iou', async (req, res) => {
  try {
    console.log('🔍 Send IOU request received:', req.body);
    
    const { fromSeed, toAddress, amount, currency, issuer } = req.body;
    
    if (!fromSeed || !toAddress || !amount || !currency || !issuer) {
      console.log('❌ Missing required fields:', { 
        fromSeed: !!fromSeed, 
        toAddress: !!toAddress, 
        amount: !!amount, 
        currency: !!currency, 
        issuer: !!issuer 
      });
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: fromSeed, toAddress, amount, currency, issuer',
        message: 'Missing required fields: fromSeed, toAddress, amount, currency, issuer',
        status: 400,
        timestamp: new Date().toISOString(),
        path: '/api/payment/send-iou'
      });
    }

    // XRPL 시드 형식 검증
    if (!fromSeed.startsWith('s') || fromSeed.length < 25) {
      console.log('❌ Invalid fromSeed format');
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid fromSeed format. XRPL seed must start with "s" and be at least 25 characters long.',
        message: 'Invalid fromSeed format. XRPL seed must start with "s" and be at least 25 characters long.',
        status: 400,
        timestamp: new Date().toISOString(),
        path: '/api/payment/send-iou'
      });
    }

    // XRPL 주소 형식 검증 (r로 시작해야 함)
    if (!toAddress.startsWith('r') || toAddress.length < 25) {
      console.log('❌ Invalid toAddress format');
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid toAddress format. XRPL address must start with "r" and be at least 25 characters long.',
        message: 'Invalid toAddress format. XRPL address must start with "r" and be at least 25 characters long.',
        status: 400,
        timestamp: new Date().toISOString(),
        path: '/api/payment/send-iou'
      });
    }

    // Issuer 주소 형식 검증 (r로 시작해야 함)
    if (!issuer.startsWith('r') || issuer.length < 25) {
      console.log('❌ Invalid issuer format');
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid issuer format. XRPL issuer address must start with "r" and be at least 25 characters long.',
        message: 'Invalid issuer format. XRPL issuer address must start with "r" and be at least 25 characters long.',
        status: 400,
        timestamp: new Date().toISOString(),
        path: '/api/payment/send-iou'
      });
    }

    console.log('📦 Importing payment module...');
    const { sendIOU } = await import('./lib/payment.mjs');
    console.log('✅ Payment module imported successfully');
    
    console.log('💰 Calling sendIOU with params:', {
      fromSeed: fromSeed.substring(0, 10) + '...',
      toAddress,
      amount,
      currency,
      issuer
    });
    
    const result = await sendIOU(fromSeed, toAddress, amount, currency, issuer);
    console.log('✅ Send IOU result:', result);
    
    res.json({ 
      success: true, 
      data: result, 
      message: 'IOU payment successful' 
    });
  } catch (error) {
    console.error('❌ Send IOU error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // 더 구체적인 에러 메시지 제공
    let errorMessage = error.message;
    if (error.message.includes('Unknown letter')) {
      errorMessage = 'Invalid wallet seed format. Please provide a valid XRPL seed that starts with "s".';
    } else if (error.message.includes('checksum_invalid')) {
      errorMessage = 'Invalid wallet seed checksum. The seed appears to be corrupted or invalid. Please provide a valid XRPL seed.';
    } else if (error.message.includes('Invalid seed')) {
      errorMessage = 'Invalid wallet seed format. Please provide a valid XRPL seed.';
    } else if (error.message.includes('insufficient funds')) {
      errorMessage = 'Insufficient funds in the sender wallet. Please ensure the wallet has enough tokens.';
    } else if (error.message.includes('invalid address')) {
      errorMessage = 'Invalid recipient address. Please provide a valid XRPL address.';
    } else if (error.message.includes('trust line')) {
      errorMessage = 'Trust line issue. Please ensure trust line is established between sender and issuer.';
    } else if (error.message.includes('temREDUNDANT')) {
      errorMessage = 'Transaction is redundant. The sender and recipient addresses cannot be the same.';
    } else if (error.message.includes('temINVALID')) {
      errorMessage = 'Invalid transaction parameters. Please check your input values.';
    } else if (error.message.includes('tecUNFUNDED_PAYMENT')) {
      errorMessage = 'Insufficient funds. The sender wallet does not have enough tokens for this transaction.';
    }
    
    // Spring WebClient 호환성을 위한 에러 응답
    const errorResponse = {
      success: false,
      error: errorMessage,
      message: errorMessage,
      status: 500,
      timestamp: new Date().toISOString(),
      path: '/api/payment/send-iou',
      details: {
        originalError: error.message,
        endpoint: '/api/payment/send-iou'
      }
    };
    
    console.log('📤 Sending error response:', JSON.stringify(errorResponse, null, 2));
    res.status(500).json(errorResponse);
  }
});

// Credential APIs
app.post('/api/credential/create', async (req, res) => {
  try {
    const { issuerSeed, subjectAddress, credentialType, expiration, uri } = req.body;
    
    if (!issuerSeed || !subjectAddress || !credentialType) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: issuerSeed, subjectAddress, credentialType' 
      });
    }

    const { createCredential } = await import('./lib/credential.mjs');
    const result = await createCredential(issuerSeed, subjectAddress, credentialType, expiration, uri);
    res.json({ success: true, data: result, message: 'Credential created successfully' });
  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: error.message,
      status: 500,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/credential/accept', async (req, res) => {
  try {
    const { subjectSeed, issuerAddress, credentialType } = req.body;
    
    if (!subjectSeed || !issuerAddress || !credentialType) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: subjectSeed, issuerAddress, credentialType' 
      });
    }

    const { acceptCredential } = await import('./lib/credential.mjs');
    const result = await acceptCredential(subjectSeed, issuerAddress, credentialType);
    res.json({ success: true, data: result, message: 'Credential accepted successfully' });
  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: error.message,
      status: 500,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/credential/check', async (req, res) => {
  try {
    const userSeed = req.query.userSeed || req.body.userSeed;
    
    if (!userSeed) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required field: userSeed' 
      });
    }

    const { checkCredential } = await import('./lib/credential.mjs');
    const result = await checkCredential(userSeed);
    res.json({ success: true, data: result, message: 'Credentials retrieved successfully' });
  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: error.message,
      status: 500,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/credential/delete', async (req, res) => {
  try {
    const { subjectSeed, issuerAddress, credentialType } = req.body;
    
    if (!subjectSeed || !issuerAddress || !credentialType) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: subjectSeed, issuerAddress, credentialType' 
      });
    }

    const { deleteCredential } = await import('./lib/credential.mjs');
    const result = await deleteCredential(subjectSeed, issuerAddress, credentialType);
    res.json({ success: true, data: result, message: 'Credential deleted successfully' });
  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: error.message,
      status: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// 통합 Credential API
app.post('/api/credential/create-and-accept', async (req, res) => {
  try {
    console.log('🔍 Create and Accept Credential request received:', req.body);
    
    const { issuerSeed, subjectSeed, credentialType, expiration, uri } = req.body;
    
    // 입력 검증
    if (!issuerSeed || !subjectSeed || !credentialType) {
      console.log('❌ Missing required fields:', { 
        issuerSeed: !!issuerSeed, 
        subjectSeed: !!subjectSeed, 
        credentialType: !!credentialType 
      });
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: issuerSeed, subjectSeed, credentialType',
        message: 'Missing required fields: issuerSeed, subjectSeed, credentialType',
        status: 400,
        timestamp: new Date().toISOString(),
        path: '/api/credential/create-and-accept'
      });
    }

    // XRPL 시드 형식 검증
    if (!issuerSeed.startsWith('s') || issuerSeed.length < 25) {
      console.log('❌ Invalid issuerSeed format');
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid issuerSeed format. XRPL seed must start with "s" and be at least 25 characters long.',
        message: 'Invalid issuerSeed format. XRPL seed must start with "s" and be at least 25 characters long.',
        status: 400,
        timestamp: new Date().toISOString(),
        path: '/api/credential/create-and-accept'
      });
    }

    if (!subjectSeed.startsWith('s') || subjectSeed.length < 25) {
      console.log('❌ Invalid subjectSeed format');
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid subjectSeed format. XRPL seed must start with "s" and be at least 25 characters long.',
        message: 'Invalid subjectSeed format. XRPL seed must start with "s" and be at least 25 characters long.',
        status: 400,
        timestamp: new Date().toISOString(),
        path: '/api/credential/create-and-accept'
      });
    }

    console.log('📦 Importing credential module...');
    const { createAndAcceptCredential } = await import('./lib/credential.mjs');
    console.log('✅ Credential module imported successfully');
    
    console.log('🔐 Calling createAndAcceptCredential with params:', {
      issuerSeed: issuerSeed.substring(0, 10) + '...',
      subjectSeed: subjectSeed.substring(0, 10) + '...',
      credentialType,
      expiration,
      uri
    });
    
    const result = await createAndAcceptCredential(issuerSeed, subjectSeed, credentialType, expiration, uri);
    console.log('✅ Create and Accept Credential result:', result);
    
    res.json({ 
      success: true, 
      data: result, 
      message: 'Credential created and accepted successfully' 
    });
  } catch (error) {
    console.error('❌ Create and Accept Credential error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // 더 구체적인 에러 메시지 제공
    let errorMessage = error.message;
    if (error.message.includes('Unknown letter')) {
      errorMessage = 'Invalid wallet seed format. Please provide valid XRPL seeds that start with "s".';
    } else if (error.message.includes('checksum_invalid')) {
      errorMessage = 'Invalid wallet seed checksum. The seeds appear to be corrupted or invalid.';
    } else if (error.message.includes('Invalid seed')) {
      errorMessage = 'Invalid wallet seed format. Please provide valid XRPL seeds.';
    } else if (error.message.includes('temREDUNDANT')) {
      errorMessage = 'Transaction is redundant. The issuer and subject addresses cannot be the same.';
    } else if (error.message.includes('temINVALID')) {
      errorMessage = 'Invalid transaction parameters. Please check your input values.';
    }
    
    // Spring WebClient 호환성을 위한 에러 응답
    const errorResponse = {
      success: false,
      error: errorMessage,
      message: errorMessage,
      status: 500,
      timestamp: new Date().toISOString(),
      path: '/api/credential/create-and-accept',
      details: {
        originalError: error.message,
        endpoint: '/api/credential/create-and-accept'
      }
    };
    
    console.log('📤 Sending error response:', JSON.stringify(errorResponse, null, 2));
    res.status(500).json(errorResponse);
  }
});

// Domain APIs
app.post('/api/domain/create', async (req, res) => {
  try {
    const { adminSeed, acceptedCredentials } = req.body;
    
    if (!adminSeed || !acceptedCredentials || !Array.isArray(acceptedCredentials)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: adminSeed, acceptedCredentials (array)' 
      });
    }

    const { createDomain } = await import('./lib/domain.mjs');
    const result = await createDomain(adminSeed, acceptedCredentials);
    res.json({ success: true, data: result, message: 'Domain created successfully' });
  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: error.message,
      status: 500,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/api/domain/delete', async (req, res) => {
  try {
    const { adminSeed, domainId } = req.body;
    
    if (!adminSeed || !domainId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: adminSeed, domainId' 
      });
    }

    const { deleteDomain } = await import('./lib/domain.mjs');
    const result = await deleteDomain(adminSeed, domainId);
    res.json({ success: true, data: result, message: 'Domain deleted successfully' });
  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: error.message,
      status: 500,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/domain/inspect', async (req, res) => {
  try {
    const domainId = req.query.domainId || req.body.domainId;
    
    if (!domainId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required field: domainId' 
      });
    }

    const { inspectDomain } = await import('./lib/domain.mjs');
    const result = await inspectDomain(domainId);
    res.json({ success: true, data: result, message: 'Domain information retrieved successfully' });
  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: error.message,
      status: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// Wallet APIs
app.post('/api/wallet/create', async (req, res) => {
  try {
    console.log('🔍 Create wallet request received');
    
    const { createNewWallet } = await import('./lib/wallet.mjs');
    const result = await createNewWallet();
    
    console.log('✅ Wallet creation result:', result);
    
    res.json({ 
      success: true, 
      data: result,
      message: 'New wallet has been created successfully'
    });
  } catch (error) {
    console.error('❌ Create wallet error:', error);
    console.error('❌ Error stack:', error.stack);
    
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: error.message,
      status: 500,
      timestamp: new Date().toISOString(),
      path: '/api/wallet/create'
    });
  }
});

// Faucet APIs
app.post('/api/faucet', async (req, res) => {
  try {
    console.log('🔍 Faucet all request received:', req.body);
    
    const { walletSeeds } = req.body;
    
    if (!walletSeeds) {
      console.log('❌ Missing walletSeeds');
      return res.status(400).json({ 
        success: false, 
        error: 'walletSeeds is required',
        message: 'walletSeeds array is required in request body'
      });
    }

    if (!Array.isArray(walletSeeds) || walletSeeds.length === 0) {
      console.log('❌ Invalid walletSeeds format');
      return res.status(400).json({ 
        success: false, 
        error: 'walletSeeds must be a non-empty array',
        message: 'walletSeeds must be a non-empty array of wallet seeds'
      });
    }

    console.log('📦 Importing faucet module...');
    const { faucetAll } = await import('./lib/faucet.mjs');
    console.log('✅ Faucet module imported successfully');
    
    console.log('🚰 Calling faucetAll with seeds:', walletSeeds.length, 'wallets');
    const results = await faucetAll(walletSeeds);
    console.log('✅ Faucet all result:', results);
    
    res.json({ 
      success: true, 
      data: results,
      message: `Faucet completed successfully. Test XRP has been added to ${results.filter(r => r.status === 'success').length}/${results.length} wallets.`
    });
  } catch (error) {
    console.error('❌ Faucet all error:', error);
    console.error('❌ Error stack:', error.stack);
    
    res.status(500).json({ 
      success: false, 
      error: error.message,
      message: error.message,
      status: 500,
      timestamp: new Date().toISOString(),
      path: '/api/faucet'
    });
  }
});

app.post('/api/faucet/wallet', async (req, res) => {
  try {
    console.log('🔍 Faucet wallet request received:', req.body);
    
    const { walletSeed } = req.body;
    
    if (!walletSeed) {
      console.log('❌ Missing walletSeed');
      return res.status(400).json({ 
        success: false, 
        error: 'walletSeed is required' 
      });
    }

    // XRPL 시드 형식 검증
    if (!walletSeed.startsWith('s') || walletSeed.length < 25) {
      console.log('❌ Invalid wallet seed format');
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid wallet seed format. XRPL seed must start with "s" and be at least 25 characters long.' 
      });
    }

    console.log('📦 Importing faucet module...');
    const { faucetWallet } = await import('./lib/faucet.mjs');
    console.log('✅ Faucet module imported successfully');
    
    console.log('🚰 Calling faucetWallet with seed:', walletSeed.substring(0, 10) + '...');
    const result = await faucetWallet(walletSeed);
    console.log('✅ Faucet result:', result);
    
    res.json({ 
      success: true, 
      data: result,
      message: 'Test XRP has been added to the wallet'
    });
  } catch (error) {
    console.error('❌ Faucet wallet error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // 더 구체적인 에러 메시지 제공
    let errorMessage = error.message;
    if (error.message.includes('Unknown letter')) {
      errorMessage = 'Invalid wallet seed format. Please provide a valid XRPL seed that starts with "s".';
    } else if (error.message.includes('checksum_invalid')) {
      errorMessage = 'Invalid wallet seed checksum. The seed appears to be corrupted or invalid. Please provide a valid XRPL seed.';
    } else if (error.message.includes('Invalid seed')) {
      errorMessage = 'Invalid wallet seed format. Please provide a valid XRPL seed.';
    }
    
    // Spring WebClient 호환성을 위한 에러 응답
    const errorResponse = {
      success: false,
      error: errorMessage,
      message: errorMessage,
      status: 500,
      timestamp: new Date().toISOString(),
      path: '/api/faucet/wallet',
      details: {
        originalError: error.message,
        endpoint: '/api/faucet/wallet'
      }
    };
    
    console.log('📤 Sending error response:', JSON.stringify(errorResponse, null, 2));
    res.status(500).json(errorResponse);
  }
});

// 헬스체크
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    },
    message: 'Server is healthy'
  });
});

// 루트 경로
app.get('/', (req, res) => {
  res.json({
    message: 'XRPL Server is running!',
    endpoints: [
      'GET /api/health',
      'POST /api/faucet',
      'POST /api/faucet/wallet',
      'POST /api/payment/send-xrp',
      'POST /api/payment/send-iou',
      'POST /api/credential/create',
      'POST /api/credential/accept',
      'GET /api/credential/check',
      'POST /api/credential/delete',
      'POST /api/domain/create',
      'POST /api/domain/delete',
      'GET /api/domain/inspect'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 XRPL Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api/health`);
});
