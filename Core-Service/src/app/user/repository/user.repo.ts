import { User } from '../entity/user.entity';
import {db} from "../../../lib/knex/knex";
import {Knex} from "knex";

function toEntity(record: any): User {
    return new User({
        id: record.id,
        email: record.email,
        phone: record.phone,
        name: record.name,
        passwordHash: record.password_hash,
        systemRole: record.system_role,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
        deletedAt: record.deleted_at
    });
}
const USER_COLUMNS = [
    "id","email","phone","name","password_hash","system_role","created_at","updated_at","deleted_at"
]


export async function getUserById(id: number): Promise<User | undefined> {
    const record =
        await db.select(USER_COLUMNS).from('users').where(
            'id', id
        ).andWhere('deleted_at', null).first();

    return record? toEntity(record) : undefined;
}
// for Login operation
export async function getUserByEmail(email: string): Promise<User | undefined> {
    const record =
        await db.select(USER_COLUMNS).from('users').where(
            'email', email
        ).andWhere('deleted_at', null).first();


    return record? toEntity(record) : undefined;
}
export async function findUserExistsByEmailOrPhone(email: string, phone: string): Promise<Boolean> {
    const result = await db.raw
    (`SELECT EXISTS (SELECT 1 FROM users WHERE (email = ? OR phone = ?) AND deleted_at IS NULL) 
    AS "exists"`, [email, phone]);

    return result.rows[0].exists;
}
export async function createUser(user: Partial<User>, conn: Knex = db): Promise<User> {
    const record = await conn("users").insert(
        {
            email: user.email,
            phone: user.phone,
            name: user.name,
            password_hash: user.passwordHash,
            system_role: user.systemRole,
            created_at: user.createdAt,
            updated_at: user.updatedAt,
        }
    ).returning( USER_COLUMNS);
    return toEntity(record[0]);
}

export async function updateUserPassword(userId: number, newPasswordHash: string): Promise<void> {
    await db("users").where('id', userId).update({
        password_hash: newPasswordHash,
    });
}

export async function updateUser(userId: number, data: Partial<User>): Promise<User> {
  // Build update object only with provided attributes

  const record = await db("users").
  where('id', userId).andWhere('deleted_at', null).
  update({...data,
  updated_at: new Date()}).
  returning(USER_COLUMNS);
  return toEntity(record[0]);
}

// export async function deleteUser(userId: number, trx?: Knex.Transaction) {
//     const query = trx || db;
//     await query("users").del().where('id',userId);
// }

