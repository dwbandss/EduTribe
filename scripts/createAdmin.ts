import bcrypt from "bcryptjs";
import dbConnect from "../lib/dbConnect";
import Admin from "../models/Admin";

async function createAdmin() {
  try {
    await dbConnect();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: "admin@edutribe.org" });
    if (existingAdmin) {
      console.log("Admin already exists!");
      return;
    }

    // Hash the password
    const password = await bcrypt.hash("Admin@123", 10);

    // Create admin account
    const admin = await Admin.create({
      adminUid: "ADM-001",
      name: "EduTribe Super Admin",
      email: "admin@edutribe.org",
      password,
      role: "superAdmin"
    });

    console.log("✅ Admin created successfully!");
    console.log("Email: admin@edutribe.org");
    console.log("Password: Admin@123");
    console.log("Admin UID:", admin.adminUid);
    
  } catch (error) {
    console.error("❌ Error creating admin:", error);
  } finally {
    process.exit(0);
  }
}

createAdmin();
