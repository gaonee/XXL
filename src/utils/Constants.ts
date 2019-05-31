/*
 * 手指滑动方向
**/
const enum MOVE_DIRECTION {
    LEFT = -1,
    RIGHT = 1,
    TOP = -2,
    BOTTOM = 2
}

/*
 * 游戏的状态
**/
const enum BLOCK_STATUS {
    /* 准备状态 */
    READY,
    /* 手指滑动中 */
    TOUCH_MOVE,
    /* 格子正在交换中 */
    MOVING,
    ELIMINATION
}

/*
 * 格子类型，根据此类型绘制
**/
const enum BLOCK_TYPE {
    RED = 1,
    GREY,
    GREEN,
    BLUE,
    BLACK
}

const BLOCK_NUM = 5;

interface Point {
    row: number;
    col: number;
}

interface BlockInfo {
    row: number;
    col: number;
    width: number;
    height: number;
    type: number;
}

/*
 * 标记每列的消除信息
 * start表示该列中，是从哪一行开始消除的
 * count表示该列一共消除多少行
**/
interface EliminationInfo {
    start: number;
    count: number;
}
