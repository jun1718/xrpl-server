import xrpl from "xrpl";
const { Client, Wallet } = xrpl;

const toHex = (s) => Buffer.from(s, "utf8").toString("hex");
const now = () => Math.floor(Date.now() / 1000);

export async function createCredential(issuerSeed, subjectAddress, credentialType, expiration, uri) {
  const client = new Client("wss://s.devnet.rippletest.net:51233");
  await client.connect();

  try {
    const issuer = Wallet.fromSeed(issuerSeed.trim());

    const tx = {
      TransactionType: "CredentialCreate",
      Account: issuer.address,
      Subject: subjectAddress,
      CredentialType: toHex(credentialType),
      Expiration: expiration || (now() + 3600),
      URI: uri ? toHex(uri) : toHex("https://example.com/credentials/" + credentialType.toLowerCase())
    };

    const prepared = await client.autofill(tx);
    const signed = issuer.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    return result;
  } finally {
    await client.disconnect();
  }
}

export async function acceptCredential(subjectSeed, issuerAddress, credentialType) {
  const client = new Client("wss://s.devnet.rippletest.net:51233");
  await client.connect();

  try {
    const subject = Wallet.fromSeed(subjectSeed.trim());

    const tx = {
      TransactionType: "CredentialAccept",
      Account: subject.address,
      Issuer: issuerAddress,
      CredentialType: toHex(credentialType)
    };

    const prepared = await client.autofill(tx);
    const signed = subject.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    return result;
  } finally {
    await client.disconnect();
  }
}

export async function checkCredential(userSeed) {
  const client = new Client("wss://s.devnet.rippletest.net:51233");
  await client.connect();

  try {
    const subject = Wallet.fromSeed(userSeed.trim());

    const all = [];
    let marker = undefined;

    do {
      const r = await client.request({
        command: "account_objects",
        account: subject.address,
        limit: 400,
        ...(marker ? { marker } : {})
      });
      
      const creds = (r.result.account_objects || []).filter(
        (o) => o.LedgerEntryType === "Credential"
      );
      all.push(...creds);
      marker = r.result.marker;
    } while (marker);

    return all;
  } finally {
    await client.disconnect();
  }
}

export async function deleteCredential(subjectSeed, issuerAddress, credentialType) {
  const client = new Client("wss://s.devnet.rippletest.net:51233");
  await client.connect();

  try {
    const subject = Wallet.fromSeed(subjectSeed.trim());

    const tx = {
      TransactionType: "CredentialDelete",
      Account: subject.address,
      Issuer: issuerAddress,
      Subject: subject.address,
      CredentialType: toHex(credentialType)
    };

    const prepared = await client.autofill(tx);
    const signed = subject.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    return result;
  } finally {
    await client.disconnect();
  }
}
