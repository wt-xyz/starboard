import { ContractIdSchema } from 'fuel-ts-sdk';
import zod from 'zod';
import { NETWORKS, type Network } from '@/models/Network';

export type EnvConfig = zod.infer<typeof EnvConfigSchema>;

export const EnvConfigSchema = zod.object({
  indexerUrls: jsonStringSchema(networkRecordSchema(zod.string().url())),
  vaultContractIds: jsonStringSchema(networkRecordSchema(ContractIdSchema.optional())),
  testnetTokenContractIds: jsonStringSchema(networkRecordSchema(ContractIdSchema.optional())),
  rpcUrls: jsonStringSchema(networkRecordSchema(zod.string().url())),
  chainIds: jsonStringSchema(networkRecordSchema(zod.coerce.number())),
  defaultNetwork: zod.enum(NETWORKS),
  env: zod.enum(['dev', 'prod']),
  /** Optional 32-byte hex (0x...) for the eth faucet predicate PIN. When set, used for Get testnet ETH and Fund faucet. */
  ethFaucetPin: zod.string().optional(),
});

function networkRecordSchema<T extends zod.ZodTypeAny>(valueSchema: T) {
  return zod.object(
    Object.fromEntries(NETWORKS.map((network) => [network, valueSchema])) as {
      [K in Network]: T;
    }
  );
}

function jsonStringSchema<T extends zod.ZodTypeAny>(schema: T) {
  return zod
    .string()
    .transform((val, ctx) => {
      try {
        return JSON.parse(val) as unknown;
      } catch {
        ctx.addIssue({
          code: zod.ZodIssueCode.custom,
          message: 'Invalid JSON string',
        });
        return zod.NEVER;
      }
    })
    .pipe(schema);
}
