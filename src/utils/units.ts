import BigNumber from 'bignumber.js';
import { ethers } from "ethers";

/*
    wei = 10^0
    mwei = 10^6
    gwei = 10^9
    ether = 10^18
*/

type UnitName = 'wei' | 'mwei' | 'gwei' | 'ether';

const UNIT_DECIMALS: Record<UnitName, number> = {
  wei: 0,
  mwei: 6,
  gwei: 9,
  ether: 18,
};

const resolveUnitDecimals = (unit: number | UnitName) =>
  typeof unit === 'number' ? unit : UNIT_DECIMALS[unit];

export const formatUnit = (value: number | bigint, unit: number | UnitName) => {
  const decimals = resolveUnitDecimals(unit);
  const normalized = typeof value === 'number' ? BigInt(Math.ceil(value)) : value;
  return ethers.formatUnits(normalized, decimals);
};

export const parseUnits = (value: string | number, unit: number | UnitName) => {
  const decimals = resolveUnitDecimals(unit);
  const number = new BigNumber(value);
  return ethers.parseUnits(number.toFixed(), decimals);
};
