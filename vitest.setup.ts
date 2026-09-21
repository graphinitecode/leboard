import '@testing-library/jest-dom/vitest'

import dotenv from 'dotenv'

dotenv.config({ path: 'tests/env/.env', override: false })
dotenv.config({ path: 'test.env', override: false })