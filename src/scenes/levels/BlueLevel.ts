/**
 * LEVEL 5: AZURE VOID
 * 
 * Features:
 * - 35 motes
 * - Mentor: Zorah (appears 3 times)
 * - 160 second timer
 * - 5 motes to unlock shooting
 */

import { BaseLevel } from '../BaseLevel';

export class BlueLevel extends BaseLevel {
  constructor() {
    super('BlueLevel', 4);  // Level index 4
  }
  
  create(): void {
    super.create();
  }
}

