import { departmentsTable } from './department.model.js'
import {pgTable,text,varchar,uuid,integer,timestamp} from 'drizzle-orm/pg-core'
export const subjectsTable=pgTable('subjects',{
    subjectid:uuid().primaryKey().defaultRandom(),
    name:varchar({length:255}).notNull(),
    code:varchar({length:20}).notNull(),
    semester:integer().notNull(),
    paperCount: integer().default(0),
    departmentid:uuid().notNull().references(()=>
        departmentsTable.departmentid
    ),
    createdat:timestamp().defaultNow(),
    updatedat:timestamp().defaultNow(),
})
