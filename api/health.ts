import { VercelRequest, VercelResponse } from '@vercel/node';
import { getXRPLClient } from '../lib/xrpl-client';
import { createSuccessResponse, createErrorResponse } from '../lib/response';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json(createErrorResponse('Method not allowed'));
    return;
  }

  try {
    // XRPL 연결 테스트
    const client = await getXRPLClient();
    const serverInfo = await client.request({
      command: 'server_info'
    });

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      xrpl: {
        connected: true,
        network: process.env.XRPL_NETWORK || 'wss://s.devnet.rippletest.net:51233',
        serverInfo: serverInfo.result
      },
      version: '1.0.0'
    };

    res.status(200).json(createSuccessResponse(healthData, 'Server is healthy'));
  } catch (error) {
    const healthData = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      xrpl: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      version: '1.0.0'
    };

    res.status(503).json(createSuccessResponse(healthData, 'Server is unhealthy'));
  }
}
