import { VercelRequest, VercelResponse } from '@vercel/node';
import { Wallet, Transaction } from 'xrpl';
import { getXRPLClient } from '../../lib/xrpl-client';
import { createSuccessResponse, createErrorResponse, handleApiError } from '../../lib/response';
import { DomainCreateRequest } from '../../types/api';
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
    const { adminSeed, acceptedCredentials }: DomainCreateRequest = req.body;

    // 입력 검증
    if (!adminSeed || !acceptedCredentials || !Array.isArray(acceptedCredentials)) {
      res.status(400).json(createErrorResponse('Missing required fields: adminSeed, acceptedCredentials (array)'));
      return;
    }

    if (acceptedCredentials.length === 0) {
      res.status(400).json(createErrorResponse('acceptedCredentials array cannot be empty'));
      return;
    }

    const client = await getXRPLClient();
    const admin = Wallet.fromSeed(adminSeed.trim());

    const tx: Transaction = {
      TransactionType: "PermissionedDomainSet",
      Account: admin.address,
      AcceptedCredentials: acceptedCredentials.map(cred => ({
        Credential: {
          Issuer: cred.issuer,
          CredentialType: toHex(cred.credentialType)
        }
      }))
    };

    const prepared = await client.autofill(tx);
    const signed = admin.sign(prepared);
    const result: any = await client.submitAndWait(signed.tx_blob);

    // 생성된 도메인의 ID 추출
    const out = result.result ?? result;
    const created = (out.meta?.AffectedNodes || []).find(
      (n: any) => n.CreatedNode?.LedgerEntryType === "PermissionedDomain"
    );
    const domainId =
      created?.CreatedNode?.LedgerIndex ||
      created?.CreatedNode?.NewFields?.DomainID || null;

    const responseData = {
      ...result,
      domainId: domainId
    };

    res.status(200).json(createSuccessResponse(responseData, 'Domain created successfully'));
  } catch (error) {
    res.status(500).json(handleApiError(error));
  }
}
