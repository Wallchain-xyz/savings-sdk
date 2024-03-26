export { createAAAccountClientFromPrivateKeyAccount } from './SavingsSDK';
export { getSupportedDepositStrategies } from './depositStrategies';
export { createSavingsAccount } from './SavingsAccount/createSavingsAccount';
export { SavingsAccount } from './SavingsAccount/SavingsAccount';

export function version() {
  return '1.0.0-alpha.2';
}
