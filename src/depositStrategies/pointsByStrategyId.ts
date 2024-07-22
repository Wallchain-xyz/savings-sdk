import { APIPoint } from '../api/SavingsBackendClient';

import { StrategyId } from './strategies';

const EtherfiKingKarakLrtPoints: APIPoint[] = [
  {
    // TODO:@merlin images should be ours and served from backend
    imageUrl: 'https://app.ether.fi/images/liquid/ethfi-icon.png',
    name: 'Ether.fi',
    multiplier: 3,
  },
  {
    // TODO:@merlin images should be ours and served from backend
    imageUrl: 'https://app.ether.fi/images/liquid/karak-icon.png',
    name: 'Karak',
    multiplier: 3,
  },
  {
    // TODO:@merlin images should be ours and served from backend
    imageUrl: 'https://app.ether.fi/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fveda-icon.226a1fb7.png&w=48&q=75',
    name: 'Veda',
    multiplier: 3,
  },
];

// TODO:@merlin temp solution, should be in DS
export const pointsByStrategyId: Partial<Record<StrategyId, APIPoint[]>> = {
  'c38d9a08-a0de-4866-bf16-e433a03848ff': EtherfiKingKarakLrtPoints,
  'c1d136de-ee0c-4652-9708-836939241d3a': EtherfiKingKarakLrtPoints,
};
