export var defaultTheme = {
    baseNode: {
        fill: '#FFFFFF',
        stroke: '#000000',
        strokeWidth: 2,
    },
    baseEdge: {
        stroke: '#000000',
        strokeWidth: 2,
    },
    rect: {},
    circle: {},
    diamond: {},
    ellipse: {},
    polygon: {},
    text: {
        color: '#000000',
        stroke: 'none',
        fontSize: 12,
        background: {
            fill: 'transparent',
        },
    },
    anchor: {
        stroke: '#000000',
        fill: '#FFFFFF',
        r: 4,
        hover: {
            fill: '#949494',
            fillOpacity: 0.5,
            stroke: '#949494',
            r: 10,
        },
    },
    nodeText: {
        color: '#000000',
        overflowMode: 'default',
        lineHeight: 1.2,
        fontSize: 12,
    },
    edgeText: {
        textWidth: 100,
        overflowMode: 'default',
        fontSize: 12,
        background: {
            fill: '#FFFFFF',
        },
    },
    line: {},
    polyline: {},
    bezier: {
        fill: 'none',
        adjustLine: {
            stroke: '#949494',
        },
        adjustAnchor: {
            r: 4,
            fill: '#949494',
            stroke: '#949494',
            fillOpacity: 1,
        },
    },
    arrow: {
        offset: 10,
        verticalLength: 5,
    },
    anchorLine: {
        stroke: '#000000',
        strokeWidth: 2,
        strokeDasharray: '3,2',
    },
    snapline: {
        stroke: '#949494',
        strokeWidth: 1,
    },
    edgeAdjust: {
        r: 4,
        fill: '#FFFFFF',
        stroke: '#949494',
        strokeWidth: 2,
    },
    outline: {
        fill: 'transparent',
        stroke: '#949494',
        strokeDasharray: '3,3',
        hover: {
            stroke: '#949494',
        },
    },
    edgeAnimation: {
        stroke: 'red',
        strokeDasharray: '10 10',
        strokeDashoffset: '100%',
        animationName: 'dash',
        animationDuration: '20s',
        animationIterationCount: 'infinite',
        animationTimingFunction: 'linear',
        animationDirection: 'normal',
    },
};
