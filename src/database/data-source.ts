import { existsSync } from 'node:fs';
import { DataSource } from 'typeorm';
import { EnvConfig } from '../config/env.config.js';

// En local lee .env; en Docker las variables ya vienen del entorno.
if (existsSync('.env')) {
  process.loadEnvFile();
}

export default new DataSource({
  ...EnvConfig().database,
  entities: ['dist/modules/**/*.entity.js'],
  migrations: ['dist/database/migrations/*.js'],
  migrationsTableName: 'migrations',
});
