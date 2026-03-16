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
    ORDER BY e.id
  `,
    params
  );
  res.json(result.rows);
});

router.get("/:id", async (req, res) => {
  const departmentId = parseDepartmentId(req.query.departmentId);
  const params = [req.params.id];
  let condition = "id=$1";

  if (departmentId !== null) {
    params.push(departmentId);
    condition += " AND department_id=$2";
  }

  const result = await db.query(
    `SELECT * FROM employees WHERE ${condition}`,
    params
  );

  if (!result.rows[0]) {
    return res.status(404).json({ error: "Сотрудник не найден" });
  }

  res.json(result.rows[0]);
});

router.post("/", async (req, res) => {
  const departmentId = parseDepartmentId(req.query.departmentId);
  const { name, position, phone_city, phone_mobile, email, room, birthday, department_id } = req.body;

  const finalDepartmentId = departmentId !== null ? departmentId : (department_id || null);
  const finalBirthday = normalizeDate(birthday);

  const q = await db.query(
    `INSERT INTO employees 
      (name, position, phone_city, phone_mobile, email, room, birthday, department_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [name, position, phone_city, phone_mobile, email, room, finalBirthday, finalDepartmentId]
  );

  res.json(q.rows[0]);
});

router.put("/:id", async (req, res) => {
  const departmentId = parseDepartmentId(req.query.departmentId);
  const { name, position, phone_city, phone_mobile, email, room, birthday, department_id } = req.body;

  const finalDepartmentId = departmentId !== null ? departmentId : (department_id || null);
  const finalBirthday = normalizeDate(birthday);
  const params = [
    name, position, phone_city, phone_mobile, email, room, finalBirthday, finalDepartmentId,
    req.params.id
  ];
  let condition = "id=$9";

  if (departmentId !== null) {
    params.push(departmentId);
    condition = "id=$9 AND department_id=$10";
  }

  const q = await db.query(
    `UPDATE employees SET
      name=$1, position=$2, phone_city=$3, phone_mobile=$4,
      email=$5, room=$6, birthday=$7, department_id=$8
     WHERE ${condition} RETURNING *`,
    params
  );

  if (!q.rows[0]) {
    return res.status(404).json({ error: "Сотрудник не найден в этом департаменте" });
  }

  res.json(q.rows[0]);
});

router.delete("/:id", async (req, res) => {
  const departmentId = parseDepartmentId(req.query.departmentId);
  const params = [req.params.id];
  let condition = "id=$1";

  if (departmentId !== null) {
    params.push(departmentId);
    condition = "id=$1 AND department_id=$2";
  }

  const result = await db.query(
    `DELETE FROM employees WHERE ${condition}`,
    params
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Сотрудник не найден в этом департаменте" });
  }

  res.json({ success: true });
});

module.exports = router;
