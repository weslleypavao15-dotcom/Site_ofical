import React, { useState, useMemo } from 'react';
import { DollarSign, Calendar, Users, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useData } from '../hooks/useData';
import { Modal } from '../components/Modal';
import { formatDateBr, getMonthYearLabel, getTodayISO } from '../utils/dates';

export function Financeiro() {
  const { transactions, students, deleteTransaction } = useData();
  const [filter, setFilter] = useState<string>('📊 Geral');
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  // KPIs
  const totalFaturado = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  const currentMonthPrefix = getTodayISO().substring(0, 7); // YYYY-MM
  const mensalidadesMes = transactions
    .filter(t => t.date.startsWith(currentMonthPrefix))
    .reduce((sum, t) => sum + t.amount, 0);
    
  const alunosAtivos = students.length;

  // Chart Data Preparation
  const chartData = useMemo(() => {
    // Determine which payment methods to include
    const filterMethodMap: Record<string, string> = {
      "📊 Geral": "all",
      "💵 Dinheiro em Mãos": "💵 Dinheiro",
      "💠 Pix": "💠 Pix",
      "💳 Cartão de Crédito": "💳 Cartão de Crédito",
      "💳 Cartão de Débito": "💳 Cartão de Débito"
    };

    const targetMethod = filterMethodMap[filter];

    // Get last 6 months list
    const last6Months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const label = getMonthYearLabel(d.toISOString().split('T')[0]);
      const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return { label, prefix, total: 0 };
    });

    // Sum transactions per month
    transactions.forEach(t => {
      if (targetMethod !== "all" && t.paymentMethod !== targetMethod) return;
      
      const monthPrefix = t.date.substring(0, 7);
      const monthBucket = last6Months.find(m => m.prefix === monthPrefix);
      if (monthBucket) {
        monthBucket.total += t.amount;
      }
    });

    return last6Months.map(m => ({
      name: m.label,
      total: m.total
    }));
  }, [transactions, filter]);

  const handleOpenDelete = (id: string) => {
    setTransactionToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (transactionToDelete) {
      await deleteTransaction(transactionToDelete);
      setDeleteModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#5A0B13] flex items-center justify-center shrink-0">
            <DollarSign className="text-white" size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Faturado</p>
            <p className="text-3xl font-bold text-black">R$ {totalFaturado},00</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#5A0B13] flex items-center justify-center shrink-0">
            <Calendar className="text-white" size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Mensalidades do Mês</p>
            <p className="text-3xl font-bold text-black">R$ {mensalidadesMes},00</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#5A0B13] flex items-center justify-center shrink-0">
            <Users className="text-white" size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Alunos Ativos</p>
            <p className="text-3xl font-bold text-black">{alunosAtivos}</p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Receita por Período</h2>
        
        <div className="flex flex-wrap gap-2 mb-6">
          {["📊 Geral", "💵 Dinheiro em Mãos", "💠 Pix", "💳 Cartão de Crédito", "💳 Cartão de Débito"].map(btn => (
            <button
              key={btn}
              onClick={() => setFilter(btn)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === btn 
                  ? 'bg-[#5A0B13] text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {btn}
            </button>
          ))}
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => `R$ ${val}`} />
              <RechartsTooltip 
                cursor={{ fill: '#f9fafb' }}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`R$ ${value},00`, 'Receita']}
              />
              <Bar dataKey="total" fill="#5A0B13" radius={[4, 4, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Histórico de Pagamentos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Aluno</th>
                <th className="px-6 py-3">Valor</th>
                <th className="px-6 py-3">Pagamento</th>
                <th className="px-6 py-3">Data</th>
                <th className="px-6 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[...transactions].reverse().map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-black">{t.id.split('-')[0]}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{t.studentName}</td>
                  <td className="px-6 py-4 text-black">R$ {t.amount},00</td>
                  <td className="px-6 py-4">{t.paymentMethod}</td>
                  <td className="px-6 py-4 text-black">{formatDateBr(t.date)}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleOpenDelete(t.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors inline-flex"
                      title="Apagar Registro"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Nenhum pagamento registrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Transaction Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Apagar Registro de Pagamento"
        confirmText="Sim, Apagar"
      >
        <p>Tem certeza que deseja apagar este registro de pagamento?</p>
        <p className="text-sm text-red-600 mt-2 font-medium">O faturamento e os gráficos serão recalculados.</p>
      </Modal>
    </div>
  );
}
