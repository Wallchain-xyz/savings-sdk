import { AxiosError } from 'axios';

// left for consistency
// eslint-disable-next-line import/no-unused-modules
export class UserNotRegisteredError extends Error {
  constructor() {
    super('User is not registered');
  }
}

const nonAAAddressErrorMessageParts = ['User for Account Abstraction at', 'on chain ', 'not exists'];

interface GetIsUserNotRegisteredErrorParams {
  error: unknown;
}

export const getIsUserNotRegisteredError = ({ error }: GetIsUserNotRegisteredErrorParams) =>
  error instanceof AxiosError &&
  nonAAAddressErrorMessageParts.every(part => {
    return error.response?.data?.detail?.includes(part);
  });
