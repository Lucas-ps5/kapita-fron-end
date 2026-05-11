import * as React from "react";
import { cn } from "@/lib/utils";
import InputError from "@/components/ui/InputError";

type InputProps = {
    className?: string;
    label?: string;
    placeholder?: string;
    type?: string;
    name?: string;
    value?: string;
    error?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    ref?: React.RefObject<HTMLInputElement>;
}

const Input = React.forwardRef(({ className, label, placeholder, type, error, ...props }: InputProps, ref: React.RefObject<HTMLInputElement>) => {
    return (
      <div className="space-y-2">
        <label htmlFor={props.name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{label}</label>
        <input
          type={type}
          id={props.name}
          placeholder={placeholder}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            error && "border-red-500 focus-visible:ring-red-500",
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && <InputError error={error} />}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
