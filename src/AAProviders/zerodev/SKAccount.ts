import { SKAccount } from '../types';

import { BaseZerodevAAAccount } from './BaseAAccount';
import { KernelClient } from './common';

interface ZerodevSKAccountParams {
  client: KernelClient;
}

export class ZerodevSKAccount extends BaseZerodevAAAccount implements SKAccount {
  constructor({ client }: ZerodevSKAccountParams) {
    super({ client });
  }
}
