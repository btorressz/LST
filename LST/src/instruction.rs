// instruction.rs
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::pubkey::Pubkey;

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum StakeInstruction {
    /// Initialize the global state
    /// Accounts expected:
    /// 0. [writable] Global state account
    /// 1. [signer] Admin account
    /// 2. [] LST mint account
    Initialize {
        total_staked_sol: u64,
        lst_mint_pubkey: Pubkey,
    },

    /// Stake SOL and receive LST in return
    /// Accounts expected:
    /// 0. [writable] User account (for receiving LST)
    /// 1. [writable] Global state account
    /// 2. [writable] User's SOL account (for transferring SOL)
    /// 3. [] LST mint account
    /// 4. [] SPL token program
    /// 5. [] System program
    Stake {
        amount: u64,
    },

    /// Withdraw SOL by redeeming LST
    /// Accounts expected:
    /// 0. [writable] User account (holding LST)
    /// 1. [writable] Global state account
    /// 2. [writable] User's SOL account (destination for withdrawn SOL)
    /// 3. [] LST mint account
    /// 4. [] SPL token program
    Withdraw {
        lst_amount: u64,
    },

    /// Auto-compound rewards
    /// Accounts expected:
    /// 0. [writable] Stake account
    /// 1. [signer] Admin account
    AutoCompound,

    /// Redelegate stake to a new validator
    /// Accounts expected:
    /// 0. [writable] Stake account
    /// 1. [signer] Admin account
    /// 2. [] New validator vote account
    Redelegate {
        new_validator_pubkey: Pubkey,
    },

    /// Propose a new admin (step 1 of 2 for admin change)
    /// Accounts expected:
    /// 0. [writable] Global state account
    /// 1. [signer] Current admin
    ChangeAdminPropose {
        new_admin: Pubkey,
    },

    /// Accept admin role (step 2 of 2 for admin change)
    /// Accounts expected:
    /// 0. [writable] Global state account
    /// 1. [signer] New admin
    ChangeAdminAccept,
}
