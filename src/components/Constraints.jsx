import React from 'react';

const Constraints = ({ constraints, setConstraints, objective }) => {
  const handleConstraintChange = (index, type, value, coeffIndex) => {
    const newConstraints = [...constraints];
    if (type === 'coefficients') {
      newConstraints[index].coefficients[coeffIndex][value.field] =
        value.field === 'coeff' ? parseFloat(value.value) : value.value;
    } else {
      newConstraints[index][type] = type === 'rhs' ? parseFloat(value) : value;
    }
    setConstraints(newConstraints);
  };

  const addConstraint = () => {
    setConstraints([
      ...constraints,
      {
        coefficients: objective.z.map(() => ({ coeff: 0, sign: '+' })),
        inequality: '<=',
        rhs: 0,
      },
    ]);
  };

  return (
    <div className="section">
      <h2>Restrições</h2>
      {constraints.map((constraint, index) => (
        <div key={index} className="flex-container">
          {constraint.coefficients.map((coeff, coeffIndex) => (
            <React.Fragment key={coeffIndex}>
              {coeffIndex > 0 && (
                <select
                  value={coeff.sign}
                  onChange={(e) =>
                    handleConstraintChange(
                      index,
                      'coefficients',
                      { field: 'sign', value: e.target.value },
                      coeffIndex
                    )
                  }
                  className="select"
                >
                  <option value="+">+</option>
                  <option value="-">-</option>
                </select>
              )}
              <input
                type="number"
                value={coeff.coeff}
                onChange={(e) =>
                  handleConstraintChange(
                    index,
                    'coefficients',
                    { field: 'coeff', value: e.target.value },
                    coeffIndex
                  )
                }
                className="input"
              />
              <span>x{coeffIndex + 1}</span>
            </React.Fragment>
          ))}
          <select
            value={constraint.inequality}
            onChange={(e) =>
              handleConstraintChange(index, 'inequality', e.target.value)
            }
            className="select"
          >
            <option value="<=">≤</option>
            <option value="=">=</option>
            <option value=">=">≥</option>
          </select>
          <input
            type="number"
            value={constraint.rhs}
            onChange={(e) =>
              handleConstraintChange(index, 'rhs', e.target.value)
            }
            className="input"
          />
        </div>
      ))}
      <button onClick={addConstraint} className="button">
        + Restrição
      </button>
    </div>
  );
};

export default Constraints;
