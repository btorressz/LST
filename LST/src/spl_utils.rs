// spl_utils.rs
use solana_program::{
    account_info::AccountInfo, program::invoke, pubkey::Pubkey, program_error::ProgramError,
};
use spl_token::instruction::{mint_to, burn};

// Mint LST tokens to the user's account
pub fn mint_tokens(
    mint_pubkey: &Pubkey,
    token_account: &Pubkey,
    authority: &Pubkey,
    amount: u64,
    accounts: &[AccountInfo],
) -> Result<(), ProgramError> {
    let ix = mint_to(
        &spl_token::id(),
        mint_pubkey,
        token_account,
        authority,
        &[],
        amount,
    )?;
    invoke(&ix, accounts)
}

// Burn LST tokens from the user's account
pub fn burn_tokens(
    mint_pubkey: &Pubkey,
    token_account: &Pubkey,
    authority: &Pubkey,
    amount: u64,
    accounts: &[AccountInfo],
) -> Result<(), ProgramError> {
    let ix = burn(
        &spl_token::id(),
        token_account,
        mint_pubkey,
        authority,
        &[],
        amount,
    )?;
    invoke(&ix, accounts)
}
