/**
 * LEVEL 3: SOLAR RIFT
 * 
 * Features:
 * - 18 motes
 * - Mentor: Sol (appears 3 times)
 * - 140 second timer
 * - 3 motes to unlock shooting
 */

import { BaseLevel } from '../BaseLevel';

export class YellowLevel extends BaseLevel {
  constructor() {
    super('YellowLevel', 2);  // Level index 2
  }
  
  create(): void {
    super.create();
  }
}

