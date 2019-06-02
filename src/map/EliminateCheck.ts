//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2019-present.
//  All rights reserved.
//  Author: Ma Jian
//  Email:  841374169@qq.com
//  判断是否达到消除条件，以及判断消除类型，是线型三消、四消还是五消，或者T型消除、L型消除。
//  其中，线性消除又分为横向和纵向两种。
//
//////////////////////////////////////////////////////////////////////////////////////

enum ELIMINATE_TYPE {
    ROW_LINE_THREE,
    ROW_LINE_FOUR,
    ROW_LINE_FIVE,
    COL_LINE_THREE,
    COL_LINE_FOUR,
    COL_LINE_FIVE,
    L_TYPE,
    T_TYPE
}

class EliminateCheck {
    private row = 0;
    private column = 0;

    constructor(row: number, col: number) {
        this.row = row;
        this.column = col;
    }

    /*
     * 计算本次交换是否会达到消除条件，用于滑动后的首次消除。
     * @param map BlockMap
     * @param touchRow 发起交换的格子所在行
     * @param touchCol 发起交换的格子所在列
     * @param distRow 目标格子所在行
     * @param distCol 目标格子所在列
     * @param dir 手指滑动方向
    **/
    public touchCheck(map: BlockMap, touchRow: number, touchCol: number, distRow: number, distCol: number, dir: number): Point[] {
        let ret: Point[] = new Array();
        ret = ret.concat(this.calculate(map, distRow, distCol, map.get(touchRow, touchCol), dir));
        ret = ret.concat(this.calculate(map, touchRow, touchCol, map.get(distRow, distCol), -dir));
        return ret;
    }

    /*
     * 全图扫描，计算是否存在可消除的情况。
     * 算法原理：通过两次扫描，找到所有符合条件的格子。算法复杂度为O(n2)。详细原理如下：
     * 1.先逐行扫，找到连续三个或者三个以上相同格子，计入行消除列表；
     * 2.逐列扫描，找到连续三个或者三个以上相同格子，计入列消除列表；
     * 3.比较两个消除列表，找到重复的格子。
    **/
    public whollyCheck(map: BlockMap): Point[] {
        let ret: Point[] = new Array();
        let rowArr = new Array();
        let colArr = new Array();

        for (let row = 0; row < this.row; row++) {
            let anchorType = null;
            let count = 1;
            for (let col = 0; col < this.column; col++) {
                let block = map.get(row, col);
                if (block != null) {
                    if (anchorType == block.type) {
                        count ++;
                        continue;
                    } else {
                        anchorType = block.type;
                    }
                } else {
                    anchorType = null;
                }
                if (count >= 3) {
                    for (let c = 1; c <= count; c++) {
                        ret.push({
                            row: row,
                            col: col - c
                        });
                    }
                }
                count = 1;
            }
        }

        // 扫描列
        for (let col = 0; col < this.row; col++) {
            let anchorType = null;
            let count = 1;
            for (let row = 0; row < this.column; row++) {
                let block = map.get(col, row);
                if (block != null) {
                    if (anchorType == block.type) {
                        count ++;
                        continue;
                    } else {
                        anchorType = block.type;
                    }
                } else {
                    anchorType = null;
                }
                if (count >= 3) {
                    for (let c = 1; c <= count; c++) {
                        ret.push({
                            row: row - c,
                            col: col
                        });
                    }
                }
                count = 1;
            }
        }
        return ret;
    }

    /*
     * 根据点的位置和将要移过去的格子进行计算
     * @param map BlockMap
     * @param row 交换后格子所在行
     * @param col 交换后格子所在列
     * @param block 移到该位置的格子
     * @param dir 交换方向
     * 注意：交换方向的格子不参与计算，因为肯定无法消除。可不传，不影响正常判断。
    **/
    private calculate(map: BlockMap, row: number, col: number, block: BlockBase, dir?: number): Point[] {
        let colArr: Point[] = new Array();
        let rowarr: Point[] = new Array();
        let ret: Point[] = new Array();
        let type = block.type;
        // 左侧
        if (dir != MOVE_DIRECTION.RIGHT && col > 0) {
            if (map.compare(row, col-1, type)) {
                rowarr.push({row: row, col: col-1});
                if (map.compare(row, col-2, type))  {
                    rowarr.push({row: row, col: col-2});
                }
            }
        }
        // 右侧
        if (dir != MOVE_DIRECTION.LEFT && col < this.column-1) {
            if (map.compare(row, col+1, type)) {
                rowarr.push({row: row, col: col+1});
                if (map.compare(row, col+2, type))  {
                    rowarr.push({row: row, col: col+2});
                }
            }
        }
        // above
        if (dir != MOVE_DIRECTION.BOTTOM && row > 0) {
            if (map.compare(row-1, col, type)) {
                colArr.push({row: row-1, col: col});
                if (map.compare(row-2, col, type))  {
                    colArr.push({row: row-2, col: col});
                }
            }
        }
        // bottom
        if (dir != MOVE_DIRECTION.TOP && row < this.row-1) {
            if (map.compare(row+1, col, type)) {
                colArr.push({row: row+1, col: col});
                if (map.compare(row+2, col, type))  {
                    colArr.push({row: row+2, col: col});
                }
            }
        }
        if (colArr.length >= 2) {
            ret = ret.concat(colArr);
            Log.debug("删除第 "+colArr[0].col+" 列, 起始行："+Math.min(row,colArr[0].row)+"，数量：" + (colArr.length+1));
        }
        if (rowarr.length >= 2) {
            ret = ret.concat(rowarr);
            Log.debug("删除第 "+rowarr[0].row+" 行，起始列："+Math.min(col,rowarr[0].col)+"，数量：" + (rowarr.length+1));
        }
        if (ret.length >= 2) {
            // 如果达成消除条件，目标格子也要参与消除
            ret.push({row: row, col: col});
        }
        return ret;
    }
}
