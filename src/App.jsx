import React, { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { solveSimplexProblem, extractSolution, generateGraphPoints } from './simplexLogic.js';
import ObjectiveFunction from './components/ObjectiveFunction.jsx';
import Constraints from './components/Constraints.jsx';
import Solution from './components/Solution.jsx';
import './App.css';

const App = () => {
  const [objective, setObjective] = useState({ z: [{coeff: 3, sign: '+'}, {coeff: 2, sign: '+'}], type: 'max' });
  const [constraints, setConstraints] = useState([
    { coefficients: [{coeff: 2, sign: '+'}, {coeff: 1, sign: '+'}], inequality: '<=', rhs: 8 },
    { coefficients: [{coeff: 1, sign: '+'}, {coeff: 3, sign: '+'}], inequality: '<=', rhs: 15 },
  ]);
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [solution, setSolution] = useState(null);

  const solve = () => {
    const solutionSteps = solveSimplexProblem(objective, constraints);
    setSteps(solutionSteps);
    setCurrentStep(0);
    const finalTableau = solutionSteps[solutionSteps.length - 1].tableau;
    setSolution(extractSolution(finalTableau, objective.z.length));
  };

  return (
    <div className="container">
      <h1 className="header">Algoritmo Simplex</h1>
      
      <ObjectiveFunction objective={objective} setObjective={setObjective} />
      <Constraints constraints={constraints} setConstraints={setConstraints} objective={objective} />

      <button onClick={solve} className="solve-button">Resolver</button>

      {steps.length > 0 && (
        <Solution 
          steps={steps}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          solution={solution}
          objective={objective}
        />
      )}

      {solution && (
        <div>
          <h3>Visualização Gráfica da Solução</h3>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid />
              <XAxis type="number" dataKey="x" name="X" />
              <YAxis type="number" dataKey="y" name="Y" />
              <ZAxis type="category" dataKey="id" name="Constraint" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name="Restrições" data={generateGraphPoints(constraints, solution, objective)} fill="#8884d8" />
              <Scatter name="Solução Ótima" data={[{ x: solution.variables[0], y: solution.variables[1], id: 'solution' }]} fill="#ff7300" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default App;