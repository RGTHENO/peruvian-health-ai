import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terminos = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main id="main-content" tabIndex={-1} className="flex-1 container py-12 max-w-3xl">
        <h1 className="text-3xl font-bold font-serif text-foreground mb-2">Términos de Uso</h1>
        <p className="text-muted-foreground mb-8">Última actualización: 1 de marzo de 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Aceptación de los Términos</h2>
            <p>Al utilizar la plataforma SaludPe, usted acepta estos términos y condiciones en su totalidad. Si no está de acuerdo con alguna de estas condiciones, le solicitamos no utilizar nuestros servicios.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. Descripción del Servicio</h2>
            <p>SaludPe es una plataforma digital que facilita la conexión entre pacientes y profesionales de la salud en el Perú. Nuestros servicios incluyen:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Directorio de médicos con búsqueda por especialidad, ubicación y seguro.</li>
              <li>Reserva de citas presenciales y por telemedicina.</li>
              <li>Gestión de historial médico digital.</li>
              <li>Procesamiento de pagos en línea.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. Registro de Usuarios</h2>
            <p>Para acceder a ciertos servicios, deberá crear una cuenta proporcionando información veraz y actualizada. Usted es responsable de mantener la confidencialidad de su cuenta y contraseña.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Responsabilidad Médica</h2>
            <p>SaludPe actúa como intermediario tecnológico. La responsabilidad por diagnósticos, tratamientos y prescripciones recae exclusivamente en los profesionales de la salud registrados. SaludPe verifica la colegiatura de todos los médicos en la plataforma.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Pagos y Cancelaciones</h2>
            <p>Los pagos se procesan a través de Culqi, Yape o Plin. Las políticas de cancelación y reembolso son:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Cancelación gratuita hasta 24 horas antes de la cita.</li>
              <li>Cancelación con menos de 24 horas: reembolso del 50%.</li>
              <li>No presentarse: sin reembolso.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Propiedad Intelectual</h2>
            <p>Todo el contenido de la plataforma (diseño, textos, logotipos, software) es propiedad de SaludPe S.A.C. y está protegido por las leyes de propiedad intelectual del Perú.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">7. Legislación Aplicable</h2>
            <p>Estos términos se rigen por las leyes de la República del Perú. Cualquier controversia será resuelta por los tribunales competentes de Lima.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">8. Contacto</h2>
            <p>Para consultas sobre estos términos: <span className="text-primary">legal@saludpe.pe</span></p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terminos;
