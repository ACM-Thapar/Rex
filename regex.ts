import { toNFA } from "./nfa";
import { insertConcatOperator, toPostFix } from "./parser";

const createMatcher = (exp: string) => {
  const expWithConcatenationOperator = insertConcatOperator(exp);
  const postfixExp = toPostFix(expWithConcatenationOperator);
  const nfa = toNFA(postfixExp);
};
