import { AxiosError } from 'axios';

export class NonAAAddressError extends Error {
  constructor() {
    super('Address is not AA on chain');
  }
}

const nonAAAddressErrorMessagePart = [' is not AA account on chain ', '. Please verify that chain is correct.'];

interface GetIsNonAAAddressErrorParams {
  error: unknown;
}

export const getIsNonAAAddressError = ({ error }: GetIsNonAAAddressErrorParams) =>
  error instanceof AxiosError && error.response?.data?.detail?.includes(nonAAAddressErrorMessagePart);
