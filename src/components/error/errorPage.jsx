// src/pages/ErrorPage.jsx
import React from "react";

export default function ErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Ops! Algo deu errado.</h1>
      <p className="text-lg text-gray-700 mb-6">
        A página que você está tentando acessar não foi encontrada ou ocorreu um erro.
      </p>
      <a
        href="/"
        className="px-6 py-3 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
      >
        Voltar para a página inicial
      </a>
    </div>
  );
}
