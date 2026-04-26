import{departmentsTable} from './department.model.js'
import {subjectsTable} from './subject.model.js'
import {usersTable} from './user.model.js'
import {pgTable,text,varchar,uuid,timestamp,integer,boolean,pgEnum} from 'drizzle-orm/pg-core'
export const examtypeEnum=pgEnum('exam_type',['End Semester/Back','Mid Semester'])
export const difficultyEnum=pgEnum('difficulty',['easy','medium','hard']);
export const papersTable=pgTable('papers',{
   paperid:uuid().primaryKey().defaultRandom(),
   title:varchar({length:255}).notNull(),
   semester:integer().notNull(),
   examtype:examtypeEnum('exam_type').notNull(),
   difficulty:difficultyEnum('difficulty').default('medium'),
   year:integer().notNull(),
   fileUrl:text().notNull(),
   fileSize:varchar({length:255}),
   pages:integer().default(0),
   downloads:integer().default(0),
   featured:boolean().default(false),
   isApproved:boolean().default(false),
   tags: text().array().default([]),
   uploadedby:uuid().notNull().references(()=>usersTable.userid),
   subjectid:uuid().notNull().references(()=>subjectsTable.subjectid),
   departmentid:uuid().notNull().references(()=>departmentsTable.departmentid),
   createdat:timestamp().defaultNow(),
   updatedat:timestamp().defaultNow(),

})