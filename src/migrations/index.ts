import * as migration_20261002_132423_initial from './20261002_132423_initial';
import * as migration_20261002_134101_content_collections from './20261002_134101_content_collections';

export const migrations = [
  {
    up: migration_20261002_132423_initial.up,
    down: migration_20261002_132423_initial.down,
    name: '20261002_132423_initial',
  },
  {
    up: migration_20261002_134101_content_collections.up,
    down: migration_20261002_134101_content_collections.down,
    name: '20261002_134101_content_collections'
  },
];
