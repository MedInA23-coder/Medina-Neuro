
import React from 'react';

interface InputPromptProps {
    inputText: string;
    setInputText: (text: string) => void;
    onAnalyze: () => void;
    isProcessing: boolean;
}

export const InputPrompt: React.FC<InputPromptProps> = ({ inputText, setInputText, onAnalyze, isProcessing }) => {
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onAnalyze();
        }
    };

    return (
        <div className="w-full">
            <label htmlFor="prompt-input" className="block text-sm font-medium text-gray-400 mb-2">Entrada de Texto</label>
            <textarea
                id="prompt-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe algo aquí..."
                className="w-full h-28 p-3 bg-gray-900 border-2 border-gray-700 rounded-lg focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-all duration-300 resize-none placeholder-gray-500 text-white"
                disabled={isProcessing}
            />
            <button
                onClick={onAnalyze}
                disabled={isProcessing || !inputText.trim()}
                className="w-full mt-4 px-4 py-3 bg-fuchsia-600 text-white font-bold rounded-lg hover:bg-fuchsia-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
            >
                {isProcessing ? (
                    <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Procesando...
                    </>
                ) : (
                    'Predecir Siguiente Palabra'
                )}
            </button>
        </div>
    );
};