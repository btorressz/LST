//Client.ts
import * as web3 from '@solana/web3.js';
import * as borsh from 'borsh';
import * as spl from '@solana/spl-token';

// Client
console.log("My address:", pg.wallet.publicKey.toString());

// Display SOL balance
const solBalance = await pg.connection.getBalance(pg.wallet.publicKey);
console.log(`My SOL balance: ${solBalance / web3.LAMPORTS_PER_SOL} SOL`);

/**
 * The state of a global account managed by the LST program
 */
class GlobalState {
  total_staked_sol = 0;
  total_lst_supply = 0;
  current_validator_pubkey = new web3.PublicKey(0);
  admin = new web3.PublicKey(0);
  pending_admin = null;
  lst_mint_pubkey = new web3.PublicKey(0);

  constructor(fields: {
    total_staked_sol: number;
    total_lst_supply: number;
    current_validator_pubkey: Uint8Array;
    admin: Uint8Array;
    pending_admin: Uint8Array | null;
    lst_mint_pubkey: Uint8Array;
  } | undefined = undefined) {
    if (fields) {
      this.total_staked_sol = fields.total_staked_sol;
      this.total_lst_supply = fields.total_lst_supply;
      this.current_validator_pubkey = new web3.PublicKey(fields.current_validator_pubkey);
      this.admin = new web3.PublicKey(fields.admin);
      this.pending_admin = fields.pending_admin ? new web3.PublicKey(fields.pending_admin) : null;
      this.lst_mint_pubkey = new web3.PublicKey(fields.lst_mint_pubkey);
    }
  }
}

/**
 * Borsh schema definition for global state accounts
 */
const GlobalStateSchema = new Map([
  [
    GlobalState,
    {
      kind: "struct",
      fields: [
        ["total_staked_sol", "u64"],
        ["total_lst_supply", "u64"],
        ["current_validator_pubkey", [32]],
        ["admin", [32]],
        ["pending_admin", { kind: "option", type: [32] }],
        ["lst_mint_pubkey", [32]],
      ],
    },
  ],
]);

// Function to validate a base58 string as a PublicKey
function isValidPublicKey(publicKeyStr: string): boolean {
  try {
    new web3.PublicKey(publicKeyStr);
    return true;
  } catch (e) {
    return false;
  }
}

// Replace with actual valid base58-encoded public keys
const lstMintAddress = "<YOUR_LST_MINT_ADDRESS>"; // Example: "So11111111111111111111111111111111111111112"
const globalStateAddress = "<YOUR_GLOBAL_STATE_ACCOUNT_ADDRESS>"; // Replace with actual public key

// Validate the LST mint address
if (!isValidPublicKey(lstMintAddress)) {
  throw new Error("Invalid LST mint address. Make sure it is a valid base58-encoded string.");
}

// Validate the global state address
if (!isValidPublicKey(globalStateAddress)) {
  throw new Error("Invalid global state address. Make sure it is a valid base58-encoded string.");
}

// Convert the valid base58 strings to PublicKey objects
const lstMintPubkey = new web3.PublicKey(lstMintAddress);
const globalStatePubkey = new web3.PublicKey(globalStateAddress);

// Function to fetch LST balance if LST mint exists
async function getLSTBalance(walletPubkey: web3.PublicKey, mintPubkey: web3.PublicKey) {
  const tokenAccounts = await pg.connection.getTokenAccountsByOwner(walletPubkey, {
    mint: mintPubkey,
  });

  if (tokenAccounts.value.length === 0) {
    console.log("No LST token account found for this wallet.");
    return 0;
  }

  const accountInfo = tokenAccounts.value[0].account.data;
  const tokenAccountInfo = spl.AccountLayout.decode(accountInfo);
  const balance = Number(tokenAccountInfo.amount);

  console.log(`My LST balance: ${balance / web3.LAMPORTS_PER_SOL} LST`);
  return balance;
}

// Function to fetch global state
async function fetchGlobalState(globalStatePubkey: web3.PublicKey) {
  const accountInfo = await pg.connection.getAccountInfo(globalStatePubkey);
  if (!accountInfo) {
    console.log("Global state account not found.");
    return null;
  }

  // Deserialize the global state
  const deserializedGlobalState = borsh.deserialize(
    GlobalStateSchema,
    GlobalState,
    accountInfo.data
  ) as GlobalState;

  console.log("Staking Pool Status:");
  console.log(`  Total staked SOL: ${deserializedGlobalState.total_staked_sol / web3.LAMPORTS_PER_SOL} SOL`);
  console.log(`  Total LST supply: ${deserializedGlobalState.total_lst_supply / web3.LAMPORTS_PER_SOL} LST`);
  console.log(`  Current validator: ${deserializedGlobalState.current_validator_pubkey.toString()}`);
  console.log(`  Admin: ${deserializedGlobalState.admin.toString()}`);
  return deserializedGlobalState;
}

// Fetch and display the LST balance
await getLSTBalance(pg.wallet.publicKey, lstMintPubkey);

// Fetch and display the global state information
await fetchGlobalState(globalStatePubkey);
