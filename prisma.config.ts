import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
    // @ts-expect-error: Prisma 7 defineConfig missing directUrl typing bug
    directUrl: process.env["DIRECT_URL"],
  },
});
