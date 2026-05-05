function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL;

export type FinanceMonthParams = { year: number; month: number };

function monthQuery(params: FinanceMonthParams) {
  return `year=${params.year}&month=${params.month}`;
}

export type IncomeCategory = {
  id: string;
  userId: string;
  name: string;
};

export type ExpenseCategory = {
  id: string;
  userId: string;
  name: string;
};

export type FinanceIncomeLine = {
  id: string;
  userId: string;
  categoryId: string;
  categoryName?: string;
  amount: number;
  receivedAt: string;
  notes: string;
  label?: string;
  isRecurring?: boolean;
  recurringRuleId?: string;
  received?: boolean;
};

export type FinanceExpense = {
  id: string;
  userId: string;
  categoryId: string;
  categoryName?: string;
  amount: number;
  occurredAt: string;
  notes: string;
  label?: string;
  isRecurring?: boolean;
  recurringRuleId?: string;
  paid?: boolean;
};

export type FinanceRecurringRule = {
  id: string;
  userId: string;
  categoryId: string;
  categoryName?: string;
  amount: number;
  dayOfMonth: number;
  label: string;
  notes: string;
  isActive: boolean;
};

export type FinanceLiquiditySnapshot = {
  currency: "COP";
  total: number;
  accounts: { label: string; amount: number }[];
};

export type FinanceSummary = {
  year: number;
  month: number;
  currency: "COP";
  income: number;
  incomeBreakdown: { categoryId: string; categoryName: string; total: number }[];
  incomes: FinanceIncomeLine[];
  totalExpenses: number;
  expenseBreakdown: { categoryId: string; categoryName: string; total: number }[];
  expenses: FinanceExpense[];
  remaining: number;
  liquidity: FinanceLiquiditySnapshot;
};

export async function putFinanceLiquidity(data: {
  accounts: { label: string; amount: number }[];
}): Promise<FinanceLiquiditySnapshot> {
  const res = await fetch(`${BASE}/finance/liquidity`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message[0] : err.message;
    throw new Error(message || "Error al guardar saldos");
  }
  return res.json();
}

export async function getFinanceSummary(
  params: FinanceMonthParams
): Promise<FinanceSummary> {
  const res = await fetch(`${BASE}/finance/summary?${monthQuery(params)}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al cargar resumen");
  const data = await res.json();
  return {
    ...data,
    liquidity: data.liquidity ?? {
      currency: "COP" as const,
      total: 0,
      accounts: [],
    },
  };
}

export async function listIncomeCategories(): Promise<IncomeCategory[]> {
  const res = await fetch(`${BASE}/finance/income-categories`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al cargar categorías de ingreso");
  return res.json();
}

export async function createIncomeCategory(name: string): Promise<IncomeCategory> {
  const res = await fetch(`${BASE}/finance/income-categories`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message[0] : err.message;
    throw new Error(message || "Error al crear categoría de ingreso");
  }
  return res.json();
}

export async function updateIncomeCategory(
  id: string,
  name: string
): Promise<IncomeCategory> {
  const res = await fetch(`${BASE}/finance/income-categories/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message[0] : err.message;
    throw new Error(message || "Error al actualizar categoría");
  }
  return res.json();
}

export async function deleteIncomeCategory(id: string): Promise<void> {
  const res = await fetch(`${BASE}/finance/income-categories/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message[0] : err.message;
    throw new Error(message || "Error al eliminar categoría");
  }
}

export async function createFinanceIncome(data: {
  categoryId: string;
  amount: number;
  receivedAt: string;
  notes?: string;
}): Promise<FinanceIncomeLine> {
  const res = await fetch(`${BASE}/finance/incomes`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message[0] : err.message;
    throw new Error(message || "Error al registrar ingreso");
  }
  return res.json();
}

export async function updateFinanceIncome(
  id: string,
  data: {
    categoryId?: string;
    amount?: number;
    receivedAt?: string;
    notes?: string;
    received?: boolean;
  },
  monthForRecurring?: FinanceMonthParams
): Promise<FinanceIncomeLine> {
  const isRecurring = id.startsWith("recurring-income:");
  const q =
    isRecurring && monthForRecurring
      ? `?${monthQuery(monthForRecurring)}`
      : "";
  const res = await fetch(
    `${BASE}/finance/incomes/${encodeURIComponent(id)}${q}`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message[0] : err.message;
    throw new Error(message || "Error al actualizar ingreso");
  }
  return res.json();
}

export async function deleteFinanceIncome(id: string): Promise<void> {
  const res = await fetch(`${BASE}/finance/incomes/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message[0] : err.message;
    throw new Error(message || "Error al eliminar ingreso");
  }
}

export async function listExpenseCategories(): Promise<ExpenseCategory[]> {
  const res = await fetch(`${BASE}/finance/categories`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al cargar categorías");
  return res.json();
}

export async function createExpenseCategory(name: string): Promise<ExpenseCategory> {
  const res = await fetch(`${BASE}/finance/categories`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message[0] : err.message;
    throw new Error(message || "Error al crear categoría");
  }
  return res.json();
}

export async function updateExpenseCategory(
  id: string,
  name: string
): Promise<ExpenseCategory> {
  const res = await fetch(`${BASE}/finance/categories/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message[0] : err.message;
    throw new Error(message || "Error al actualizar categoría");
  }
  return res.json();
}

export async function deleteExpenseCategory(id: string): Promise<void> {
  const res = await fetch(`${BASE}/finance/categories/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message[0] : err.message;
    throw new Error(message || "Error al eliminar categoría");
  }
}

export async function listFinanceExpenses(
  params: FinanceMonthParams
): Promise<FinanceExpense[]> {
  const res = await fetch(`${BASE}/finance/expenses?${monthQuery(params)}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al cargar gastos");
  return res.json();
}

export async function createFinanceExpense(data: {
  categoryId: string;
  amount: number;
  occurredAt: string;
  notes?: string;
}): Promise<FinanceExpense> {
  const res = await fetch(`${BASE}/finance/expenses`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message[0] : err.message;
    throw new Error(message || "Error al registrar gasto");
  }
  return res.json();
}

export async function updateFinanceExpense(
  id: string,
  data: {
    categoryId?: string;
    amount?: number;
    occurredAt?: string;
    notes?: string;
    paid?: boolean;
  },
  monthForRecurring?: FinanceMonthParams
): Promise<FinanceExpense> {
  const isRecurring = id.startsWith("recurring:");
  const q =
    isRecurring && monthForRecurring
      ? `?${monthQuery(monthForRecurring)}`
      : "";
  const res = await fetch(
    `${BASE}/finance/expenses/${encodeURIComponent(id)}${q}`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message[0] : err.message;
    throw new Error(message || "Error al actualizar gasto");
  }
  return res.json();
}

export async function deleteFinanceExpense(id: string): Promise<void> {
  const res = await fetch(`${BASE}/finance/expenses/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message[0] : err.message;
    throw new Error(message || "Error al eliminar gasto");
  }
}

export async function listRecurringExpenses(): Promise<FinanceRecurringRule[]> {
  const res = await fetch(`${BASE}/finance/recurring-expenses`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al cargar gastos recurrentes");
  return res.json();
}

export async function createRecurringExpense(data: {
  categoryId: string;
  amount: number;
  dayOfMonth: number;
  label?: string;
  notes?: string;
  isActive?: boolean;
}): Promise<FinanceRecurringRule> {
  const res = await fetch(`${BASE}/finance/recurring-expenses`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message[0] : err.message;
    throw new Error(message || "Error al crear gasto recurrente");
  }
  return res.json();
}

export async function updateRecurringExpense(
  id: string,
  data: {
    categoryId?: string;
    amount?: number;
    dayOfMonth?: number;
    label?: string;
    notes?: string;
    isActive?: boolean;
  }
): Promise<FinanceRecurringRule> {
  const res = await fetch(`${BASE}/finance/recurring-expenses/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message[0] : err.message;
    throw new Error(message || "Error al actualizar gasto recurrente");
  }
  return res.json();
}

export async function deleteRecurringExpense(id: string): Promise<void> {
  const res = await fetch(`${BASE}/finance/recurring-expenses/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message[0] : err.message;
    throw new Error(message || "Error al eliminar regla");
  }
}

export async function listRecurringIncomes(): Promise<FinanceRecurringRule[]> {
  const res = await fetch(`${BASE}/finance/recurring-incomes`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Error al cargar ingresos recurrentes");
  return res.json();
}

export async function createRecurringIncome(data: {
  categoryId: string;
  amount: number;
  dayOfMonth: number;
  label?: string;
  notes?: string;
  isActive?: boolean;
}): Promise<FinanceRecurringRule> {
  const res = await fetch(`${BASE}/finance/recurring-incomes`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message[0] : err.message;
    throw new Error(message || "Error al crear ingreso recurrente");
  }
  return res.json();
}

export async function updateRecurringIncome(
  id: string,
  data: {
    categoryId?: string;
    amount?: number;
    dayOfMonth?: number;
    label?: string;
    notes?: string;
    isActive?: boolean;
  }
): Promise<FinanceRecurringRule> {
  const res = await fetch(`${BASE}/finance/recurring-incomes/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message[0] : err.message;
    throw new Error(message || "Error al actualizar ingreso recurrente");
  }
  return res.json();
}

export async function deleteRecurringIncome(id: string): Promise<void> {
  const res = await fetch(`${BASE}/finance/recurring-incomes/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = Array.isArray(err.message) ? err.message[0] : err.message;
    throw new Error(message || "Error al eliminar regla");
  }
}

export function formatCop(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}
