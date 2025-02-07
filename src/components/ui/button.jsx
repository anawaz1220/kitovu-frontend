import * as React from 'react';

const Button = React.forwardRef(({ 
  className,
  variant = "default",
  size = "default",
  type = "button",
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  
  const variants = {
    default: "bg-kitovu-purple text-white hover:bg-kitovu-purple/90",
    outline: "border border-input hover:bg-accent hover:text-accent-foreground",
  };

  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3",
    lg: "h-11 px-8",
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      ref={ref}
      {...props}
    />
  );
});

export { Button };