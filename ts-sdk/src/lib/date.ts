// Fuel time is in TAI64N format, which is seconds since 1970 + 2^62
// Reference: https://cr.yp.to/libtai/tai64.html

export function tai64ToDate(tai64: number) {
  const offset = BigInt('0x4000000000000000'); // 2^62
  const seconds = BigInt(tai64) - offset;
  return new Date(Number(seconds) * 1000);
}
