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

const MellowRenzoLrtPoints: APIPoint[] = [
  {
    // TODO:@merlin images should be ours and served from backend
    imageUrl: 'https://avatars.githubusercontent.com/u/83597631?s=200',
    name: 'Mellow',
    multiplier: 1,
  },
  {
    // TODO:@merlin images should be ours and served from backend
    imageUrl: 'https://s2.coinmarketcap.com/static/img/coins/200x200/32192.png',
    name: 'Symbiotic',
    multiplier: 1,
  },
  {
    // TODO:@merlin images should be ours and served from backend
    imageUrl: 'https://s2.coinmarketcap.com/static/img/coins/200x200/30843.png',
    name: 'Renzo',
    multiplier: 1.5,
  },
];

// TODO:@merlin temp solution, should be in DS
export const pointsByStrategyId: Partial<Record<StrategyId, APIPoint[]>> = {
  'c38d9a08-a0de-4866-bf16-e433a03848ff': EtherfiKingKarakLrtPoints,
  'c1d136de-ee0c-4652-9708-836939241d3a': EtherfiKingKarakLrtPoints,
  '5155d89f-98c3-436b-bd87-d8fef022620a': MellowRenzoLrtPoints,
  'a4be0324-c93c-4525-a0d1-48c6f9f1bb49': MellowRenzoLrtPoints,
};
