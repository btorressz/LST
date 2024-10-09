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

  ### Client

The client-side code is written in TypeScript and interacts with the Solana program using web3.js and Borsh serialization for communication with on-chain data. It includes the following components:

- **`client.ts`**: A script for fetching the user's balance, global state, and LST balance, as well as performing various interactions with the program.
- **`native.test.ts`**: Test cases for each program function, such as staking, withdrawing, auto-compounding, and admin management.

## Tech Stack

The project uses the following technologies:

- **Rust**: For writing the Solana on-chain program, which handles staking logic, rewards, and state management.
- **TypeScript**: For writing client-side scripts that interact with the on-chain program using Solana's web3.js library.
- **Native Solana**: The program directly uses native Solana features and does not rely on frameworks like Anchor.
- **Solana Playground IDE**: An online IDE for building, deploying, and testing Solana programs and client-side scripts.

## License 
This Project is under the **MIT LICENSE** 

