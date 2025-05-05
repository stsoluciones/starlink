import React from "react";
import { cn } from "../../lib/utils";

// Crear una función generadora de componentes reutilizables con `forwardRef`
const createCardComponent = (Component, defaultClasses, componentName) => {
  const CardComponent = React.forwardRef(({ className = "", ...props }, ref) => (
    <Component ref={ref} className={cn(defaultClasses, className)} {...props} />
  ));
  
  // Asignar el displayName para facilitar la depuración
  CardComponent.displayName = componentName;
  
  return CardComponent;
};

// Definir los componentes utilizando la función generadora
const Card = createCardComponent("div", "rounded-lg border bg-card text-card-foreground shadow-sm", "Card");
const CardHeader = createCardComponent("div", "flex flex-col space-y-1.5 p-6", "CardHeader");
const CardTitle = createCardComponent("h3", "text-2xl font-semibold leading-none tracking-tight text-primary", "CardTitle");
const CardDescription = createCardComponent("p", "text-sm md:text-base text-muted-foreground", "CardDescription");
const CardContent = createCardComponent("div", "p-2 md:p-6 pt-0", "CardContent");
const CardFooter = createCardComponent("div", "flex items-center p-2 md:p-6 pt-0", "CardFooter");

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
