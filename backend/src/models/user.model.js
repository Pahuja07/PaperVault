import {pgTable,text,varchar,uuid,bigint,timestamp,pgEnum} from 'drizzle-orm/pg-core';

export const roleEnum=pgEnum('role',['student','admin']);
export const usersTable =pgTable('users',{
    userid:uuid().primaryKey().defaultRandom(),
    name:varchar({length:255}).notNull(),
    email:text().notNull(),
    password:varchar({length:255}),
    salt:varchar({length:255}).notNull(),
    updatedat:timestamp().defaultNow(),
    createdat:timestamp().defaultNow(),
    resetToken:text('reset_token'),
    resetTokenExpiry:timestamp('reset_token_expiry'),
    otp:varchar({length:6}),
    otpExpiry:timestamp('otp_expiry'),
    role:   roleEnum('role').default('student').notNull()
});