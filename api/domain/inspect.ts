import { VercelRequest, VercelResponse } from '@vercel/node';
import { getXRPLClient } from '../../lib/xrpl-client';
import { createSuccessResponse, createErrorResponse, handleApiError } from '../../lib/response';
import { DomainInspectRequest } from '../../types/api';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json(createErrorResponse('Method not allowed'));
    return;
  }

  try {
    let domainId: string;

    if (req.method === 'GET') {
      domainId = req.query.domainId as string;
    } else {
      domainId = req.body.domainId;
    }

    // 입력 검증
    if (!domainId) {
      res.status(400).json(createErrorResponse('Missing required field: domainId'));
      return;
    }

    const client = await getXRPLClient();
    const result = await client.request({ 
      command: "ledger_entry", 
      index: domainId 
    });

    res.status(200).json(createSuccessResponse(result, 'Domain information retrieved successfully'));
  } catch (error) {
    res.status(500).json(handleApiError(error));
  }
}
