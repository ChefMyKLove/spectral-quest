/**
 * LEVEL 2: AMBER FLUX
 * 
 * Features:
 * - 12 motes
 * - Mentor: Calen (appears 3 times)
 * - 130 second timer
 * - 2 motes to unlock shooting
 */

import { BaseLevel } from '../BaseLevel';

export class AmberLevel extends BaseLevel {
  constructor() {
    super('AmberLevel', 1);  // Level index 1
  }
  
  create(): void {
    super.create();
    // No tutorial for level 2+
  }
}

