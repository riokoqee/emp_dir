const pool = require("../db");

async function getDepartments(req, res) {
  const result = await pool.query("SELECT * FROM departments ORDER BY name");
  res.json(result.rows);
}

module.exports = { getDepartments };
