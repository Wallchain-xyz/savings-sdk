import { Chain } from 'viem';
import { base } from 'viem/chains';

import { createExtendedTestClient } from './createExtendedTestClient';
import { EnsureAllowanceParams, ensureAllowance } from './helperActions/ensureAllowance';
import { EnsureEnoughBalanceForGasParams, ensureEnoughBalanceForGas } from './helperActions/ensureEnoughBalanceForGas';
import { GetAllowanceParams, getAllowance } from './helperActions/getAllowance';
import { GetERC20BalanceParams, getERC20Balance } from './helperActions/getERC20Balance';
import { SetAllowanceParams, setAllowance } from './helperActions/setAllowance';
import { SetERC20BalanceParams, setERC20Balance } from './helperActions/setERC20Balance';

export function createHelperTestClient(chain: Chain = base) {
  return createExtendedTestClient(chain).extend(client => ({
    ensureEnoughBalanceForGas: (params: EnsureEnoughBalanceForGasParams) => ensureEnoughBalanceForGas(client, params),
    getAllowance: (params: GetAllowanceParams) => getAllowance(client, params),
    setAllowance: (params: SetAllowanceParams) => setAllowance(client, params),
    ensureAllowance: (params: EnsureAllowanceParams) => ensureAllowance(client, params),
    getERC20Balance: (params: GetERC20BalanceParams) => getERC20Balance(client, params),
    setERC20Balance: (params: SetERC20BalanceParams) => setERC20Balance(client, params),
  }));
}
