import React from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

export default function FiltroStatus({ value, onChange }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Filtrar por status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="todos">Todos</SelectItem>
        <SelectItem value="Aberto">Aberto</SelectItem>
        <SelectItem value="Em andamento">Em andamento</SelectItem>
        <SelectItem value="Resolvido">Resolvido</SelectItem>
      </SelectContent>
    </Select>
  );
}
