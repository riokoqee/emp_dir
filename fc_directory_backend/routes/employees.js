const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/by-dept/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const employees = await db.query(
      `
      SELECT 
        e.id,
        e.name,
        e.position,
        e.phone_city,
        e.phone_mobile,
        e.email,
        e.room,
        e.birthday,
        d.name AS department
      FROM employees e
      LEFT JOIN departments d ON d.id = e.department_id
      WHERE e.department_id = $1
      `,
      [id]
    );

    console.log("EMPLOYEES:", employees.rows);
    res.json(employees.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/search", async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json([]);

    const result = await db.query(
      `SELECT e.id, e.name, e.position, e.room, e.department_id, d.name AS department
       FROM employees e
       LEFT JOIN departments d ON d.id = e.department_id
       WHERE LOWER(e.name) LIKE LOWER($1)
       ORDER BY e.name
       LIMIT 20`,
      [`%${q}%`]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT 
        e.id,
        e.name,
        e.position,
        e.room,
        e.department_id,
        d.name AS department
      FROM employees e
      LEFT JOIN departments d ON d.id = e.department_id
      `
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
