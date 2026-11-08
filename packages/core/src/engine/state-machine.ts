import { FieldSchema, FormSchema, StepSchema } from '../schema/types';
import { evaluateCondition } from './evaluator';

export interface MultiStepProgress {
  currentStepNumber: number;
  totalActiveSteps: number;
  percentage: number;
  stepTitles: string[];
  activeStepIndices: number[];
}

export function isStepActive(step: StepSchema, formValues: Record<string, any>): boolean {
  if (!step.condition) {
    return true;
  }

  const matches = evaluateCondition(step.condition.condition, formValues);

  if (step.condition.action === 'skip') {
    return !matches;
  }

  if (step.condition.action === 'show') {
    return matches;
  }

  return true;
}

export function getActiveStepIndices(schema: FormSchema, formValues: Record<string, any>): number[] {
  const activeIndices: number[] = [];
  schema.steps.forEach((step, index) => {
    if (isStepActive(step, formValues)) {
      activeIndices.push(index);
    }
  });
  return activeIndices.length > 0 ? activeIndices : [0];
}

export function getNextStepIndex(
  schema: FormSchema,
  currentIndex: number,
  formValues: Record<string, any>
): number | null {
  for (let i = currentIndex + 1; i < schema.steps.length; i++) {
    if (isStepActive(schema.steps[i], formValues)) {
      return i;
    }
  }
  return null; // No next step - at end of form
}

export function getPrevStepIndex(
  schema: FormSchema,
  currentIndex: number,
  visitedIndices: number[],
  formValues: Record<string, any>
): number | null {
  // Check visited history backwards first to preserve the path user took
  for (let i = visitedIndices.length - 1; i >= 0; i--) {
    const candidate = visitedIndices[i];
    if (candidate < currentIndex && isStepActive(schema.steps[candidate], formValues)) {
      return candidate;
    }
  }

  // Fallback: look back sequentially
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (isStepActive(schema.steps[i], formValues)) {
      return i;
    }
  }

  return null; // At first step
}

export function isLastStep(
  schema: FormSchema,
  currentIndex: number,
  formValues: Record<string, any>
): boolean {
  return getNextStepIndex(schema, currentIndex, formValues) === null;
}

export function calculateProgress(
  schema: FormSchema,
  currentIndex: number,
  formValues: Record<string, any>
): MultiStepProgress {
  const activeIndices = getActiveStepIndices(schema, formValues);
  const positionInActive = activeIndices.indexOf(currentIndex);
  const currentStepNumber = positionInActive !== -1 ? positionInActive + 1 : 1;
  const totalActiveSteps = Math.max(activeIndices.length, 1);
  const percentage = Math.round((currentStepNumber / totalActiveSteps) * 100);

  const stepTitles = activeIndices.map((idx) => schema.steps[idx]?.title || `Step ${idx + 1}`);

  return {
    currentStepNumber,
    totalActiveSteps,
    percentage,
    stepTitles,
    activeStepIndices: activeIndices,
  };
}

export function getVisibleFields(
  step: StepSchema,
  formValues: Record<string, any>
): FieldSchema[] {
  return step.fields.filter((field) => {
    if (!field.visibilityCondition) return true;
    return evaluateCondition(field.visibilityCondition, formValues);
  });
}
