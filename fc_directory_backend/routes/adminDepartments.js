const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", async (_req, res) => {
  const result = await db.query("SELECT * FROM departments ORDER BY name");
  res.json(result.rows);
});

router.post("/", async (req, res) => {
  const name = req.body?.name?.trim();
  if (!name) return res.status(400).json({ error: "Введите название департамента" });

  const result = await db.query(
    `INSERT INTO departments (name)
     VALUES ($1)
     ON CONFLICT (name) DO NOTHING
     RETURNING *`,
    [name]
  );

  if (!result.rows[0]) {
    const existing = await db.query("SELECT * FROM departments WHERE name=$1", [name]);
    return res.json(existing.rows[0]);
  }

  res.json(result.rows[0]);
});

router.put("/:id", async (req, res) => {
  const name = req.body?.name?.trim();
  if (!name) return res.status(400).json({ error: "Введите название департамента" });

  const result = await db.query(
    `UPDATE departments SET name=$1 WHERE id=$2 RETURNING *`,
    [name, req.params.id]
  );

  res.json(result.rows[0]);
});

router.delete("/:id", async (req, res) => {
  await db.query("DELETE FROM departments WHERE id=$1", [req.params.id]);
  res.json({ success: true });
});

module.exports = router;
