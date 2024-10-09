// processor.rs
use crate::{
    instruction::StakeInstruction,
    state::GlobalState,
    error::StakingError,
    spl_utils::{mint_tokens, burn_tokens}, // Utility functions for SPL token operations
};
use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
    program_error::ProgramError,
    system_instruction,
    program::invoke,
    sysvar::{rent::Rent, Sysvar},
};

pub fn process(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = StakeInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction {
        StakeInstruction::Initialize { total_staked_sol, lst_mint_pubkey } => {
            process_initialize(accounts, total_staked_sol, lst_mint_pubkey, program_id)
        }
        StakeInstruction::Stake { amount } => {
            process_stake(accounts, amount, program_id)
        }
        StakeInstruction::Withdraw { lst_amount } => {
            process_withdraw(accounts, lst_amount, program_id)
        }
        StakeInstruction::AutoCompound => {
            process_auto_compound(accounts, program_id)
        }
        StakeInstruction::Redelegate { new_validator_pubkey } => {
            process_redelegate(accounts, new_validator_pubkey, program_id)
        }
        StakeInstruction::ChangeAdminPropose { new_admin } => {
            process_change_admin_propose(accounts, new_admin, program_id)
        }
        StakeInstruction::ChangeAdminAccept => {
            process_change_admin_accept(accounts, program_id)
        }
    }
}

fn process_initialize(
    accounts: &[AccountInfo],
    total_staked_sol: u64,
    lst_mint_pubkey: Pubkey,
    program_id: &Pubkey,
) -> ProgramResult {
    // Initialization logic (already provided)
    Ok(())
}

fn process_stake(
    accounts: &[AccountInfo],
    amount: u64,
    program_id: &Pubkey,
) -> ProgramResult {
    // Staking logic (already provided)
    Ok(())
}

fn process_withdraw(
    accounts: &[AccountInfo],
    lst_amount: u64,
    program_id: &Pubkey,
) -> ProgramResult {
    // Withdrawal logic (already provided)
    Ok(())
}

fn process_auto_compound(
    accounts: &[AccountInfo],
    program_id: &Pubkey,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let stake_account = next_account_info(account_info_iter)?;
    let global_state_account = next_account_info(account_info_iter)?;
    let admin_account = next_account_info(account_info_iter)?;

    // Verify the admin is the signer
    if !admin_account.is_signer {
        return Err(StakingError::Unauthorized.into());
    }

    // Deserialize the global state
    let mut global_state_data = GlobalState::try_from_slice(&global_state_account.data.borrow())?;

    // Simulate fetching rewards from the stake account (normally this would involve
    // more complex logic depending on the staking program you're interacting with)
    let simulated_rewards_amount: u64 = 100; // Example reward amount, should be fetched from real data

    // Update the total staked SOL with the compounded rewards
    global_state_data.total_staked_sol += simulated_rewards_amount;

    // Serialize the updated state back into the global state account
    global_state_data.serialize(&mut &mut global_state_account.data.borrow_mut()[..])?;

    msg!("Auto-compounded rewards: {} SOL added to the pool", simulated_rewards_amount);
    Ok(())
}

fn process_redelegate(
    accounts: &[AccountInfo],
    new_validator_pubkey: Pubkey,
    program_id: &Pubkey,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let stake_account = next_account_info(account_info_iter)?;
    let global_state_account = next_account_info(account_info_iter)?;
    let admin_account = next_account_info(account_info_iter)?;

    // Verify the admin is the signer
    if !admin_account.is_signer {
        return Err(StakingError::Unauthorized.into());
    }

    // Deserialize the global state
    let mut global_state_data = GlobalState::try_from_slice(&global_state_account.data.borrow())?;

    // Update the current validator in the global state
    global_state_data.current_validator_pubkey = new_validator_pubkey;

    // Serialize the updated global state
    global_state_data.serialize(&mut &mut global_state_account.data.borrow_mut()[..])?;

    msg!("Redelegated to new validator: {:?}", new_validator_pubkey);
    Ok(())
}

fn process_change_admin_propose(
    accounts: &[AccountInfo],
    new_admin: Pubkey,
    program_id: &Pubkey,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let global_state_account = next_account_info(account_info_iter)?;
    let current_admin_account = next_account_info(account_info_iter)?;

    // Verify the current admin is the signer
    if !current_admin_account.is_signer {
        return Err(StakingError::Unauthorized.into());
    }

    // Deserialize the global state
    let mut global_state_data = GlobalState::try_from_slice(&global_state_account.data.borrow())?;

    // Verify that the caller is indeed the current admin
    if global_state_data.admin != *current_admin_account.key {
        msg!("Unauthorized: Caller is not the current admin");
        return Err(StakingError::Unauthorized.into());
    }

    // Propose the new admin
    global_state_data.pending_admin = Some(new_admin);
    global_state_data.serialize(&mut &mut global_state_account.data.borrow_mut()[..])?;

    msg!("Admin change proposed to: {:?}", new_admin);
    Ok(())
}

fn process_change_admin_accept(
    accounts: &[AccountInfo],
    program_id: &Pubkey,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let global_state_account = next_account_info(account_info_iter)?;
    let new_admin_account = next_account_info(account_info_iter)?;

    // Verify that the caller is the pending admin
    if !new_admin_account.is_signer {
        return Err(StakingError::Unauthorized.into());
    }

    // Deserialize the global state
    let mut global_state_data = GlobalState::try_from_slice(&global_state_account.data.borrow())?;

    // Verify that the pending admin matches the caller
    if global_state_data.pending_admin != Some(*new_admin_account.key) {
        msg!("Unauthorized: Caller is not the pending admin");
        return Err(StakingError::Unauthorized.into());
    }

    // Update the admin and clear the pending admin
    global_state_data.admin = *new_admin_account.key;
    global_state_data.pending_admin = None;
    global_state_data.serialize(&mut &mut global_state_account.data.borrow_mut()[..])?;

    msg!("Admin role accepted by: {:?}", new_admin_account.key);
    Ok(())
}
