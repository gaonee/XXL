namespace SpecialEffects {
    class Eliminate {
        public static bomb(effect: Base, scope: number) {
            let map: BlockMap = effect.getMap();
            let info: BlockInfo = effect.getTriggerInfo();
            
            if (!map || !info) {
                return;
            }

            let rowTop = info.row - scope;
            let rowBottom = info.row + scope;

            rowTop = rowTop < 0 ? 0 : rowTop;
            rowBottom = rowBottom >= map.getRowAmount() ? map.getRowAmount() : rowBottom;

            for (let row = rowTop; row <= rowBottom; row++) {
                let count = (scope*2 + 1) - Math.abs(row - info.row)*2;
                let colLeft = info.col - (count-1)/2;
                let colRight = colLeft + count;

                for (let col = colLeft; col <= colRight; col++) {
                    map.remove(row, col);
                }
            }
        }
        public static clear(effect: Base) {
            let map: BlockMap = effect.getMap();

            if (!map) {
                return;
            }

            let rowNum = map.getRowAmount();
            let colNum = map.getColAmount();

            for (let row = 0; row < rowNum; row++) {
                for (let col = 0; col < colNum; col++) {
                    effect.remove(row, col);
                }
            }
        }
        public static linearCol(effect: Base, col: number) {
            let map: BlockMap = effect.getMap();
            
            if (!map) {
                return;
            }

            let rowNum = map.getRowAmount();
            for (let row = 0; row < rowNum; row++) {
                effect.remove(row, col);
            }
        }
        public static linearRow(effect: Base, row: number) {
            let map: BlockMap = effect.getMap();
            
            if (!map) {
                return;
            }

            let colNum = map.getColAmount();
            for (let col = 0; col < colNum; col++) {
                effect.remove(row, col);
            }
        }
    }

    export class Base {
        protected map: BlockMap = null;
        protected triggerInfo: BlockInfo = null;
        protected targetInfo: BlockInfo = null;
        protected strikeList: BlockBase[] = null;

        constructor(map: BlockMap, triggerInfo?: BlockInfo, targetInfo?: BlockInfo) {
            if (!map) return null;
            this.map = map;
            this.triggerInfo = triggerInfo == undefined ? null : triggerInfo;
            this.targetInfo = targetInfo == undefined ? null : targetInfo;

            this.strikeList = new Array();
        }

        public play(callback: Function): void {
            setTimeout(callback, 200);
        }

        public eliminate(callback?: Function): void {
            callback && callback();
        }

        public getMap(): BlockMap {
            return this.map;
        }

        public getTriggerInfo(): BlockInfo {
            return this.triggerInfo;
        }

        public getStrikeList(): BlockBase[] {
            return this.strikeList;
        }

        public remove(row: number, col: number) {
            let block = this.map.get(row, col);
            if (block != null) {
                this.map.remove(row, col);
                
                // 是否是特效
                if (block.getSpecialEffect() != null) {
                    this.strikeList.push(block);
                }
            }
        }

        public reset() {
            this.strikeList = new Array();
        }
    }
    
    export class Bomb extends Base {
        constructor(map: BlockMap, triggerInfo: BlockInfo) {
            super(map, triggerInfo);
        }

        public eliminate() {
            Log.debug("SpecialEffects: Bomb!");
            Eliminate.bomb(this, 2);
        }
    }

    export class DoubleBomb extends Base {
        constructor(map: BlockMap, triggerInfo: BlockInfo, targetInfo: BlockInfo) {
            super(map, triggerInfo, targetInfo);
        }

        public eliminate() {
            Log.debug("SpecialEffects: DoubleBomb!");
            Eliminate.bomb(this, 4);
        }
    }

    export class DoubleMagicBird extends Base {
        constructor(map: BlockMap, triggerInfo: BlockInfo, targetInfo: BlockInfo) {
            super(map, triggerInfo, targetInfo);
        }

        public eliminate() {
            Eliminate.clear(this);
        }

        public play(callback: Function) {
            if (!this.map) {
                return;
            }

            let rowNum = this.map.getRowAmount();
            let colNum = this.map.getColAmount();
            
            this.reset();

            for (let row = 0; row < rowNum; row++) {
                for (let col = 0; col < colNum; col++) {
                    let block = this.map.get(row, col);
                    if (block && block.getSpecialEffect()) {
                        this.strikeList.push(block);
                    }
                }
            }

            callback && setTimeout(callback, 200);
        }
    }

    export class DoubleLinearRow extends Base {
        constructor(map: BlockMap, triggerInfo: BlockInfo, targetInfo: BlockInfo) {
            super(map, triggerInfo, targetInfo);
        }

        public eliminate() {
            Log.debug("SpecialEffects: DoubleLinearRow!");
            if (this.triggerInfo && this.targetInfo) {
                Eliminate.linearRow(this, this.triggerInfo.row);
                Eliminate.linearRow(this, this.targetInfo.row);
            }
        }
    }

    export class DoubleLinearCol extends Base {
        constructor(map: BlockMap, triggerInfo: BlockInfo, targetInfo: BlockInfo) {
            super(map, triggerInfo, targetInfo);
        }

        public eliminate() {
            Log.debug("SpecialEffects: DoubleLinearCol!");
            if (this.triggerInfo && this.targetInfo) {
                Eliminate.linearCol(this, this.triggerInfo.col);
                Eliminate.linearCol(this, this.targetInfo.col);
            }
        }
    }
     
    export class LinearRow extends Base {
        constructor(map: BlockMap, triggerInfo: BlockInfo) {
            super(map, triggerInfo);
        }

        public eliminate() {
            Log.debug("SpecialEffects: LinearRow!");
            if (this.triggerInfo) {
                Eliminate.linearRow(this, this.triggerInfo.row);
            }
        }
    }

    export class LinearColumn extends Base {
        constructor(map: BlockMap, triggerInfo: BlockInfo) {
            super(map, triggerInfo);
        }

        public eliminate() {
            Log.debug("SpecialEffects: LinearColumn!");
            if (this.triggerInfo) {
                Eliminate.linearCol(this, this.triggerInfo.col);
            }
        }
    }

    export class LinearCross extends Base {
        constructor(map: BlockMap, triggerInfo: BlockInfo, targetInfo: BlockInfo) {
            super(map, triggerInfo, targetInfo);
        }

        public eliminate() {
            Log.debug("SpecialEffects: LinearCross!");
            if (this.triggerInfo && this.targetInfo) {
                if (this.triggerInfo.effectType == EFFECT_TYPE.ROW_LINE) {
                    Eliminate.linearRow(this, this.triggerInfo.row);
                    Eliminate.linearCol(this, this.targetInfo.col);
                } else {
                    Eliminate.linearRow(this, this.targetInfo.row);
                    Eliminate.linearCol(this, this.triggerInfo.col);
                }
            }
        }
    }

    export class LinearRowBomb extends Base {
        constructor(map: BlockMap, triggerInfo: BlockInfo, targetInfo: BlockInfo) {
            super(map, triggerInfo, targetInfo);
        }

        public eliminate() {
            Log.debug("SpecialEffects: LinearRowBomb!");
            if (this.triggerInfo && this.targetInfo) {
                let rowTop = Math.min(this.triggerInfo.row, this.targetInfo.row) - 1;
                let rowBottom = rowTop + 3;

                rowTop = rowTop < 0 ? 0 : rowTop;
                rowBottom = rowBottom >= this.map.getRowAmount() ? this.map.getRowAmount() : rowBottom;
                
                for (let row = rowTop; row <= rowBottom; row++) {
                    Eliminate.linearRow(this, row);
                }
            }
        }
    }

    export class LinearColBomb extends Base {
        constructor(map: BlockMap, triggerInfo: BlockInfo, targetInfo: BlockInfo) {
            super(map, triggerInfo, targetInfo);
        }

        public eliminate() {
            Log.debug("SpecialEffects: LinearColBomb!");
            if (this.triggerInfo && this.targetInfo) {
                let colLeft = Math.min(this.triggerInfo.col, this.targetInfo.col) - 1;
                let colRight = colLeft + 3;

                colLeft = colLeft < 0 ? 0 : colLeft;
                colRight = colRight >= this.map.getColAmount() ? this.map.getColAmount() : colRight;
                
                for (let col = colLeft; col <= colRight; col++) {
                    Eliminate.linearCol(this, col);
                }
            }
        }
    }

    export class MagicBird extends Base {
        constructor(map: BlockMap, triggerInfo?: BlockInfo) {
            super(map, triggerInfo);
        }

        public eliminate() {
            Log.debug("SpecialEffects: MagicBird!");
            let map: BlockMap = this.getMap();
            let info: BlockInfo = this.getTriggerInfo();
            
            if (!map || !info) {
                return;
            }

            for (let row = 0; row < map.getRowAmount(); row++)  {
                for (let col = 0; col < map.getColAmount(); col++) {
                    let block = map.get(row, col);
                    if (block != null && block.getType() == info.type) {
                        this.remove(row, col);
                    }
                }
            }
        }
    }

    export class MagicBirdWithOther extends Base {
        constructor(map: BlockMap, triggerInfo: BlockInfo, targetInfo: BlockInfo) {
            super(map, triggerInfo, targetInfo);
        }

        private genEffectType(effectType: EFFECT_TYPE) {
            if (effectType == EFFECT_TYPE.BOMB) {
                return effectType;
            } else {
                return Util.random(1, 2) == 1 ? EFFECT_TYPE.ROW_LINE : EFFECT_TYPE.COL_LINE;
            }
        }

        private playNext(row: number, col: number, processInfo: BlockInfo, callback: Function) {
            let rowNum = this.map.getRowAmount();
            let colNum = this.map.getColAmount();

            if (col == colNum-1) {
                if (row == rowNum-1) {
                    callback && callback();
                    return null;
                } else {
                    row ++;
                    col = 0;
                }
            } else {
                col ++;
            }

            this.playProcess(row, col, processInfo, callback);
        }

        private playProcess(row: number, col: number, processInfo: BlockInfo, callback: Function) {
            let rowNum = this.map.getRowAmount();
            let colNum = this.map.getColAmount();
            let block = this.map.get(row, col);
            
            if (block && block.getType() == processInfo.type) {
                if (block.getSpecialEffect() == null) {
                    // turn to special effect block
                    let blockInfo = block.getBlockInfo();
                    blockInfo.effectType = this.genEffectType(processInfo.effectType);
                    let effectBlock = Util.createBlock(blockInfo);
                    effectBlock.show(this.map.getContainer());
                    this.map.remove(row, col);
                    this.map.add(row, col, effectBlock);
                    this.strikeList.push(effectBlock);

                    setTimeout(() => {
                        this.playNext(row, col, processInfo, callback);
                    }, 60);
                    return;
                }
                this.strikeList.push(block);
            }

            this.playNext(row, col, processInfo, callback);
        }

        public play(callback: Function) {
            if (!this.triggerInfo || !this.targetInfo) return;

            let processInfo = this.triggerInfo.effectType == EFFECT_TYPE.MAGIC_BIRD ? this.targetInfo : this.triggerInfo;

            this.strikeList = new Array();
            this.playProcess(0, 0, processInfo, callback);
        }

        public eliminate(callback: Function) {
            Log.debug("===========eliminate")
        }
    }
}
