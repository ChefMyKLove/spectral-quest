import { LayerScene } from '../LayerScene';
import { LAYERS } from '../../config/layers';

export class CrimsonLayer extends LayerScene {
  constructor() {
    super('CrimsonLayer', LAYERS[0]);
  }
}