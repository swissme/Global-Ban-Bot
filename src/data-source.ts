import { join } from "path";
import { createConnection } from "typeorm";
import { __prod__ } from "./constants";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const createDbConnection = () =>
  createConnection({
    type: "mongodb",
    database: process.env.database,
    url: process.env.uri,
    entities: [join(__dirname, "./entities/*")],
    logging: !__prod__,
    extra: {
      authSource: "admin",
    },
  });