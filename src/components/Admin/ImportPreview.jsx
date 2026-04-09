import { useState } from "react";
import * as XLSX from "xlsx";

export default function ImportPreview({ onPrepared }) {
  const [preview, setPreview] = useState([]);
  const [file, setFile] = useState(null);

  function readExcel(e) {
    const f = e.target.files[0];
    setFile(f);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      let currentDepartment = null;
      const result = [];

      rows.forEach((row) => {
        // Индексы колонок зависят от структуры твоего Excel-файла.
        // Предположим, внутренний номер идет перед городским:
        const depName = row[1];
        const fullName = row[2];
        const internalPhone = row[3]; // Новая колонка
        const cityPhone = row[4];     // Сдвинулось на 1
        const mobilePhone = row[5];   // Сдвинулось на 1
        const email = row[6];         // Сдвинулось на 1
        const room = row[7];          // Сдвинулось на 1

        if (depName && !fullName) {
          currentDepartment = depName;
          return;
        }

        if (fullName) {
          result.push({
            name: fullName,
            department: currentDepartment,
            internalPhone, // Добавляем в объект
            cityPhone,
            mobilePhone,
            email,
            room,
          });
        }
      });

      setPreview(result);
      onPrepared(f); 
    };

    reader.readAsArrayBuffer(f);
  }

  return (
    <div>
      <h3>Загрузка Excel</h3>

      <input type="file" onChange={readExcel} />

      {preview.length > 0 && (
        <>
          <h4>Предпросмотр ({preview.length} сотрудников)</h4>

          <div className="preview-table-wrapper">
            <table className="preview-table">
              <thead>
                <tr>
                  <th>ФИО</th>
                  <th>Подразделение</th>
                  <th>Внутр.</th> {/* Добавили заголовок */}
                  <th>Городской</th>
                  <th>Сотовый</th>
                  <th>Email</th>
                  <th>Кабинет</th>
                </tr>
              </thead>

              <tbody>
                {preview.map((p, i) => (
                  <tr key={i}>
                    <td>{p.name}</td>
                    <td>{p.department}</td>
                    <td className="text-blue-bold">{p.internalPhone || "-"}</td> {/* Вывод номера */}
                    <td>{p.cityPhone || "-"}</td>
                    <td>{p.mobilePhone || "-"}</td>
                    <td>{p.email || "-"}</td>
                    <td>{p.room || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}