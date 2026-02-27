script;

use std::identity::Identity;
use core_interfaces::vault::Vault;
use std::asset::transfer;

configurable {
    VAULT: ContractId = ContractId::zero(),
    BASE_ASSET_ID: AssetId = AssetId::zero(),
}

pub enum Error {
    VaultPriceSlippageExceeded: (),
}

fn main(
    account: Identity,
    index_asset: b256,
    size_delta: u256,
    is_long: bool,
    collateral_delta: u64,
    limit_price: u256,
) -> (u256, u256) {
    let vault = abi(Vault, VAULT.bits());
    let (new_collateral, price) = vault.increase_position {
        coins: collateral_delta,
        asset_id: BASE_ASSET_ID.bits(),
    }(account, index_asset, size_delta, is_long);
    if is_long {
        require(price <= limit_price, Error::VaultPriceSlippageExceeded);
    } else {
        require(price >= limit_price, Error::VaultPriceSlippageExceeded);
    }
    (new_collateral, price)
}
