import xrpl from "xrpl";
const { Client, Wallet, Payment } = xrpl;

export async function sendXRP(fromSeed, toAddress, amount) {
  const client = new Client("wss://s.devnet.rippletest.net:51233");
  await client.connect();

  try {
    const sender = Wallet.fromSeed(fromSeed.trim());

    const tx = {
      TransactionType: "Payment",
      Account: sender.address,
      Destination: toAddress,
      Amount: amount
    };

    const prepared = await client.autofill(tx);
    const signed = sender.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    return result;
  } finally {
    await client.disconnect();
  }
}

export async function sendIOU(fromSeed, toAddress, amount, currency, issuer) {
  const client = new Client("wss://s.devnet.rippletest.net:51233");
  await client.connect();

  try {
    const sender = Wallet.fromSeed(fromSeed.trim());

    const tx = {
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

    return result;
  } finally {
    await client.disconnect();
  }
}
