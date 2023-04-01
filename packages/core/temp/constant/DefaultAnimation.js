// 不填或者false返回的配置，表示不开启所有动画
export var defaultAnimationCloseConfig = {
    node: false,
    edge: false,
};
// 仅使用true的时候返回的配置，表示开启所有动画
export var defaultAnimationOpenConfig = {
    node: true,
    edge: true,
};
export var defaultAnimationData = {
    stroke: 'red',
    strokeDasharray: '10 200',
    className: 'lf-edge-animation',
};
