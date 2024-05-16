import { SKAccount } from '../types';

import { BaseZerodevAAAccount } from './baseAccount';
import { KernelClient } from './common';

export class ZerodevSKAccount extends BaseZerodevAAAccount implements SKAccount {
  constructor(client: KernelClient) {
    super({ client });
  }
}
