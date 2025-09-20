import { VercelRequest, VercelResponse } from '@vercel/node';
import { Wallet } from 'xrpl';
import { getXRPLClient } from '../../lib/xrpl-client';
import { createSuccessResponse, createErrorResponse, handleApiError } from '../../lib/response';

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
    let userSeed: string;

    if (req.method === 'GET') {
      userSeed = req.query.userSeed as string;
    } else {
      userSeed = req.body.userSeed;
    }

    // 입력 검증
    if (!userSeed) {
      res.status(400).json(createErrorResponse('Missing required field: userSeed'));
      return;
    }

    const client = await getXRPLClient();
    const subject = Wallet.fromSeed(userSeed.trim());

    const all: any[] = [];
    let marker: any = undefined;

    do {
      const r: any = await client.request({
        command: "account_objects",
        account: subject.address,
        limit: 400,
        ...(marker ? { marker } : {})
      });
      
      const creds = (r.result.account_objects || []).filter(
        (o: any) => o.LedgerEntryType === "Credential"
      );
      all.push(...creds);
      marker = r.result.marker;
    } while (marker);

    res.status(200).json(createSuccessResponse(all, 'Credentials retrieved successfully'));
  } catch (error) {
    res.status(500).json(handleApiError(error));
  }
}
