const express = require("express");
const router = express.Router();
const db = require("../db");

function parseDepartmentId(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function normalizeDate(value) {
  if (!value) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  return value;
}

// ====================== GET ======================
router.get("/", async (req, res) => {
  const departmentId = parseDepartmentId(req.query.departmentId);
  const params = [];
  const departmentClause = departmentId !== null ? "WHERE e.department_id = $1" : "";
  if (departmentId !== null) params.push(departmentId);

  const result = await db.query(
    `
    SELECT e.*, d.name AS department_name
    FROM employees e
    LEFT JOIN departments d ON d.id = e.department_id
    ${departmentClause}
    ORDER BY e.name
  `,
    params
  );
  res.json(result.rows);
});

router.get("/:id", async (req, res) => {
  const result = await db.query(
    `SELECT * FROM employees WHERE id = $1`,
    [req.params.id]
  );

  if (!result.rows[0]) {
    return res.status(404).json({ error: "Сотрудник не найден" });
  }
  res.json(result.rows[0]);
});

// ====================== POST ======================
router.post("/", async (req, res) => {
  const departmentId = parseDepartmentId(req.query.departmentId);
  const {
    name, position, internal_phone, phone_city, phone_mobile,
    email, room, birthday, department_id
  } = req.body;

  const finalDepartmentId = departmentId !== null ? departmentId : (department_id || null);
  const finalBirthday = normalizeDate(birthday);

  const q = await db.query(
    `INSERT INTO employees 
      (name, position, internal_phone, phone_city, phone_mobile, email, room, birthday, department_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [name, position, internal_phone, phone_city, phone_mobile, email, room, finalBirthday, finalDepartmentId]
  );

  res.json(q.rows[0]);
});

// ====================== PUT (частичные обновления) ======================
router.put("/:id", async (req, res) => {
  const {
    name, position, internal_phone, phone_city, phone_mobile,
    email, room, birthday, department_id
  } = req.body;

  const finalBirthday = normalizeDate(birthday);
  const setParts = [];
  const params = [];
  let paramIndex = 1;

  if (name !== undefined) {
    setParts.push(`name=$${paramIndex++}`);
    params.push(name);
  }
  if (position !== undefined) {
    setParts.push(`position=$${paramIndex++}`);
    params.push(position);
  }
  if (internal_phone !== undefined) {
    setParts.push(`internal_phone=$${paramIndex++}`);
    params.push(internal_phone);
  }
  if (phone_city !== undefined) {
    setParts.push(`phone_city=$${paramIndex++}`);
    params.push(phone_city);
  }
  if (phone_mobile !== undefined) {
    setParts.push(`phone_mobile=$${paramIndex++}`);
    params.push(phone_mobile);
  }
  if (email !== undefined) {
    setParts.push(`email=$${paramIndex++}`);
    params.push(email);
  }
  if (room !== undefined) {
    setParts.push(`room=$${paramIndex++}`);
    params.push(room);
  }
  if (finalBirthday !== undefined) {
    setParts.push(`birthday=$${paramIndex++}`);
    params.push(finalBirthday);
  }
  if (department_id !== undefined) {
    setParts.push(`department_id=$${paramIndex++}`);
    params.push(parseDepartmentId(department_id));
  }

  if (setParts.length === 0) {
    return res.status(400).json({ error: "Нет данных для обновления" });
  }

  params.push(req.params.id); // id для WHERE

  const query = `
    UPDATE employees 
    SET ${setParts.join(", ")}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await db.query(query, params);

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Сотрудник не найден" });
  }

  res.json(result.rows[0]);
});

// ====================== DELETE (жёсткое удаление) ======================
router.delete("/:id", async (req, res) => {
  const result = await db.query(
    `DELETE FROM employees WHERE id = $1`,
    [req.params.id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Сотрудник не найден" });
  }

  res.json({ success: true });
});

module.exports = router;