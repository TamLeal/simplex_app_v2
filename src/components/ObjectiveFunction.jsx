import React from 'react';

const ObjectiveFunction = ({ objective, setObjective }) => {
  const handleObjectiveChange = (index, field, value) => {
    const newObjective = { ...objective };
    newObjective.z[index][field] =
      field === 'coeff' ? parseFloat(value) : value;
    setObjective(newObjective);
  };

  return (
    <div className="section">
      <h2>Função Objetivo</h2>
      <div className="flex-container">
        <select
          value={objective.type}
          onChange={(e) => setObjective({ ...objective, type: e.target.value })}
          className="select"
        >
          <option value="max">Maximizar</option>
          <option value="min">Minimizar</option>
        </select>
        <span style={{ margin: '0 10px' }}>Z =</span>
        {objective.z.map((term, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <select
                value={term.sign}
                onChange={(e) =>
                  handleObjectiveChange(index, 'sign', e.target.value)
                }
                className="select"
              >
                <option value="+">+</option>
                <option value="-">-</option>
              </select>
            )}
            <input
              type="number"
              value={term.coeff}
              onChange={(e) =>
                handleObjectiveChange(index, 'coeff', e.target.value)
              }
              className="input"
            />
            <span>x{index + 1}</span>
          </React.Fragment>
        ))}
        <button
          onClick={() =>
            setObjective({
              ...objective,
              z: [...objective.z, { coeff: 0, sign: '+' }],
            })
          }
          className="button"
        >
          + Variável
        </button>
      </div>
    </div>
  );
};

export default ObjectiveFunction;
