import React, { useState, useCallback } from 'react';
import { InputPrompt } from './components/InputPrompt';
import { ParticleVisualization } from './components/ParticleVisualization';
import { PredictionOutput } from './components/PredictionOutput';
import { predictNextWords } from './services/geminiService';
import type { Prediction } from './types';

const App: React.FC = () => {
    const [inputText, setInputText] = useState<string>('El sol brilla en el');
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [activePrediction, setActivePrediction] = useState<Prediction | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = useCallback(async () => {
        if (!inputText.trim() || isProcessing) return;

        setIsProcessing(true);
        setError(null);
        setPredictions([]);
        setActivePrediction(null);

        try {
            const result: Prediction[] = await predictNextWords(inputText);
            setPredictions(result);
            if (result.length > 0) {
                setActivePrediction(result[0]);
            }
        } catch (err) {
            console.error(err);
            setError('Error al contactar la IA. Por favor, inténtalo de nuevo más tarde.');
        } finally {
            setIsProcessing(false);
        }
    }, [inputText, isProcessing]);
    
    const handlePredictionSelect = useCallback((prediction: Prediction) => {
        setActivePrediction(prediction);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 font-mono">
            <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
                
                {/* Left Panel: Input and Output */}
                <div className="w-full lg:w-1/3 flex flex-col gap-6 z-10">
                    <header className="text-center lg:text-left">
                        <h1 className="text-3xl md:text-4xl font-bold text-fuchsia-500">Medina Neuro Predictor</h1>
                        <p className="text-gray-400 mt-2">Escribe una frase y observa las predicciones de la IA en una simulación de partículas.</p>
                    </header>
                    <InputPrompt 
                        inputText={inputText}
                        setInputText={setInputText}
                        onAnalyze={handleAnalyze}
                        isProcessing={isProcessing}
                    />
                    <PredictionOutput
                        activePrediction={activePrediction}
                        isProcessing={isProcessing}
                        error={error}
                    />
                    {activePrediction?.analysis && !isProcessing && (
                        <div className="w-full p-4 bg-gray-900/70 border border-gray-800 rounded-lg animate-fade-in">
                            <h3 className="text-sm font-bold text-fuchsia-400 mb-2">Análisis de la IA</h3>
                            <p className="text-gray-300 text-sm leading-relaxed">{activePrediction.analysis}</p>
                        </div>
                    )}
                </div>

                {/* Right Panel: Visualization */}
                <div className="w-full lg:w-2/3 h-80 lg:h-[500px] flex items-center justify-center rounded-lg bg-gray-900/50 border border-fuchsia-900/30 overflow-hidden">
                    <ParticleVisualization
                        predictions={predictions}
                        isProcessing={isProcessing}
                        promptText={inputText}
                        activePrediction={activePrediction}
                        onPredictionSelect={handlePredictionSelect}
                    />
                </div>

            </div>
            <footer className="text-gray-600 text-xs mt-8">
                Desarrollado con React, Canvas y Gemini API.
            </footer>
        </div>
    );
};

export default App;