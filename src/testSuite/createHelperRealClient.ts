import { createExtendedRealClient } from './createExtendedRealClient';
import { EnsureAllowanceParams, ensureAllowance } from './helperActions/ensureAllowance';
import { GetAllowanceParams, getAllowance } from './helperActions/getAllowance';
import { GetERC20BalanceParams, getERC20Balance } from './helperActions/getERC20Balance';
import { SetAllowanceParams, setAllowance } from './helperActions/setAllowance';

export function createHelperRealClient() {
  return createExtendedRealClient().extend(client => ({
    getAllowance: (params: GetAllowanceParams) => getAllowance(client, params),
    setAllowance: (params: SetAllowanceParams) => setAllowance(client, params),
    ensureAllowance: (params: EnsureAllowanceParams) => ensureAllowance(client, params),
    getERC20Balance: (params: GetERC20BalanceParams) => getERC20Balance(client, params),
  }));
}

export type HelperClient = ReturnType<typeof createHelperRealClient>;
