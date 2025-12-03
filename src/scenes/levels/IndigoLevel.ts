/**
 * LEVEL 6: INDIGO VEIL
 * 
 * Features:
 * - 44 motes
 * - Mentor: Nyx (appears 2 times)
 * - 170 second timer
 * - 6 motes to unlock shooting
 */

import { BaseLevel } from '../BaseLevel';

export class IndigoLevel extends BaseLevel {
  constructor() {
    super('IndigoLevel', 5);  // Level index 5
  }
  
  create(): void {
    super.create();
  }
}

