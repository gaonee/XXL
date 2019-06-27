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
        if (map == null || map == undefined) {
            callback && callback();
            return;
        }

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
     * 非特效消除。包括以下情况：
     * 1.格子交换三消；
     * 2.格子补全、下落后，经全图扫描后的消除。
     * @param points 需要消除的格子的位置组成的数组
    **/
    private eliminateBlocks(map: BlockMap, points: Point[]): BlockBase[] {
        let effectList: BlockBase[] = new Array();

        for (let i = 0; i < points.length; i++) {
            let p = points[i];
            this.removeAndCollectEffectBlock(map, p.row, p.col, effectList);
        }

        return effectList;
    }

    /**
     * 批量执行子特效。
     * 子特效包括四种：爆炸、线性单消（横向和纵向）、魔力鸟。
     * 执行规则：每个子特效独立执行，执行完毕调用回调，互相之间不受影响。
     * @param map BlockMap
     * @param effectBlocksList 特效集合
     * @param callback 所有特效执行完成后的回调
     * @param target 可选字段，表示触发该特效集合的对象，包含以下情况：
     * 1.交换触发特效，仅考虑单魔力鸟的情况，这时参数为跟魔力鸟交换的格子；
     * 2.被其它特效范围波及，此时为触发它的格子；
     * 3.被双特效交换附加效果波及，如双魔力鸟交换等。此时不知道魔力鸟要消除的对象，因此随即产生消除类型。
     * 注：该参数主要服务于魔力鸟特效，因为它需要知道类型。
    **/
    private exec(map: BlockMap, effectBlocksList: BlockBase[], onComplete: Function, target?: BlockBase) {
        let finishCount = 0;
        let effectsNum = effectBlocksList.length;
        let process = () => {
            finishCount ++;
            if (finishCount == effectsNum) {
                onComplete && onComplete();
            }
        }

        if (effectsNum == 0) {
            onComplete && onComplete();
        }

        for (let i = 0; i < effectsNum; i++) {
            let block = effectBlocksList[i];
            let effect = null;

            switch (block.getSpecialEffect()) {
                case EFFECT_TYPE.ROW_LINE: {
                    effect = new SpecialEffects.LinearRow(map, block.getBlockInfo());
                    break;
                }
                case EFFECT_TYPE.COL_LINE: {
                    effect = new SpecialEffects.LinearColumn(map, block.getBlockInfo());
                    break;
                }
                case EFFECT_TYPE.BOMB: {
                    effect = new SpecialEffects.Bomb(map, block.getBlockInfo());
                    break;
                }
                case EFFECT_TYPE.MAGIC_BIRD: {
                    if (target) {
                        effect = new SpecialEffects.MagicBird(map, target.getBlockInfo());
                    } else {
                        effect = new SpecialEffects.MagicBird(map, Util.generateBlockInfo(0,0,0));
                    }
                    break;
                }
                default: {
                    process();
                    break;
                }
            }

            if (effect != null) {
                effect.play(() => {
                    effect.eliminate();
                    this.exec(map, effect.getStrikeList(), process);
                });
            }
        }
    }

    /**
     * 漫射特效。
     * @param map BlockMap
     * @param effectBlocksList 特效集合
     * @param onComplete 所有特效执行完成后的回调
    **/
    private diffuseEffect(map: BlockMap, effectBlocksList: BlockBase[], onComplete: Function) {
        let finishCount = 0;
        let effectsNum = effectBlocksList.length;

        this.oneByOne(map, effectBlocksList, 0, () => {
            finishCount ++;
            if (finishCount == effectsNum) {
                onComplete && onComplete();
            }
        });
    }

    /**
     * 逐个执行子特效。
     * 子特效包括三种：爆炸、线性单消（横向和纵向）。
     * @param map BlockMap
     * @param effectBlocksList 特效集合
     * @param anchor 当前执行位置
     * @param interval 执行间隔
     * @param callback 每个执行完回调(包括二次触发)
    **/
    private oneByOne(map: BlockMap, effectBlocksList: BlockBase[], anchor: number, callback: Function) {
        let block = effectBlocksList[anchor];
        let effect = null;

        if (anchor == effectBlocksList.length) {
            return;
        }

        // 如果map中已被删除，表示特效已触发，则忽略。
        if (block && map.get(block.getRow(), block.getCol()) != null) {
            switch (block.getSpecialEffect()) {
                case EFFECT_TYPE.ROW_LINE: {
                    effect = new SpecialEffects.LinearRow(map, block.getBlockInfo());
                    break;
                }
                case EFFECT_TYPE.COL_LINE: {
                    effect = new SpecialEffects.LinearColumn(map, block.getBlockInfo());
                    break;
                }
                case EFFECT_TYPE.BOMB: {
                    effect = new SpecialEffects.Bomb(map, block.getBlockInfo());
                    break;
                }
                default: {
                    break;
                }
            }
        }

        if (effect != null) {
            effect.play(() => {
                effect.eliminate();
                this.exec(map, effect.getStrikeList(), callback);

                anchor ++;
                this.oneByOne(map, effectBlocksList, anchor, callback);
            });
            return;
        } else {
            callback && callback();
        }
        
        anchor ++;
        this.oneByOne(map, effectBlocksList, anchor, callback);
    }

    /**
     * 消除中的特效检查，若该消除有特效产生，则删除keyPoint位置的格子，
     * 并根据特效类型，在该位置生成新的格子。
     * @param block 需要消除的特效格子
     * @param point 格子位置
    **/
    private simpleEliminateProcess(map: BlockMap, eliminateInfo: EliminateInfo, callback: Function) {
        let keyPoint: Point = eliminateInfo.keyPoint;
        let points: Point[] = eliminateInfo.points;
        let effectType: EFFECT_TYPE = Util.getEffectType(eliminateInfo.type);
        let effectBlock: BlockBase = null;
        let effectList: BlockBase[] = [];

        if (effectType != null) {
            // 删除keyPoint位置的格子
            let block = map.get(keyPoint.row, keyPoint.col);
            if (block != null) {
                let effectType = block.getSpecialEffect();
                 /**
                 * keyPoint位置如果是普通格子，直接删除；如果是特效格子，需要做如下处理：
                 * 原特效格子需保留，在另外的消除点中，找一个普通格子放置新生成的特效点。
                 * 如果在极端情况下，都是特效格子，则将相同特效【合并】，在空出的位置放置新的特效。
                **/
                if (effectType != null) {
                    //
                    for (let i = 0; i < points.length; i++) {
                        let block = map.get(points[i].row, points[i].col);
                        if (block == null || block.getSpecialEffect() == null) {
                            keyPoint = points[i];
                            break;
                        }
                    }
                    map.remove(keyPoint.row, keyPoint.col);
                } else {
                    map.remove(keyPoint.row, keyPoint.col);
                }
            }

            // 判断当前消除是否会触发新生成的特效，例如消除格子中含有爆炸特效，则新特效会被立即触发。
            let triggerFlag = false;
            for (let i = 0; i < points.length; i++) {
                let block = map.get(points[i].row, points[i].col);
                if (block == null) continue;
                let effect = block.getSpecialEffect();

                if (effect == EFFECT_TYPE.BOMB ||
                    (effect == EFFECT_TYPE.COL_LINE && eliminateInfo.type == ELIMINATE_TYPE.COL_LINE_FOUR) ||
                    (effect == EFFECT_TYPE.ROW_LINE && eliminateInfo.type == ELIMINATE_TYPE.ROW_LINE_FOUR)) {
                    triggerFlag = true;
                    break;
                }
            }

            // 添加特效格子
            let blockInfo = {
                row: keyPoint.row,
                col: keyPoint.col,
                width: map.getSize(),
                height: map.getSize(),
                type: effectType == EFFECT_TYPE.MAGIC_BIRD ? BLOCK_TYPE.MAGIC_BIRD : eliminateInfo.blockType,
                effectType: effectType
            }
            effectBlock = Util.createBlock(blockInfo);
            effectBlock.show(map.getContainer());

            // 先添加后消除，表示新特效会被立即消除；反之，表示新特效不会被消除。
            if (triggerFlag) {
                map.add(keyPoint.row, keyPoint.col, effectBlock);
                effectList = this.eliminateBlocks(map, points);
            } else {
                effectList = this.eliminateBlocks(map, points);
                map.add(keyPoint.row, keyPoint.col, effectBlock);
            }
        } else {
            effectList = this.eliminateBlocks(map, points);
        }

        if (effectList.length > 0) {
            this.exec(map, effectList, callback);
        } else {
            callback && callback();
        }
    }

    /**
     * 删除格子，如果该格子存在特效，则放入effectList中。
     * @param map 格子所在BlockMap
     * @param row 格子所在行
     * @param col 格子所在列
     * @param effectList 特效集合
    **/
    private removeAndCollectEffectBlock(map: BlockMap, row: number, col: number, effectList: BlockBase[]) {
        let block = map.get(row, col);
        if (block != null) {
            map.remove(row, col);
            
            // 是否是特效
            if (block.getSpecialEffect() != null) {
                effectList.push(block);
            }
        }
    }

    /**
     * 记录每列最下方消除位置，从而得知哪些格子产生了移动，
     * 进而，得到触发特效形成的keyPoint
    **/
    private setEliminateMemo(row: number, col: number) {
        this.eliminateMemo[col] = this.eliminateMemo[col] == undefined ? row : Math.max(row, this.eliminateMemo[col]);
    }

    /************************************************* 消除调用场景 **************************************************/

    /**
     * 【简单交换消除】
     * 调用场景：1.简单交换三消；2.格子补全、下落消除。
     * @param map 消除发生的BlockMap
     * @param eliminateList EliminateInfo组成的数组
     * @param callback 所有消除完成，且格子补全、下落后执行回调
    **/
    public simple(map: BlockMap, eliminateList: EliminateInfo[], callback: Function): void {
        let eliminateCount = 0;
        let process = () => {
            eliminateCount ++;
            if (eliminateCount == eliminateList.length) {
                this.dropDown(map, callback);
            }
        }

        this.eliminateMemo = new Array(map.getColAmount());
        
        for (let i = 0; i < eliminateList.length; i++) {
            this.simpleEliminateProcess(map, eliminateList[i], process);
        }
    }

    /**
     * 【单魔力鸟交换消除】
     * 调用场景：单个魔力鸟与普通格子的交换。
     * @param map 消除发生的BlockMap
     * @param type 魔力鸟要消除的类型
     * @param callback 所有消除完成，且格子补全、下落后执行回调
    **/
    public singleMagicBird(map: BlockMap, magic: BlockBase, target: BlockBase, callback: Function) {
        if (!map || !magic || !target) {
            callback && callback();
            return;
        }

        let effect = new SpecialEffects.MagicBird(map, target.getBlockInfo());
        let magicPoint: Point = magic.getPoint();

        this.eliminateMemo = new Array(map.getColAmount());

        effect.play(() => {
            // 特效动画执行完之后，先删除魔力鸟所在点，防止后面做重复特效处理。
            map.remove(magicPoint.row, magicPoint.col);
            effect.eliminate();
            this.exec(map, effect.getStrikeList(), () => {
                this.dropDown(map, callback);
            });
        });
    }

    /**
     * 【双特效交换】
     * 调用场景：两个特效格子的交换。
     * @param map 消除发生的BlockMap
     * @param type 魔力鸟要消除的类型
     * @param callback 所有消除完成，且格子补全、下落后执行回调
    **/
    public doubleEffectsSwap(map: BlockMap, trigger: BlockBase, target: BlockBase, callback: Function) {
        if (!map || !trigger || !target) {
            callback && callback();
            return;
        }

        let triggerInfo: BlockInfo = trigger.getBlockInfo();
        let targetInfo: BlockInfo = target.getBlockInfo();

        if (triggerInfo.effectType == null || targetInfo.effectType == null) {
            Log.warn("doubleEffectsSwap error: not special effect block.");
            callback && callback();
            return;
        }

        let effect: SpecialEffects.Base = null;

        map.remove(trigger.getRow(), trigger.getCol());
        map.remove(target.getRow(), target.getCol());

        if (triggerInfo.effectType == EFFECT_TYPE.MAGIC_BIRD && targetInfo.effectType == EFFECT_TYPE.MAGIC_BIRD) {
            effect = new SpecialEffects.DoubleMagicBird(map, triggerInfo, targetInfo);
            effect.play(() => {
                this.exec(map, effect.getStrikeList(), () => {
                    effect.eliminate();
                    this.dropDown(map, callback);
                });
            });
            return;
        } else {
            if (triggerInfo.effectType == EFFECT_TYPE.MAGIC_BIRD || targetInfo.effectType == EFFECT_TYPE.MAGIC_BIRD) {
                effect = new SpecialEffects.MagicBirdWithOther(map, triggerInfo, targetInfo);
                effect.play(() => {
                    this.diffuseEffect(map, effect.getStrikeList(), () => {
                        this.dropDown(map, callback);
                    });
                });
                return;
            } else {
                // 线性交叉
                if ((triggerInfo.effectType == EFFECT_TYPE.COL_LINE && targetInfo.effectType == EFFECT_TYPE.ROW_LINE) ||
                    (triggerInfo.effectType == EFFECT_TYPE.ROW_LINE && targetInfo.effectType == EFFECT_TYPE.COL_LINE)) {
                    effect = new SpecialEffects.LinearCross(map, triggerInfo, targetInfo);
                } else if (triggerInfo.effectType == EFFECT_TYPE.ROW_LINE && targetInfo.effectType == EFFECT_TYPE.ROW_LINE) {
                    // 双横向
                    effect = new SpecialEffects.DoubleLinearRow(map, triggerInfo, targetInfo);
                } else if (triggerInfo.effectType == EFFECT_TYPE.COL_LINE && targetInfo.effectType == EFFECT_TYPE.COL_LINE) {
                    // 双纵向
                    effect = new SpecialEffects.DoubleLinearCol(map, triggerInfo, targetInfo);
                } else if ((triggerInfo.effectType == EFFECT_TYPE.ROW_LINE && targetInfo.effectType == EFFECT_TYPE.BOMB) ||
                    (triggerInfo.effectType == EFFECT_TYPE.BOMB && targetInfo.effectType == EFFECT_TYPE.ROW_LINE)) {
                    // 横向爆炸
                    effect = new SpecialEffects.LinearRowBomb(map, triggerInfo, targetInfo);
                } else if ((triggerInfo.effectType == EFFECT_TYPE.COL_LINE && targetInfo.effectType == EFFECT_TYPE.BOMB) ||
                    (triggerInfo.effectType == EFFECT_TYPE.BOMB && targetInfo.effectType == EFFECT_TYPE.COL_LINE)) {
                    // 纵向爆炸
                    effect = new SpecialEffects.LinearColBomb(map, triggerInfo, targetInfo);
                } else if (triggerInfo.effectType == EFFECT_TYPE.BOMB && targetInfo.effectType == EFFECT_TYPE.BOMB) {
                    // 双爆
                    effect = new SpecialEffects.DoubleBomb(map, triggerInfo, targetInfo);
                }
            }
        }

        if (effect != null) {
            effect.play(() => {
                effect.eliminate();

                this.exec(map, effect.getStrikeList(), () => {
                    this.dropDown(map, callback);
                });
            })
        }
    }



}
