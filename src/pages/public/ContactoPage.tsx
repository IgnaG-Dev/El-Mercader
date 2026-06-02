export default function ContactoPage() {
  return (
    <div className="max-w-container-max mx-auto px-4 md:px-margin-desktop py-12">
      <div className="mb-10">
        <h1 className="font-headline text-headline-lg text-primary mb-3">Contacto</h1>
        <p className="text-body-md text-on-surface-variant max-w-2xl">
          Estamos para ayudarte. Elegí el canal que prefieras y te respondemos a la brevedad.
        </p>
      </div>

      <div className="max-w-lg space-y-4">
        <a
          href="https://wa.me/5493777309591"
          target="_blank"
          rel="noreferrer"
          className="flex gap-4 bg-surface-container rounded-xl border border-outline-variant/30 p-5 hover:bg-surface-container-highest transition-colors"
        >
          <span className="material-symbols-outlined text-secondary flex-shrink-0">chat</span>
          <div>
            <div className="font-bold text-label-bold text-on-surface">WhatsApp</div>
            <div className="text-body-md font-bold text-secondary">+54 9 3777 309591</div>
          </div>
        </a>

        <a
          href="mailto:ignaciogauto40@gmail.com"
          className="flex gap-4 bg-surface-container rounded-xl border border-outline-variant/30 p-5 hover:bg-surface-container-highest transition-colors"
        >
          <span className="material-symbols-outlined text-primary flex-shrink-0">mail</span>
          <div>
            <div className="font-bold text-label-bold text-on-surface">Email</div>
            <div className="text-body-md font-bold text-primary">ignaciogauto40@gmail.com</div>
          </div>
        </a>

        <a
          href="https://www.reddit.com/r/elmercader"
          target="_blank"
          rel="noreferrer"
          className="flex gap-4 bg-surface-container rounded-xl border border-outline-variant/30 p-5 hover:bg-surface-container-highest transition-colors"
        >
          <span className="material-symbols-outlined text-tertiary flex-shrink-0">forum</span>
          <div>
            <div className="font-bold text-label-bold text-on-surface">Reddit</div>
            <div className="text-body-md font-bold text-tertiary">r/elmercader</div>
          </div>
        </a>
      </div>
    </div>
  )
}
