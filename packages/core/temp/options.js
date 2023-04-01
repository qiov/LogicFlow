import { assign } from 'lodash-es';
// 用来获取用户传入的 options，并做一些容错和异常抛出
export function get(options) {
    var container = options.container, grid = options.grid, width = options.width, height = options.height;
    if (!container) {
        throw new Error('请检查 container 参数是否有效');
    }
    if (typeof width === 'string' || typeof height === 'string') {
        throw new Error('width或height不支持传入字符串，请传数字');
    }
    if (grid) {
        options.grid = assign({
            size: 20,
            type: 'dot',
            visible: true,
            config: {
                color: '#ababab',
                thickness: 1,
            },
        }, grid);
    }
    return assign({}, defaults, options);
}
// 默认 options
export var defaults = {
    background: false,
    grid: false,
    textEdit: true,
    disabledTools: [],
};
