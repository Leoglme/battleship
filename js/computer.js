/*jslint browser this */
/*global _, player */

(function (global) {
    "use strict";

    var computer = _.assign({}, player, {
        grid: [],
        tries: [],
        fleet: [],
        game: null,
        play: function () {
            var self = this;

            let col = Math.floor(Math.random() * 10);
            let row = Math.floor(Math.random() * 10);
            let inFire = this.tries[row][col];
            if(inFire !== 0) {
                while (inFire !== 0) {
                    col = Math.floor(Math.random() * 10);
                    row = Math.floor(Math.random() * 10);
                    inFire = this.tries[row][col];
                }
            }
            setTimeout(function () {
                self.game.fire(this, col, row, function (hasSucced) {
                    //console.log(row)
                    self.tries[row][col] = hasSucced;
                });
            }, 200);
        },
        isShipOk: function (callback) {
            
            var i = 0;
            var j;

            this.fleet.forEach(function (ship, i) {
                let Orientation;
                let Col;
                let Row;
                
                do 
                {
                    Orientation = (Math.floor(Math.random() * 2));
                    Col = Math.floor(Math.random() * 10);
                    Row = Math.floor(Math.random() * 10);
                }
                while (!this.setActiveShipPosition(Col, Row, ship, Orientation)) 
                if (this.activeShip < this.fleet.length - 1) {
                    this.activeShip += 1;
                    return true;
                } else {
                    return false;
                }
            }, this);

            setTimeout(function () {
                callback();
            }, 500);
        },
        setActiveShipPosition: function (x, y, ship, Orientation) {
            var ship = this.fleet[this.activeShip];
            var i = 0;

            if (Orientation === 1) {

                if (ship.getLife() === 3)
                {
                    x = x - 1
                }
                else
                {
                    x = x - 2
                }
                while (i < ship.getLife()) {
                    if (this.grid[y][x + i] > 0) 
                    {
                        return false;
                    }
                    i += 1;
                }
                if (x < 0 || (x + ship.getLife() > 10)) {
                    return false;
                }
                i = 0;
                while (i < ship.getLife()) {
                    this.grid[y][x + i] = ship.getId();
                    i += 1;
                }
            } 
            else 
            {
                if (ship.getLife() == 3) y++;

                while (i < ship.getLife()) {
                    if (!this.grid[y + i - 2] || this.grid[y + i - 2][x] > 0) {
                        return false;
                    }
                    i += 1;
                }

                if (y < 2 || (y + ship.getLife() > 12)) {
                    return false;
                }

                i = 0;
                while (i < ship.getLife()) {
                    this.grid[y + i - 2][x] = ship.getId();
                    i += 1;
                }
            }
            //console.log(this.grid);
            return true;
        },
    });
    
    global.computer = computer;

}(this));