#!/bin/bash

set -e

cd /starboard/contracts

pnpm deploy:stork-mock --url=http://starboard_fuel_core:4000/v1/graphql --privK=0x9e42fa83bda35cbc769c4b058c721adef68011d7945d0b30165397ec6d05a53a --salt=${SALT}

pnpm setup:testnet --url=http://starboard_fuel_core:4000/v1/graphql --privK=0x9e42fa83bda35cbc769c4b058c721adef68011d7945d0b30165397ec6d05a53a --storkContractAddress=${VAULT_PRICEFEED_ADDRESS} --salt=${SALT}

# Build and fund ETH faucet predicate for e2e tests
echo "Building ETH faucet predicate..."
pnpm build:eth-faucet-predicate

echo "Funding ETH faucet predicate for e2e tests..."
# Fund with 1 ETH (1000000000 base units) - enough for ~10,000 test runs at 0.0001 ETH each
pnpm fund:eth-faucet-predicate \
  --url=http://starboard_fuel_core:4000/v1/graphql \
  --privK=0x9e42fa83bda35cbc769c4b058c721adef68011d7945d0b30165397ec6d05a53a \
  --amount=1000000000 \
  --pin=${VITE_ETH_FAUCET_PIN:-0x86B66DaccF66BAf63D9BE78426CC1f9313fa3d3A5C5C3A0F94F9e87223365C5f} \
  --out=/starboard/frontend/src/assets/eth-faucet-predicate.json

echo "ETH faucet predicate funded and artifact written"


