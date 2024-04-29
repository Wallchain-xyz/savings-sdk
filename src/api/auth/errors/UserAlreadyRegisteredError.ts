import { AxiosError } from 'axios';

// left for consistency
// eslint-disable-next-line import/no-unused-modules
export class UserAlreadyRegisteredError extends Error {
  constructor() {
    super('User is not registered');
  }
}

const nonAAAddressErrorMessageParts = ['User for Account Abstraction at', 'on chain ', 'already exists'];

interface GetIsUserAlreadyRegisteredErrorParams {
  error: unknown;
}

// left for consistency
// eslint-disable-next-line import/no-unused-modules
export const getIsUserAlreadyRegisteredError = ({ error }: GetIsUserAlreadyRegisteredErrorParams) =>
  error instanceof AxiosError &&
  nonAAAddressErrorMessageParts.every(part => {
    return error.response?.data.detail.includes(part);
  });
