import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Calculator } from './types';

interface CalculatorPageProps {
  calculators: Calculator[];
}

export const CalculatorPage: React.FC<CalculatorPageProps> = ({ calculators }) => {
  const { calculatorId } = useParams();
  
  const calculator = calculators.find(calc => calc.id === calculatorId);
  
  if (!calculator) {
    return <Navigate to="/tools" replace />;
  }

  // For now, return a simple message. Later, we can render the actual calculator component
  return (
    <div>
      <h2>{calculator.title}</h2>
      <p>{calculator.description}</p>
    </div>
  );
};
