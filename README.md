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


