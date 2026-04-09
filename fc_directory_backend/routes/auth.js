const express = require("express");
const router = express.Router();

// Здесь храним пароли — теперь они НЕ видны в браузере
const deptAdmins = {
  "АПП":     { password: "app123456",   departmentName: "Аппарат председателя Правления" },
  "ДБФ1":    { password: "dbf1123456",  departmentName: "Департамент бюджетного финансирования 1" },
  "ДБФ2":    { password: "dbf2123456",  departmentName: "Департамент бюджетного финансирования 2" },
  "ДИТ":     { password: "dit123456",   departmentName: "Департамент информационных технологий" },
  "ДМВГО":   { password: "dmvgo123456", departmentName: "Департамент методологии и взаимодействия с государственными органами" },
  "ДМ":      { password: "dm123456",    departmentName: "Департамент мониторинга" },
  "ДПВК":    { password: "dpvk123456",  departmentName: "Департамент продвижения и внешних коммуникаций" },
  "ЗПП":     { password: "zpp123456",   departmentName: "Заместитель председателя Правления" },
  "ПЗПП":    { password: "pzpp123456",  departmentName: "Первый заместитель председателя Правления" },
  "СВААК":   { password: "svaak123456", departmentName: "Служба внутреннего аудита и антикоррупционного комплаенса" },
  "СПК":     { password: "spk123456",   departmentName: "Служба последовательного контроля" },
  "ФП":      { password: "fp123456",    departmentName: "Финансовый департамент" },
  "УХД":     { password: "uhd123456",   departmentName: "Управление хозяйственной деятельности" },
  "ПП":      { password: "pp123456",    departmentName: "Председатель Правления" }
};

router.post("/login", (req, res) => {
  const { username, password, departmentId, displayName } = req.body;
  const normalized = username?.trim().toUpperCase();

  // Админ всего приложения
  if (normalized === "ADMIN") {
    if (password === "admin123") {
      return res.json({ success: true, user: { id: 1, name: "Admin User", role: "ADMIN" } });
    }
    return res.json({ success: false, error: "Неверный логин или пароль" });
  }

  // Админы департаментов
  const deptConfig = deptAdmins[normalized];
  if (!deptConfig || deptConfig.password !== password) {
    return res.json({ success: false, error: "Неверный логин или пароль" });
  }

  const depIdNum = Number(departmentId);
  if (!depIdNum) {
    return res.json({ success: false, error: "Департамент не найден" });
  }

  res.json({
    success: true,
    user: {
      id: Date.now(),
      name: displayName || deptConfig.departmentName,
      role: "DEPT_ADMIN",
      departmentId: depIdNum,
      departmentName: deptConfig.departmentName
    }
  });
});

module.exports = router;