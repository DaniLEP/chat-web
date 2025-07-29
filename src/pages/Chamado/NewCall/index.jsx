import React, { useState } from 'react';
import { ref, push } from 'firebase/database';
import { db } from '@/services/firebase';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';

export default function AberturaChamado() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    categoria: '',
    prioridade: '',
    descricao: '',
    status: 'Aberto',
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Pega o UID do usuário logado (salvo no localStorage no login)
    const uid = localStorage.getItem('userUid');
    if (!uid) {
      toast.error('Usuário não autenticado.');
      return;
    }

    try {
      const protocolo = `CH-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
      // Salva o chamado dentro do nó do usuário
      await push(ref(db, `chamados/${uid}`), {
        ...form,
        criadoEm: Date.now(),
        protocolo,
      });
      toast.success('Chamado criado com sucesso!');
      setForm({ nome: '', email: '', categoria: '', prioridade: '', descricao: '', status: 'Aberto' });
    } catch (err) {
      toast.error('Erro ao criar chamado.');
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 bg-white shadow rounded-md space-y-4">
      <h1 className="text-2xl font-bold text-center">Abrir Novo Chamado</h1>
      <Input name="nome" value={form.nome} onChange={handleChange} placeholder="Seu nome" required />
      <Input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Seu email" required />
      <Select onValueChange={(val) => setForm((prev) => ({ ...prev, categoria: val }))} value={form.categoria}>
        <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="TI">TI</SelectItem>
          <SelectItem value="Financeiro">Financeiro</SelectItem>
          <SelectItem value="RH">RH</SelectItem>
        </SelectContent>
      </Select>
      <Select onValueChange={(val) => setForm((prev) => ({ ...prev, prioridade: val }))} value={form.prioridade}>
        <SelectTrigger><SelectValue placeholder="Prioridade" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="Baixa">Baixa</SelectItem>
          <SelectItem value="Média">Média</SelectItem>
          <SelectItem value="Alta">Alta</SelectItem>
        </SelectContent>
      </Select>
      <Textarea name="descricao" value={form.descricao} onChange={handleChange} placeholder="Descreva o problema..." required />
      <Button type="submit" className="w-full">Enviar chamado</Button>
    </form>
  );
}
