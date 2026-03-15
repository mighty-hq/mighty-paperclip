import React from 'react';
import type { ImageLike } from '../types/image';

export type FormValue = string | number | boolean | string[] | Date | null;
export type FormValues = Record<string, FormValue>;

export interface FormProps {
  actions?: React.ReactNode;
  children?: React.ReactNode;
  navigationTitle?: string;
}

export const FormBase: React.FC<FormProps> = ({ children, actions }) => (
  <form
    data-raycast="Form"
    onSubmit={(e) => e.preventDefault()}
    style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
    {children}
    {actions && <div style={{ marginTop: 8 }}>{actions}</div>}
  </form>
);

export const Description: React.FC<{ title?: string; text: string }> = ({ title, text }) => (
  <div data-raycast="Form.Description">
    {title && <div style={{ fontWeight: 500, marginBottom: 4 }}>{title}</div>}
    <div style={{ fontSize: 13, color: '#888' }}>{text}</div>
  </div>
);

export const Separator: React.FC = () => (
  <hr data-raycast="Form.Separator" style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '8px 0' }} />
);

export const TextField: React.FC<{
  id: string;
  title: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
}> = ({ id, title, placeholder, value, defaultValue, onChange }) => {
  const [internal, setInternal] = React.useState(defaultValue ?? value ?? '');
  const currentValue = value !== undefined ? value : internal;
  return (
    <div data-raycast="Form.TextField">
      <label htmlFor={id} style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>
        {title}
      </label>
      <input
        id={id}
        type="text"
        value={currentValue}
        onChange={(e) => {
          const v = e.target.value;
          if (value === undefined) setInternal(v);
          onChange?.(v);
        }}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: 8,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 4,
          color: 'inherit',
        }}
      />
    </div>
  );
};

export const TextArea: React.FC<{
  id: string;
  title: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
}> = ({ id, title, placeholder, value, defaultValue, onChange }) => {
  const [internal, setInternal] = React.useState(defaultValue ?? value ?? '');
  const currentValue = value !== undefined ? value : internal;
  return (
    <div data-raycast="Form.TextArea">
      <label htmlFor={id} style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>
        {title}
      </label>
      <textarea
        id={id}
        value={currentValue}
        onChange={(e) => {
          const v = e.target.value;
          if (value === undefined) setInternal(v);
          onChange?.(v);
        }}
        placeholder={placeholder}
        rows={4}
        style={{
          width: '100%',
          padding: 8,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 4,
          color: 'inherit',
          resize: 'vertical',
        }}
      />
    </div>
  );
};

export const Checkbox: React.FC<{
  id: string;
  title: string;
  label: string;
  value?: boolean;
  storeValue?: boolean;
  onChange?: (v: boolean) => void;
}> = ({ id, title, label, value = false, storeValue: _storeValue, onChange }) => (
  <div data-raycast="Form.Checkbox" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <input id={id} type="checkbox" checked={value} onChange={(e) => onChange?.(e.target.checked)} />
    <label htmlFor={id}>{label}</label>
  </div>
);

const DropdownBase: React.FC<{
  id: string;
  title: string;
  value?: string;
  onChange?: (v: string) => void;
  children?: React.ReactNode;
}> = ({ id, title, value = '', onChange, children }) => (
  <div data-raycast="Form.Dropdown">
    <label htmlFor={id} style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>
      {title}
    </label>
    <select id={id} value={value} onChange={(e) => onChange?.(e.target.value)} style={{ width: '100%', padding: 8 }}>
      {children}
    </select>
  </div>
);

const DropdownItem: React.FC<{ title: string; value: string }> = ({ title, value }) => (
  <option value={value}>{title}</option>
);
const DropdownSection: React.FC<{ title?: string; children?: React.ReactNode }> = ({ title, children }) => (
  <optgroup label={title ?? ''}>{children}</optgroup>
);

export const Dropdown = Object.assign(DropdownBase, {
  Item: DropdownItem,
  Section: DropdownSection,
});

export const DatePicker: React.FC<{
  id: string;
  title: string;
  value?: Date | null;
  onChange?: (v: Date | null) => void;
  type?: 'date' | 'date_time';
  min?: Date;
  max?: Date;
}> = ({ id, title, value, onChange }) => (
  <div data-raycast="Form.DatePicker">
    <label htmlFor={id} style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>
      {title}
    </label>
    <input
      id={id}
      type="datetime-local"
      value={value ? value.toISOString().slice(0, 16) : ''}
      onChange={(e) => onChange?.(e.target.value ? new Date(e.target.value) : null)}
      style={{ width: '100%', padding: 8 }}
    />
  </div>
);

const TagPickerBase: React.FC<{
  id: string;
  title: string;
  value?: string[];
  onChange?: (v: string[]) => void;
  children?: React.ReactNode;
}> = ({ title, children }) => (
  <div data-raycast="Form.TagPicker">
    <label style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>{title}</label>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{children}</div>
  </div>
);

const TagPickerItem: React.FC<{ title: string; value: string }> = ({ title, value }) => (
  <span key={value} style={{ padding: '2px 6px', fontSize: 11, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>
    {title}
  </span>
);

export const TagPicker = Object.assign(TagPickerBase, { Item: TagPickerItem });

export const PasswordField: React.FC<{
  id: string;
  title: string;
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
}> = ({ id, title, placeholder, value = '', onChange }) => (
  <div data-raycast="Form.PasswordField">
    <label htmlFor={id} style={{ display: 'block', fontSize: 13, marginBottom: 4 }}>
      {title}
    </label>
    <input
      id={id}
      type="password"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      style={{ width: '100%', padding: 8 }}
    />
  </div>
);

export const Link: React.FC<{
  id: string;
  title: string;
  target: string;
  text: string;
}> = ({ title, target, text }) => (
  <div data-raycast="Form.Link">
    <span style={{ fontSize: 13, marginRight: 8 }}>{title}</span>
    <a href={target} target="_blank" rel="noopener noreferrer">
      {text}
    </a>
  </div>
);

const FormWithMembers = Object.assign(FormBase, {
  Description,
  Separator,
  TextField,
  TextArea,
  Checkbox,
  Dropdown,
  DatePicker,
  TagPicker,
  PasswordField,
  Link,
});

export { FormWithMembers as Form };
export default FormWithMembers;
