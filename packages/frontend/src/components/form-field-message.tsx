type FormFieldMessageProps = {
  error: string | undefined;
  errorId: string;
};

export function FormFieldMessage({ error, errorId }: FormFieldMessageProps) {
  if (!error) {
    // Return empty div to maintain consistent spacing
    return <div className="min-h-7" />;
  }

  return (
    <div className="min-h-7">
      <p
        id={errorId}
        role="alert"
        className="text-sm text-red-600 mt-1 ease-out animate-in fade-in-0"
      >
        {error}
      </p>
    </div>
  );
}
