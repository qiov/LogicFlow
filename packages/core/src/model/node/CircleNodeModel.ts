import { computed, observable } from 'mobx';
import { assign } from 'lodash-es';
import { Point } from '../../type';
import BaseNodeModel from './BaseNodeModel';
import { ModelType } from '../../constant/constant';
import GraphModel from '../GraphModel';
import { defaultTheme } from '../../constant/DefaultTheme';
import { pickNodeConfig } from '../../util/node';

class CircleNodeModel extends BaseNodeModel {
  modelType = ModelType.CIRCLE_NODE;
  @observable r = defaultTheme.circle.r;

  constructor(data, graphModel: GraphModel) {
    super(data);
    this.setStyleFromTheme('circle', graphModel);
    const attrs = this.setAttributes(data);
    assign(this, pickNodeConfig(data), attrs);
  }

  @computed get width(): number {
    return this.r * 2;
  }
  @computed get height(): number {
    return this.r * 2;
  }
  @computed get anchors(): Point[] {
    const {
      anchorsOffset, x, y, r,
    } = this;
    if (Array.isArray(anchorsOffset) && anchorsOffset.length > 0) {
      return anchorsOffset.map((el) => ({
        x: x + el[0],
        y: y + el[1],
      }));
    }
    return [
      { x, y: y - r },
      { x: x + r, y },
      { x, y: y + r },
      { x: x - r, y },
    ];
  }
}

export { CircleNodeModel };
export default CircleNodeModel;
