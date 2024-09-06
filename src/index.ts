export { createSavingsBackendClient } from './factories/createSavingsBackendClient';
export { createPimlicoPaymaster } from './factories/createPimlicoPaymaster';
export { createSKAccount } from './factories/createSKAccount';
export { createSavingsAccountFromPrivateKeyAccount } from './factories/createSavingsAccountFromPrivateKeyAccount';
export { createStrategiesManager } from './factories/createStrategiesManager';
export { SavingsAccount } from './SavingsAccount/SavingsAccount';
export type { PointsByProtocol } from './SavingsAccount/SavingsAccount';
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
export { ForbiddenError, SkaNotFoundError, SkaAlreadyExistsError, TxnFailedError } from './api/ska/errors';
export { UnsupportedChainError, DepositTxnFailedError } from './api/dms/errors';
export { InterpolationError } from './depositStrategies/InterpolatePermissions';

export type { DepositStrategyDetailedInfo } from './api/SavingsBackendClient';

export { StrategyNotFoundError } from './depositStrategies/StrategyNotFoundError';
export type { MultiStepWithdrawStrategyId, SingleStepWithdrawStrategyId } from './depositStrategies/strategies';
export type { PendingWithdrawal } from './depositStrategies/DepositStrategy';

export type {
  Distribution,
  SimpleDistribution,
  DistributionPercentage,
  SplitDistribution,
  SequenceDistribution,
} from './api/SavingsBackendClient';
