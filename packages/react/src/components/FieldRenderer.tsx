import React from 'react';
import { FieldSchema } from '@openform-steps/core';
import { useFormContext } from '../context/FormContext';
import { TextField } from '../fields/TextField';
import { TextareaField } from '../fields/TextareaField';
import { DropdownField } from '../fields/DropdownField';
import { RadioField } from '../fields/RadioField';
import { CheckboxField } from '../fields/CheckboxField';
import { RatingField } from '../fields/RatingField';
import { ConsentField } from '../fields/ConsentField';
import { ContentField } from '../fields/ContentField';

interface FieldRendererProps {
  field: FieldSchema;
}

export const FieldRenderer: React.FC<FieldRendererProps> = React.memo(({ field }) => {
  const { values, errors, touched, setFieldValue, setFieldTouched, disabled, customFields } = useFormContext();

  const value = values[field.id];
  const error = touched[field.id] ? errors[field.id] : undefined;

  const handleChange = (newVal: any) => {
    setFieldValue(field.id, newVal);
  };

  const handleBlur = () => {
    setFieldTouched(field.id, true);
  };

  // Check custom field registry first
  if (customFields && customFields[field.type]) {
    const CustomComponent = customFields[field.type];
    return (
      <CustomComponent
        field={field}
        value={value}
        error={error}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
      />
    );
  }

  switch (field.type) {
    case 'text':
    case 'email':
    case 'number':
    case 'phone':
    case 'date':
      return (
        <TextField
          field={field}
          value={value}
          error={error}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
        />
      );

    case 'textarea':
      return (
        <TextareaField
          field={field}
          value={value}
          error={error}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
        />
      );

    case 'dropdown':
      return (
        <DropdownField
          field={field}
          value={value}
          error={error}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
        />
      );

    case 'radio':
      return (
        <RadioField
          field={field}
          value={value}
          error={error}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
        />
      );

    case 'checkbox':
      return (
        <CheckboxField
          field={field}
          value={value}
          error={error}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
        />
      );

    case 'rating':
      return (
        <RatingField
          field={field}
          value={value}
          error={error}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
        />
      );

    case 'consent':
      return (
        <ConsentField
          field={field}
          value={value}
          error={error}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
        />
      );

    case 'content':
      return <ContentField field={field} />;

    default:
      return (
        <TextField
          field={field}
          value={value}
          error={error}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
        />
      );
  }
});

