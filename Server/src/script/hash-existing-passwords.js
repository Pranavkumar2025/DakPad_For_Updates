import prisma from "../prisma/client.js";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

async function hashPasswords() {
  console.log("Starting password hashing migration...");

  const admins = await prisma.admin.findMany();
  for (const admin of admins) {
    if (admin.password && admin.password.length < 60 && !admin.password.startsWith("$2b$")) {
      const hashed = await bcrypt.hash(admin.password, SALT_ROUNDS);
      await prisma.admin.update({
        where: { adminId: admin.adminId },
        data: { password: hashed },
      });
      console.log(`Hashed password for admin: ${admin.adminId}`);
    }
  }

  const supervisors = await prisma.supervisor.findMany();
  for (const sup of supervisors) {
    if (sup.password && sup.password.length < 60 && !sup.password.startsWith("$2b$")) {
      const hashed = await bcrypt.hash(sup.password, SALT_ROUNDS);
      await prisma.supervisor.update({
        where: { supervisorId: sup.supervisorId },
        data: { password: hashed },
      });
      console.log(`Hashed password for supervisor: ${sup.supervisorId}`);
    }
  }

  console.log("Migration complete!");
  process.exit(0);
}

hashPasswords().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});




// to run this code i am able to achieve the password hashing migration for existing admin and supervisor users in the database. The script checks if the passwords are already hashed (by checking their length and format) and only hashes those that are in plain text. After hashing, it updates the database with the new hashed passwords.


// node scripts/hash-existing-passwords.js