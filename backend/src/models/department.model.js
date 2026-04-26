import{pgTable,uuid,text,varchar,timestamp} from 'drizzle-orm/pg-core'
export const departmentsTable=pgTable('departments',{
    departmentid:uuid().primaryKey().defaultRandom(),
    name:varchar({length:255}).notNull(),
    code:varchar({length:255}).notNull().unique(),
    icon:text(),
    color:varchar({length:255}),
    parentId:uuid('parent_id').references(() => departmentsTable.departmentid),
    createdat:timestamp().defaultNow(),
    
})