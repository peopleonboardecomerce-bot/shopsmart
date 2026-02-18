import React from "react";

// ejemplo de grid responsive usando Tailwind
export const ResponsiveGridExample = () => {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-xl font-bold mb-4">Productos destacados</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow p-4 flex flex-col h-full"
          >
            <div className="h-32 bg-gray-200 mb-2"></div>
            <h3 className="text-sm font-medium truncate">Nombre del producto {i + 1}</h3>
            <p className="text-xs text-muted-foreground flex-1">
              Descripción corta o precio aquí
            </p>
            <button className="mt-2 btn btn-primary w-full h-10">Comprar</button>
          </div>
        ))}
      </div>
    </div>
  );
};
