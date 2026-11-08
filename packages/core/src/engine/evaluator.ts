import { FieldCondition, FieldConditionRule } from '../schema/types';

function evaluateSingleRule(rule: FieldConditionRule, formValues: Record<string, any>): boolean {
  const actualValue = formValues[rule.fieldId];
  const targetValue = rule.value;

  switch (rule.operator) {
    case 'equals':
      if (typeof actualValue === 'boolean' || typeof targetValue === 'boolean') {
        return Boolean(actualValue) === Boolean(targetValue);
      }
      return String(actualValue ?? '').trim().toLowerCase() === String(targetValue ?? '').trim().toLowerCase();

    case 'not_equals':
      if (typeof actualValue === 'boolean' || typeof targetValue === 'boolean') {
        return Boolean(actualValue) !== Boolean(targetValue);
      }
      return String(actualValue ?? '').trim().toLowerCase() !== String(targetValue ?? '').trim().toLowerCase();

    case 'contains':
      if (Array.isArray(actualValue)) {
        return actualValue.some((v) => String(v).toLowerCase() === String(targetValue).toLowerCase());
      }
      return String(actualValue ?? '')
        .toLowerCase()
        .includes(String(targetValue ?? '').toLowerCase());

    case 'not_contains':
      if (Array.isArray(actualValue)) {
        return !actualValue.some((v) => String(v).toLowerCase() === String(targetValue).toLowerCase());
      }
      return !String(actualValue ?? '')
        .toLowerCase()
        .includes(String(targetValue ?? '').toLowerCase());

    case 'greater_than': {
      const numActual = Number(actualValue);
      const numTarget = Number(targetValue);
      if (!isNaN(numActual) && !isNaN(numTarget)) {
        return numActual > numTarget;
      }
      // Date comparison fallback
      const dateActual = new Date(actualValue).getTime();
      const dateTarget = new Date(targetValue).getTime();
      if (!isNaN(dateActual) && !isNaN(dateTarget)) {
        return dateActual > dateTarget;
      }
      return false;
    }

    case 'less_than': {
      const numActual = Number(actualValue);
      const numTarget = Number(targetValue);
      if (!isNaN(numActual) && !isNaN(numTarget)) {
        return numActual < numTarget;
      }
      const dateActual = new Date(actualValue).getTime();
      const dateTarget = new Date(targetValue).getTime();
      if (!isNaN(dateActual) && !isNaN(dateTarget)) {
        return dateActual < dateTarget;
      }
      return false;
    }

    case 'is_empty':
      if (actualValue === null || actualValue === undefined) return true;
      if (typeof actualValue === 'string') return actualValue.trim() === '';
      if (Array.isArray(actualValue)) return actualValue.length === 0;
      return false;

    case 'is_not_empty':
      if (actualValue === null || actualValue === undefined) return false;
      if (typeof actualValue === 'string') return actualValue.trim() !== '';
      if (Array.isArray(actualValue)) return actualValue.length > 0;
      return true;

    case 'in':
      if (Array.isArray(targetValue)) {
        return targetValue.some((v) => String(v).toLowerCase() === String(actualValue).toLowerCase());
      }
      if (typeof targetValue === 'string') {
        const split = targetValue.split(',').map((s) => s.trim().toLowerCase());
        return split.includes(String(actualValue).toLowerCase());
      }
      return false;

    case 'not_in':
      if (Array.isArray(targetValue)) {
        return !targetValue.some((v) => String(v).toLowerCase() === String(actualValue).toLowerCase());
      }
      if (typeof targetValue === 'string') {
        const split = targetValue.split(',').map((s) => s.trim().toLowerCase());
        return !split.includes(String(actualValue).toLowerCase());
      }
      return true;

    default:
      return true;
  }
}

export function evaluateCondition(
  condition?: FieldCondition,
  formValues: Record<string, any> = {}
): boolean {
  if (!condition || !condition.rules || condition.rules.length === 0) {
    return true;
  }

  const isOr = condition.logicalOperator === 'or';

  if (isOr) {
    return condition.rules.some((rule) => evaluateSingleRule(rule, formValues));
  }

  return condition.rules.every((rule) => evaluateSingleRule(rule, formValues));
}
