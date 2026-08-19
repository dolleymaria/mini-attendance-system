const bcrypt = require("bcryptjs");
const pool = require("../config/db");

const createAdmin = async () => {
  try {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    if (!username || !password) {
      throw new Error(
        "ADMIN_USERNAME and ADMIN_PASSWORD must be set in the environment"
      );
    }

    const existingUser = await pool.query(
      `SELECT id FROM users WHERE username = $1`,
      [username]
    );

    if (existingUser.rows.length > 0) {
      console.log(`User "${username}" already exists`);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (username, password_hash, role)
       VALUES ($1, $2, $3)`,
      [username, passwordHash, "ADMIN"]
    );

    console.log("Admin user created successfully");
    console.log("Username:", username);

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();