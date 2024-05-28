import { SKAccount } from '../shared/SKAccount';

import { KernelClient } from './shared';
import { ZerodevAAAccount } from './ZerodevAAAccount';

interface ZerodevSKAccountParams {
  client: KernelClient;
}

export class ZerodevSKAccount extends ZerodevAAAccount implements SKAccount {
  constructor({ client }: ZerodevSKAccountParams) {
    super({ client });
  }
}
