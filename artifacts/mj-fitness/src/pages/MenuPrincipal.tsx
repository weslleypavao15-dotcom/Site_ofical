import React, { useState } from 'react';
import { Users, CheckCircle, AlertCircle } from 'lucide-react';
import { useData } from '../hooks/useData';
import { Modal } from '../components/Modal';
import { getTodayISO } from '../utils/dates';
import { PaymentMethod } from '../types';

function formatCPF(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function formatPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function MenuPrincipal() {
  const { students, addStudent } = useData();

  const totalAlunos = students.length;
  const emDia = students.filter((s) => s.status === 'Em Dia').length;
  const atrasados = students.filter((s) => s.status === 'Atrasado').length;

  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    phone: '',
    enrollmentDate: getTodayISO(),
    plan: 'Plano Mensal – R$ 100,00' as "Plano Mensal – R$ 100,00",
    paymentMethod: '💠 Pix' as PaymentMethod,
  });

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.cpf || !formData.phone || !formData.enrollmentDate) return;
    setIsConfirmModalOpen(true);
  };

  const handleConfirmAdd = async () => {
    await addStudent(
      {
        name: formData.name,
        cpf: formData.cpf,
        phone: formData.phone,
        enrollmentDate: formData.enrollmentDate,
        plan: formData.plan,
      },
      formData.paymentMethod
    );
    setFormData({
      name: '',
      cpf: '',
      phone: '',
      enrollmentDate: getTodayISO(),
      plan: 'Plano Mensal – R$ 100,00',
      paymentMethod: '💠 Pix',
    });
    setIsConfirmModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#5A0B13] flex items-center justify-center shrink-0">
            <Users className="text-white" size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total de Alunos</p>
            <p className="text-3xl font-bold text-black">{totalAlunos}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#5A0B13] flex items-center justify-center shrink-0">
            <CheckCircle className="text-white" size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Mensalidades em Dia</p>
            <p className="text-3xl font-bold text-black">{emDia}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#5A0B13] flex items-center justify-center shrink-0">
            <AlertCircle className="text-white" size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Mensalidades Atrasadas</p>
            <p className="text-3xl font-bold text-black">{atrasados}</p>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Cadastrar Novo Aluno</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Nome</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#5A0B13] focus:border-[#5A0B13] outline-none text-black bg-white"
                placeholder="Ex: João da Silva"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">CPF</label>
              <input
                type="text"
                required
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#5A0B13] focus:border-[#5A0B13] outline-none text-black bg-white"
                placeholder="000.000.000-00"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Telefone</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: formatPhone(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#5A0B13] focus:border-[#5A0B13] outline-none text-black bg-white"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Data de Matrícula</label>
              <input
                type="date"
                required
                value={formData.enrollmentDate}
                onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#5A0B13] focus:border-[#5A0B13] outline-none text-black bg-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Plano</label>
              {/*
                PLANOS DISPONÍVEIS: para adicionar novos planos no futuro,
                basta descomentar (ou copiar) uma linha <option> abaixo
                e adicionar o valor correspondente ao tipo Student em types/index.ts.
              */}
              <select
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value as typeof formData.plan })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#5A0B13] focus:border-[#5A0B13] outline-none bg-white text-black"
              >
                <option value="Plano Mensal – R$ 100,00">Plano Mensal – R$ 100,00</option>
                {/* <option value="Plano Trimestral – R$ 270,00">Plano Trimestral – R$ 270,00</option> */}
                {/* <option value="Plano Anual – R$ 960,00">Plano Anual – R$ 960,00</option> */}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Forma de Pagamento</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#5A0B13] focus:border-[#5A0B13] outline-none bg-white text-black"
              >
                <option value="💠 Pix">💠 Pix</option>
                <option value="💵 Dinheiro">💵 Dinheiro</option>
                <option value="💳 Cartão de Crédito">💳 Cartão de Crédito</option>
                <option value="💳 Cartão de Débito">💳 Cartão de Débito</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full md:w-auto px-6 py-2.5 bg-[#5A0B13] text-white font-medium rounded-md hover:bg-[#4a0910] transition-colors"
          >
            Cadastrar Aluno
          </button>
        </form>
      </div>

      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmAdd}
        title="Confirmar Cadastro"
      >
        <p>
          Deseja finalizar o cadastro de <strong>{formData.name}</strong>?
        </p>
      </Modal>
    </div>
  );
}
