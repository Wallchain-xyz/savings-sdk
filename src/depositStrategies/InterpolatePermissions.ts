import { Permission } from '../AAProviders/shared/Permission';
import { mapStringValuesDeep } from '../utils/mapValuesDeep';

export class InterpolationError extends Error {}

interface ParamsValuesByKey {
  [key: string]: string | null;
}

export function interpolatePermissions(permissions: Permission[], paramValuesByKey?: ParamsValuesByKey) {
  return mapStringValuesDeep(permissions, value => {
    if (value.startsWith('{{') && value.endsWith('}}')) {
      const paramKey = value.slice(2, -2);
      const paramValue = (paramValuesByKey ?? {})[paramKey];
      if (!paramValue) {
        throw new InterpolationError(`Value is not provided for permissions - ${paramKey}`);
      }
      return paramValue;
    }
    return value;
  });
}
