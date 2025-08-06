import { useState, useEffect, useRef } from "react"
import { ref, push } from "firebase/database"
import { db } from "@/services/firebase"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "react-toastify"
import {
  User,
  Mail,
  FolderOpen,
  AlertTriangle,
  FileText,
  Calendar,
  Clock,
  Send,
  CheckCircle,
  Zap,
  Shield,
  Flame,
  Computer,
  DollarSign,
  Users,
  Sparkles,
  Timer,
  Lightbulb,
  Utensils,
} from "lucide-react"

const CATEGORIAS = [
  { value: "TI", label: "TI", icon: Computer, color: "bg-white" },
  { value: "Financeiro", label: "Financeiro", icon: DollarSign, color: "bg-white" },
  { value: "RH", label: "RH", icon: Users, color: "bg-white" },
  { value: "DI", label: "DI", icon: Shield, color: "bg-white" },
  { value: "Mentoria/Projetos", label: "Mentoria/Projetos", icon: Sparkles, color: "bg-white" },
  { value: "ADM", label: "ADM", icon: Users, color: "bg-white" },
  { value: "Comunicação", label: "Comunicação", icon: Mail, color: "bg-white" },
  { value: "Educacional/Assistência Social", label: "Educacional/Assistência Social", icon: Lightbulb, color: "bg-white" },
  { value: "Cozinha", label: "Cozinha", icon: Utensils, color: "bg-white" },
  { value: "Diretoria", label: "Diretoria", icon: User, color: "bg-white" },
]

const PRIORIDADES = [
  { value: "Baixa", label: "Baixa", icon: Shield, color: "bg-green-100 text-green-800 border-green-200" },
  { value: "Média", label: "Média", icon: Zap, color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "Alta", label: "Alta", icon: Flame, color: "bg-red-100 text-red-800 border-red-200" },
]

export default function AberturaChamado() {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    categoria: "",
    prioridade: "",
    descricao: "",
    status: "Aberto",
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [currentDateTime, setCurrentDateTime] = useState(new Date())
  const [previewProtocolo, setPreviewProtocolo] = useState("")
  const [formProgress, setFormProgress] = useState(0)
  const [isFormValid, setIsFormValid] = useState(false)
  const nomeInputRef = useRef(null)

  // Atualizar data/hora a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Carregar dados do usuário autenticado
  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const nome = user.displayName || ""
        const email = user.email || ""

        setForm((prev) => ({
          ...prev,
          nome,
          email,
        }))

        localStorage.setItem("userUid", user.uid)
        localStorage.setItem("userData", JSON.stringify({ nome, email }))
      } else {
        // fallback para localStorage
        const storedData = localStorage.getItem("userData")
        if (storedData) {
          const { nome, email } = JSON.parse(storedData)
          setForm((prev) => ({
            ...prev,
            nome: nome || "",
            email: email || "",
          }))
        }
      }

      nomeInputRef.current?.focus()
    })

    return () => unsubscribe()
  }, [])

  // Gerar preview do protocolo
  useEffect(() => {
    if (form.categoria) {
      const prefix = "CH"
      const categoryCode = form.categoria.substring(0, 2).toUpperCase()
      const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase()
      const randomNum = Math.floor(100 + Math.random() * 900)
      setPreviewProtocolo(`${prefix}-${categoryCode}-${randomStr}-${randomNum}`)
    } else {
      setPreviewProtocolo("")
    }
  }, [form.categoria])

  // Calcular progresso do formulário
  useEffect(() => {
    const fields = ["categoria", "prioridade", "descricao"]
    const filledFields = fields.filter((field) => form[field].trim() !== "").length
    const progress = (filledFields / fields.length) * 100
    setFormProgress(progress)
    setIsFormValid(progress === 100 && Object.keys(errors).length === 0)
  }, [form, errors])

  const validate = () => {
    const newErrors = {}

    if (!form.nome.trim()) {
      newErrors.nome = "Nome é obrigatório."
    } else if (form.nome.trim().length < 2) {
      newErrors.nome = "Nome deve ter pelo menos 2 caracteres."
    }

    if (!form.email.trim()) {
      newErrors.email = "Email é obrigatório."
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email.trim())) {
      newErrors.email = "Email inválido."
    }

    if (!form.categoria) newErrors.categoria = "Selecione uma categoria."
    if (!form.prioridade) newErrors.prioridade = "Selecione a prioridade."

    if (!form.descricao.trim()) {
      newErrors.descricao = "Descrição do problema é obrigatória."
    } else if (form.descricao.trim().length < 10) {
      newErrors.descricao = "Descrição deve ter pelo menos 10 caracteres."
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const gerarProtocolo = () => {
    const prefix = "CH"
    const categoryCode = form.categoria.substring(0, 2).toUpperCase()
    const timestamp = Date.now().toString().slice(-4)
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase()
    return `${prefix}-${categoryCode}-${timestamp}-${randomStr}`
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))

    // Validação em tempo real
    if (errors[name]) {
      const newErrors = { ...errors }
      delete newErrors[name]
      setErrors(newErrors)
    }
  }

  const handleSelectChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))

    if (errors[field]) {
      const newErrors = { ...errors }
      delete newErrors[field]
      setErrors(newErrors)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      toast.error("Por favor, corrija os erros no formulário.")
      return
    }

    const uid = localStorage.getItem("userUid")
    if (!uid) {
      toast.error("Usuário não autenticado.")
      return
    }

    setLoading(true)

    try {
      const protocolo = gerarProtocolo()
      const chamadoData = {
        ...form,
        protocolo,
        criadoEm: Date.now(),
        updatedAt: Date.now(),
        dataFormatada: currentDateTime.toLocaleDateString("pt-BR"),
        horaFormatada: currentDateTime.toLocaleTimeString("pt-BR"),
      }

      await push(ref(db, `chamados/${uid}`), chamadoData)

      // Salvar dados do usuário para próximas vezes
      localStorage.setItem(
        "userData",
        JSON.stringify({
          nome: form.nome,
          email: form.email,
        }),
      )

      toast.success(`Chamado criado com sucesso! Protocolo: ${protocolo}`)

      // Reset form mantendo nome e email
      setForm({
        nome: form.nome,
        email: form.email,
        categoria: "",
        prioridade: "",
        descricao: "",
        status: "Aberto",
      })
      setErrors({})
      setPreviewProtocolo("")

      // Focus na categoria para próximo chamado
      setTimeout(() => {
        const categoriaSelect = document.querySelector('[data-testid="categoria-select"]')
        categoriaSelect?.focus()
      }, 100)
    } catch (err) {
      toast.error("Erro ao criar chamado. Tente novamente.")
      console.error(err)
    }

    setLoading(false)
  }

  const formatDateTime = (date) => {
    return {
      date: date.toLocaleDateString("pt-BR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    }
  }

  const { date, time } = formatDateTime(currentDateTime)
  const selectedPrioridade = PRIORIDADES.find((p) => p.value === form.prioridade)
  const selectedCategoria = CATEGORIAS.find((c) => c.value === form.categoria)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header com informações dinâmicas */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border mb-4">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-700">Sistema de Chamados</span>
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Abrir Novo Chamado
          </h1>

          <p className="text-gray-600 max-w-2xl mx-auto">
            Descreva seu problema com detalhes para que possamos ajudá-lo da melhor forma possível
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Informações laterais */}
          <div className="lg:col-span-1 space-y-6">
            {/* Data e Hora */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">Data de Abertura</h3>
                </div>
                <p className="text-sm opacity-90 mb-2 capitalize">{date}</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono text-lg">{time}</span>
                </div>
              </CardContent>
            </Card>

            {/* Preview do Protocolo */}
            {previewProtocolo && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold">Protocolo Previsto</h3>
                  </div>
                  <p className="font-mono text-xl font-bold">{previewProtocolo}</p>
                  <p className="text-sm opacity-90 mt-2">Este será seu número de protocolo</p>
                </CardContent>
              </Card>
            )}

            {/* Progresso do Formulário */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Timer className="h-5 w-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold">Progresso</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Campos preenchidos</span>
                    <span className="font-medium">{Math.round(formProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${formProgress}%` }}
                    />
                  </div>
                  {isFormValid && (
                    <div className="flex items-center gap-2 text-green-600 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      <span>Formulário completo!</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formulário principal */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                  {/* Dados Pessoais */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <h2 className="text-xl font-semibold">Dados Pessoais</h2>
                      {form.nome && form.email && (
                        <Badge variant="secondary" className="ml-auto">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Preenchido automaticamente
                        </Badge>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="nome" className="flex items-center gap-2 font-medium text-gray-700">
                          <User className="h-4 w-4" />
                          Nome Completo
                        </label>
                        <Input
                          id="nome"
                          name="nome"
                          value={form.nome}
                          onChange={handleChange}
                          placeholder="Seu nome completo"
                          required
                          readOnly
                          ref={nomeInputRef}
                          className={`transition-all duration-200 ${errors.nome ? "border-red-500 focus:border-red-500" : "focus:border-blue-500"}`}
                          aria-invalid={errors.nome ? "true" : "false"}
                        />
                        {errors.nome && (
                          <p className="text-red-600 text-sm flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {errors.nome}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="email" className="flex items-center gap-2 font-medium text-gray-700">
                          <Mail className="h-4 w-4" />
                          Email
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="seu@email.com"
                          required
                          readOnly
                          className={`transition-all duration-200 ${errors.email ? "border-red-500 focus:border-red-500" : "focus:border-blue-500"}`}
                          aria-invalid={errors.email ? "true" : "false"}
                        />
                        {errors.email && (
                          <p className="text-red-600 text-sm flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {errors.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Classificação do Chamado */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FolderOpen className="h-5 w-5 text-purple-600" />
                      </div>
                      <h2 className="text-xl font-semibold">Classificação</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 font-medium text-gray-700">
                          <FolderOpen className="h-4 w-4" />
                          Categoria
                        </label>
                        <Select
                          onValueChange={(val) => handleSelectChange("categoria", val)}
                          value={form.categoria}
                          data-testid="categoria-select"
                        >
                          <SelectTrigger
                            className={`transition-all duration-200 ${errors.categoria ? "border-red-500" : "focus:border-purple-500"}`}
                          >
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIAS.map((cat) => {
                              const IconComponent = cat.icon
                              return (
                                <SelectItem key={cat.value} value={cat.value}>
                                  <div className="flex items-center gap-2">
                                    <div className={`p-1 rounded ${cat.color} text-white`}>
                                      <IconComponent className="h-3 w-3" />
                                    </div>
                                    {cat.label}
                                  </div>
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                        {errors.categoria && (
                          <p className="text-red-600 text-sm flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {errors.categoria}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 font-medium text-gray-700">
                          <AlertTriangle className="h-4 w-4" />
                          Prioridade
                        </label>
                        <Select onValueChange={(val) => handleSelectChange("prioridade", val)} value={form.prioridade}>
                          <SelectTrigger
                            className={`transition-all duration-200 ${errors.prioridade ? "border-red-500" : "focus:border-purple-500"}`}
                          >
                            <SelectValue placeholder="Selecione a prioridade" />
                          </SelectTrigger>
                          <SelectContent>
                            {PRIORIDADES.map((prio) => {
                              const IconComponent = prio.icon
                              return (
                                <SelectItem key={prio.value} value={prio.value}>
                                  <div className="flex items-center gap-2">
                                    <IconComponent className="h-4 w-4" />
                                    <Badge variant="outline" className={prio.color}>
                                      {prio.label}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                        {errors.prioridade && (
                          <p className="text-red-600 text-sm flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {errors.prioridade}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Preview da seleção */}
                    {(selectedCategoria || selectedPrioridade) && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                        <h4 className="font-medium text-gray-700 mb-2">Resumo da Classificação:</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedCategoria && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <selectedCategoria.icon className="h-3 w-3" />
                              {selectedCategoria.label}
                            </Badge>
                          )}
                          {selectedPrioridade && (
                            <Badge variant="outline" className={selectedPrioridade.color}>
                              <selectedPrioridade.icon className="h-3 w-3 mr-1" />
                              {selectedPrioridade.label}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Descrição do Problema */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <FileText className="h-5 w-5 text-green-600" />
                      </div>
                      <h2 className="text-xl font-semibold">Descrição do Problema</h2>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="descricao" className="flex items-center gap-2 font-medium text-gray-700">
                        <FileText className="h-4 w-4" />
                        Descreva o problema com detalhes
                      </label>
                      <Textarea
                        id="descricao"
                        name="descricao"
                        value={form.descricao}
                        onChange={handleChange}
                        placeholder="Descreva o problema com o máximo de detalhes possível. Inclua quando começou, o que estava fazendo, mensagens de erro, etc."
                        rows={6}
                        required
                        className={`transition-all duration-200 resize-none ${errors.descricao ? "border-red-500 focus:border-red-500" : "focus:border-green-500"}`}
                        aria-invalid={errors.descricao ? "true" : "false"}
                      />
                      <div className="flex justify-between items-center">
                        {errors.descricao && (
                          <p className="text-red-600 text-sm flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {errors.descricao}
                          </p>
                        )}
                        <div className="ml-auto text-sm text-gray-500">
                          {form.descricao.length} caracteres
                          {form.descricao.length >= 10 && (
                            <CheckCircle className="h-3 w-3 text-green-500 inline ml-1" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botão de Envio */}
                  <div className="pt-6">
                    <Button
                      type="submit"
                      className={`w-full h-12 text-lg font-semibold transition-all duration-300 ${
                        isFormValid
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
                          : "bg-gray-400"
                      }`}
                      disabled={loading || !isFormValid}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Enviando chamado...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send className="h-5 w-5" />
                          Enviar Chamado
                        </div>
                      )}
                    </Button>

                    {!isFormValid && (
                      <p className="text-center text-sm text-gray-500 mt-2">
                        Complete todos os campos para enviar o chamado
                      </p>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
