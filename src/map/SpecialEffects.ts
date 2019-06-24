namespace SpecialEffects {
    class Base {
        private map: BlockMap = null;
        private keyInfo: BlockInfo = null;
        private strikeList: BlockBase[] = null;

        constructor(map: BlockMap, keyInfo?: BlockInfo) {
            this.map = map;
            this.keyInfo = keyInfo == undefined ? null : keyInfo;

            this.strikeList = new Array();
        }

        public play(callback: Function): void {
            setTimeout(callback, 50);
        }

        public eliminate(): void {}

        public getMap(): BlockMap {
            return this.map;
        }

        public getKeyInfo(): BlockInfo {
            return this.keyInfo;
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
    }
    
    export class Bomb extends Base {
        constructor(map: BlockMap, keyInfo?: BlockInfo) {
            super(map, keyInfo);
        }

        public eliminate() {
            let info: BlockInfo = this.getKeyInfo();

            if (!info) {
                return;
            }

            this.remove(info.row-1, info.col);
            this.remove(info.row-2, info.col);
            this.remove(info.row+1, info.col);
            this.remove(info.row+2, info.col);

            this.remove(info.row, info.col-1);
            this.remove(info.row, info.col-2);
            this.remove(info.row, info.col+1);
            this.remove(info.row, info.col+2);

            this.remove(info.row-1, info.col-1);
            this.remove(info.row-1, info.col+1);
            this.remove(info.row+1, info.col-1);
            this.remove(info.row+1, info.col+1);
        }
    }
     
    export class LinearRow extends Base {
        constructor(map: BlockMap, keyInfo?: BlockInfo) {
            super(map, keyInfo);
        }

        public eliminate() {
            let map: BlockMap = this.getMap();
            let info: BlockInfo = this.getKeyInfo();
            
            if (!map || !info) {
                return;
            }

            for (let col = 0; col < map.getColAmount(); col++) {
                this.remove(info.row, col);
            }
        }
    }

    export class LinearColumn extends Base {
        constructor(map: BlockMap, keyInfo?: BlockInfo) {
            super(map, keyInfo);
        }

        public eliminate() {
            let map: BlockMap = this.getMap();
            let info: BlockInfo = this.getKeyInfo();
            
            if (!map && info) {
                return;
            }

            for (let row = 0; row < map.getRowAmount(); row++) {
                this.remove(row, info.col);
            }
        }
    }

    export class LinearCross {}

    export class MagicBird extends Base {
        constructor(map: BlockMap, keyInfo?: BlockInfo) {
            super(map, keyInfo);
        }

        public eliminate() {
            let map: BlockMap = this.getMap();
            let info: BlockInfo = this.getKeyInfo();
            
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
}
