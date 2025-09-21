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

/**
 * 자격증명을 생성하고 즉시 수락합니다.
 * @param {string} issuerSeed - 발급자 지갑 시드
 * @param {string} subjectSeed - 대상자 지갑 시드
 * @param {string} credentialType - 자격증명 타입
 * @param {number} expiration - 만료시간 (선택사항)
 * @param {string} uri - URI (선택사항)
 * @returns {Promise<Object>} 생성 및 수락 결과
 */
export async function createAndAcceptCredential(issuerSeed, subjectSeed, credentialType, expiration, uri) {
  const client = new Client("wss://s.devnet.rippletest.net:51233");
  await client.connect();

  try {
    console.log('🔑 Creating credential...');
    
    // 1. 자격증명 생성
    const issuer = Wallet.fromSeed(issuerSeed.trim());
    const subject = Wallet.fromSeed(subjectSeed.trim());

    const createTx = {
      TransactionType: "CredentialCreate",
      Account: issuer.address,
      Subject: subject.address,
      CredentialType: toHex(credentialType),
      Expiration: expiration || (now() + 3600),
      URI: uri ? toHex(uri) : toHex("https://example.com/credentials/" + credentialType.toLowerCase())
    };

    const preparedCreate = await client.autofill(createTx);
    const signedCreate = issuer.sign(preparedCreate);
    const createResult = await client.submitAndWait(signedCreate.tx_blob);

    console.log('✅ Credential created successfully');

    // 2. 자격증명 수락
    console.log('🤝 Accepting credential...');
    
    const acceptTx = {
      TransactionType: "CredentialAccept",
      Account: subject.address,
      Issuer: issuer.address,
      CredentialType: toHex(credentialType)
    };

    const preparedAccept = await client.autofill(acceptTx);
    const signedAccept = subject.sign(preparedAccept);
    const acceptResult = await client.submitAndWait(signedAccept.tx_blob);

    console.log('✅ Credential accepted successfully');

    return {
      create: createResult,
      accept: acceptResult,
      credentialType,
      issuerAddress: issuer.address,
      subjectAddress: subject.address,
      status: 'completed'
    };
  } finally {
    await client.disconnect();
  }
}
