import { VercelRequest, VercelResponse } from '@vercel/node';
import { Wallet, Transaction } from 'xrpl';
import { getXRPLClient } from '../../lib/xrpl-client';
import { createSuccessResponse, createErrorResponse, handleApiError } from '../../lib/response';
import { DomainDeleteRequest } from '../../types/api';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json(createErrorResponse('Method not allowed'));
    return;
  }

  try {
    const { adminSeed, domainId }: DomainDeleteRequest = req.body;

    // 입력 검증
    if (!adminSeed || !domainId) {
      res.status(400).json(createErrorResponse('Missing required fields: adminSeed, domainId'));
      return;
    }

    const client = await getXRPLClient();
    const admin = Wallet.fromSeed(adminSeed.trim());

    const tx: Transaction = {
      TransactionType: "PermissionedDomainDelete",
      Account: admin.address,
      DomainID: domainId
    };

    const prepared = await client.autofill(tx);
    const signed = admin.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    res.status(200).json(createSuccessResponse(result, 'Domain deleted successfully'));
  } catch (error) {
    res.status(500).json(handleApiError(error));
  }
}
