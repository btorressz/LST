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

/**
 * The expected size of each global state account.
 */
const GLOBAL_STATE_SIZE = borsh.serialize(
  GlobalStateSchema,
  new GlobalState({
    total_staked_sol: 0,
    total_lst_supply: 0,
    current_validator_pubkey: new Uint8Array(32),
    admin: new Uint8Array(32),
    pending_admin: null,
    lst_mint_pubkey: new Uint8Array(32),
  })
).length;

describe("LST Program Tests", () => {
  let globalStateKp: web3.Keypair;
  let lstMintKp: web3.Keypair;

  before(async () => {
    // Create global state and mint accounts before running the tests
    globalStateKp = new web3.Keypair();
    lstMintKp = new web3.Keypair();
  });

  it("initialize global state", async () => {
    const lamports = await pg.connection.getMinimumBalanceForRentExemption(GLOBAL_STATE_SIZE);

    const createGlobalStateIx = web3.SystemProgram.createAccount({
      fromPubkey: pg.wallet.publicKey,
      lamports,
      newAccountPubkey: globalStateKp.publicKey,
      programId: pg.PROGRAM_ID,
      space: GLOBAL_STATE_SIZE,
    });

    // Initialize the global state
    const initializeIx = new web3.TransactionInstruction({
      keys: [
        { pubkey: globalStateKp.publicKey, isSigner: false, isWritable: true },
        { pubkey: pg.wallet.publicKey, isSigner: true, isWritable: false },
        { pubkey: lstMintKp.publicKey, isSigner: false, isWritable: false },
      ],
      programId: pg.PROGRAM_ID,
      data: Buffer.from([0]), // Instruction 0 for Initialize
    });

    const tx = new web3.Transaction();
    tx.add(createGlobalStateIx, initializeIx);

    const txHash = await web3.sendAndConfirmTransaction(pg.connection, tx, [
      pg.wallet.keypair,
      globalStateKp,
    ]);
    console.log(`Initialize transaction hash: ${txHash}`);

    const globalStateAccount = await pg.connection.getAccountInfo(globalStateKp.publicKey);
    if (!globalStateAccount) {
      throw new Error("Failed to fetch global state account");
    }

    const deserializedGlobalState = borsh.deserialize(
      GlobalStateSchema,
      GlobalState,
      globalStateAccount.data
    );

    assert(globalStateAccount.lamports >= lamports, "Lamports should be at least the rent-exempt balance");
    assert(globalStateAccount.owner.equals(pg.PROGRAM_ID), "Account owner should be the program ID");
    assert.equal(deserializedGlobalState.total_staked_sol, 0, "Total staked SOL should be 0");
    assert.equal(deserializedGlobalState.total_lst_supply, 0, "Total LST supply should be 0");
    assert(deserializedGlobalState.admin.equals(pg.wallet.publicKey), "Admin should be the wallet's public key");
    assert(deserializedGlobalState.lst_mint_pubkey.equals(lstMintKp.publicKey), "LST mint pubkey should match");
  });

  it("stake SOL and mint LST", async () => {
    const stakeAmount = 1_000_000_000; // 1 SOL

    const stakeIx = new web3.TransactionInstruction({
      keys: [
        { pubkey: globalStateKp.publicKey, isSigner: false, isWritable: true },
        { pubkey: pg.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: lstMintKp.publicKey, isSigner: false, isWritable: false },
      ],
      programId: pg.PROGRAM_ID,
      data: Buffer.from([1, ...new BN(stakeAmount).toArray("le", 8)]), // Instruction 1 for Stake
    });

    const tx = new web3.Transaction();
    tx.add(stakeIx);

    const txHash = await web3.sendAndConfirmTransaction(pg.connection, tx, [pg.wallet.keypair]);
    console.log(`Stake transaction hash: ${txHash}`);

    const globalStateAccount = await pg.connection.getAccountInfo(globalStateKp.publicKey);
    if (!globalStateAccount) {
      throw new Error("Failed to fetch global state account");
    }

    const deserializedGlobalState = borsh.deserialize(
      GlobalStateSchema,
      GlobalState,
      globalStateAccount.data
    );

    assert.equal(deserializedGlobalState.total_staked_sol, stakeAmount, "Total staked SOL should be updated");
    assert(deserializedGlobalState.total_lst_supply > 0, "Total LST supply should be greater than 0");
  });

  it("withdraw SOL by burning LST", async () => {
    const withdrawAmount = 500_000_000; // 0.5 SOL

    const withdrawIx = new web3.TransactionInstruction({
      keys: [
        { pubkey: globalStateKp.publicKey, isSigner: false, isWritable: true },
        { pubkey: pg.wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: lstMintKp.publicKey, isSigner: false, isWritable: false },
      ],
      programId: pg.PROGRAM_ID,
      data: Buffer.from([2, ...new BN(withdrawAmount).toArray("le", 8)]), // Instruction 2 for Withdraw
    });

    const tx = new web3.Transaction();
    tx.add(withdrawIx);

    const txHash = await web3.sendAndConfirmTransaction(pg.connection, tx, [pg.wallet.keypair]);
    console.log(`Withdraw transaction hash: ${txHash}`);

    const globalStateAccount = await pg.connection.getAccountInfo(globalStateKp.publicKey);
    if (!globalStateAccount) {
      throw new Error("Failed to fetch global state account");
    }

    const deserializedGlobalState = borsh.deserialize(
      GlobalStateSchema,
      GlobalState,
      globalStateAccount.data
    );

    assert.equal(deserializedGlobalState.total_staked_sol, 500_000_000, "Total staked SOL should be reduced");
  });

  it("auto-compound rewards", async () => {
    const autoCompoundIx = new web3.TransactionInstruction({
      keys: [
        { pubkey: globalStateKp.publicKey, isSigner: false, isWritable: true },
        { pubkey: pg.wallet.publicKey, isSigner: true, isWritable: false },
      ],
      programId: pg.PROGRAM_ID,
      data: Buffer.from([3]), // Instruction 3 for Auto-Compound
    });

    const tx = new web3.Transaction();
    tx.add(autoCompoundIx);

    const txHash = await web3.sendAndConfirmTransaction(pg.connection, tx, [pg.wallet.keypair]);
    console.log(`Auto-compound transaction hash: ${txHash}`);

    const globalStateAccount = await pg.connection.getAccountInfo(globalStateKp.publicKey);
    if (!globalStateAccount) {
      throw new Error("Failed to fetch global state account");
    }

    const deserializedGlobalState = borsh.deserialize(
      GlobalStateSchema,
      GlobalState,
      globalStateAccount.data
    );

    assert(deserializedGlobalState.total_staked_sol > 500_000_000, "Total staked SOL should have increased");
  });

  it("redelegate to a new validator", async () => {
    const newValidator = new web3.Keypair().publicKey;

    const redelegateIx = new web3.TransactionInstruction({
      keys: [
        { pubkey: globalStateKp.publicKey, isSigner: false, isWritable: true },
        { pubkey: pg.wallet.publicKey, isSigner: true, isWritable: false },
      ],
      programId: pg.PROGRAM_ID,
      data: Buffer.from([4, ...newValidator.toBytes()]), // Instruction 4 for Redelegate
    });

    const tx = new web3.Transaction();
    tx.add(redelegateIx);

    const txHash = await web3.sendAndConfirmTransaction(pg.connection, tx, [pg.wallet.keypair]);
    console.log(`Redelegate transaction hash: ${txHash}`);

    const globalStateAccount = await pg.connection.getAccountInfo(globalStateKp.publicKey);
    if (!globalStateAccount) {
      throw new Error("Failed to fetch global state account");
    }

    const deserializedGlobalState = borsh.deserialize(
      GlobalStateSchema,
      GlobalState,
      globalStateAccount.data
    );

    assert(deserializedGlobalState.current_validator_pubkey.equals(newValidator), "Validator should be updated");
  });

  it("admin change proposal and acceptance", async () => {
    const newAdmin = new web3.Keypair();

    const proposeAdminIx = new web3.TransactionInstruction({
      keys: [
        { pubkey: globalStateKp.publicKey, isSigner: false, isWritable: true },
        { pubkey: pg.wallet.publicKey, isSigner: true, isWritable: false },
      ],
      programId: pg.PROGRAM_ID,
      data: Buffer.from([5, ...newAdmin.publicKey.toBytes()]), // Instruction 5 for Propose Admin
    });

    const tx1 = new web3.Transaction();
    tx1.add(proposeAdminIx);

    const proposeTxHash = await web3.sendAndConfirmTransaction(pg.connection, tx1, [pg.wallet.keypair]);
    console.log(`Admin propose transaction hash: ${proposeTxHash}`);

    const acceptAdminIx = new web3.TransactionInstruction({
      keys: [
        { pubkey: globalStateKp.publicKey, isSigner: false, isWritable: true },
        { pubkey: newAdmin.publicKey, isSigner: true, isWritable: false },
      ],
      programId: pg.PROGRAM_ID,
      data: Buffer.from([6]), // Instruction 6 for Accept Admin
    });

    const tx2 = new web3.Transaction();
    tx2.add(acceptAdminIx);

    const acceptTxHash = await web3.sendAndConfirmTransaction(pg.connection, tx2, [newAdmin]);
    console.log(`Admin accept transaction hash: ${acceptTxHash}`);

    const globalStateAccount = await pg.connection.getAccountInfo(globalStateKp.publicKey);
    if (!globalStateAccount) {
      throw new Error("Failed to fetch global state account");
    }

    const deserializedGlobalState = borsh.deserialize(
      GlobalStateSchema,
      GlobalState,
      globalStateAccount.data
    );

    assert(deserializedGlobalState.admin.equals(newAdmin.publicKey), "Admin should be updated to new admin");
  });
});
