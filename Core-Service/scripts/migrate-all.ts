/**
 * Runs `knex migrate:latest` for Core-Service database.
 *
 *   npx tsx scripts/migrate-all.ts
 */
import {spawnSync} from "child_process";

function run() {
    console.log("[Core-Service] Running knex migrate:latest...");
    const res = spawnSync(
        "npx",
        ["tsx", "node_modules/knex/bin/cli.js", "--knexfile", "src/lib/knex/knexfile.ts", "migrate:latest"],
        {
            stdio: "inherit",
            shell: true,
            env: {...process.env},
        },
    );
    if (res.status !== 0) {
        console.error("[Core-Service] Migration failed!");
        process.exit(res.status ?? 1);
    }
    console.log("[Core-Service] Migrations applied successfully.");
}

run();
