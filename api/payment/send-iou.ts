import { VercelRequest, VercelResponse } from '@vercel/node';
import { Wallet, Payment } from 'xrpl';
import { getXRPLClient } from '../../lib/xrpl-client';
import { createSuccessResponse, createErrorResponse, handleApiError } from '../../lib/response';
import { PaymentRequest } from '../../types/api';

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
    const { fromSeed, toAddress, amount, currency, issuer }: PaymentRequest = req.body;

    // 입력 검증
    if (!fromSeed || !toAddress || !amount || !currency || !issuer) {
      res.status(400).json(createErrorResponse('Missing required fields: fromSeed, toAddress, amount, currency, issuer'));
      return;
    }

    // 금액 검증
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      res.status(400).json(createErrorResponse('Invalid amount. Must be a positive number'));
      return;
    }

    const client = await getXRPLClient();
    const sender = Wallet.fromSeed(fromSeed.trim());

    const tx: Payment = {
      TransactionType: "Payment",
      Account: sender.address,
      Destination: toAddress,
      Amount: {
        currency: currency,
        issuer: issuer,
        value: amount
      }
    };

    const prepared = await client.autofill(tx);
    const signed = sender.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    res.status(200).json(createSuccessResponse(result, 'IOU payment successful'));
  } catch (error) {
    res.status(500).json(handleApiError(error));
  }
}
