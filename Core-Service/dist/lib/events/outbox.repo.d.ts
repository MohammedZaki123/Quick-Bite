import type { Knex } from "knex";
import { OutboxRow, InsertOutboxInput } from "./types";
/**
 * Insert an event in the SAME trx as the domain mutation that produced it.
 * Callers pass their trx (conn). No dispatch happens here — the dispatcher
 * drains this table on its own interval.
 */
export declare function insertOutboxEvent(conn: Knex, input: InsertOutboxInput): Promise<void>;
/**
 * Dispatcher claim — selects a batch of undispatched rows and locks them so
 * another dispatcher process won't pick up the same rows. Caller is
 * responsible for committing/rolling back the trx.
 */
export declare function claimBatch(conn: Knex, limit: number): Promise<OutboxRow[]>;
export declare function markDispatched(conn: Knex, id: string): Promise<void>;
export declare function markFailed(conn: Knex, id: string, err: string): Promise<void>;
