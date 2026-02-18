import React from "react";

export const ResponsiveFormExample = () => {
  return (
    <form className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Nombre</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Correo</label>
          <input
            type="email"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            placeholder="email@ejemplo.com"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Mensaje</label>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          rows={4}
        ></textarea>
      </div>
      <button className="btn btn-primary h-12 w-full sm:w-auto">Enviar</button>
    </form>
  );
};
