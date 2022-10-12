export interface IState {
  isEnd: boolean;
  transition: Object;
  epsilonTransition: IState[];
}

export interface INfa {
  start: IState;
  end: IState;
}

/**
 * State in Thompson's NFA can either have 
   - a single symbol transition to a state
    or
   - up to two epsilon transitions to another states
  but not both.   
 */
function createState(isEnd: boolean): IState {
  return {
    isEnd,
    transition: {},
    epsilonTransition: [],
  };
}

function addEpsilonTransition(from: IState, to: IState): void {
  from.epsilonTransition.push(to);
}

/**
 *   Thompson's NFA state can have only one transition to another state for a given symbol.
 */
function addTransition(from: IState, to: IState, symbol: string): void {
  // @ts-ignore
  from.transition[symbol] = to;
}

/**
 * Construct an NFA that recognizes only the empty string.
 * @returns start and end state
 */
function fromEpsilon(): INfa {
  const start = createState(false);
  const end = createState(true);
  addEpsilonTransition(start, end);

  return { start, end };
}

/**
 *  Construct an NFA that recognizes only a single character string.
 * @param symbol string
 * @returns
 */
function fromSymbol(symbol: string): INfa {
  const start = createState(false);
  const end = createState(true);
  addTransition(start, end, symbol);

  return { start, end };
}

/**
 * Concatenating two NFA's
 * @param first - Starting NFA
 * @param second - Ending NFA
 * @returns Concatenated NFA
 */
function concat(first: INfa, second: INfa): INfa {
  addEpsilonTransition(first.end, second.start);
  first.end.isEnd = false;

  return {
    start: first.start,
    end: second.end,
  };
}

/**
 * Union of two NFAs
 * @param first
 * @param second
 * @returns Unionized NFA
 */
function union(first: INfa, second: INfa): INfa {
  const start = createState(false);
  addEpsilonTransition(start, first.start);
  addEpsilonTransition(start, second.start);

  const end = createState(true);

  addEpsilonTransition(first.end, end);
  first.end.isEnd = false;
  addEpsilonTransition(second.end, end);
  second.end.isEnd = false;

  return {
    start,
    end,
  };
}

/**
 * Kleene Closure
 * @param first NFA
 * @returns NFA
 */
function closure(first: INfa) {
  const start = createState(false);
  const end = createState(true);

  addEpsilonTransition(start, end);
  addEpsilonTransition(start, first.start);

  addEpsilonTransition(first.end, end);
  addEpsilonTransition(first.end, first.start);

  first.end.isEnd = false;

  return {
    start,
    end,
  };
}

/**
 * Converts a postfix regular expression into a Thompson NFA
 * @param postFixExp string
 * @returns NFA
 */
export function toNFA(postFixExp: string): INfa {
  if (postFixExp === "") {
    return fromEpsilon();
  }

  const stack: any[] = [];

  for (const token of postFixExp) {
    if (token === "*") {
      stack.push(closure(stack.pop()));
    } else if (token === "|") {
      const right = stack.pop();
      const left = stack.pop();
      stack.push(union(left, right));
    } else if (token === ".") {
      const right = stack.pop();
      const left = stack.pop();
      stack.push(concat(left, right));
    } else {
      stack.push(fromSymbol(token));
    }
  }

  return stack.pop();
}

/*
  Process a string through an NFA by recurisively (depth-first) traversing all the possible paths until finding a matching one.
  
  The NFA has N states, from each state it can go to at most N possible states, yet there might be at most 2^N possible paths, 
  therefore, worst case it'll end up going through all of them until it finds a match (or not), resulting in very slow runtimes.
*/
export function recursiveBacktrackingSearch(
  state: IState,
  visited: IState[],
  input: string,
  position: number
) {
  if (visited.includes(state)) {
    return false;
  }

  visited.push(state);

  if (position === input.length) {
    if (state.isEnd) {
      return true;
    }

    if (
      state.epsilonTransition.some((s) =>
        recursiveBacktrackingSearch(s, visited, input, position)
      )
    ) {
      return true;
    }
  } else {
    // @ts-ignore
    const nextState: IState = state.transition[input[position]];

    if (nextState) {
      if (recursiveBacktrackingSearch(nextState, [], input, position + 1)) {
        return true;
      }
    } else {
      if (
        state.epsilonTransition.some((s) =>
          recursiveBacktrackingSearch(s, visited, input, position)
        )
      ) {
        return true;
      }
    }

    return false;
  }
}

export function recognize(nfa: INfa, word: string) {
  return recursiveBacktrackingSearch(nfa.start, [], word, 0);
}
