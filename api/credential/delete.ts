import { VercelRequest, VercelResponse } from '@vercel/node';
import { Wallet, Transaction } from 'xrpl';
import { getXRPLClient } from '../../lib/xrpl-client';
import { createSuccessResponse, createErrorResponse, handleApiError } from '../../lib/response';
import { CredentialDeleteRequest } from '../../types/api';
import { toHex } from '../../lib/xrpl-client';

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
    const { subjectSeed, issuerAddress, credentialType }: CredentialDeleteRequest = req.body;

    // 입력 검증
    if (!subjectSeed || !issuerAddress || !credentialType) {
      res.status(400).json(createErrorResponse('Missing required fields: subjectSeed, issuerAddress, credentialType'));
      return;
    }

    const client = await getXRPLClient();
    const subject = Wallet.fromSeed(subjectSeed.trim());

    const tx: Transaction = {
      TransactionType: "CredentialDelete",
      Account: subject.address,
      Issuer: issuerAddress,
      Subject: subject.address,
      CredentialType: toHex(credentialType)
    };

    const prepared = await client.autofill(tx);
    const signed = subject.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    res.status(200).json(createSuccessResponse(result, 'Credential deleted successfully'));
  } catch (error) {
    res.status(500).json(handleApiError(error));
  }
}
