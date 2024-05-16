import { UserOperation as BaseUserOperation } from 'permissionless/types/userOperation';

import { AAManagerEntryPoint } from './EntryPoint';

import type { GetEntryPointVersion } from 'permissionless/types/entrypoint';

export type UserOperation = BaseUserOperation<GetEntryPointVersion<AAManagerEntryPoint>>;
