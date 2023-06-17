import { Fraction } from "./fraction";

export class Expression {
  raw: string;
  terms: Fraction[];
  operations: Operator[];

  constructor(raw: string) {
    this.raw = raw;
    this.terms = [];
    this.operations = [];
  }

  evaluate() {
    if (this.terms.length === 0 && this.operations.length === 0) {
      const code = this.parse();
      if (code != 0) {
        return "Parse error - could not compute";
      }
    }
    var terms: Fraction[] = [...this.terms];
    var operations = [...this.operations];
    while (terms.length > 1) {
      const operation = operations.pop() as Operator;
      terms[operation.pos] = Fraction.evaluate(
        terms[operation.pos],
        terms[operation.pos + 1],
        operation.operation
      );
      terms.splice(operation.pos + 1, 1);
      for (var op of operations) {
        if (op.pos > operation.pos) {
          op.pos--;
        }
      }
    }
    return terms[0];
  }

  static isValidOperator(operator: string): boolean {
    return (
      operator === "*" ||
      operator === "/" ||
      operator === "+" ||
      operator === "-"
    );
  }

  static isDigit(char: string): boolean {
    return (
      char === "1" ||
      char === "2" ||
      char === "3" ||
      char === "4" ||
      char === "5" ||
      char === "6" ||
      char === "7" ||
      char === "8" ||
      char === "9" ||
      char === "0"
    );
  }

  // Note: MUST be spaces before and after your operators.
  // Do NOT put spaces in your fractions or numbers.
  // Also, no decimals. We don't like decimals here.
  parse(): number {
    const length: number = this.raw.length;
    var index: number = 0;
    var layer: number = 0;
    var term = "";
    try {
      while (index < length) {
        var char = this.raw.charAt(index);
        if (Expression.isDigit(char)) {
          term += char;
        } else if (char === "(") {
          if (term != "") {
            this.terms.push(Fraction.parseFraction(term));
            term = "";
            const op = new Operator("*", this.operations.length, layer);
            this.operations.push(op);
          }
          layer++;
        } else if (char === ")") {
          if (term != "") {
            this.terms.push(Fraction.parseFraction(term));
            term = "";
          }
          layer--;
        } else if (
          char === "/" &&
          term != "" &&
          this.raw.charAt(index - 1) != " "
        ) {
          term += char;
        } else if (Expression.isValidOperator(char)) {
          if (term != "") {
            this.terms.push(Fraction.parseFraction(term));
            term = "";
          }
          const op = new Operator(char, this.operations.length, layer);
          this.operations.push(op);
        }
        index++;
      }
      if (term != "" && Expression.isDigit(term.charAt(term.length - 1))) {
        this.terms.push(Fraction.parseFraction(term));
      }
      this.operations.sort(Operator.sort);
      return 0;
    } catch (e: any) {
      return 1;
    }
  }
}

export class Operator {
  operation: string;
  pos: number;
  layer: number;

  constructor(operation: string, pos: number, layer: number) {
    this.operation = operation;
    this.pos = pos;
    this.layer = layer;
  }

  static sort(a: Operator, b: Operator) {
    if (a.layer > b.layer) {
      return 1;
    } else if (b.layer > a.layer) {
      return -1;
    } else {
      if (a.getOperPriority() > b.getOperPriority()) {
        return 1;
      } else if (b.getOperPriority() > a.getOperPriority()) {
        return -1;
      } else {
        if (a.pos < b.pos) {
          return 1;
        } else if (b.pos < a.pos) {
          return -1;
        }
        return 0;
      }
    }
  }

  getOperPriority() {
    switch (this.operation) {
      case "*":
        return 4;
      case "/":
        return 3;
      case "+":
        return 2;
      case "-":
        return 1;
      default:
        return 0;
    }
  }

  static reverseSort(a: Operator, b: Operator) {
    return -1 * Operator.sort(a, b);
  }
}
