"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "@/services/firebase";
import { ref, onValue } from "firebase/database";
import {
  BarChart,
  CircleCheck,
  Clock,
  FileText,
  Lightbulb,
  ListChecks,
  Loader2,
  Rocket,
  ShieldCheck,
  Signal,
  Users,
  CalendarDays,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function HomePage() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [userProfile, setUserProfile] = useState(null);
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  function formatTimestamp(ts) {
    if (!ts) return null;
    const date = new Date(ts);
    return isNaN(date.getTime()) ? null : date.toISOString();
  }

  useEffect(() => {
    const nome = localStorage.getItem("userName") || "Usuário";
    setUserName(nome);

    const uid = localStorage.getItem("userUid");
    if (!uid) {
      setLoading(false);
      setChamados([]);
      setUserProfile(null);
      return;
    }

    const perfilRef = ref(db, `usuarios/${uid}`);
    const unsubscribePerfil = onValue(perfilRef, (snapshot) => {
      const perfilDados = snapshot.val();
      setUserProfile(perfilDados || null);
    });

    const chamadosRef = ref(db, `chamados/${uid}`);
    const unsubscribeChamados = onValue(chamadosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lista = Object.entries(data).map(([id, chamado]) => ({
          id,
          ...chamado,
          dataAbertura:
            chamado.dataAbertura ||
            formatTimestamp(chamado.timestamp) ||
            new Date().toISOString(),
        }));

        lista.sort(
          (a, b) =>
            new Date(b.dataAbertura).getTime() -
            new Date(a.dataAbertura).getTime()
        );
        setChamados(lista);
      } else {
        setChamados([]);
      }
      setLoading(false);
      setLastUpdated(new Date());
    });

    return () => {
      unsubscribeChamados();
      unsubscribePerfil();
    };
  }, []);

  const totalChamados = chamados.length;
  const abertos = chamados.filter((c) => c.status === "Aberto").length;
  const Resolvidos = chamados.filter((c) => c.status === "Resolvidos").length;
  const emAndamento = chamados.filter((c) => c.status === "Em Andamento").length;

  const seteDiasAtras = new Date();
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
  seteDiasAtras.setHours(0, 0, 0, 0);

  const chamadosRecentes = chamados.filter((c) => {
    const dataChamado = new Date(c.dataAbertura);
    return dataChamado >= seteDiasAtras;
  }).length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const StatCard = ({ title, value, subtitle, bgColor, textColor, icon: Icon }) => (
    <div
      className={`${bgColor} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-transparent hover:border-opacity-50 hover:border-white cursor-pointer`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-3xl font-extrabold ${textColor}`}>{value}</h3>
          <p className={`${textColor} font-medium text-lg`}>{title}</p>
          {subtitle && <p className={`${textColor} text-sm opacity-80 mt-1`}>{subtitle}</p>}
        </div>
        <div className={`text-4xl ${textColor} opacity-80`}>
          <Icon size={40} />
        </div>
      </div>
    </div>
  );

  const ActionButton = ({ onClick, gradient, icon: Icon, title, description }) => (
    <button
      onClick={onClick}
      className={`${gradient} text-white font-semibold py-5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 group flex items-center justify-center space-x-4 focus:outline-none focus:ring-4 focus:ring-opacity-50 focus:ring-blue-300`}
    >
      <Icon size={32} className="group-hover:scale-110 transition-transform duration-300" />
      <div className="text-left">
        <div className="font-bold text-xl">{title}</div>
        <div className="text-sm opacity-90">{description}</div>
      </div>
    </button>
  );

  const latestChamado = chamados.length > 0 ? chamados[0] : null;

  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans">
      <div className="max-w-7xl w-full mx-auto px-4 py-6 md:p-8 flex-grow flex flex-col">
        {/* Header */}
        <header className="text-center mb-8 bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-gray-100 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-gray-900 mb-3 leading-tight">
            {getGreeting()}, {userName}!
            <span className="inline-block animate-wave origin-[70%_70%] ml-2">👋</span>
          </h1>

          {userProfile && (
            <div className="text-gray-700 text-base sm:text-lg md:text-xl max-w-3xl mx-auto mb-4 space-y-1">
              <p><strong>Nome:</strong> {userProfile.nome || "Não informado"}</p>
              <p><strong>Função:</strong> {userProfile.funcao || "Não informado"}</p>
              <p><strong>Email:</strong> {userProfile.email || "Não informado"}</p>
            </div>
          )}

          <p className="text-gray-700 text-base sm:text-lg md:text-xl max-w-3xl mx-auto">
            Bem-vindo ao seu painel de chamados. Gerencie suas solicitações de forma simples e eficiente.
          </p>
        </header>

        {/* Loading */}
        {loading ? (
          <section className="flex flex-col items-center justify-center py-20 bg-white/70 backdrop-blur-sm rounded-2xl shadow-md border border-gray-100 animate-fade-in flex-grow">
            <Loader2 className="animate-spin h-16 w-16 text-blue-600 mb-6" />
            <p className="text-gray-600 text-xl font-medium">Carregando seus dados, por favor aguarde...</p>
            <p className="text-gray-500 text-md mt-2">Isso pode levar alguns segundos.</p>
          </section>
        ) : (
          <main className="flex-grow flex flex-col justify-between gap-8">
            {/* Estatísticas */}
            <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total de Chamados"
                value={totalChamados}
                subtitle="Todos os tempos"
                bgColor="bg-gradient-to-br from-blue-600 to-blue-700"
                textColor="text-white"
                icon={BarChart}
              />
              <StatCard
                title="Chamados Abertos"
                value={abertos}
                subtitle="Aguardando atendimento"
                bgColor="bg-gradient-to-br from-red-500 to-red-600"
                textColor="text-white"
                icon={Clock}
              />
              <StatCard
                title="Em Andamento"
                value={emAndamento}
                subtitle="Sendo processados"
                bgColor="bg-gradient-to-br from-yellow-500 to-orange-500"
                textColor="text-white"
                icon={Rocket}
              />
              <StatCard
                title="Finalizados"
                value={Resolvidos}
                subtitle="Concluídos com sucesso"
                bgColor="bg-gradient-to-br from-green-500 to-green-600"
                textColor="text-white"
                icon={CircleCheck}
              />
            </section>

            {/* Atividade e Dicas */}
            <section className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-6">
              {totalChamados > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-7 border border-gray-100">
                  <h2 className="text-2xl font-bold text-gray-800 mb-5 flex items-center">
                    <Signal className="mr-3 text-blue-600" size={24} />
                    Atividade Recente
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center p-5 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="text-3xl font-bold text-blue-700 mb-1">{chamadosRecentes}</div>
                      <div className="text-blue-700 font-medium text-md">Últimos 7 dias</div>
                    </div>
                    <div className="text-center p-5 bg-green-50 rounded-lg border border-green-100">
                      <div className="text-3xl font-bold text-green-700 mb-1">
                        {totalChamados > 0 ? Math.round((Resolvidos / totalChamados) * 100) : 0}%
                      </div>
                      <div className="w-full mt-2">
                        <Progress
                          value={totalChamados > 0 ? Math.round((Resolvidos / totalChamados) * 100) : 0}
                          className="h-2 bg-green-200"
                          indicatorClassName="bg-green-600"
                        />
                      </div>
                      <div className="text-green-700 font-medium text-md mt-2">Taxa de Resolução</div>
                    </div>
                    <div className="text-center p-5 bg-purple-50 rounded-lg border border-purple-100">
                      <div className="text-xl font-bold text-purple-700 mb-1 truncate">
                        {latestChamado
                          ? latestChamado.assunto || `Chamado #${latestChamado.id.slice(-4)}`
                          : "N/A"}
                      </div>
                      <div className="text-purple-700 font-medium text-md">Último Chamado</div>
                    </div>
                  </div>
                  {lastUpdated && (
                    <p className="text-gray-500 text-xs mt-6 flex items-center justify-end">
                      <CalendarDays size={14} className="mr-1" />
                      Dados atualizados em: {lastUpdated.toLocaleTimeString("pt-BR")}
                    </p>
                  )}
                </div>
              )}

              {/* Dicas */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-10 text-white">
                <h2 className="text-2xl font-bold mb-5 flex items-center">
                  <Lightbulb className="mr-3 text-white" size={24} />
                  Dicas Rápidas
                </h2>
                <div className="grid grid-cols-1 gap-5">
                  <div className="flex items-start space-x-4">
                    <Rocket size={24} className="flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg">Seja específico</h3>
                      <p className="text-sm opacity-90">
                        Descreva seu problema com detalhes e anexe arquivos relevantes para um atendimento mais rápido.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <Users size={24} className="flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-lg">Acompanhe em tempo real</h3>
                      <p className="text-sm opacity-90">
                        Receba notificações sobre o status dos seus chamados e interaja com a equipe de suporte.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Botões de ação */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ActionButton
                onClick={() => navigate("/abrir-chamado")}
                gradient="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                icon={FileText}
                title="Abrir Novo Chamado"
                description="Crie uma nova solicitação de suporte ou serviço"
              />
              <ActionButton
                onClick={() => navigate("/lista-chamados")}
                gradient="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                icon={ListChecks}
                title="Ver Meus Chamados"
                description="Acompanhe o status e o histórico de suas solicitações"
              />
            </section>
          </main>
        )}

        {/* Footer */}
        <footer className="text-center text-gray-600 text-sm space-y-3 py-10 border-t border-gray-200 mt-12">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <span className="text-xl">🌱</span>
            <p className="font-medium text-base">
              © {new Date().getFullYear()} Sistema de Chamados — Instituto Reciclar
            </p>
          </div>
          <p>
            Última atualização:{" "}
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4 text-xs font-medium">
            <span className="flex items-center space-x-1 text-green-600">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
              <span>Sistema Online</span>
            </span>
            <span className="text-gray-400">•</span>
            <span className="flex items-center space-x-1 text-blue-600">
              <Users size={14} />
              <span>Suporte 24/7</span>
            </span>
            <span className="text-gray-400">•</span>
            <span className="flex items-center space-x-1 text-purple-600">
              <ShieldCheck size={14} />
              <span>Dados Seguros</span>
            </span>
          </div>
        </footer>
      </div>

      <style>{`
        @keyframes wave {
          0% { transform: rotate(0deg); }
          15% { transform: rotate(14deg); }
          30% { transform: rotate(-8deg); }
          45% { transform: rotate(14deg); }
          60% { transform: rotate(-4deg); }
          75% { transform: rotate(10deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-wave {
          animation: wave 2.5s infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
