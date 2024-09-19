export const solveSimplexProblem = (objective, constraints) => {
  const tableau = createInitialTableau(objective, constraints);
  const steps = [
    { tableau: tableau, explanation: 'Tableau inicial criado.', changes: [] },
  ];

  while (!isOptimal(tableau)) {
    const pivotColumn = findPivotColumn(tableau);
    if (pivotColumn === -1) {
      steps.push({
        tableau: tableau,
        explanation: 'Solução ótima encontrada.',
        changes: ['Todos os valores na linha Z são não-negativos.'],
      });
      break;
    }
    const pivotRow = findPivotRow(tableau, pivotColumn);

    if (pivotRow === -1) {
      steps.push({
        tableau: tableau,
        explanation: 'O problema não tem solução limitada.',
        changes: ['Não foi possível encontrar uma linha pivô válida.'],
      });
      break;
    }

    const oldTableau = tableau.map((row) => [...row]);
    pivot(tableau, pivotRow, pivotColumn);
    const changes = detectChanges(oldTableau, tableau);

    steps.push({
      tableau: tableau,
      explanation: `Pivô realizado na linha ${pivotRow + 1}, coluna ${
        pivotColumn + 1
      }.`,
      changes: changes,
    });
  }

  return steps;
};

const createInitialTableau = (objective, constraints) => {
  const numVariables = objective.z.length;
  const numConstraints = constraints.length;
  const tableau = [];

  // Adiciona as restrições ao tableau
  for (let i = 0; i < numConstraints; i++) {
    const row = constraints[i].coefficients.map((c) =>
      c.sign === '+' ? c.coeff : -c.coeff
    );
    // Adiciona variáveis de folga
    for (let j = 0; j < numConstraints; j++) {
      row.push(i === j ? (constraints[i].inequality === '>=' ? -1 : 1) : 0);
    }
    row.push(constraints[i].rhs);
    tableau.push(row);
  }

  // Adiciona a função objetivo
  const objectiveRow = objective.z.map((c) =>
    objective.type === 'max'
      ? -c.coeff * (c.sign === '+' ? 1 : -1)
      : c.coeff * (c.sign === '+' ? 1 : -1)
  );
  objectiveRow.push(...Array(numConstraints).fill(0), 0);
  tableau.push(objectiveRow);

  return tableau;
};

const isOptimal = (tableau) => {
  return tableau[tableau.length - 1].slice(0, -1).every((val) => val >= -1e-10); // Usa uma pequena tolerância para evitar problemas de precisão de ponto flutuante
};

const findPivotColumn = (tableau) => {
  const lastRow = tableau[tableau.length - 1];
  return lastRow.slice(0, -1).findIndex((val) => val < -1e-10); // Usa uma pequena tolerância
};

const findPivotRow = (tableau, pivotColumn) => {
  let minRatio = Infinity;
  let pivotRow = -1;
  for (let i = 0; i < tableau.length - 1; i++) {
    if (tableau[i][pivotColumn] > 1e-10) {
      // Usa uma pequena tolerância
      const ratio = tableau[i][tableau[i].length - 1] / tableau[i][pivotColumn];
      if (ratio < minRatio && ratio >= 0) {
        minRatio = ratio;
        pivotRow = i;
      }
    }
  }
  return pivotRow;
};

const pivot = (tableau, pivotRow, pivotColumn) => {
  const pivotValue = tableau[pivotRow][pivotColumn];
  for (let i = 0; i < tableau.length; i++) {
    if (i !== pivotRow) {
      const factor = tableau[i][pivotColumn] / pivotValue;
      for (let j = 0; j < tableau[i].length; j++) {
        tableau[i][j] = parseFloat(
          (tableau[i][j] - factor * tableau[pivotRow][j]).toFixed(10)
        );
      }
    }
  }
  for (let j = 0; j < tableau[pivotRow].length; j++) {
    tableau[pivotRow][j] = parseFloat(
      (tableau[pivotRow][j] / pivotValue).toFixed(10)
    );
  }
};

const detectChanges = (oldTableau, newTableau) => {
  const changes = [];
  for (let i = 0; i < oldTableau.length; i++) {
    for (let j = 0; j < oldTableau[i].length; j++) {
      if (Math.abs(oldTableau[i][j] - newTableau[i][j]) > 1e-10) {
        const rowName = i === oldTableau.length - 1 ? 'Z' : `x${i + 1}`;
        const colName =
          j < oldTableau[0].length - 1
            ? j < oldTableau[0].length - oldTableau.length
              ? `x${j + 1}`
              : `s${j - oldTableau[0].length + oldTableau.length + 1}`
            : 'RHS';
        changes.push(
          `${rowName}, ${colName}: ${oldTableau[i][j].toFixed(
            4
          )} → ${newTableau[i][j].toFixed(4)}`
        );
      }
    }
  }
  return changes;
};

export const extractSolution = (tableau, numVariables) => {
  const solution = Array(numVariables).fill(0);
  for (let i = 0; i < tableau.length - 1; i++) {
    const basicVar = tableau[i]
      .slice(0, numVariables)
      .findIndex((val) => Math.abs(val - 1) < 1e-6);
    if (basicVar !== -1) {
      solution[basicVar] = parseFloat(
        tableau[i][tableau[i].length - 1].toFixed(4)
      );
    }
  }
  const objectiveValue = Math.abs(
    parseFloat(tableau[tableau.length - 1][tableau[0].length - 1].toFixed(4))
  );
  return { variables: solution, objectiveValue };
};

export const generateGraphPoints = (constraints, solution, objective) => {
  if (!solution) return [];

  const points = [];
  const xMax = Math.max(solution.variables[0] * 1.5, 10);
  const yMax = Math.max(solution.variables[1] * 1.5, 10);

  // Gera pontos para as restrições
  for (let x = 0; x <= xMax; x += 0.1) {
    constraints.forEach((constraint, index) => {
      const [a, b] = constraint.coefficients;
      const y =
        (constraint.rhs - a.coeff * x * (a.sign === '+' ? 1 : -1)) /
        (b.coeff * (b.sign === '+' ? 1 : -1));
      if (y >= 0 && y <= yMax) {
        points.push({ x, y, id: `c${index}` });
      }
    });
  }

  // Gera pontos para a função objetivo
  const [c1, c2] = objective.z;
  for (let x = 0; x <= xMax; x += 0.1) {
    const y =
      (solution.objectiveValue - c1.coeff * x * (c1.sign === '+' ? 1 : -1)) /
      (c2.coeff * (c2.sign === '+' ? 1 : -1));
    if (y >= 0 && y <= yMax) {
      points.push({ x, y, id: 'objective' });
    }
  }

  // Adiciona o ponto de solução ótima
  points.push({
    x: solution.variables[0],
    y: solution.variables[1],
    id: 'solution',
  });

  return points;
};
