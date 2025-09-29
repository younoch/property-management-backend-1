export enum ExpenseCategory {
  REPAIRS = 'repairs',
  UTILITIES = 'utilities',
  TAX = 'tax',
  INSURANCE = 'insurance',
  MAINTENANCE = 'maintenance',
  OTHER = 'other'
}

// Map enum values to display names
const expenseCategoryDisplayNames: Record<ExpenseCategory, string> = {
  [ExpenseCategory.REPAIRS]: 'Repairs',
  [ExpenseCategory.UTILITIES]: 'Utilities',
  [ExpenseCategory.TAX]: 'Tax',
  [ExpenseCategory.INSURANCE]: 'Insurance',
  [ExpenseCategory.MAINTENANCE]: 'Maintenance',
  [ExpenseCategory.OTHER]: 'Other'
};

// Map enum values to icons
const expenseCategoryIcons: Record<ExpenseCategory, string> = {
  [ExpenseCategory.REPAIRS]: 'i-heroicons-wrench-screwdriver',
  [ExpenseCategory.UTILITIES]: 'i-heroicons-bolt',
  [ExpenseCategory.TAX]: 'i-heroicons-document-text',
  [ExpenseCategory.INSURANCE]: 'i-heroicons-shield-check',
  [ExpenseCategory.MAINTENANCE]: 'i-heroicons-wrench',
  [ExpenseCategory.OTHER]: 'i-heroicons-ellipsis-horizontal'
};

export const EXPENSE_CATEGORIES = Object.values(ExpenseCategory);

export function getExpenseCategoryLabel(category: ExpenseCategory): string {
  return expenseCategoryDisplayNames[category] || 'Unknown';
}

export function getExpenseCategoryIcon(category: ExpenseCategory): string {
  return expenseCategoryIcons[category] || 'i-heroicons-question-mark-circle';
}

export function getExpenseCategoryOptions() {
  return EXPENSE_CATEGORIES.map(category => ({
    value: category,
    label: getExpenseCategoryLabel(category),
    icon: getExpenseCategoryIcon(category)
  }));
}
