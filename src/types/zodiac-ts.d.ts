// src/types/zodiac-ts.d.ts
declare module 'zodiac-ts' {
  export class HoltWintersSmoothing {
    constructor(data: number[], alpha: number, beta: number, gamma: number, seasonLength: number, multiplicative: boolean);
    optimizeParameters(maxIterations: number): void;
    predict(steps: number): number[];
  }
}