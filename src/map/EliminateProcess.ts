//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2019-present.
//  All rights reserved.
//  Author: Ma Jian
//  Email:  841374169@qq.com
//  特效消除处理模块
//
//////////////////////////////////////////////////////////////////////////////////////

interface DropInfo {
    count: number;
    block: BlockBase;
}

class EliminateProcess {
    // 标识哪一列有格子消除，并记录每列最下方的消除位置
    public eliminateMemo: number[] = new Array();

    /**
     * 下降后位置更新
    **/
    private dropColList(map: BlockMap, col: number, dropList: DropInfo[], callback?: Function): void {
        let finishCount = 0;
        for (let row = 0; row < dropList.length; row++) {
            let block: BlockBase = dropList[row].block;
            block.drop(dropList[row].count, () => {
                finishCount ++;
                if (finishCount == dropList.length) {
                    for (let r = 0; r < dropList.length; r++) {
                        map.set(r, col, dropList[r].block);
                    }
                    callback && callback();
                }
            })
        }
    }

    /**
     * 填充和下落
     * @param eliminateArr 哪些列有格子消除
     */
    private dropDown(map: BlockMap, callback?: Function) {
        let dropCount = 0;
        let rowNum = map.getRowAmount();
        let colNum = map.getColAmount();
        
        for (let i = 0; i < colNum; i++) {
            let count = 0;
            let dropList: DropInfo[] = new Array();

            for (let row = rowNum-1; row >= 0; row--) {
                let block = map.get(row, i);
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

            // 计算最下方的消除格子位置
            if (dropList.length == 0) {
                this.setEliminateMemo(count-1, i);
            } else {
                let dropListBottom = dropList[dropList.length-1];
                let emptyBottom = dropListBottom.block.getRow() + dropListBottom.count;
                this.setEliminateMemo(emptyBottom, i);
            }

            // 上方生成新的格子，补足消除的空缺
            for (let c = 1; c <= count; c++) {
                // let index = count - c + 1;
                let info: BlockInfo = Util.generateBlockInfo(-c, i, map.getSize());
                let block: BlockBase = Util.createBlock(info);
                block.show(map.getContainer());
                dropList.unshift({
                    count: count,
                    block: block
                });
            }
            this.dropColList(map, i, dropList, () => {
                dropCount --;
                if (dropCount == 0) {
                    callback && callback();
                }
            });
        }
    }

    /**
     * 消除中的特效检查，若该消除有特效产生，则删除keyPoint位置的格子，
     * 并根据特效类型，在该位置生成新的格子。
     * @param block 需要消除的特效格子
     * @param point 格子位置
    **/
    private effectCheck(map: BlockMap, eliminateInfo: EliminateInfo) {
        let keyPoint: Point = eliminateInfo.keyPoint;
        let effectType: EFFECT_TYPE = Util.getEffectType(eliminateInfo.type);
        let effectBlock: BlockBase = null;

        if (effectType != null) {
            // 有特效产生的消除，该EliminateInfo中的所有格子必然相同；我们取其中之一，作为属性备份。
            let blockInfoCopy: BlockInfo = map.get(eliminateInfo.points[0].row, eliminateInfo.points[0].col).getBlockInfo();
            // 删除keyPoint位置的格子
            let block = map.get(keyPoint.row, keyPoint.col);
            if (block != null) {
                map.remove(keyPoint.row, keyPoint.col);
            }
            // 添加特效格子
            let blockInfo = {
                row: keyPoint.row,
                col: keyPoint.col,
                width: blockInfoCopy.width,
                height: blockInfoCopy.height,
                type: blockInfoCopy.type,
                effectType: effectType
            }
            effectBlock = Util.createBlock(blockInfo);
            Log.debug("effectsEliminate, type: " + effectType + "; keyPoint, row: " + keyPoint.row+",col:" + keyPoint.col);
        }

        return effectBlock;
    }

    /*
     * 特效消除。
     * @param block 需要消除的特效格子
     * @param point 格子位置
    **/
    private effectSwitch(map: BlockMap, block: BlockBase) {
        switch (block.getSpecialEffect()) {
            case EFFECT_TYPE.ROW_LINE: {
                this.lineRow(map, block.getRow());
                break;
            }
            case EFFECT_TYPE.COL_LINE: {
                this.lineCol(map, block.getCol());
                break;
            }
            case EFFECT_TYPE.BOMB: {
                this.bomb(map, block.getPoint());
                break;
            }
            case EFFECT_TYPE.MAGIC_BIRD: {}
            default: {
                break;
            }
        }
    }

    /**
     * 消除目标格子。
     * @param points 需要消除的格子的位置组成的数组
    **/
    private eliminateBlocks(map: BlockMap, points: Point[]) {
        for (let i = 0; i < points.length; i++) {
            let p = points[i];
            let block = map.get(p.row, p.col);
            if (block == null) continue;

            map.remove(p.row, p.col);
            
            // 是否是特效
            let effect: EFFECT_TYPE = block.getSpecialEffect();
            if (effect != null) {
                this.effectSwitch(map, block);
            }

            // 标记该列有消除
            this.setEliminateMemo(p.row, p.col);
        }
    }

    /**
     * 记录每列最下方消除位置，从而得知哪些格子产生了移动，
     * 进而，得到触发特效形成的keyPoint
    **/
    private setEliminateMemo(row: number, col: number) {
        this.eliminateMemo[col] = this.eliminateMemo[col] == undefined ? row : Math.max(row, this.eliminateMemo[col]);
    }



    /**
     * 爆炸消除。消除上下左右个两个；左上，右上，左下，右下各一个
     * @param point 爆炸点
    **/
    public bomb(map: BlockMap, point: Point) {
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
    }

    /**
     * 整列消除。
     * @param col 需要消除的列
    **/
    public lineCol(map: BlockMap, col: number) {
        let effectList = new Array();
        for (let row = 0; row < map.getRowAmount(); row++) {
            let block = map.get(row, col);
            if (block != null && block.getSpecialEffect() != null) {
                effectList.push(block);
            }
            
            map.remove(row, col);
        }
    }

    /**
     * 整行消除。
     * @param row 需要消除的行
    **/
    public lineRow(map: BlockMap, row: number) {
        for (let col = 0; col < map.getColAmount(); col++) {
            map.remove(row, col);
        }
    }

    /**
     * 单个魔力鸟消除。
     * @param type 需要消除的类型
    **/
    public magicBird(map: BlockMap, type: BLOCK_TYPE) {
        for (let row = 0; row < map.getRowAmount(); row++)  {
            for (let col = 0; col < map.getColAmount(); col++) {
                let block = map.get(row, col);
                if (block != null && block.getType() == type) {
                    map.remove(row, col, block);
                }
            }
        }
    }

    /**
     * 简单消除，只根据指定点进行消除。
     * 若点所在的格子存在特效，则进入相应的特效处理模块
     * @param eliminateList EliminateInfo组成的数组
    **/
    public simple(map: BlockMap, eliminateList: EliminateInfo[], callback: Function) {
        this.eliminateMemo = new Array(map.getColAmount());
        
        for (let i = 0; i < eliminateList.length; i++) {
            let eliminateInfo = eliminateList[i];
            if (!Array.isArray(eliminateInfo.points)) {
                Log.warn("effectsEliminate, points is null");
                continue;
            }
            let effectBlock: BlockBase = this.effectCheck(map, eliminateInfo);
            let keyPoint: Point = eliminateInfo.keyPoint;
            this.eliminateBlocks(map, eliminateInfo.points);

            if (effectBlock != null) {
                effectBlock.show(map.getContainer());
                map.add(keyPoint.row, keyPoint.col, effectBlock);
            }

            // 特效消除是否会触发新生成的特效点。若波及，则立即触发该新特效，不等待二次触发。
        }

        this.dropDown(map, () => {
            setTimeout(callback, 50);
        });
    }

    /**
     * 双横向。
    **/
    public doubleLineRow() {}
    /**
     * 双纵向。
    **/
    public doubleLineCol() {}
    /**
     * 横向+纵向。
    **/

    /**
     * 横向+爆炸。
     * @param type 需要消除的类型
    **/
    public bombRow() {}

    /**
     * 纵向+爆炸。
     * @param type 需要消除的类型
    **/
    public bombCol() {}

    /**
     * 双爆。
    **/

    /**
     * 魔力鸟+爆炸。
    **/
    /**
     * 魔力鸟+横向。
    **/
    /**
     * 魔力鸟+纵向。
    **/
    /**
     * 魔力鸟+魔力鸟。
    **/
}
