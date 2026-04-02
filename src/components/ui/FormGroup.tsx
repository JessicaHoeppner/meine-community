import type { ReactNode, CSSProperties, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

/* ── Label ── */
interface FormLabelProps {
  htmlFor: string;
  children: ReactNode;
  optional?: boolean;
}

function FormLabel({ htmlFor, children, optional }: FormLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      style={{
        display: "block",
        fontFamily: "var(--font-body)",
        fontSize: "var(--text-body-sm)",
        fontWeight: 500,
        color: "var(--color-text)",
        marginBottom: "var(--space-sm)",
      }}
    >
      {children}
      {optional && (
        <span
          style={{
            fontWeight: 400,
            color: "var(--color-text-muted)",
            marginLeft: "4px",
          }}
        >
          (optional)
        </span>
      )}
    </label>
  );
}

/* ── Hilfetext ── */
function HelpText({ children }: { children: ReactNode }) {
  return (
    <p
      style={{
        fontFamily: "var(--font-body)",
        fontSize: "var(--text-caption)",
        color: "var(--color-text-muted)",
        marginTop: "var(--space-xs)",
        lineHeight: 1.5,
      }}
    >
      {children}
    </p>
  );
}

/* ── Fehlermeldung ── */
function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      style={{
        fontFamily: "var(--font-body)",
        fontSize: "var(--text-caption)",
        color: "var(--color-error)",
        marginTop: "var(--space-xs)",
        lineHeight: 1.5,
      }}
    >
      {children}
    </p>
  );
}

/* ── Shared Input Styles ── */
const inputBaseStyle: CSSProperties = {
  width: "100%",
  height: "48px",
  padding: "12px 16px",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--color-border-strong)",
  fontFamily: "var(--font-body)",
  fontSize: "var(--text-button)",
  color: "var(--color-text)",
  backgroundColor: "var(--bg-card)",
  outline: "none",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
};

const inputErrorStyle: CSSProperties = {
  borderColor: "var(--color-error)",
};

/* ── FormGroup Wrapper ── */
interface FormGroupProps {
  children: ReactNode;
  style?: CSSProperties;
}

export default function FormGroup({ children, style }: FormGroupProps) {
  return (
    <div style={{ marginBottom: "var(--space-lg)", ...style }}>
      {children}
    </div>
  );
}

/* ── Input ── */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

function Input({ error, style, ...props }: InputProps) {
  return (
    <input
      style={{
        ...inputBaseStyle,
        ...(error ? inputErrorStyle : {}),
        ...style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "var(--color-primary)";
        e.currentTarget.style.boxShadow = "0 0 0 3px var(--color-focus)";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = error
          ? "var(--color-error)"
          : "var(--color-border-strong)";
        e.currentTarget.style.boxShadow = "none";
        props.onBlur?.(e);
      }}
      {...props}
    />
  );
}

/* ── Textarea ── */
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

function Textarea({ error, style, ...props }: TextareaProps) {
  return (
    <textarea
      style={{
        ...inputBaseStyle,
        height: "auto",
        minHeight: "120px",
        resize: "vertical" as const,
        ...(error ? inputErrorStyle : {}),
        ...style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "var(--color-primary)";
        e.currentTarget.style.boxShadow = "0 0 0 3px var(--color-focus)";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = error
          ? "var(--color-error)"
          : "var(--color-border-strong)";
        e.currentTarget.style.boxShadow = "none";
        props.onBlur?.(e);
      }}
      {...props}
    />
  );
}

/* ── Select ── */
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

function Select({ error, style, children, ...props }: SelectProps) {
  return (
    <select
      style={{
        ...inputBaseStyle,
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23594d46' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 16px center",
        paddingRight: "40px",
        ...(error ? inputErrorStyle : {}),
        ...style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = "var(--color-primary)";
        e.currentTarget.style.boxShadow = "0 0 0 3px var(--color-focus)";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = error
          ? "var(--color-error)"
          : "var(--color-border-strong)";
        e.currentTarget.style.boxShadow = "none";
        props.onBlur?.(e);
      }}
      {...props}
    >
      {children}
    </select>
  );
}

/* ── Exports ── */
FormGroup.Label = FormLabel;
FormGroup.Input = Input;
FormGroup.Textarea = Textarea;
FormGroup.Select = Select;
FormGroup.HelpText = HelpText;
FormGroup.ErrorText = ErrorText;
