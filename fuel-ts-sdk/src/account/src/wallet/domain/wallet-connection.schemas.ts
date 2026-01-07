import { z } from 'zod';

/**
 * Fuel addresses are 66 characters (0x + 64 hex chars)
 */
export const WalletAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid Fuel wallet address format');

export const WalletConnectionSchema = z.object({
  address: WalletAddressSchema,
  connectorId: z.string().min(1, 'Connector ID is required'),
});

export const ConnectorInfoSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  installed: z.boolean(),
  icon: z.string().url().optional(),
});

export const ConnectorInfoArraySchema = z.array(ConnectorInfoSchema);

