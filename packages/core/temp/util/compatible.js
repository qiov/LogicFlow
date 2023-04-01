// 需要进行兼容操作，提供的方法
// vue中data会进行Observe, 深拷贝的原始数据对象。
export var formatData = function (data) {
    try {
        return JSON.parse(JSON.stringify(data));
    }
    catch (_a) {
        return data;
    }
};
