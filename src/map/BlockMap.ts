//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2019-present.
//  All rights reserved.
//  Author: Ma Jian
//  Email:  841374169@qq.com
//  block map
//
//////////////////////////////////////////////////////////////////////////////////////

class BlockMap {
    private container: egret.DisplayObjectContainer;
    private map: BlockBase[][] = new Array();
    private row: number = 0;
    private column: number = 0;
    private size: number = 0;
    // 标识哪一列有格子消除，并记录每列最下方的消除位置
    private eliminateMemo: number[] = null;

    constructor(container: egret.DisplayObjectContainer, row: number, col: number, size: number) {
        if (container == null) return;

        this.container = container;
        this.row = row;
        this.column = col;
        this.size = size;

        for (let row = 0; row < this.row; row++) {
            this.map[row] = new Array();
        }
    }

    /*
     * Create special effect block.
     * @param eliminateInfo 消除信息
     * @param sourceBlockInfo 源信息，表示是哪种类型的格子消除产生的，
     * 用来继承一些公共的属性。
    **/
    private createEffectBlock(eliminateInfo: EliminateInfo, sourceBlockInfo: BlockInfo) {
        let effectType: EFFECT_TYPE = null;
        let type = eliminateInfo.type;

        switch (type) {
            case ELIMINATE_TYPE.COL_LINE_THREE:
            case ELIMINATE_TYPE.ROW_LINE_THREE: {
                break;
            }
            case ELIMINATE_TYPE.ROW_LINE_FOUR: {
                effectType = EFFECT_TYPE.COL_LINE;
                break;
            }
            case ELIMINATE_TYPE.COL_LINE_FOUR: {
                effectType = EFFECT_TYPE.ROW_LINE;
                break;
            }
            case ELIMINATE_TYPE.ROW_LINE_FIVE: 
            case ELIMINATE_TYPE.COL_LINE_FIVE: {
                effectType = EFFECT_TYPE.MAGIC_BIRD;
                break;
            }
            case ELIMINATE_TYPE.NON_LINE: {
                effectType = EFFECT_TYPE.BOMB;
                break;
            }
            default: {
                break;
            }
        }

        if (effectType != null) {
            let point = eliminateInfo.keyPoint;
            let blockInfo = {
                row: point.row,
                col: point.col,
                width: sourceBlockInfo.width,
                height: sourceBlockInfo.height,
                type: sourceBlockInfo.type,
                effectType: effectType
            }
            let block = Util.createBlock(blockInfo);
            block.show(this.container);
            this.add(point.row, point.col, block);
            Log.debug("effectsEliminate, type: " + type + "; keyPoint, row: " + point.row+",col:" + point.col);
        }
    }

    /*
     * 下降后位置更新
    **/
    private dropColList(col: number, dropList, callback?: Function): void {
        let finishCount = 0;
        for (let row = 0; row < dropList.length; row++) {
            let block: BlockBase = dropList[row].block;
            block.drop(dropList[row].count, () => {
                finishCount ++;
                if (finishCount == dropList.length) {
                    for (let r = 0; r < dropList.length; r++) {
                        this.map[r][col] = dropList[r].block;
                    }
                    callback && callback();
                }
            })
        }
    }

    /*
     * 填充和下落
     * @param eliminateArr 哪些列有格子消除
    **/
    private dropDown(callback?: Function) {
        let dropCount = 0;
        for (let i = 0; i < this.column; i++) {
            let info = this.eliminateMemo[i];
            if (info == undefined) continue;

            let count = 0;
            let dropList = new Array();

            for (let row = this.row-1; row >= 0; row--) {
                let block = this.get(row, i);
                if (block == null) {
                    count ++;
                } else {
                    if (count > 0) {
                        dropList.unshift({
                            count: count,
                            block: block
                        });
                    }
                }
            }

            if (count <= 0) continue;

            dropCount ++;

            // 上方生成新的格子，补足消除的空缺
            for (let c = 1; c <= count; c++) {
                // let index = count - c + 1;
                let info: BlockInfo = Util.generateBlockInfo(-c, i, this.size);
                let block: BlockBase = Util.createBlock(info);
                block.show(this.container);
                dropList.unshift({
                    count: count,
                    block: block
                });
            }
            this.dropColList(i, dropList, () => {
                dropCount --;
                if (dropCount == 0) {
                    callback && callback();
                }
            });
        }
    }

    /*
     * 消除目标格子。
     * @param points 需要消除的格子的位置组成的数组
    **/
    private eliminateBlocks(points: Point[]) {
        for (let i = 0; i < points.length; i++) {
            let p = points[i];
            let block = this.get(p.row, p.col);
            if (block == null) continue;

            this.remove(p.row, p.col);
            
            // 是否是特效
            let effect: EFFECT_TYPE = block.getSpecialEffect();
            if (effect != null) {
                this.effectEliminate(block, p);
            }

            this.setEliminateMemo(p.row, p.col);
        }
    }

    /*
     * 特效消除。
     * @param block 需要消除的特效格子
     * @param point 格子位置
    **/
    private effectEliminate(block: BlockBase, point: Point) {
        switch (block.getSpecialEffect()) {
            case EFFECT_TYPE.ROW_LINE: {
                this.eliminateRow(point.row);
                break;
            }
            case EFFECT_TYPE.COL_LINE: {
                this.eliminateCol(point.col);
                break;
            }
            case EFFECT_TYPE.BOMB: {
                this.eliminateBomb(point);
                break;
            }
            case EFFECT_TYPE.MAGIC_BIRD: {}
            default: {
                break;
            }
        }
    }

    /*
     * 整行消除。
     * @param row 需要消除的行
    **/
    private eliminateRow(row: number) {
        for (let col = 0; col < this.row; col++) {
            this.remove(row, col);
            this.setEliminateMemo(row, col);
        }
    }

    /*
     * 整列消除。
     * @param col 需要消除的列
    **/
    private eliminateCol(col: number) {
        for (let row = 0; row < this.row; row++) {
            this.remove(row, col);
            this.setEliminateMemo(row, col);
        }
    }

    /*
     * 爆炸消除。消除上下左右个两个；左上，右上，左下，右下各一个
     * @param point 爆炸点
    **/
    private eliminateBomb(point: Point) {
        this.remove(point.row-1, point.col);
        this.remove(point.row-2, point.col);
        this.remove(point.row+1, point.col);
        this.remove(point.row+2, point.col);

        this.remove(point.row, point.col-1);
        this.remove(point.row, point.col-2);
        this.remove(point.row, point.col+1);
        this.remove(point.row, point.col+2);

        this.remove(point.row-1, point.col-1);
        this.remove(point.row-1, point.col+1);
        this.remove(point.row+1, point.col-1);
        this.remove(point.row+1, point.col+1);

        this.setEliminateMemo(point.row, point.col-2);
        this.setEliminateMemo(point.row+1, point.col-1);
        this.setEliminateMemo(point.row+2, point.col);
        this.setEliminateMemo(point.row+1, point.col+1);
        this.setEliminateMemo(point.row, point.col+2);
    }

    /*
     * 魔力鸟消除。
     * @param type 需要消除的类型
    **/
    private eliminateMagicBird(type: BLOCK_TYPE) {
        for (let row = 0; row < this.row; row++)  {
            for (let col = 0; col < this.column; col++) {
                let block = this.get(row, col);
                if (block != null && block.getType() == type) {
                    this.remove(row, col, block);
                    this.setEliminateMemo(row, col);
                }
            }
        }
    }

    /*
     * 双横向。
    **/
    /*
     * 双纵向。
    **/
    /*
     * 横向+纵向。
    **/

    /*
     * 横向+爆炸。
     * @param type 需要消除的类型
    **/
    private eliminateRowBomb() {}

    /*
     * 纵向+爆炸。
     * @param type 需要消除的类型
    **/
    private eliminateColBomb() {}

    /*
     * 双爆。
    **/

    /*
     * 魔力鸟+爆炸。
    **/
    /*
     * 魔力鸟+横向。
    **/
    /*
     * 魔力鸟+纵向。
    **/
    /*
     * 魔力鸟+魔力鸟。
    **/

    /*
     * 记录每列最下方消除位置，从而得知哪些格子产生了移动，
     * 进而，得到触发特效形成的keyPoint
    **/
    private setEliminateMemo(row: number, col: number) {
        this.eliminateMemo[col] = this.eliminateMemo[col] == undefined ? row : Math.max(row, this.eliminateMemo[col]);
    }


    /*
     * 填充格子
    **/
    public add(row: number, col: number, block: BlockBase): void {
        if (Array.isArray(this.map[row])) {
            this.map[row][col] = block;
        } else {
            Log.warn("BlockMap, add block error! row: " + row + ", col: " + col);
        }
    }

    /*
     * [row]行[col]列的格子是否是[type]类型
     * @param row 行号
     * @param col 列号
     * @param type 类型
     * @param 布尔值，TRUE表示相同，FALSE表示不相同。
    **/
    public compare(row: number, col: number, type: number): boolean {
        let block = this.get(row, col);
        if (block != null) {
            return block.type == type;
        }
        return false;
    }

    /*
     * 特效消除
     * @param eliminateList EliminateInfo组成的数组
    **/
    public eliminate(eliminateList: EliminateInfo[], callback: Function) {
        this.eliminateMemo = new Array(this.column);
        for (let i = 0; i < eliminateList.length; i++) {
            let eliminateInfo = eliminateList[i];
            if (!Array.isArray(eliminateInfo.points)) {
                Log.warn("effectsEliminate, points is null");
                continue;
            }
            // 消除之前获取，否则不存在
            let copyInfo: BlockInfo = this.get(eliminateInfo.points[0].row, eliminateInfo.points[0].col).getBlockInfo();
            this.eliminateBlocks(eliminateInfo.points);
            this.createEffectBlock(eliminateInfo, copyInfo);
        }

        this.dropDown(() => {
            setTimeout(callback, 50);
        });
    }

    /*
     * 交换相邻位置格子
    **/
    public swap(distRow: number, distCol: number, resRow: number, resCol: number): void {
        let temp = this.map[distRow][distCol];

        this.map[distRow][distCol] = this.map[resRow][resCol];
        this.map[resRow][resCol] = temp;
    }

    /*
     * 获取格子
    **/
    public get(row: number, col: number): BlockBase {
        if (Array.isArray(this.map[row]) && col < this.map[row].length) {
            return this.map[row][col];
        }
        return null;
    }

    /*
     * 生成跟左边和上方格子类型都不相同的类型
    **/
    public getDifferentType(row: number, col: number) {
        let type = null;
        for (let bt = 1; bt <= BLOCK_NUM; bt++) {
            if (!this.compare(row-1, col, bt) &&
                !this.compare(row, col-1, bt)) {
                type = bt;
                break;
            }
        }

        if (type == null) {
            Log.warn("Can not find a different type.");
            type = BLOCK_TYPE.BLACK;
        }
        
        return type;
    }

    public getRowAmount(): number {
        return this.row;
    }

    public getColAmount(): number {
        return this.column;
    }

    public hasDrop(row: number, col: number): boolean {
        return this.eliminateMemo[col] != undefined && this.eliminateMemo[col] >= row;
    }

    /*
     * 是否存在连续三个格子相同的情况
     * 初始化时，只需要判断上方和左侧即可
    **/
    public isLine(row: number, col: number, info: BlockInfo): boolean {
        // above
        if (row-1>=0&&row-2>=0 &&
            this.map[row-1][col].type == info.type && this.map[row-2][col].type == info.type) {
            return true;
        }
        // left side
        if (col-1>=0&&col-2>=0 &&
            this.map[row][col-1].type == info.type && this.map[row][col-2].type == info.type) {
            return true;
        }

        return false;
    }

    public remove(row: number, col: number, block?: BlockBase) {
        if (block == undefined || block == null) {
            block = this.get(row, col);
        }

        if (block == null) {
            return;
        }

        this.container.removeChild(block.getObject());
        this.map[row][col] = null;
    }

    public render() {
        for (let row = 0; row < this.row; row++) {
            for (let col = 0; col < this.column; col++) {
                if (this.map[row][col] instanceof BlockBase) {
                    this.map[row][col].show(this.container);
                }
            }
        }
    }

    public risingTop(row: number, col: number) {
        let block = this.get(row, col);
        if (block != null) {
            this.container.removeChild(block.getObject());
            block.show(this.container);
        }
    }
}
