// Pinned eth faucet predicate: only succeeds when the caller supplies the correct PIN
// and the requested amount does not exceed MAX_FAUCET_AMOUNT.
// Fund this predicate's address (with configurable PIN/MAX set); the app passes the PIN when requesting ETH.
predicate;

use std::outputs::{output_amount, output_count};

configurable {
    /// Secret pin; only the app knows this. Passed as runtime data and must match.
    PIN: b256 = 0x0000000000000000000000000000000000000000000000000000000000000000,
    /// Max base-asset amount (9 decimals) that can be taken per transaction.
    MAX_FAUCET_AMOUNT: u64 = 5_000_000,
}

fn main(pin: b256) -> bool {
    if pin != PIN {
        return false;
    }
    if output_count() < 1 {
        return false;
    }
    let amount = output_amount(0).unwrap();
    amount <= MAX_FAUCET_AMOUNT
}
