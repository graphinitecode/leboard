import * as migration_20261005_233851_baseline from './20261005_233851_baseline';

export const migrations = [
  {
    up: migration_20261005_233851_baseline.up,
    down: migration_20261005_233851_baseline.down,
    name: '20261005_233851_baseline'
  },
];
