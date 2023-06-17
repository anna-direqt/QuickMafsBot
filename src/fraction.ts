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
