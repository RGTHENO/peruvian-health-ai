import type { ConsultationEncounter } from "@/data/encounters";
import type { Patient } from "@/data/appointments";

export function generatePrescriptionPdf(encounter: ConsultationEncounter, patient?: Patient) {
  const patientName = patient?.name || "Paciente";
  const patientAge = patient ? `${patient.age} años` : "";
  const patientInsurance = patient?.insurance || "";
  const patientAllergies = patient?.allergies?.join(", ") || "Ninguna conocida";

  const prescriptionRows = encounter.prescriptions
    .map(
      (rx, i) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;">${i + 1}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;font-weight:600;">${rx.medication}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;">${rx.dosage}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;">${rx.frequency}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;">${rx.duration}</td>
      </tr>`
    )
    .join("");

  const recommendationsList = encounter.recommendations
    .map((r) => `<li style="margin-bottom:4px;font-size:13px;">${r}</li>`)
    .join("");

  const labOrdersList = encounter.labOrders
    .map((o) => `<li style="margin-bottom:4px;font-size:13px;">${o}</li>`)
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <title>Receta Médica - ${patientName}</title>
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
        body {
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          color: #1a1a1a;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 32px;
          line-height: 1.5;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 3px solid #16a34a;
          padding-bottom: 16px;
          margin-bottom: 24px;
        }
        .logo-area h1 {
          margin: 0;
          font-size: 22px;
          color: #16a34a;
          font-weight: 700;
        }
        .logo-area p {
          margin: 2px 0 0;
          font-size: 12px;
          color: #6b7280;
        }
        .doc-info {
          text-align: right;
          font-size: 13px;
          color: #374151;
        }
        .doc-info strong { display: block; font-size: 15px; }
        .patient-box {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          font-size: 13px;
        }
        .patient-box .label { color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
        .patient-box .value { font-weight: 500; color: #1a1a1a; }
        .allergy-alert {
          background: #fef2f2;
          border: 1px solid #fca5a5;
          border-radius: 6px;
          padding: 8px 12px;
          font-size: 13px;
          color: #991b1b;
          margin-bottom: 24px;
        }
        .section-title {
          font-size: 15px;
          font-weight: 700;
          color: #16a34a;
          margin: 24px 0 12px;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 6px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 8px;
        }
        th {
          background: #f3f4f6;
          padding: 8px 12px;
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #6b7280;
          border-bottom: 2px solid #d1d5db;
        }
        .footer {
          margin-top: 48px;
          border-top: 1px solid #e5e7eb;
          padding-top: 16px;
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #9ca3af;
        }
        .signature {
          margin-top: 60px;
          text-align: center;
        }
        .signature-line {
          width: 250px;
          border-top: 1px solid #1a1a1a;
          margin: 0 auto 4px;
        }
        .signature p { font-size: 13px; margin: 2px 0; }
        .print-btn {
          position: fixed;
          bottom: 24px;
          right: 24px;
          background: #16a34a;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .print-btn:hover { background: #15803d; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo-area">
          <h1>🩺 SaludPe</h1>
          <p>Receta Médica</p>
        </div>
        <div class="doc-info">
          <strong>${encounter.doctor}</strong>
          ${encounter.specialty}<br/>
          CMP: XXXXX · RNE: XXXXX
        </div>
      </div>

      <div class="patient-box">
        <div><span class="label">Paciente</span><br/><span class="value">${patientName}</span></div>
        <div><span class="label">Edad</span><br/><span class="value">${patientAge}</span></div>
        <div><span class="label">Diagnóstico</span><br/><span class="value">${encounter.diagnosis} (${encounter.diagnosisStatus})</span></div>
        <div><span class="label">Seguro</span><br/><span class="value">${patientInsurance || "Particular"}</span></div>
        <div><span class="label">Fecha</span><br/><span class="value">${encounter.date}</span></div>
      </div>

      ${patientAllergies !== "Ninguna conocida" ? `<div class="allergy-alert">⚠️ <strong>Alergias:</strong> ${patientAllergies}</div>` : ""}

      ${encounter.prescriptions.length > 0 ? `
        <div class="section-title">Medicamentos</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Medicamento</th>
              <th>Dosis</th>
              <th>Frecuencia</th>
              <th>Duración</th>
            </tr>
          </thead>
          <tbody>${prescriptionRows}</tbody>
        </table>
      ` : ""}

      ${encounter.recommendations.length > 0 ? `
        <div class="section-title">Indicaciones</div>
        <ul style="padding-left:20px;">${recommendationsList}</ul>
      ` : ""}

      ${encounter.labOrders.length > 0 ? `
        <div class="section-title">Exámenes Solicitados</div>
        <ul style="padding-left:20px;">${labOrdersList}</ul>
      ` : ""}

      ${encounter.notes ? `
        <div class="section-title">Observaciones</div>
        <p style="font-size:13px;color:#374151;">${encounter.notes}</p>
      ` : ""}

      <div class="signature">
        <div class="signature-line"></div>
        <p style="font-weight:600;">${encounter.doctor}</p>
        <p style="color:#6b7280;">${encounter.specialty}</p>
      </div>

      <div class="footer">
        <span>Documento generado por SaludPe · ${encounter.date}</span>
        <span>Este documento es una receta médica válida</span>
      </div>

      <button class="print-btn no-print" onclick="window.print()">🖨️ Imprimir / Guardar PDF</button>
    </body>
    </html>
  `;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}
