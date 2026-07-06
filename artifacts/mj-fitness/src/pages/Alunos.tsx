import React, { useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { useData } from '../hooks/useData';
import { Modal } from '../components/Modal';
import { formatDateBr } from '../utils/dates';
import { PaymentMethod, Student } from '../types';

export function Alunos() {
  const { students, renewStudent, deleteStudent } = useData();
  const [searchTerm, setSearchTerm] = useState('');

  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('💠 Pix');
  const [renewStep, setRenewStep] = useState(1);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.cpf.includes(searchTerm)
  );

  const handleOpenRenew = (student: Student) => {
    setSelectedStudent(student);
    setPaymentMethod('💠 Pix');
    setRenewStep(1);
    setRenewModalOpen(true);
  };

  const handleOpenDelete = (student: Student) => {
    setSelectedStudent(student);
    setDeleteModalOpen(true);
  };

  // Step 1: advance to confirmation; Step 2: perform renewal
  const handleRenewAction = async () => {
    if (renewStep === 1) {
      setRenewStep(2);
      return;
    }
    if (selectedStudent) {
      await renewStudent(selectedStudent.id, paymentMethod);
      setRenewModalOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedStudent) {
      await deleteStudent(selectedStudent.id);
      setDeleteModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md px-3 py-2 max-w-md">
        <Search className="text-gray-400 mr-2" size={20} />
        <input
          type="text"
          placeholder="Buscar por nome ou CPF..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none outline-none w-full text-black placeholder-gray-500"
        />
      </div>

      {/* Student cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredStudents.map((student) => (
          <div
            key={student.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col sm:flex-row justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-gray-900 text-lg">{student.name}</h3>
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    student.status === 'Em Dia'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {student.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <div className="text-gray-500">
                  ID: <span className="text-black">{student.id.split('-')[0]}</span>
                </div>
                <div className="text-gray-500">
                  CPF: <span className="text-black">{student.cpf}</span>
                </div>
                <div className="text-gray-500">
                  Tel: <span className="text-black">{student.phone}</span>
                </div>
                <div className="text-gray-500">
                  Matrícula: <span className="text-black">{formatDateBr(student.enrollmentDate)}</span>
                </div>
                <div className="text-gray-500 col-span-2 mt-1">
                  Vencimento:{' '}
                  <span className="text-black font-medium">{formatDateBr(student.dueDate)}</span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col justify-end gap-2 shrink-0">
              <button
                onClick={() => handleOpenRenew(student)}
                className="px-4 py-2 border border-[#5A0B13] text-[#5A0B13] text-sm font-medium rounded-md hover:bg-red-50 transition-colors w-full sm:w-auto text-center"
              >
                Renovar Assinatura
              </button>
              <button
                onClick={() => handleOpenDelete(student)}
                className="p-2 border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors flex items-center justify-center w-full sm:w-auto"
                title="Apagar Aluno"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {filteredStudents.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            Nenhum aluno encontrado.
          </div>
        )}
      </div>

      {/* Renew Modal (2-step) */}
      {renewModalOpen && selectedStudent && (
        <Modal
          isOpen={renewModalOpen}
          onClose={() => {
            setRenewModalOpen(false);
            setRenewStep(1);
          }}
          onConfirm={handleRenewAction}
          title={
            renewStep === 1
              ? `Renovar: ${selectedStudent.name}`
              : 'Confirmar Renovação'
          }
          confirmText={renewStep === 1 ? 'Avançar' : 'Confirmar'}
        >
          {renewStep === 1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Plano</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#5A0B13] focus:border-[#5A0B13] outline-none bg-white text-black">
                  <option value="Plano Mensal – R$ 100,00">Plano Mensal – R$ 100,00</option>
                  {/* <option value="Plano Trimestral – R$ 270,00">Plano Trimestral – R$ 270,00</option> */}
                  {/* <option value="Plano Anual – R$ 960,00">Plano Anual – R$ 960,00</option> */}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Forma de Pagamento</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-[#5A0B13] focus:border-[#5A0B13] outline-none bg-white text-black"
                >
                  <option value="💠 Pix">💠 Pix</option>
                  <option value="💵 Dinheiro">💵 Dinheiro</option>
                  <option value="💳 Cartão de Crédito">💳 Cartão de Crédito</option>
                  <option value="💳 Cartão de Débito">💳 Cartão de Débito</option>
                </select>
              </div>
            </div>
          ) : (
            <p>
              Tem certeza que deseja renovar a assinatura de{' '}
              <strong>{selectedStudent.name}</strong> no Plano Mensal – R$ 100,00?
            </p>
          )}
        </Modal>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Excluir Aluno"
        confirmText="Sim, Excluir"
      >
        <p>
          Tem certeza que deseja apagar o registro de{' '}
          <strong>{selectedStudent?.name}</strong>?
        </p>
        <p className="text-sm text-red-600 mt-2">
          Esta ação removerá todo o histórico de pagamentos deste aluno.
        </p>
      </Modal>
    </div>
  );
}
