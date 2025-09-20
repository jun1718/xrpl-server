import { Client } from "xrpl";

let client: Client | null = null;

export async function getXRPLClient(): Promise<Client> {
  if (!client) {
    const network = process.env.XRPL_NETWORK || "wss://s.devnet.rippletest.net:51233";
    client = new Client(network);
    await client.connect();
  }
  return client;
}

export async function disconnectXRPLClient(): Promise<void> {
  if (client) {
    await client.disconnect();
    client = null;
  }
}

export const toHex = (s: string): string => Buffer.from(s, "utf8").toString("hex");
export const fromHex = (hex: string): string => Buffer.from(hex, "hex").toString("utf8");
export const now = (): number => Math.floor(Date.now() / 1000);
