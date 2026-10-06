import {db} from '../../src/lib/knex/knex';

export async function truncateAll(): Promise<void> {
    const result = await db.raw<{ rows: { tablename: string }[] }>
    (`
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
          AND tablename NOT IN ('knex_migrations', 'knex_migrations_lock');`);

    const tableNames = result.rows.map(row => row.tablename).join(', ');
    await db.raw(`TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;`);

}