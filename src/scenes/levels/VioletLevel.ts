/**
 * LEVEL 7: VIOLET CROWN
 * 
 * Features:
 * - 49 motes
 * - Mentor: Sylvara (appears 2 times)
 * - 180 second timer
 * - 7 motes to unlock shooting (shooting unlocked by default in boss level)
 */

import { BaseLevel } from '../BaseLevel';

export class VioletLevel extends BaseLevel {
  constructor() {
    super('VioletLevel', 6);  // Level index 6
  }
  
  create(): void {
    super.create();
  }
}

