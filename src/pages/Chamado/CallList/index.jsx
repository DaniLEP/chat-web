"use client";

import { useEffect, useState } from "react";
import { db } from "../../../services/firebase";
import { ref, onValue } from "firebase/database";
import { useNavigate } from "react-router-dom";

export default function ListaChamados() {
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Pega o UID do usuário logado no localStorage
  const uid = localStorage.getItem("userUid") || "";

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      setChamados([]);
      return;
    }

    // Referência dos chamados do usuário no Realtime Database
    const chamadosRef = ref(db, `chamados/${uid}`);

    // Escuta alterações em tempo real
    const unsubscribe = onValue(chamadosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const lista = Object.entries(data).map(([id, chamado]) => ({
          id,
          ...chamado,
        }));
        // Inverte para mostrar do mais recente para o mais antigo
        setChamados(lista.reverse());
      } else {
        setChamados([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  // Ícones por categoria
  const getCategoryIcon = (categoria) => {
    const icons = {
      Hardware: "🖥️",
      Software: "💻",
      Rede: "🌐",
      Email: "📧",
      Impressora: "🖨️",
      Sistema: "⚙️",
      Segurança: "🔒",
      Backup: "💾",
      TI: "💻",
      Financeiro: "💰",
      RH: "👥",
    };
    return icons[categoria] || "📋";
  };

  // Cores e estilos para prioridade
  const getPriorityColor = (prioridade) => {
    const colors = {
      Baixa: "bg-green-100 text-green-800 border-green-200",
      Média: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Alta: "bg-orange-100 text-orange-800 border-orange-200",
      Crítica: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[prioridade] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Status com cor, ícone e animação
  const getStatusInfo = (status) => {
    const statusInfo = {
      Aberto: {
        color: "bg-red-500 text-white",
        icon: "🔴",
        pulse: true,
      },
      "Em andamento": {
        color: "bg-yellow-500 text-white",
        icon: "🟡",
        pulse: true,
      },
      Resolvido: {
        color: "bg-green-500 text-white",
        icon: "✅",
        pulse: false,
      },
      Fechado: {
        color: "bg-gray-500 text-white",
        icon: "⚫",
        pulse: false,
      },
    };
    return statusInfo[status] || statusInfo["Aberto"];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin mx-auto"
              style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
            ></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Carregando chamados</h2>
          <p className="text-gray-500">Aguarde um momento...</p>
        </div>
      </div>
    );
  }

  if (chamados.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📋</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Nenhum chamado encontrado</h2>
          <p className="text-gray-600 mb-6">
            Não há chamados registrados no momento. Quando novos chamados forem criados, eles aparecerão aqui.
          </p>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
            <p className="text-sm text-blue-600">💡 Dica: Os chamados são atualizados em tempo real</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <span className="text-2xl text-white">🎫</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Lista de Chamados</h1>
          <p className="text-gray-600">Gerencie e acompanhe todos os seus chamados</p>

          <div className="flex justify-center gap-6 mt-6">
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border">
              <span className="text-2xl font-bold text-blue-600">{chamados.length}</span>
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border">
              <span className="text-2xl font-bold text-red-600">
                {chamados.filter((c) => c.status === "Aberto").length}
              </span>
              <p className="text-sm text-gray-600">Abertos</p>
            </div>
            <div className="bg-white rounded-lg px-4 py-2 shadow-sm border">
              <span className="text-2xl font-bold text-yellow-600">
                {chamados.filter((c) => c.status === "Em andamento").length}
              </span>
              <p className="text-sm text-gray-600">Em Andamento</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {chamados.map(({ id, protocolo, nome, categoria, prioridade, descricao, status, criadoEm }) => {
            const statusInfo = getStatusInfo(status);
            const createdDate = criadoEm ? new Date(criadoEm) : null;

            return (
              <div
                key={id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCategoryIcon(categoria)}</span>
                      <span className="font-bold text-lg">#{protocolo || id}</span>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusInfo.color} ${
                        statusInfo.pulse ? "animate-pulse" : ""
                      }`}
                    >
                      <span>{statusInfo.icon}</span>
                      {status}
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {nome ? nome.charAt(0).toUpperCase() : "U"}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">{nome}</p>
                      <p className="text-xs text-gray-500">Solicitante</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full border border-blue-200">
                      {getCategoryIcon(categoria)}
                      {categoria}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(
                        prioridade
                      )}`}
                    >
                      {prioridade}
                    </span>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-2">Descrição:</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {descricao && descricao.length > 120 ? descricao.slice(0, 120) + "..." : descricao}
                    </p>
                  </div>

                  <button
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    onClick={() => navigate(`/chat/${uid}/${id}`)}
                  >
                    <span>💬</span> Abrir Chat com T.I.
                  </button>
                </div>

                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 text-center">
                    🕒 Criado em:{" "}
                    {createdDate
                      ? createdDate.toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                      : "-"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 max-w-md mx-auto">
            <p className="text-sm text-gray-600 mb-2">
              <span className="font-semibold">Atualização automática:</span> Esta lista é atualizada em tempo real
            </p>
            <div className="flex items-center justify-center gap-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium">Sistema Online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
