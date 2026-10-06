/**
 * One pass over the outbox: claim a batch with FOR UPDATE SKIP LOCKED, publish
 * each row to the core.events exchange with publisher confirms, mark dispatched.
 * A publish failure marks the row as failed, bumps attempts, and bails out of
 * the batch (the broker is probably sick — don't hold the lock on the rest).
 *
 * Call site is the worker's scheduler (Croner). This function is idempotent
 * with respect to itself thanks to SKIP LOCKED, so running more than one worker
 * in parallel is safe.
 */
export declare function drainOutbox(): Promise<void>;
