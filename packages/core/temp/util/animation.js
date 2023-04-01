import { cloneDeep, merge } from 'lodash-es';
import { defaultAnimationCloseConfig, defaultAnimationOpenConfig, } from '../constant/DefaultAnimation';
export var updateAnimation = function (config) {
    if (!config || typeof config === 'boolean') {
        // 不转类型
        return config === true
            ? cloneDeep(defaultAnimationOpenConfig)
            : cloneDeep(defaultAnimationCloseConfig);
    }
    // 传入的是对象AnimationConfig
    return merge(cloneDeep(defaultAnimationCloseConfig), config);
};
