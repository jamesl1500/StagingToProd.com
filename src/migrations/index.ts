import * as migration_20261002_132423_initial from './20261002_132423_initial';

export const migrations = [
  {
    up: migration_20261002_132423_initial.up,
    down: migration_20261002_132423_initial.down,
    name: '20261002_132423_initial'
  },
];
