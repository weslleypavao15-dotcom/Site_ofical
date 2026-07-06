export type PaymentMethod = "💠 Pix" | "💵 Dinheiro" | "💳 Cartão de Crédito" | "💳 Cartão de Débito";

export type Student = {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  plan: "Plano Mensal – R$ 100,00";
  enrollmentDate: string; // ISO date YYYY-MM-DD  →  data_matricula no Supabase
  dueDate: string;        // ISO date YYYY-MM-DD  →  data_vencimento no Supabase
  status: "Em Dia" | "Atrasado";
  // paymentMethod não existe na tabela students; fica exclusivamente em transactions
};

export type Transaction = {
  id: string;
  studentId: string;      // student_id no Supabase
  studentName: string;    // student_name no Supabase
  amount: number;         // valor no Supabase
  paymentMethod: PaymentMethod; // forma_pagamento no Supabase
  date: string;           // data_pagamento no Supabase (ISO YYYY-MM-DD)
};
