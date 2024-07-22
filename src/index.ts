export { createSavingsBackendClient } from './factories/createSavingsBackendClient';
export { createPimlicoPaymaster } from './factories/createPimlicoPaymaster';
export { createSKAccount } from './factories/createSKAccount';
export { createSavingsAccountFromPrivateKeyAccount } from './factories/createSavingsAccountFromPrivateKeyAccount';
export { createStrategiesManager } from './factories/createStrategiesManager';
export { SavingsAccount } from './SavingsAccount/SavingsAccount';
export type {
  DepositStrategy,
  DepositStrategyProtocolType,
  DepositStrategyAccountType,
} from './depositStrategies/DepositStrategy';
export type { SavingsAccountUserId } from './api/SavingsBackendClient';
export type { User as SavingsAccountUser } from './api/auth/__generated__/createApiClient';
// TODO: @merlin we need to make this universal and part of our code
export { walletClientToSmartAccountSigner } from 'permissionless';

// errors
export { UnknownAPIError, UnauthenticatedError, ValidationError } from './api/shared/errors';
export {
  NotAdminForbiddenError,
  SignatureExpiredForbiddenError,
  UserAlreadyExistsError,
  UserNotFoundError,
} from './api/auth/errors';
export { ForbiddenError, SkaNotFoundError, SkaAlreadyExistsError, UserOpsFailedError } from './api/ska/errors';
export { UnsupportedChainError } from './api/dms/errors';
export { InterpolationError } from './depositStrategies/InterpolatePermissions';

export { StrategyNotFoundError } from './depositStrategies/StrategyNotFoundError';
export type { DepositStrategyDetailedInfo } from './api/SavingsBackendClient';
