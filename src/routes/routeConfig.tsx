import type { ReactElement } from 'react';
import GaragePage from '../features/garage/GaragePage';
import WinnersPage from '../features/winners/WinnersPage';

export type RouteKey = 'garage' | 'winners';

export interface RouteConfigItem {
  key: RouteKey;
  label: string;
  path: string;
  element: ReactElement;
}

export const routeConfig: RouteConfigItem[] = [
  {
    key: 'garage',
    label: 'Garage',
    path: '/garage',
    element: <GaragePage />,
  },
  {
    key: 'winners',
    label: 'Winners',
    path: '/winners',
    element: <WinnersPage />,
  },
];

export function getRouteByKey(key: RouteKey) {
  return routeConfig.find((route) => route.key === key) ?? routeConfig[0];
}
