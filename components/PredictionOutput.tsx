import React from 'react';
import type { Prediction } from '../types';

interface PredictionOutputProps {
    activePrediction: Prediction | null;
    isProcessing: boolean;
    error: string | null;
}

export const PredictionOutput: React.FC<PredictionOutputProps> = ({ activePrediction, isProcessing, error }) => {
    const renderContent = () => {
        if (isProcessing) {
            return <div className="text-gray-400 animate-pulse">Calculando predicciones...</div>;
        }
        if (error) {
            return <div className="text-red-400">{error}</div>;
        }
        if (activePrediction) {
            return (
                <div className="flex flex-col items-center text-center">
                    <span className="text-5xl font-bold text-fuchsia-400 tracking-wider bg-gray-900 px-4 py-2 rounded-lg shadow-lg">
                        {activePrediction.word}
                    </span>
                    <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
                        <div className="bg-fuchsia-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${activePrediction.confidence * 100}%` }}></div>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">Confianza de la predicción: <span className="font-bold text-fuchsia-300">{(activePrediction.confidence * 100).toFixed(2)}%</span></p>
                </div>
            );
        }
        return <div className="text-gray-500">Esperando entrada para analizar...</div>;
    };

    return (
        <div className="w-full p-4 h-40 bg-black border-2 border-dashed border-gray-800 rounded-lg flex items-center justify-center">
            {renderContent()}
        </div>
    );
};