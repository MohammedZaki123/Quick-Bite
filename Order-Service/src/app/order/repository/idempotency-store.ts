// import {Knex} from "knex";
// import {db} from "../../../lib/knex/knex";

// export interface IdempotencyRecord {
//     keyHash: Buffer;
//     region: string;
//     userId: string;
//     requestFingerprint: Buffer;
//     responseStatus: number;
//     responseBody: any;
//     createdAt: Date;
//     expiresAt: Date;
// }

// export async function storeIdempotencyKey(record: IdempotencyRecord, conn: Knex = db(record.region)): Promise<void> {
//     await conn("idempotency_keys").insert({
//         key_hash: record.keyHash,
//         region: record.region,
//         user_id: record.userId,
//         request_fingerprint: record.requestFingerprint,
//         response_status: record.responseStatus,
//         response_body: JSON.stringify(record.responseBody),
//         created_at: record.createdAt,
//         expires_at: record.expiresAt,
//     }).onConflict("key_hash").ignore();
// }

// export async function getIdempotencyKey(keyHash: Buffer, region: string, conn: Knex = db(region)): Promise<IdempotencyRecord | undefined> {
//     const row = await conn("idempotency_keys")
//         .where({key_hash: keyHash, region})
//         .first();
    
//     if (!row) return undefined;
    
//     return {
//         keyHash: row.key_hash,
//         region: row.region,
//         userId: String(row.user_id),
//         requestFingerprint: row.request_fingerprint,
//         responseStatus: row.response_status,
//         responseBody: row.response_body,
//         createdAt: new Date(row.created_at),
//         expiresAt: new Date(row.expires_at),
//     };
// }
