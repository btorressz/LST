// lib.rs
use solana_program::{
    account_info::AccountInfo, entrypoint, entrypoint::ProgramResult, pubkey::Pubkey,
};

mod state;
mod instruction;
mod processor;
mod error;
mod spl_utils;

// Program entry point
entrypoint!(process_instruction);

// Main process instruction function
fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    processor::process(program_id, accounts, instruction_data)
}
