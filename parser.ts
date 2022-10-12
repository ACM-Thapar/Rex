/**
 * Inserts a '.' wherever there needs to be a concat operation
 * @param exp string
 * @returns string with concat inserted
 */
export const insertConcatOperator = (exp: string): string => {
  let output = "";
  for (let i = 0; i < exp.length; i++) {
    const token = exp[i];
    output = output + token;

    if (token === "(" || token === "|") {
      continue;
    }

    if (i < exp.length - 1) {
      let lookahead = exp[i + 1];

      if (lookahead === "*" || lookahead === "|" || lookahead === ")") {
        continue;
      }

      output = output + ".";
    }
  }

  return output;
};

const peek = (stack: any[]) => {
  return stack.length && stack[stack.length - 1];
};

const operatorPrecedence = {
  "|": 0,
  ".": 1,
  "*": 2,
};

/**
 * Converts an expression into postfix
 * @param exp string
 * @returns string in postfix order
 */
export const toPostFix = (exp: string) => {
  let output = "";
  const operatorStack = [];

  for (const token of exp) {
    if (token === "." || token === "|" || token === "*") {
      while (
        operatorStack.length &&
        peek(operatorStack) !== "(" &&
        operatorPrecedence[
          peek(operatorStack) as keyof typeof operatorPrecedence
        ] >= operatorPrecedence[token]
      ) {
        output += operatorStack.pop();
      }

      operatorStack.push(token);
    } else if (token === "(" || token === ")") {
      if (token == "(") {
        operatorStack.push(token);
      } else {
        while (peek(operatorStack) !== "(") {
          output += operatorStack.pop();
        }
        operatorStack.pop();
      }
    } else {
      output += token;
    }
  }

  while (operatorStack.length) {
    output += operatorStack.pop();
  }

  return output;
};
