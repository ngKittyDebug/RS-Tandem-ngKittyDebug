import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const connectionString = `${process.env.MODE ? process.env.DEVELOPMENT_POSTGRES : process.env.DIRECT_URL}`;

console.log(connectionString);
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: connectionString,
  },
});
