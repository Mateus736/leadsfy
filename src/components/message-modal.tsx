"use client";

type MessageModalProps = {
  message: string;
  onClose: () => void;
};

export function MessageModal({ message, onClose }: MessageModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="Fechar"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="message-title"
        className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
      >
        <h2 id="message-title" className="text-lg font-semibold">
          Mensagem sugerida
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-muted">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-muted transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
