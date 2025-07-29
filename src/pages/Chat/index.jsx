// "use client";

// import { useEffect, useState, useRef } from "react";
// import { db } from "@/services/firebase";
// import { ref, push, onValue, update } from "firebase/database";
// import { useParams } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Send, MessageCircle, Clock, User, Headphones, XCircle } from "lucide-react";

// export default function ChatTI({ userName = "Usuário" }) {
//   const { chamadoId } = useParams();
//   const [messages, setMessages] = useState([]);
//   const [newMsg, setNewMsg] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSending, setIsSending] = useState(false);
//   const [adminTyping, setAdminTyping] = useState(false);
//   const [chatStatus, setChatStatus] = useState("aberto"); // novo estado para status do chat
//   const messagesEndRef = useRef(null);
//   const typingTimeoutRef = useRef(null);

//   useEffect(() => {
//     if (!chamadoId) return;

//     setIsLoading(true);

//     // Referência para mensagens
//     const messagesRef = ref(db, `chamados/${chamadoId}/mensagens`);
//     const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
//       const data = snapshot.val() || {};
//       const msgsList = Object.entries(data).map(([id, msg]) => ({
//         id,
//         ...msg,
//       }));
//       setMessages(msgsList.sort((a, b) => a.timestamp - b.timestamp));
//       setIsLoading(false);
//       scrollToBottom();
//     });

//     // Referência para status do chamado (bloqueio)
//     const chamadoRef = ref(db, `chamados/${chamadoId}`);
//     const unsubscribeChamado = onValue(chamadoRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data && data.status) {
//         setChatStatus(data.status.toLowerCase());
//       }
//     });

//     // Escuta se admin está digitando
//     const typingRef = ref(db, `chamados/${chamadoId}/typingStatus/admin`);
//     const unsubscribeTyping = onValue(typingRef, (snapshot) => {
//       setAdminTyping(!!snapshot.val());
//     });

//     return () => {
//       unsubscribeMessages();
//       unsubscribeChamado();
//       unsubscribeTyping();
//     };
//   }, [chamadoId]);

//   function scrollToBottom() {
//     setTimeout(() => {
//       messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }, 100);
//   }

//   async function handleSend() {
//     if (!newMsg.trim() || isSending || chatStatus === "fechado") return;

//     setIsSending(true);
//     const messagesRef = ref(db, `chamados/${chamadoId}/mensagens`);

//     try {
//       await push(messagesRef, {
//         texto: newMsg.trim(),
//         autor: "usuario",
//         timestamp: Date.now(),
//       });
//       setNewMsg("");
//       await setTypingStatus(false);
//     } catch (error) {
//       console.error("Erro ao enviar mensagem:", error);
//     } finally {
//       setIsSending(false);
//     }
//   }

//   async function setTypingStatus(isTyping) {
//     if (!chamadoId) return;
//     const typingRef = ref(db, `chamados/${chamadoId}/typingStatus`);
//     try {
//       await update(typingRef, {
//         usuario: isTyping,
//       });
//     } catch (err) {
//       console.error("Erro ao atualizar typingStatus:", err);
//     }
//   }

//   function handleInputChange(e) {
//     if (chatStatus === "fechado") return; // evita digitar se fechado

//     setNewMsg(e.target.value);

//     setTypingStatus(true);

//     if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

//     typingTimeoutRef.current = setTimeout(() => {
//       setTypingStatus(false);
//     }, 2000);
//   }

//   function formatTime(timestamp) {
//     const date = new Date(timestamp);
//     const now = new Date();
//     const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

//     if (diffInHours < 24) {
//       return date.toLocaleTimeString("pt-BR", {
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//     } else {
//       return date.toLocaleDateString("pt-BR", {
//         day: "2-digit",
//         month: "2-digit",
//         hour: "2-digit",
//         minute: "2-digit",
//       });
//     }
//   }

//   function getAuthorInfo(autor) {
//     if (autor === "usuario") {
//       return {
//         name: userName,
//         avatar: userName.charAt(0).toUpperCase(),
//         color: "bg-blue-500",
//         isCurrentUser: true,
//       };
//     } else {
//       return {
//         name: "Suporte TI",
//         avatar: "TI",
//         color: "bg-green-500",
//         isCurrentUser: false,
//       };
//     }
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-4">
//       <Card className="h-[700px] flex flex-col shadow-xl border-0 bg-gradient-to-br from-slate-50 to-white">
//         <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="p-2 bg-white/20 rounded-full">
//                 <MessageCircle className="h-5 w-5" />
//               </div>
//               <div>
//                 <CardTitle className="text-lg font-semibold">
//                   Chat do Chamado #{chamadoId}
//                 </CardTitle>
//                 <p className="text-blue-100 text-sm">
//                   Suporte técnico em tempo real
//                 </p>
//               </div>
//             </div>
//             <Badge
//               variant="secondary"
//               className={`border-0 ${
//                 chatStatus === "fechado"
//                   ? "bg-red-500 text-white"
//                   : "bg-green-500 text-white"
//               }`}
//             >
//               <div
//                 className={`w-2 h-2 bg-white rounded-full mr-2 animate-pulse ${
//                   chatStatus === "fechado" ? "bg-white opacity-60" : ""
//                 }`}
//               />
//               {chatStatus === "fechado" ? "Encerrado" : "Online"}
//             </Badge>
//           </div>
//         </CardHeader>

//         <CardContent className="flex-1 p-0 overflow-hidden">
//           <ScrollArea className="h-full p-4">
//             {isLoading ? (
//               <div className="flex items-center justify-center h-full">
//                 <div className="text-center">
//                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
//                   <p className="text-gray-500">Carregando mensagens...</p>
//                 </div>
//               </div>
//             ) : messages.length === 0 ? (
//               <div className="flex items-center justify-center h-full">
//                 <div className="text-center max-w-md">
//                   <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                     <MessageCircle className="h-8 w-8 text-blue-600" />
//                   </div>
//                   <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                     Inicie a conversa
//                   </h3>
//                   <p className="text-gray-500 text-sm">
//                     Envie sua primeira mensagem para começar o atendimento. Nossa
//                     equipe de suporte está pronta para ajudar!
//                   </p>
//                 </div>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {messages.map((message) => {
//                   const authorInfo = getAuthorInfo(message.autor);
//                   return (
//                     <div
//                       key={message.id}
//                       className={`flex gap-3 ${
//                         authorInfo.isCurrentUser ? "flex-row-reverse" : "flex-row"
//                       }`}
//                     >
//                       <Avatar className="h-8 w-8 flex-shrink-0">
//                         <AvatarFallback
//                           className={`${authorInfo.color} text-white text-xs font-semibold`}
//                         >
//                           {authorInfo.isCurrentUser ? (
//                             <User className="h-4 w-4" />
//                           ) : (
//                             <Headphones className="h-4 w-4" />
//                           )}
//                         </AvatarFallback>
//                       </Avatar>

//                       <div
//                         className={`flex flex-col max-w-[70%] ${
//                           authorInfo.isCurrentUser ? "items-end" : "items-start"
//                         }`}
//                       >
//                         <div className="flex items-center gap-2 mb-1">
//                           <span className="text-xs font-medium text-gray-700">
//                             {authorInfo.name}
//                           </span>
//                           <div className="flex items-center gap-1 text-xs text-gray-500">
//                             <Clock className="h-3 w-3" />
//                             {formatTime(message.timestamp)}
//                           </div>
//                         </div>

//                         <div
//                           className={`rounded-2xl px-4 py-2 shadow-sm ${
//                             authorInfo.isCurrentUser
//                               ? "bg-blue-600 text-white rounded-br-md"
//                               : "bg-white border border-gray-200 text-gray-900 rounded-bl-md"
//                           }`}
//                         >
//                           <p className="text-sm leading-relaxed">{message.texto}</p>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//                 <div ref={messagesEndRef} />
//               </div>
//             )}

//             {/* Indicador digitando */}
//             {adminTyping && chatStatus !== "fechado" && (
//               <p className="text-sm text-gray-500 italic mt-2">
//                 Suporte TI está digitando...
//               </p>
//             )}

//             {/* Mensagem de chat encerrado */}
//             {chatStatus === "fechado" && (
//               <div className="text-center mt-4 p-4 bg-red-50 border border-red-300 rounded-md text-red-700 font-semibold">
//                 <XCircle className="mx-auto mb-2 h-6 w-6" />
//                 Este chat foi encerrado e não aceita novas mensagens.
//               </div>
//             )}
//           </ScrollArea>
//         </CardContent>

//         <div className="border-t bg-gray-50 p-4 rounded-b-lg">
//           <div className="flex gap-3 items-end">
//             <div className="flex-1">
//               <Input
//                 type="text"
//                 value={newMsg}
//                 onChange={handleInputChange}
//                 placeholder={
//                   chatStatus === "fechado"
//                     ? "Chat encerrado"
//                     : "Digite sua mensagem..."
//                 }
//                 className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter" && !e.shiftKey) {
//                     e.preventDefault();
//                     handleSend();
//                   }
//                 }}
//                 disabled={isSending || chatStatus === "fechado"}
//               />
//             </div>
//             <Button
//               onClick={handleSend}
//               disabled={!newMsg.trim() || isSending || chatStatus === "fechado"}
//               className="bg-blue-600 hover:bg-blue-700 rounded-xl px-4 py-2 h-10"
//             >
//               {isSending ? (
//                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
//               ) : (
//                 <Send className="h-4 w-4" />
//               )}
//             </Button>
//           </div>
//           <p className="text-xs text-gray-500 mt-2 text-center">
//             Pressione Enter para enviar • Shift + Enter para nova linha
//           </p>
//         </div>
//       </Card>
//     </div>
//   );
// }



import { useEffect, useState, useRef } from "react";
import { db } from "@/services/firebase";
import { ref, push, onValue, update } from "firebase/database";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle, Clock, User, Headphones, XCircle } from "lucide-react";

export default function ChatTI({ userName = "Usuário" }) {
  const { chamadoId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [adminTyping, setAdminTyping] = useState(false);
  const [chatStatus, setChatStatus] = useState("aberto");
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!chamadoId) return;

    setIsLoading(true);

    const messagesRef = ref(db, `chamados/${chamadoId}/mensagens`);
    const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val() || {};
      const msgsList = Object.entries(data).map(([id, msg]) => ({
        id,
        ...msg,
      }));
      setMessages(msgsList.sort((a, b) => a.timestamp - b.timestamp));
      setIsLoading(false);
      scrollToBottom();
    });

    const chamadoRef = ref(db, `chamados/${chamadoId}`);
    const unsubscribeChamado = onValue(chamadoRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.status) {
        setChatStatus(data.status.toLowerCase());
      }
    });

    const typingRef = ref(db, `chamados/${chamadoId}/typingStatus/admin`);
    const unsubscribeTyping = onValue(typingRef, (snapshot) => {
      setAdminTyping(!!snapshot.val());
    });

    return () => {
      unsubscribeMessages();
      unsubscribeChamado();
      unsubscribeTyping();
    };
  }, [chamadoId]);

  function scrollToBottom() {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }

  async function handleSend() {
    if (!newMsg.trim() || isSending || chatStatus === "fechado") return;

    setIsSending(true);
    const messagesRef = ref(db, `chamados/${chamadoId}/mensagens`);

    try {
      await push(messagesRef, {
        texto: newMsg.trim(),
        autor: "usuario",
        timestamp: Date.now(),
      });
      setNewMsg("");
      await setTypingStatus(false);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    } finally {
      setIsSending(false);
    }
  }

  async function setTypingStatus(isTyping) {
    if (!chamadoId) return;
    const typingRef = ref(db, `chamados/${chamadoId}/typingStatus`);
    try {
      await update(typingRef, {
        usuario: isTyping,
      });
    } catch (err) {
      console.error("Erro ao atualizar typingStatus:", err);
    }
  }

  function handleInputChange(e) {
    if (chatStatus === "fechado") return;

    setNewMsg(e.target.value);
    setTypingStatus(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setTypingStatus(false);
    }, 2000);
  }

  function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  }

  function getAuthorInfo(autor) {
    if (autor === "usuario") {
      return {
        name: userName,
        avatar: userName.charAt(0).toUpperCase(),
        color: "bg-blue-500",
        isCurrentUser: true,
      };
    } else {
      return {
        name: "Suporte TI",
        avatar: "TI",
        color: "bg-green-500",
        isCurrentUser: false,
      };
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="h-[700px] flex flex-col shadow-xl border-0 bg-gradient-to-br from-slate-50 to-white">
        <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">
                  Chat do Chamado #{chamadoId}
                </CardTitle>
                <p className="text-blue-100 text-sm">
                  Suporte técnico em tempo real
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={`border-0 ${
                chatStatus === "fechado"
                  ? "bg-red-500 text-white"
                  : "bg-green-500 text-white"
              }`}
            >
              <div
                className={`w-2 h-2 bg-white rounded-full mr-2 animate-pulse ${
                  chatStatus === "fechado" ? "bg-white opacity-60" : ""
                }`}
              />
              {chatStatus === "fechado" ? "Encerrado" : "Online"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden">
          <ScrollArea className="h-full p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Carregando mensagens...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-md">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Inicie a conversa
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Envie sua primeira mensagem para começar o atendimento. Nossa
                    equipe de suporte está pronta para ajudar!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => {
                  const authorInfo = getAuthorInfo(message.autor);
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        authorInfo.isCurrentUser ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback
                          className={`${authorInfo.color} text-white text-xs font-semibold`}
                        >
                          {authorInfo.isCurrentUser ? (
                            <User className="h-4 w-4" />
                          ) : (
                            <Headphones className="h-4 w-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>

                      <div
                        className={`flex flex-col max-w-[70%] ${
                          authorInfo.isCurrentUser ? "items-end" : "items-start"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-700">
                            {authorInfo.name}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {formatTime(message.timestamp)}
                          </div>
                        </div>

                        <div
                          className={`rounded-2xl px-4 py-2 shadow-sm ${
                            authorInfo.isCurrentUser
                              ? "bg-blue-600 text-white rounded-br-md"
                              : "bg-white border border-gray-200 text-gray-900 rounded-bl-md"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.texto}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}

            {adminTyping && chatStatus !== "fechado" && (
              <p className="text-sm text-gray-500 italic mt-2">
                Suporte TI está digitando...
              </p>
            )}

            {chatStatus === "fechado" && (
              <div className="text-center mt-4 p-4 bg-red-50 border border-red-300 rounded-md text-red-700 font-semibold">
                <XCircle className="mx-auto mb-2 h-6 w-6" />
                Este chat foi encerrado e não aceita novas mensagens.
              </div>
            )}
          </ScrollArea>
        </CardContent>

        <div className="border-t bg-gray-50 p-4 rounded-b-lg">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                type="text"
                value={newMsg}
                onChange={handleInputChange}
                placeholder={
                  chatStatus === "fechado"
                    ? "Chat encerrado"
                    : "Digite sua mensagem..."
                }
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={isSending || chatStatus === "fechado"}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!newMsg.trim() || isSending || chatStatus === "fechado"}
              className="bg-blue-600 hover:bg-blue-700 rounded-xl px-4 py-2 h-10"
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Pressione Enter para enviar • Shift + Enter para nova linha
          </p>
        </div>
      </Card>
    </div>
  );
}
