import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.env.E2E_BASE_URL ?? "http://127.0.0.1:8082";
const chromePath = process.env.CHROME_PATH ?? "/usr/bin/google-chrome";
const runId = new Date().toISOString().replace(/\D/g, "").slice(-10);

const browser = await chromium.launch({
  headless: true,
  executablePath: chromePath,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const createSession = async () => {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
  });
  const page = await context.newPage();
  const consoleIssues = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleIssues.push(`console:${message.text()}`);
    }
  });
  page.on("pageerror", (error) => {
    consoleIssues.push(`pageerror:${error.message}`);
  });

  return { context, page, consoleIssues };
};

const expectText = async (page, text) => {
  const locator = page.getByText(text, { exact: false });
  await locator.first().waitFor({ state: "visible", timeout: 10_000 });
};

const fillBookingDraft = async ({ page, reason, notes, slot }) => {
  await page.getByRole("button", { name: slot, exact: true }).click();
  await page.getByLabel("Motivo de consulta").fill(reason);
  await page.getByLabel("Notas opcionales").fill(notes);
  await page.getByRole("button", { name: new RegExp(`Reservar a las ${slot}`, "i") }).click();
  await page.getByRole("heading", { name: "Confirmar Reserva" }).waitFor({
    state: "visible",
    timeout: 10_000,
  });
  await page.getByRole("button", { name: "Confirmar Reserva" }).click();
};

const loginPatient = async ({ page, email, password }) => {
  await page.locator('input[type="email"]:visible').waitFor({
    state: "visible",
    timeout: 15_000,
  });
  await page.locator('input[type="email"]:visible').fill(email);
  await page.locator('input[type="password"]:visible').fill(password);
  await page.getByRole("button", { name: "Ingresar como Paciente" }).click();
};

try {
  const existingPatient = await createSession();
  const existingPatientReason = `Control neurologico auth ${runId}`;
  const existingPatientNotes = `Reserva retomada tras login ${runId}`;

  await existingPatient.page.goto(`${baseUrl}/doctor/6`, { waitUntil: "networkidle" });
  await expectText(existingPatient.page, "Dr. Felipe Torres Luna");
  await fillBookingDraft({
    page: existingPatient.page,
    reason: existingPatientReason,
    notes: existingPatientNotes,
    slot: "11:00",
  });
  await existingPatient.page.waitForURL("**/iniciar-sesion**", { timeout: 10_000 });
  await expectText(existingPatient.page, "Tu reserva sigue en espera.");
  await loginPatient({
    page: existingPatient.page,
    email: "paciente@saludpe.pe",
    password: "SaludPe123!",
  });
  await existingPatient.page.waitForURL("**/doctor/6**", { timeout: 10_000 });
  await existingPatient.page.getByRole("heading", { name: "Confirmar Reserva" }).waitFor({
    state: "visible",
    timeout: 10_000,
  });
  assert.equal(await existingPatient.page.getByLabel("Motivo de consulta").inputValue(), existingPatientReason);
  assert.equal(await existingPatient.page.getByLabel("Notas opcionales").inputValue(), existingPatientNotes);
  await existingPatient.page.getByRole("button", { name: "Confirmar Reserva" }).click();
  await existingPatient.page.getByRole("heading", { name: "Reserva registrada" }).waitFor({
    state: "visible",
    timeout: 10_000,
  });
  await expectText(existingPatient.page, "La Molina, Lima");
  await expectText(existingPatient.page, "No vinculado");
  await existingPatient.context.close();

  const newPatient = await createSession();
  const newPatientReason = `Teleconsulta auth ${runId}`;
  const newPatientNotes = `Paciente nuevo ${runId}`;
  const newPatientEmail = `nuevo.paciente.${runId}@example.com`;
  const newPatientPhone = `+51 955 ${runId.slice(-6, -3)} ${runId.slice(-3)}`;
  const telegramHandle = `saludpe_${runId}`;

  await newPatient.page.goto(`${baseUrl}/doctor/5`, { waitUntil: "networkidle" });
  await expectText(newPatient.page, "Dra. Rosa Mendoza Chávez");
  await fillBookingDraft({
    page: newPatient.page,
    reason: newPatientReason,
    notes: newPatientNotes,
    slot: "10:00",
  });
  await newPatient.page.waitForURL("**/iniciar-sesion**", { timeout: 10_000 });
  await expectText(newPatient.page, "Accede a tu cuenta de SaludPe");
  await newPatient.page.getByRole("tab", { name: "Crear cuenta" }).click();
  await newPatient.page.getByLabel("Nombre completo").fill("Paciente Nuevo SaludPe");
  await newPatient.page.locator('input[type="email"]:visible').fill(newPatientEmail);
  await newPatient.page.getByLabel("WhatsApp / celular").fill(newPatientPhone);
  await newPatient.page.getByLabel("Edad").fill("31");
  await newPatient.page.getByRole("combobox", { name: "Sexo" }).click();
  await newPatient.page.getByRole("option", { name: "Masculino" }).click();
  await newPatient.page.getByLabel("Seguro").fill("Particular");
  await newPatient.page.getByLabel("Telegram (opcional)").fill(`@${telegramHandle}`);
  await newPatient.page.locator('input[type="password"]:visible').nth(0).fill("SaludPe789!");
  await newPatient.page.locator('input[type="password"]:visible').nth(1).fill("SaludPe789!");
  await newPatient.page.getByRole("button", { name: "Crear cuenta de Paciente" }).click();
  await newPatient.page.waitForURL("**/doctor/5**", { timeout: 10_000 });
  await newPatient.page.getByRole("heading", { name: "Confirmar Reserva" }).waitFor({
    state: "visible",
    timeout: 10_000,
  });
  assert.equal(await newPatient.page.getByLabel("Motivo de consulta").inputValue(), newPatientReason);
  assert.equal(await newPatient.page.getByLabel("Notas opcionales").inputValue(), newPatientNotes);
  await newPatient.page.getByRole("button", { name: "Confirmar Reserva" }).click();
  await newPatient.page.getByRole("heading", { name: "Reserva registrada" }).waitFor({
    state: "visible",
    timeout: 10_000,
  });
  await expectText(newPatient.page, "Enlace de teleconsulta");
  await expectText(newPatient.page, `@${telegramHandle}`);
  await expectText(newPatient.page, newPatientEmail);
  assert.match(
    await newPatient.page.locator('input[readonly]').first().inputValue(),
    /\/teleconsulta\?appointment=/,
  );
  await newPatient.context.close();

  const issues = [...existingPatient.consoleIssues, ...newPatient.consoleIssues];
  if (issues.length > 0) {
    throw new Error(issues.join("\n"));
  }

  console.log("Booking auth resume E2E passed");
} finally {
  await browser.close();
}
