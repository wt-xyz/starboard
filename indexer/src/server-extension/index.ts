import { getCandles, GetCandlesParams } from './resolvers/candles';

export default function (server: any) {
  // Add custom candles query
  server.addResolver('Query.candles', async (parent: any, args: any, ctx: any, info: any) => {
    const params: GetCandlesParams = {
      ticker: args.ticker,
      resolution: args.resolution,
      fromMs: args.fromMs,
      toMs: args.toMs,
    };
    
    return await getCandles(ctx.openReaderReplica('candles'), params);
  });
  
  console.log('Custom candles resolver registered!');
}

