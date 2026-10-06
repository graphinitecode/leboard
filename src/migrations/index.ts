import * as migration_20261005_233851_baseline from './20261005_233851_baseline';
import * as migration_20261006_103051_dimanche from './20261006_103051_dimanche';

export const migrations = [
  {
    up: migration_20261005_233851_baseline.up,
    down: migration_20261005_233851_baseline.down,
    name: '20261005_233851_baseline',
  },
  {
    up: migration_20261006_103051_dimanche.up,
    down: migration_20261006_103051_dimanche.down,
    name: '20261006_103051_dimanche'
  },
];
