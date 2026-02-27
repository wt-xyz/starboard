script;

use core_interfaces::vault::Vault;

configurable {
    VAULT: ContractId = ContractId::zero(),
}

pub enum Error {
    VaultPriceSlippageExceeded: (),
}

/// Decreases a position with a limit price (slippage protection).
/// - For a long: require execution price >= limit_price (minimum acceptable sell price).
/// - For a short: require execution price <= limit_price (maximum acceptable buy-to-cover price).
fn main(
    account: Identity,
    index_asset: b256,
    collateral_delta: u256,
    size_delta: u256,
    is_long: bool,
    receiver: Identity,
    limit_price: u256,
) -> (u256, u256, u256) {
    let vault = abi(Vault, VAULT.bits());
    let (new_collateral, price, paid_out_collateral) = vault.decrease_position(
        account,
        index_asset,
        collateral_delta,
        size_delta,
        is_long,
        receiver,
    );
    if is_long {
        require(price >= limit_price, Error::VaultPriceSlippageExceeded);
    } else {
        require(price <= limit_price, Error::VaultPriceSlippageExceeded);
    }
    (new_collateral, price, paid_out_collateral)
}
