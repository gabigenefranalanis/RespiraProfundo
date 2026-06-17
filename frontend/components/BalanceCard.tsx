import React from 'react';
import { Membership } from '../types';

interface BalanceCardProps {
  membership: Membership | null;
  reservesCount: number;
  onRenew: () => void;
}

export default function BalanceCard({ membership, reservesCount, onRenew }: BalanceCardProps) {
  return (
    <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-[0_10px_30px_rgba(128,72,123,0.04)] border border-pink-50/50">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Mi Membresía</h2>
      {membership ? (
        <div className="space-y-4">
          <p className="text-gray-600">Plan: <span className="font-semibold text-gray-800">{membership.packageName}</span></p>
          <p className="text-gray-600">Clases restantes: <span className="font-semibold text-gray-800">{membership.clases_restantes}</span></p>
          <p className="text-gray-600">Reservas activas: <span className="font-semibold text-gray-800">{reservesCount}</span></p>
          <p className="text-gray-600">Estado: <span className="font-semibold text-gray-800">{membership.estado}</span></p>
          <button onClick={onRenew} className="mt-4 px-6 py-2 bg-pink-100 hover:bg-pink-200 text-pink-700 rounded-xl font-medium transition-colors">
            Renovar / Cambiar Plan
          </button>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No tienes una membresía activa actualmente.</p>
          <button onClick={onRenew} className="px-6 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-medium transition-colors">
            Adquirir Plan
          </button>
        </div>
      )}
    </div>
  );
}
