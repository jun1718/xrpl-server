import { VercelRequest, VercelResponse } from '@vercel/node';
import { Wallet, CredentialCreate } from 'xrpl';
import { getXRPLClient } from '../../lib/xrpl-client';
import { createSuccessResponse, createErrorResponse, handleApiError } from '../../lib/response';
import { CredentialRequest } from '../../types/api';
import { toHex, now } from '../../lib/xrpl-client';

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
    const { 
      issuerSeed, 
      subjectAddress, 
      credentialType, 
      expiration, 
      uri 
    }: CredentialRequest = req.body;

    // 입력 검증
    if (!issuerSeed || !subjectAddress || !credentialType) {
      res.status(400).json(createErrorResponse('Missing required fields: issuerSeed, subjectAddress, credentialType'));
      return;
    }

    const client = await getXRPLClient();
    const issuer = Wallet.fromSeed(issuerSeed.trim());

    const tx: CredentialCreate = {
      TransactionType: "CredentialCreate",
      Account: issuer.address,
      Subject: subjectAddress,
      CredentialType: toHex(credentialType),
      Expiration: expiration || (now() + 3600), // 기본 1시간 후 만료
      URI: uri ? toHex(uri) : toHex("https://example.com/credentials/" + credentialType.toLowerCase())
    };

    const prepared = await client.autofill(tx);
    const signed = issuer.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    res.status(200).json(createSuccessResponse(result, 'Credential created successfully'));
  } catch (error) {
    res.status(500).json(handleApiError(error));
  }
}
