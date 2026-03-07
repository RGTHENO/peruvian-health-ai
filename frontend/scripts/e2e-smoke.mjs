import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.E2E_BASE_URL ?? "http://127.0.0.1:8082";
const chromePath = process.env.CHROME_PATH ?? "/usr/bin/google-chrome";
const runId = new Date().toISOString().replace(/\D/g, "").slice(-8);
const bookingReason = `Seguimiento cardiológico E2E ${runId}`;
const bookingNotes = `Reserva desde smoke test ${runId}`;
const diagnosis = `Hipertensión controlada E2E ${runId}`;
const doctorPhone = `+51 900 ${runId.slice(0, 3)} ${runId.slice(3, 6)}`;

const browser = await chromium.launch({
  headless: true,
  executablePath: chromePath,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const consoleIssues = [];

const createSession = async () => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
  });
  const page = await context.newPage();

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleIssues.push(`console:${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    consoleIssues.push(`pageerror:${error.message}`);
  });

  return { context, page };
};

const expectText = async (page, text) => {
  const locator = page.getByText(text, { exact: false });
  const timeoutAt = Date.now() + 10_000;

  while (Date.now() < timeoutAt) {
    const count = await locator.count();
    for (let index = 0; index < count; index += 1) {
      if (await locator.nth(index).isVisible()) {
        return;
      }
    }
    await page.waitForTimeout(100);
  }

  throw new Error(`No visible text match found for: ${text}`);
};

const expectVisible = async (locator) => {
  await locator.waitFor({ state: "visible", timeout: 10_000 });
};

const login = async (page, { role, email, password }) => {
  await page.goto(
    `${baseUrl}/iniciar-sesion${role === "doctor" ? "?role=doctor" : ""}`,
    { waitUntil: "networkidle" },
  );
  const submitLabel = role === "doctor" ? "Ingresar como Médico" : "Ingresar como Paciente";
  if (role === "patient") {
    await page.getByRole("tab", { name: "Paciente" }).click();
  }
  await page.locator('input[type="email"]:visible').waitFor({ state: "visible", timeout: 10_000 });
  await page.locator('input[type="email"]:visible').fill(email);
  await page.locator('input[type="password"]:visible').fill(password);
  await page.getByRole("button", { name: submitLabel }).click();
};

try {
  const patientSession = await createSession();
  const patientPage = patientSession.page;

  await patientPage.goto(baseUrl, { waitUntil: "networkidle" });
  await expectText(patientPage, "Tu salud, conectada");
  await expectVisible(patientPage.getByRole("link", { name: "Agendar Cita" }));

  await patientPage.goto(`${baseUrl}/directorio`, { waitUntil: "networkidle" });
  await expectText(patientPage, "Directorio Médico");
  await patientPage
    .getByRole("searchbox", { name: "Buscar por nombre o especialidad" })
    .fill("Cardiología");
  await expectText(patientPage, "Dra. María Elena Quispe");

  await login(patientPage, {
    role: "patient",
    email: "paciente@saludpe.pe",
    password: "SaludPe123!",
  });
  await patientPage.waitForURL("**/historial", { timeout: 10_000 });
  await expectText(patientPage, "Mi Historial Médico");

  await patientPage.goto(`${baseUrl}/doctor/1`, { waitUntil: "networkidle" });
  await expectText(patientPage, "Reservar Cita");
  await patientPage.getByRole("button", { name: "16:00" }).click();
  const virtualOption = patientPage.locator("label").filter({ hasText: "Virtual" }).first();
  if (await virtualOption.count()) {
    await virtualOption.click();
  }
  await patientPage.getByLabel("Motivo de consulta").fill(bookingReason);
  await patientPage.getByLabel("Notas opcionales").fill(bookingNotes);
  await patientPage.getByRole("button", { name: /Reservar a las 16:00/i }).click();
  await patientPage.getByRole("heading", { name: "Confirmar Reserva" }).waitFor({
    state: "visible",
    timeout: 10_000,
  });
  await patientPage.getByRole("button", { name: "Confirmar Reserva" }).click();
  await patientPage.getByText("¡Cita reservada", { exact: false }).waitFor({ timeout: 10_000 });
  await patientSession.context.close();

  const doctorSession = await createSession();
  const doctorPage = doctorSession.page;

  await login(doctorPage, {
    role: "doctor",
    email: "medico@saludpe.pe",
    password: "SaludPe123!",
  });
  await doctorPage.waitForURL("**/doctor/portal", { timeout: 10_000 });
  await expectText(doctorPage, "Próximas citas de hoy");

  await doctorPage.getByRole("button", { name: /Abrir notificaciones/i }).click();
  const newAppointmentNotification = doctorPage
    .getByRole("button")
    .filter({ hasText: "Nueva cita agendada" })
    .filter({ hasText: "16:00" })
    .filter({ hasText: "Juan Pérez Sánchez" })
    .last();
  await expectVisible(newAppointmentNotification);
  await expectText(doctorPage, "16:00");

  await doctorPage.getByRole("link", { name: "Agenda", exact: true }).click();
  await doctorPage.waitForURL("**/doctor/portal/agenda", { timeout: 10_000 });
  await doctorPage.getByRole("button", { name: "Ver día siguiente" }).click();
  await expectText(doctorPage, "Juan Pérez Sánchez");
  await expectText(doctorPage, "16:00");
  await expectText(doctorPage, bookingReason);

  const bookedSlotRow = doctorPage
    .locator("div")
    .filter({ hasText: "16:00" })
    .filter({ hasText: bookingReason })
    .first();
  await expectVisible(bookedSlotRow);
  await bookedSlotRow.getByRole("link", { name: /Atender/i }).last().click();
  await doctorPage.waitForURL("**/doctor/portal/consulta/**", { timeout: 10_000 });

  await expectText(doctorPage, "Registro de consulta");
  await doctorPage.getByLabel("Motivo de consulta").fill(bookingReason);
  await doctorPage.getByLabel("Síntomas / Historia de enfermedad actual").fill(
    "Paciente estable, sin dolor torácico.",
  );
  await doctorPage.getByLabel("Examen físico").fill("Presión arterial controlada. Sin hallazgos de alarma.");
  await doctorPage.getByRole("textbox", { name: "Diagnóstico" }).fill(diagnosis);
  await doctorPage
    .locator("input[placeholder='Medicamento']")
    .first()
    .fill("Losartán 50mg");
  await doctorPage.getByRole("button", { name: "Guardar consulta" }).click();
  await doctorPage.waitForURL("**/doctor/portal/pacientes/**", { timeout: 10_000 });
  await expectText(doctorPage, diagnosis);

  await doctorPage
    .getByPlaceholder("Buscar por diagnóstico, medicamento o doctor…")
    .fill(diagnosis);
  await expectText(doctorPage, diagnosis);

  await doctorPage.getByRole("link", { name: "Pacientes", exact: true }).click();
  await doctorPage.waitForURL("**/doctor/portal/pacientes", { timeout: 10_000 });
  await doctorPage
    .getByPlaceholder("Buscar por nombre, seguro o condición...")
    .fill("Juan Pérez");
  await expectText(doctorPage, "Juan Pérez Sánchez");
  await doctorPage.getByText("Juan Pérez Sánchez").first().click();
  await doctorPage.waitForURL("**/doctor/portal/pacientes/**", { timeout: 10_000 });
  await expectText(doctorPage, diagnosis);

  await doctorPage.goto(`${baseUrl}/doctor/portal/configuracion`, { waitUntil: "networkidle" });
  await expectText(doctorPage, "Configuración");
  await doctorPage.getByLabel("Teléfono").fill(doctorPhone);
  await doctorPage.getByRole("button", { name: "Guardar cambios" }).click();
  await doctorPage.getByText("Perfil actualizado correctamente", { exact: false }).waitFor({
    timeout: 10_000,
  });
  assert.equal(await doctorPage.getByLabel("Teléfono").inputValue(), doctorPhone);

  const reminderSwitch = doctorPage.getByText("Recordatorios de citas").locator("..").locator(
    "button[role='switch']",
  );
  if (await reminderSwitch.count()) {
    await reminderSwitch.click();
  }
  await doctorPage.getByRole("button", { name: "Guardar preferencias" }).click();
  await doctorPage.getByText("Preferencias de notificación guardadas", { exact: false }).waitFor({
    timeout: 10_000,
  });
  await doctorSession.context.close();

  const patientVerificationSession = await createSession();
  const patientVerificationPage = patientVerificationSession.page;

  await login(patientVerificationPage, {
    role: "patient",
    email: "paciente@saludpe.pe",
    password: "SaludPe123!",
  });
  await patientVerificationPage.waitForURL("**/historial", { timeout: 10_000 });
  await patientVerificationPage
    .getByPlaceholder("Buscar por diagnóstico, medicamento o doctor…")
    .fill(diagnosis);
  await expectText(patientVerificationPage, diagnosis);
  await patientVerificationSession.context.close();

  if (consoleIssues.length > 0) {
    throw new Error(consoleIssues.join("\n"));
  }

  console.log("E2E smoke passed");
} finally {
  await browser.close();
}
