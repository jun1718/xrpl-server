import xrpl from "xrpl";
const { Client, Wallet } = xrpl;

const toHex = (s) => Buffer.from(s, "utf8").toString("hex");

export async function createDomain(adminSeed, acceptedCredentials) {
  const client = new Client("wss://s.devnet.rippletest.net:51233");
  await client.connect();

  try {
    const admin = Wallet.fromSeed(adminSeed.trim());

    const tx = {
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
    const result = await client.submitAndWait(signed.tx_blob);

    // 생성된 도메인의 ID 추출
    const out = result.result ?? result;
    const created = (out.meta?.AffectedNodes || []).find(
      (n) => n.CreatedNode?.LedgerEntryType === "PermissionedDomain"
    );
    const domainId =
      created?.CreatedNode?.LedgerIndex ||
      created?.CreatedNode?.NewFields?.DomainID || null;

    return {
      ...result,
      domainId: domainId
    };
  } finally {
    await client.disconnect();
  }
}

export async function deleteDomain(adminSeed, domainId) {
  const client = new Client("wss://s.devnet.rippletest.net:51233");
  await client.connect();

  try {
    const admin = Wallet.fromSeed(adminSeed.trim());

    const tx = {
      TransactionType: "PermissionedDomainDelete",
      Account: admin.address,
      DomainID: domainId
    };

    const prepared = await client.autofill(tx);
    const signed = admin.sign(prepared);
    const result = await client.submitAndWait(signed.tx_blob);

    return result;
  } finally {
    await client.disconnect();
  }
}

export async function inspectDomain(domainId) {
  const client = new Client("wss://s.devnet.rippletest.net:51233");
  await client.connect();

  try {
    const result = await client.request({ 
      command: "ledger_entry", 
      index: domainId 
    });

    return result;
  } finally {
    await client.disconnect();
  }
}
