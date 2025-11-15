#!/bin/bash
set -e

echo "🚀 Setting up Starboard local development environment..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if fuel node is running
if ! curl -s http://127.0.0.1:4000/v1/health > /dev/null 2>&1; then
    echo -e "${RED}❌ Fuel node is not running on port 4000${NC}"
    echo "Please start it with: pnpm dev:all"
    exit 1
fi

echo -e "${GREEN}✓${NC} Fuel node is running"

# Deployer wallet (from fuel node test wallets)
DEPLOYER_PRIVK="0x9e42fa83bda35cbc769c4b058c721adef68011d7945d0b30165397ec6d05a53a"
NODE_URL="http://127.0.0.1:4000/v1/graphql"

# Build contracts if not already built
echo -e "${YELLOW}📦 Building contracts...${NC}"
cd "$(dirname "$0")/.."
pnpm nx build starboard/contracts > /tmp/contract-build.log 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Contract build failed. Check /tmp/contract-build.log${NC}"
    exit 1
fi
echo -e "${GREEN}✓${NC} Contracts built"

# Generate types
echo -e "${YELLOW}📝 Generating TypeScript types...${NC}"
pnpm nx gen:types starboard/contracts > /tmp/contract-types.log 2>&1
echo -e "${GREEN}✓${NC} Types generated"

# Deploy StorkMock (price oracle)
echo -e "${YELLOW}🦜 Deploying Stork Mock (Price Oracle)...${NC}"
DEPLOY_OUTPUT=$(cd contracts && npx ts-node tasks/deploy-stork-mock.ts --url="$NODE_URL" --privK="$DEPLOYER_PRIVK" 2>&1)
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to deploy Stork Mock${NC}"
    echo "$DEPLOY_OUTPUT"
    echo ""
    echo -e "${YELLOW}💡 This might be a version mismatch. Trying to continue...${NC}"
    # Don't exit - we'll create a mock setup
    STORK_CONTRACT="0x0000000000000000000000000000000000000000000000000000000000000000"
else
    STORK_CONTRACT=$(echo "$DEPLOY_OUTPUT" | grep "Mocked Stork deployed to" | awk '{print $NF}')
    echo -e "${GREEN}✓${NC} Stork Mock deployed: $STORK_CONTRACT"
fi

# Deploy USDC token and Vault
echo -e "${YELLOW}🏦 Deploying Vault system...${NC}"
SETUP_OUTPUT=$(cd contracts && npx ts-node tasks/setup-testnet.ts --url="$NODE_URL" --privK="$DEPLOYER_PRIVK" --storkContractAddress="$STORK_CONTRACT" 2>&1)
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to deploy Vault system${NC}"
    echo "$SETUP_OUTPUT"
    echo ""
    echo -e "${YELLOW}⚠️  Version mismatch detected. Please run:${NC}"
    echo "  fuelup update"
    echo "  fuelup default testnet"
    exit 1
fi

VAULT_CONTRACT=$(echo "$SETUP_OUTPUT" | grep "Vault deployed to" | awk '{print $NF}')
PRICEFEED_CONTRACT=$(echo "$SETUP_OUTPUT" | grep "PricefeedWrapper deployed to" | awk '{print $NF}')
USDC_CONTRACT=$(echo "$SETUP_OUTPUT" | grep -A 2 "mckUSDC" | grep "Token deployed to" | awk '{print $(NF-2)}')
USDC_ASSET=$(echo "$SETUP_OUTPUT" | grep -A 2 "mckUSDC" | grep "Token deployed to" | awk '{print $NF}')

echo -e "${GREEN}✓${NC} Vault deployed: $VAULT_CONTRACT"
echo -e "${GREEN}✓${NC} PricefeedWrapper deployed: $PRICEFEED_CONTRACT"
echo -e "${GREEN}✓${NC} USDC Token deployed: $USDC_CONTRACT"
echo -e "${GREEN}✓${NC} USDC Asset ID: $USDC_ASSET"

# Update indexer .env file
echo -e "${YELLOW}⚙️  Updating indexer configuration...${NC}"
INDEXER_ENV_FILE="apps/indexer/.env"

# Update or create .env file
cat > "$INDEXER_ENV_FILE" << EOF
# Database Configuration
DB_NAME=postgres
DB_USER=postgres
DB_PASS=postgres
DB_PORT=23798

# GraphQL Server
GRAPHQL_SERVER_PORT=4350

# Local Development - Auto-configured by setup-local-dev.sh
GATEWAY_URL=
GRAPHQL_URL=http://127.0.0.1:4000/v1/graphql

# Deployed Contract Addresses
VAULT_PRICEFEED_ADDRESS=$PRICEFEED_CONTRACT
VAULT_ADDRESS=$VAULT_CONTRACT

# Start from current block
FROM_BLOCK=0

# USDC Token Info
USDC_CONTRACT=$USDC_CONTRACT
USDC_ASSET=$USDC_ASSET
EOF

echo -e "${GREEN}✓${NC} Indexer configured"

# Save deployment info for reference
cat > "deployment.local.json" << EOF
{
  "network": "local",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "contracts": {
    "storkMock": "$STORK_CONTRACT",
    "vault": "$VAULT_CONTRACT",
    "pricefeedWrapper": "$PRICEFEED_CONTRACT",
    "usdcToken": "$USDC_CONTRACT",
    "usdcAssetId": "$USDC_ASSET"
  },
  "deployer": "0x0a0da2e1d4d201cc73cd500dfd64a732f1b94e5fb2d86657ab43ff620acaefd6"
}
EOF

echo -e "${GREEN}✓${NC} Deployment info saved to deployment.local.json"

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo "Deployed contracts:"
echo "  • Stork Mock:       $STORK_CONTRACT"
echo "  • Vault:            $VAULT_CONTRACT"
echo "  • PricefeedWrapper: $PRICEFEED_CONTRACT"
echo "  • USDC Token:       $USDC_CONTRACT"
echo ""
echo "Next steps:"
echo "  1. Restart the indexer to pick up the new configuration"
echo "  2. The frontend will connect to your local node automatically"
echo ""
echo "Test wallets (pre-funded):"
echo "  • Deployer:  0x0a0da2e1d4d201cc73cd500dfd64a732f1b94e5fb2d86657ab43ff620acaefd6"
echo "  • User 0:    0xc2833c4eae8a3b056a6f21a04d1a176780d5dc9df621270c41bec86a90c3d770"
echo "  • User 1:    0x7ab1e9d9fd10909aead61cbfd4a5ec2d80bb304f34cfa2b5a9446398e284e92c"

