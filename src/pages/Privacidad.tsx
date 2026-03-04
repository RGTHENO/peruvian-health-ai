import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacidad = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container py-12 max-w-3xl">
        <h1 className="text-3xl font-bold font-serif text-foreground mb-2">Política de Privacidad</h1>
        <p className="text-muted-foreground mb-8">Última actualización: 1 de marzo de 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
          <section>
            <h2 className="text-lg font-semibold text-foreground">1. Marco Legal</h2>
            <p>SaludPe opera en cumplimiento de la <strong>Ley N° 29733</strong>, Ley de Protección de Datos Personales del Perú, y su reglamento aprobado por Decreto Supremo N° 003-2013-JUS. Todos los datos personales y de salud son tratados conforme a las disposiciones de la Autoridad Nacional de Protección de Datos Personales.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">2. Datos que Recopilamos</h2>
            <p>Recopilamos los siguientes tipos de información:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Datos de identificación: nombre, DNI/CE, fecha de nacimiento, correo electrónico, teléfono.</li>
              <li>Datos de salud: historial médico, diagnósticos, recetas, resultados de laboratorio.</li>
              <li>Datos de uso: interacciones con la plataforma, preferencias, dispositivo utilizado.</li>
              <li>Datos de pago: información necesaria para procesar transacciones (gestionada por Culqi).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">3. Finalidad del Tratamiento</h2>
            <p>Sus datos personales son utilizados para:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Facilitar la búsqueda y reserva de citas médicas.</li>
              <li>Mantener su expediente clínico digital accesible de forma segura.</li>
              <li>Procesar pagos de consultas médicas.</li>
              <li>Enviar recordatorios de citas y notificaciones relevantes.</li>
              <li>Mejorar la calidad de nuestros servicios.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">4. Consentimiento</h2>
            <p>Al registrarse en SaludPe, usted otorga su consentimiento expreso para el tratamiento de sus datos personales conforme a los fines descritos. Podrá revocar su consentimiento en cualquier momento escribiendo a <span className="text-primary">privacidad@saludpe.pe</span>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">5. Seguridad de los Datos</h2>
            <p>Implementamos medidas técnicas y organizativas para proteger sus datos, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Cifrado de extremo a extremo en todas las comunicaciones.</li>
              <li>Almacenamiento seguro en servidores certificados.</li>
              <li>Control de acceso basado en roles.</li>
              <li>Auditorías de seguridad periódicas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">6. Derechos del Titular</h2>
            <p>Usted tiene derecho a acceder, rectificar, cancelar y oponerse al tratamiento de sus datos personales (derechos ARCO). Para ejercer estos derechos, contacte a <span className="text-primary">privacidad@saludpe.pe</span>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">7. Contacto</h2>
            <p>Para consultas sobre privacidad: <span className="text-primary">privacidad@saludpe.pe</span></p>
            <p>Responsable del tratamiento: SaludPe S.A.C., Lima, Perú.</p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacidad;
