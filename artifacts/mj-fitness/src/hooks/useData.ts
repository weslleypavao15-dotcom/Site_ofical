import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Student, Transaction, PaymentMethod } from '../types';
import { getTodayISO, isLate } from '../utils/dates';
import { showToast } from '../components/Toast';

// Adiciona exatamente 1 mês a uma string YYYY-MM-DD
function addOneMonth(dateString: string): string {
  const date = new Date(dateString + 'T12:00:00Z');
  date.setMonth(date.getMonth() + 1);
  return date.toISOString().split('T')[0];
}

// Mapeia linha do Supabase → tipo Student (camelCase)
// Colunas na tabela students: id, nome, cpf, telefone, plano, data_matricula, data_vencimento
function rowToStudent(row: Record<string, unknown>): Student {
  const dueDate = row.data_vencimento as string;
  return {
    id: row.id as string,
    name: row.nome as string,
    cpf: row.cpf as string,
    phone: row.telefone as string,
    plan: row.plano as "Plano Mensal – R$ 100,00",
    enrollmentDate: row.data_matricula as string,
    dueDate,
    status: isLate(dueDate) ? 'Atrasado' : 'Em Dia',
  };
}

// Mapeia linha do Supabase → tipo Transaction
// Colunas na tabela transactions: id, student_id, student_name, valor, data_pagamento, forma_pagamento
function rowToTransaction(row: Record<string, unknown>): Transaction {
  return {
    id: row.id as string,
    studentId: row.student_id as string,
    studentName: row.student_name as string,
    amount: row.valor as number,
    paymentMethod: row.forma_pagamento as PaymentMethod,
    date: row.data_pagamento as string,
  };
}

export function useData() {
  const [students, setStudents] = useState<Student[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [studentsRes, transactionsRes] = await Promise.all([
      supabase.from('students').select('*').order('nome', { ascending: true }),
      supabase.from('transactions').select('*').order('data_pagamento', { ascending: false }),
    ]);

    if (studentsRes.error) {
      showToast('Erro ao carregar alunos: ' + studentsRes.error.message, 'error');
    } else {
      setStudents((studentsRes.data ?? []).map(rowToStudent));
    }

    if (transactionsRes.error) {
      showToast('Erro ao carregar pagamentos: ' + transactionsRes.error.message, 'error');
    } else {
      setTransactions((transactionsRes.data ?? []).map(rowToTransaction));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // INSERT novo aluno + transação inicial
  const addStudent = async (
    studentData: Omit<Student, 'id' | 'status' | 'dueDate'>,
    paymentMethod: PaymentMethod
  ): Promise<void> => {
    const dueDate = addOneMonth(studentData.enrollmentDate);

    const { data: newStudent, error } = await supabase
      .from('students')
      .insert({
        nome: studentData.name,
        cpf: studentData.cpf,
        telefone: studentData.phone,
        plano: studentData.plan,
        data_matricula: studentData.enrollmentDate,
        data_vencimento: dueDate,
      })
      .select()
      .single();

    if (error || !newStudent) {
      showToast('Erro ao cadastrar aluno: ' + (error?.message ?? 'resposta vazia'), 'error');
      return;
    }

    const { error: txError } = await supabase.from('transactions').insert({
      student_id: newStudent.id,
      student_name: newStudent.nome,
      valor: 100,
      forma_pagamento: paymentMethod,
      data_pagamento: newStudent.data_matricula,
    });

    if (txError) {
      showToast('Aluno cadastrado, mas erro ao registrar pagamento: ' + txError.message, 'error');
    } else {
      showToast('Aluno cadastrado com sucesso!', 'success');
    }

    await fetchData();
  };

  // UPDATE data_vencimento + INSERT transação de renovação
  const renewStudent = async (
    studentId: string,
    paymentMethod: PaymentMethod
  ): Promise<void> => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const newDueDate = addOneMonth(getTodayISO());

    const { error: updateError } = await supabase
      .from('students')
      .update({ data_vencimento: newDueDate })
      .eq('id', studentId);

    if (updateError) {
      showToast('Erro ao renovar assinatura: ' + updateError.message, 'error');
      return;
    }

    const { error: txError } = await supabase.from('transactions').insert({
      student_id: studentId,
      student_name: student.name,
      valor: 100,
      forma_pagamento: paymentMethod,
      data_pagamento: getTodayISO(),
    });

    if (txError) {
      showToast('Mensalidade renovada, mas erro ao registrar pagamento: ' + txError.message, 'error');
    } else {
      showToast('Assinatura renovada com sucesso!', 'success');
    }

    await fetchData();
  };

  // DELETE aluno (transações apagadas em cascata via ON DELETE CASCADE)
  const deleteStudent = async (studentId: string): Promise<void> => {
    // Apaga transações manualmente caso ON DELETE CASCADE não esteja ativo
    await supabase.from('transactions').delete().eq('student_id', studentId);

    const { error } = await supabase.from('students').delete().eq('id', studentId);

    if (error) {
      showToast('Erro ao remover aluno: ' + error.message, 'error');
      return;
    }

    showToast('Aluno removido com sucesso!', 'success');
    await fetchData();
  };

  // DELETE transação individual
  const deleteTransaction = async (transactionId: string): Promise<void> => {
    const { error } = await supabase.from('transactions').delete().eq('id', transactionId);

    if (error) {
      showToast('Erro ao apagar pagamento: ' + error.message, 'error');
      return;
    }

    showToast('Registro de pagamento apagado com sucesso!', 'success');
    await fetchData();
  };

  return {
    students,
    transactions,
    loading,
    addStudent,
    renewStudent,
    deleteStudent,
    deleteTransaction,
  };
}
