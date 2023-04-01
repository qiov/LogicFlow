// 统一对外导出
import { observer as mobxObserver } from 'mobx-react';
import { h } from 'preact';
import LogicFlow from './LogicFlow';
import * as LogicFlowUtil from './util';
export function observer(props) {
    return mobxObserver(props);
}
export { LogicFlow, h };
export { LogicFlowUtil };
export * from './view';
export * from './model';
export * from './keyboard';
export * from './options';
export default LogicFlow;
