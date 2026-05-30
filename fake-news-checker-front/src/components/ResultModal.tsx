import { X, CheckCircle2, XCircle, AlertCircle, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type ResultType = "verdadeira" | "falsa" | "nao_verificavel";

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ResultType;
  content: string;
  details?: string;
}

const resultConfig = {
  verdadeira: {
    icon: CheckCircle2,
    title: "Informação Verdadeira",
    color: "var(--m3-tertiary)",
    bgColor: "var(--m3-tertiary-container)",
    textColor: "var(--m3-on-tertiary-container)",
  },
  falsa: {
    icon: XCircle,
    title: "Informação Falsa",
    color: "var(--m3-error)",
    bgColor: "var(--m3-error-container)",
    textColor: "var(--m3-on-error-container)",
  },
  nao_verificavel: {
    icon: HelpCircle,
    title: "Não foi possível verificar",
    color: "var(--m3-on-surface-variant)",
    bgColor: "var(--m3-surface-container-high)",
    textColor: "var(--m3-on-surface)",
  },
};

export function ResultModal({ isOpen, onClose, result, content, details }: ResultModalProps) {
  const config = resultConfig[result];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ 
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="w-full max-w-md rounded-3xl shadow-2xl pointer-events-auto overflow-hidden"
              style={{ 
                backgroundColor: "var(--m3-surface-container-high)",
              }}
            >
              {/* Header */}
              <div 
                className="p-6 pb-4"
                style={{ backgroundColor: config.bgColor }}
              >
                <div className="flex items-start justify-between mb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  >
                    <Icon 
                      size={48} 
                      style={{ color: config.color }}
                    />
                  </motion.div>
                  
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full transition-colors"
                    style={{ color: "var(--m3-on-surface-variant)"  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <X size={24} />
                  </button>
                </div>

                <h3 
                  className="text-2xl"
                  style={{ color: "var(--m3-on-surface-variant)"  }}
                >
                  {config.title}
                </h3>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div>
                  <p 
                    className="mb-2 opacity-70"
                    style={{ color: "var(--m3-on-surface-variant)" }}
                  >
                    Conteúdo verificado:
                  </p>
                  <p 
                    className="p-4 rounded-xl"
                    style={{ 
                      backgroundColor: "var(--m3-surface-container)",
                      color: "var(--m3-on-surface)",
                      border: "1px solid var(--m3-outline-variant)"
                    }}
                  >
                    {content}
                  </p>
                </div>

                {details && (
                  <div>
                    <p 
                      className="mb-2 opacity-70"
                      style={{ color: "var(--m3-on-surface-variant)" }}
                    >
                      Detalhes:
                    </p>
                    <p style={{ color: "var(--m3-on-surface)" }}>
                      {details}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-6 pt-0 flex justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full transition-all"
                  style={{ 
                    backgroundColor: "var(--m3-primary)",
                    color: "var(--m3-on-primary)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  Entendi
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
