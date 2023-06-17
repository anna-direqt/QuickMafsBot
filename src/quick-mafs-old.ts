import { cloneDeep } from "lodash";

function gcf(num1: number, num2: number): number {
  if (num2 === 0) {
    return num1;
  }
  return gcf(num2, num1 % num2);
}

function lcm(num1: number, num2: number): number {
  if (num1 > num2) {
    const temp = num1;
    num1 = num2;
    num2 = temp;
  }
  return lcmHelper(num1, num2);
}

function lcmHelper(num1: number, num2: number): number {
  if (num1 % num2 === 0) {
    return num1;
  }
  var multiplier = 2;
  while (multiplier < num2) {
    var lcm = num1 * multiplier;
    if (lcm % num2 === 0) {
      return lcm;
    }
    multiplier++;
  }
  return num1 * num2;
}

export class Fraction {
  num: number;
  denom: number;

  constructor(num: number, denom: number) {
    this.num = parseInt(`${num}`);
    this.denom = parseInt(`${denom}`);
  }

  clone() {
    return new Fraction(this.num, this.denom);
  }

  simplify() {
    var gcd = gcf(this.num, this.denom);
    this.num /= gcd;
    this.denom /= gcd;
    if (this.denom < 0) {
      this.num *= -1;
      this.denom *= -1;
    }
  }

  static simplify(frac: Fraction) {
    let copy = frac.clone();
    copy.simplify();
    return copy;
  }

  multiply(other: Fraction) {
    this.num *= other.num;
    this.denom *= other.denom;
    this.simplify();
  }

  static multiply(frac1: Fraction, frac2: Fraction) {
    let copy = frac1.clone();
    copy.multiply(frac2);
    return copy;
  }

  divide(other: Fraction) {
    var multiplier = new Fraction(other.denom, other.num);
    this.multiply(multiplier);
  }

  static divide(frac1: Fraction, frac2: Fraction) {
    let copy = frac1.clone();
    copy.divide(frac2);
    return copy;
  }

  add(other: Fraction) {
    var lcd = lcm(this.denom, other.denom);
    var mult1 = lcd / this.denom;
    var mult2 = lcd / other.denom;
    this.num *= mult1;
    this.denom = lcd;
    let addend = new Fraction(other.num * mult2, lcd);
    this.num += addend.num;
    this.simplify();
  }

  static add(frac1: Fraction, frac2: Fraction) {
    let copy = frac1.clone();
    copy.add(frac2);
    return copy;
  }

  subtract(other: Fraction) {
    let subtrahend = new Fraction(-1 * other.num, other.denom);
    this.add(subtrahend);
  }

  static subtract(frac1: Fraction, frac2: Fraction) {
    let copy = frac1.clone();
    copy.subtract(frac2);
    return copy;
  }

  static parseFraction(str: string): Fraction {
    const slash = str.indexOf("/");
    if (slash === -1) {
      return new Fraction(parseInt(str), 1);
    } else {
      const num = parseInt(str.slice(0, slash));
      const denom = parseInt(str.slice(slash + 1));
      return new Fraction(num, denom);
    }
  }

  static evaluate(frac1: Fraction, frac2: Fraction, operator: string) {
    operator = operator.charAt(0);
    switch (operator) {
      case "+":
        return Fraction.add(frac1, frac2);
      case "-":
        return Fraction.subtract(frac1, frac2);
      case "*":
        return Fraction.multiply(frac1, frac2);
      case "/":
        return Fraction.divide(frac1, frac2);
      default:
        throw new Error("Invalid operator");
    }
  }

  toString() {
    if (this.denom != 1) {
      return `${this.num}/${this.denom}`;
    }
    return `${this.num}`;
  }

  equals(other: Fraction) {
    let simplified1 = Fraction.simplify(this);
    let simplified2 = Fraction.simplify(other);
    return (
      simplified1.num === simplified2.num &&
      simplified1.denom === simplified2.denom
    );
  }
}

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
    if (char === " ") {
      return false;
    }
    try {
      const parsed = parseInt(char);
      return true;
    } catch (e: any) {
      return false;
    }
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
        if (char === "(") {
          layer++;
          term = "";
        } else if (char === ")") {
          layer--;
          this.terms.push(Fraction.parseFraction(term));
          term = "";
        } else if (char === " " && term != "") {
          this.terms.push(Fraction.parseFraction(term));
          term = "";
        } else if (
          this.raw.charAt(index - 1) === " " &&
          this.raw.charAt(index + 1) == " " &&
          Expression.isValidOperator(char)
        ) {
          this.operations.push(
            new Operator(char, this.operations.length, layer)
          );
          term = "";
        } else if (Expression.isDigit(char) || char === "/") {
          term += char;
        }
        index++;
      }
      if (term != "") {
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
