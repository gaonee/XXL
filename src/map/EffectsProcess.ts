//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2019-present.
//  All rights reserved.
//  Author: Ma Jian
//  Email:  841374169@qq.com
//  特效消除处理模块
//
//////////////////////////////////////////////////////////////////////////////////////

class EffectsProcess {


    /*
     * 爆炸消除。消除上下左右个两个；左上，右上，左下，右下各一个
     * @param point 爆炸点
    **/
    public eliminateBomb(map: BlockMap, point: Point) {
        map.remove(point.row-1, point.col);
        map.remove(point.row-2, point.col);
        map.remove(point.row+1, point.col);
        map.remove(point.row+2, point.col);

        map.remove(point.row, point.col-1);
        map.remove(point.row, point.col-2);
        map.remove(point.row, point.col+1);
        map.remove(point.row, point.col+2);

        map.remove(point.row-1, point.col-1);
        map.remove(point.row-1, point.col+1);
        map.remove(point.row+1, point.col-1);
        map.remove(point.row+1, point.col+1);

        map.setEliminateMemo(point.row, point.col-2);
        map.setEliminateMemo(point.row+1, point.col-1);
        map.setEliminateMemo(point.row+2, point.col);
        map.setEliminateMemo(point.row+1, point.col+1);
        map.setEliminateMemo(point.row, point.col+2);
    }

    /*
     * 整列消除。
     * @param col 需要消除的列
    **/
    public eliminateCol(map: BlockMap, col: number) {
        for (let row = 0; row < map.getRowAmount(); row++) {
            map.remove(row, col);
            map.setEliminateMemo(row, col);
        }
    }

    /*
     * 魔力鸟消除。
     * @param type 需要消除的类型
    **/
    public eliminateMagicBird(map: BlockMap, type: BLOCK_TYPE) {
        for (let row = 0; row < map.getRowAmount(); row++)  {
            for (let col = 0; col < map.getColAmount(); col++) {
                let block = map.get(row, col);
                if (block != null && block.getType() == type) {
                    map.remove(row, col, block);
                    map.setEliminateMemo(row, col);
                }
            }
        }
    }

    /*
     * 整行消除。
     * @param row 需要消除的行
    **/
    public eliminateRow(map: BlockMap, row: number) {
        for (let col = 0; col < map.getColAmount(); col++) {
            map.remove(row, col);
            map.setEliminateMemo(row, col);
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
}
