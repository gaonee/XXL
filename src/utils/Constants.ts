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
    /* 选中格子 */
    CHECKED,
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
 * 消除信息，不同的类型有不同的消除方式
 * type     消除类型，三消、四消等
 * points   消除的点的位置构成的数组
 * keyPoint 关键点，即交换位置，该次交换动作产生了本次消除的结果，
 * 该位置用于确定特效生成的位置
**/
interface EliminationInfo {
    type: ELIMINATE_TYPE;
    points: Point[];
    keyPoint: Point
}
