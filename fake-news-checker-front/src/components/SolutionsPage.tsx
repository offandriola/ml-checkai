import { Code, MessageCircle, Twitter, MessageSquare, Puzzle } from "lucide-react";

interface SolutionCardProps {
  title: string;
  icon: React.ReactNode;
  description: string;
  isPrimary?: boolean;
}

function SolutionCard({ title, icon, description, isPrimary = false }: SolutionCardProps) {
  return (
    <button
      className="relative w-full p-6 rounded-xl transition-all duration-200
                 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[var(--m3-primary)]
                 hover:shadow-lg"
      style={{
        backgroundColor: isPrimary ? "var(--m3-primary-container)" : "var(--m3-surface-container-high)",
        color: isPrimary ? "var(--m3-on-primary-container)" : "var(--m3-on-surface)",
      }}
    >
      {isPrimary && (
        <div 
          className="absolute top-3 right-3 px-2 py-1 rounded text-xs"
          style={{
            backgroundColor: "var(--m3-primary)",
            color: "var(--m3-on-primary)"
          }}
        >
          Principal
        </div>
      )}
      
      <div className="flex flex-col items-center text-center gap-4">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: isPrimary 
              ? "var(--m3-primary)" 
              : "var(--m3-secondary-container)",
            color: isPrimary 
              ? "var(--m3-on-primary)" 
              : "var(--m3-on-secondary-container)"
          }}
        >
          {icon}
        </div>
        
        <div>
          <h3 className="text-xl mb-2">{title}</h3>
          <p 
            className="text-sm"
            style={{ color: isPrimary ? "var(--m3-on-primary-container)" : "var(--m3-on-surface-variant)" }}
          >
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

export function SolutionsPage() {
  const solutions = [
    {
      title: "Chat",
      icon: <MessageSquare size={32} />,
      description: "Interface de conversação para verificação de informações em tempo real",
      isPrimary: true
    },
    {
      title: "API",
      icon: <Code size={32} />,
      description: "Integre a verificação de informações diretamente em suas aplicações"
    },
    {
      title: "WhatsApp/Telegram",
      icon: <MessageCircle size={32} />,
      description: "Verifique informações através dos seus apps de mensagem favoritos"
    },
    {
      title: "Twitter/X",
      icon: <Twitter size={32} />,
      description: "Verificação de posts e threads diretamente na timeline"
    },
    {
      title: "Extensão",
      icon: <Puzzle size={32} />,
      description: "Extensão para navegador com verificação em qualquer página"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8 md:mb-12 text-center">
        <h1 className="text-3xl md:text-4xl mb-3" style={{ color: "var(--m3-on-surface)" }}>
          Soluções
        </h1>
        <p className="text-base md:text-lg" style={{ color: "var(--m3-on-surface-variant)" }}>
          Escolha a melhor forma de verificar informações para suas necessidades
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {solutions.map((solution) => (
          <SolutionCard
            key={solution.title}
            title={solution.title}
            icon={solution.icon}
            description={solution.description}
            isPrimary={solution.isPrimary}
          />
        ))}
      </div>
    </div>
  );
}
