/**
 * LEVEL 4: VERDANT PULSE
 * 
 * Features:
 * - 24 motes
 * - Mentor: Veyra (appears 3 times)
 * - 150 second timer
 * - 4 motes to unlock shooting
 */

import { BaseLevel } from '../BaseLevel';

export class GreenLevel extends BaseLevel {
  constructor() {
    super('GreenLevel', 3);  // Level index 3
  }
  
  create(): void {
    super.create();
  }
}

