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
 * 魔力鸟虽然是特效，但类型已然改变，不能再参与三消，故单独类型。
 * 其余特效类型不变，通过在BlockInfo中增加特效属性标识。
**/
const enum BLOCK_TYPE {
    RED = 1,
    GREY,
    GREEN,
    BLUE,
    BLACK,
    MAGIC_BIRD
}

/*
 * 特效类型:横向特效，纵向特效，爆炸特效，魔力鸟特效
**/
const enum EFFECT_TYPE {
    ROW_LINE,
    COL_LINE,
    BOMB,
    MAGIC_BIRD
}

const BLOCK_NUM = 4;

interface Point {
    row: number;
    col: number;
}

interface BlockInfo {
    row: number;
    col: number;
    width: number;
    height: number;
    type: BLOCK_TYPE;
    effectType?: EFFECT_TYPE
}

/*
 * 消除信息，用来确定消除方式（不包含特效消除）
 * type     消除类型，包括三消、四消、五消、T型、L型等
 * points   消除的点的位置构成的数组
 * keyPoint 关键点，该位置用于确定特效生成的位置，有以下几种情况：
 *   1.交换消除，使用交换产生的位置；
 *   2.T型或者L型消除的交接处；
 *   3.下落产生的直线消除，使用运动产生接触的点。
 *   注意：可选字段，消除产生特效时才携带。
**/
interface EliminateInfo {
    type: ELIMINATE_TYPE;
    blockType: BLOCK_TYPE;
    points: Point[];
    keyPoint?: Point;
}

const enum ELIMINATE_TYPE {
    ROW_LINE_THREE,
    ROW_LINE_FOUR,
    ROW_LINE_FIVE,
    COL_LINE_THREE,
    COL_LINE_FOUR,
    COL_LINE_FIVE,
    NON_LINE
}
