import 'dotenv/config';
import db from './src/config/db.js';
import { papersTable } from './src/models/paper.model.js';
import { subjectsTable } from './src/models/subject.model.js';
import { departmentsTable } from './src/models/department.model.js';
import { usersTable } from './src/models/user.model.js';
import { eq } from 'drizzle-orm';

// Azure Storage URL base for your container
const AZURE_BASE_URL = 'https://pypwebsite123.blob.core.windows.net/papers';

const skitCommonSubjects = [
  { code: 'MA101', name: 'Engineering Mathematics-I', semester: 1 },
  { code: 'PH101', name: 'Engineering Physics', semester: 1 },
  { code: 'CS101', name: 'Fundamentals of Computer & IT', semester: 1 },
];

async function seedSkitPapers() {
  console.log('🌱 Starting SKIT papers metadata seeding to PostgreSQL...');

  try {
    // 1. Get or Create an Admin User for 'uploadedby'
    let user = await db.select().from(usersTable).limit(1);
    let userId;
    
    if (user.length === 0) {
      console.log('Creating default admin user...');
      const newUser = await db.insert(usersTable).values({
        username: 'skit_admin',
        email: 'admin@skit.ac.in',
        passwordhash: 'dummy_hash',
        role: 'admin'
      }).returning();
      userId = newUser[0].userid;
    } else {
      userId = user[0].userid;
    }

    // 2. Get or Create a Department (e.g., Computer Science)
    let dept = await db.select().from(departmentsTable).where(eq(departmentsTable.code, 'CSE')).limit(1);
    let deptId;
    
    if (dept.length === 0) {
      console.log('Creating CSE Department...');
      const newDept = await db.insert(departmentsTable).values({
        name: 'Computer Science & Engineering',
        code: 'CSE',
        description: 'First Year Common & CSE Department'
      }).returning();
      deptId = newDept[0].departmentid;
    } else {
      deptId = dept[0].departmentid;
    }

    // 3. Process Subjects and Insert Papers linked to Azure
    for (const sub of skitCommonSubjects) {
      // Create Subject if not exists
      let subject = await db.select().from(subjectsTable).where(eq(subjectsTable.code, sub.code)).limit(1);
      let subjectId;
      
      if (subject.length === 0) {
        console.log(`Creating Subject: ${sub.name}...`);
        const newSub = await db.insert(subjectsTable).values({
          name: sub.name,
          code: sub.code,
          departmentid: deptId,
          semester: sub.semester
        }).returning();
        subjectId = newSub[0].subjectid;
      } else {
        subjectId = subject[0].subjectid;
      }

      // 4. Create Paper Metadata with Azure PDF Link
      const paperTitle = `${sub.code} - ${sub.name} (2023)`;
      const azurePdfUrl = `${AZURE_BASE_URL}/${sub.code}_2023_Paper.pdf`;
      
      console.log(`Inserting Paper Metadata for ${sub.code}... connecting to Azure URL: ${azurePdfUrl}`);
      
      await db.insert(papersTable).values({
        title: paperTitle,
        semester: sub.semester,
        examtype: 'End Semester/Back',
        difficulty: 'medium',
        year: 2023,
        fileUrl: azurePdfUrl, // Linking to Azure!
        fileSize: '1.5MB',
        pages: 5,
        isApproved: true,
        tags: ['skit', 'first-year', sub.code.toLowerCase()],
        uploadedby: userId,
        subjectid: subjectId,
        departmentid: deptId
      });
    }

    console.log('✅ Successfully seeded PostgreSQL with SKIT papers metadata and Azure Links!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding papers:', error);
    process.exit(1);
  }
}

seedSkitPapers();
