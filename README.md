# LST
# Solana Liquid Staking Token (LST) Program 

## Project Overview
The LST program is built using Solana's native Rust SDK and Borsh for serialization. It does not use the Anchor framework and relies on Solana's native functionality to implement the smart contract. The program provides functionalities for:
- Staking SOL and minting LST tokens.
- Withdrawing SOL by burning LST tokens.
- Auto-compounding staking rewards.
- Redelegating stake to different validators.
- Managing admin changes.

  ## Features
- **Auto-Compounding Rewards**: Automatically reinvests staking rewards to increase the overall yield.
- **Validator Rotation**: Dynamically reallocates staked SOL to different validators based on performance metrics.
- **Admin Management**: Allows proposing and accepting changes to the program's admin.
- **Native Solana Staking**: Uses Solana's native staking functionality without any third-party dependencies.

 ## Program Architecture

### On-Chain Program

The Solana program is written in Rust and performs the following tasks:

- **Initialize Global State**: Sets up the initial state for the staking pool.
- **Stake SOL and Mint LST**: Accepts SOL from the user, stakes it, and mints LST tokens.
- **Auto-Compound Rewards**: Automatically compounds staking rewards to maximize yields.
- **Withdraw SOL by Burning LST**: Burns LST tokens to redeem the equivalent amount of staked SOL.
- **Redelegate Stake**: Allows for redelegation to a different validator to optimize staking rewards.
- **Admin Management**: Enables admin changes with appropriate checks and access control.


