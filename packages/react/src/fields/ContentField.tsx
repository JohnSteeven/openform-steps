import React from 'react';
import { FieldSchema } from '@openform-steps/core';

interface FieldProps {
  field: FieldSchema;
}

export const ContentField: React.FC<FieldProps> = ({ field }) => {
  return (
    <div className="w-full py-2 my-1 border-b border-slate-100 dark:border-slate-800">
      {field.contentHeading && (
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
          {field.contentHeading}
        </h3>
      )}
      {field.contentText && (
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {field.contentText}
        </p>
      )}
    </div>
  );
};

