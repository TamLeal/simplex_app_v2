import React from 'react';

const Solution = ({ steps, currentStep, setCurrentStep, solution, objective }) => {
  const getCurrentTableau = () => steps[currentStep].tableau;
  const getPreviousTableau = () => currentStep > 0 ? steps[currentStep - 1].tableau : null;

  const renderCell = (value, rowIndex, colIndex) => {
    const previousTableau = getPreviousTableau();
    const isChanged = previousTableau && Math.abs(value - previousTableau[rowIndex][colIndex]) > 1e-10;
    
    const cellStyle = {
      position: 'relative',
      textAlign: 'center',
      padding: '10px',
    };

    const currentValueStyle = {
      fontSize: '16px',
      fontWeight: 'bold',
    };

    const oldValueStyle = {
      position: 'absolute',
      top: '2px',
      left: '2px',
      fontSize: '10px',
      color: '#666',
    };
    
    return (
      <td key={colIndex} className={isChanged ? "changed" : ""} style={cellStyle}>
        {isChanged && <span style={oldValueStyle}>{previousTableau[rowIndex][colIndex].toFixed(2)}</span>}
        <span style={currentValueStyle}>{value.toFixed(2)}</span>
      </td>
    );
  };

  return (
    <div>
      <h2>Solução Passo a Passo</h2>
      <div className="flex-container">
        <button 
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} 
          className="button" 
          disabled={currentStep === 0}
        >
          Anterior
        </button>
        <span style={{ margin: '0 10px' }}>Passo {currentStep + 1} de {steps.length}</span>
        <button 
          onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))} 
          className="button" 
          disabled={currentStep === steps.length - 1}
        >
          Próximo
        </button>
      </div>
      
      <table className="table">
        <thead>
          <tr>
            <th>Base</th>
            {getCurrentTableau()[0].slice(0, -1).map((_, index) => (
              <th key={index}>
                {index < objective.z.length ? `x${index + 1}` : `s${index - objective.z.length + 1}`}
              </th>
            ))}
            <th>RHS</th>
          </tr>
        </thead>
        <tbody>
          {getCurrentTableau().map((row, rowIndex) => (
            <tr key={rowIndex}>
              <td>{rowIndex === getCurrentTableau().length - 1 ? 'Z' : `x${rowIndex + 1}`}</td>
              {row.map((cell, cellIndex) => renderCell(cell, rowIndex, cellIndex))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="explanation">
        <h3>Explicação do Passo</h3>
        <p>{steps[currentStep].explanation}</p>
        {currentStep > 0 && (
          <div>
            <h4>Mudanças neste passo:</h4>
            <ul>
              {steps[currentStep].changes && steps[currentStep].changes.map((change, index) => (
                <li key={index}>{change}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {solution && currentStep === steps.length - 1 && (
        <div>
          <h2>Solução Final</h2>
          <p>Valor ótimo de Z: {solution.objectiveValue.toFixed(2)}</p>
          {solution.variables.map((value, index) => (
            <p key={index}>x{index + 1} = {value.toFixed(2)}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default Solution;