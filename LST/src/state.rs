// state.rs
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::pubkey::Pubkey;

// Global state structure to track the staking pool and token data
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct GlobalState {
    pub total_staked_sol: u64, // Total SOL staked in the pool
    pub total_lst_supply: u64, // Total LST issued to users
    pub current_validator_pubkey: Pubkey, // Validator the stake is currently delegated to
    pub admin: Pubkey, // Admin account for managing redelegation
    pub lst_mint_pubkey: Pubkey, // LST mint account public key
    pub pending_admin: Option<Pubkey>, // New admin pending acceptance
}

// User-specific data structure (optional if needed)
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct UserAccount {
    pub lst_balance: u64, // User's LST balance
    pub owner: Pubkey, // User's wallet address
}
