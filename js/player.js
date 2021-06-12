/*jslint browser this */
/*global _, shipFactory, player, utils */

(function (global) {
    "use strict";

    var sheep = {
        dom: {
            parentNode: {
                removeChild: function () {
                }
            }
        }
    };

    var player = {
        grid: [],
        tries: [],
        fleet: [],
        rowResult: [],
        game: null,
        activeShip: 0,
        init: function () {
            // créé la flotte
            this.fleet.push(shipFactory.build(shipFactory.TYPE_BATTLESHIP));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_DESTROYER));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_SUBMARINE));
            this.fleet.push(shipFactory.build(shipFactory.TYPE_SMALL_SHIP));

            // créé les grilles
            this.grid = utils.createGrid(10, 10);
            this.tries = utils.createGrid(10, 10);
        },
        play: function (col, line) {
            // appel la fonction fire du game, et lui passe une callback pour récupérer le résultat du tir
            this.game.fire(this, col, line, _.bind(function (hasSucced) {
                this.tries[line][col] = hasSucced;
            }, this));
        },
        // quand il est attaqué le joueur doit dire si il a un bateaux ou non à l'emplacement choisi par l'adversaire
        receiveAttack: function (col, line, target1, callback) {
            var succeed = false;
            var isFire = false;
            if (target1.tries[line][col] === false || target1.tries[line][col] === true && target1.tries[line][col] !== 0) {
                isFire = true;
            }
            if (this.grid[line][col] !== 0) {
                succeed = true;
                this.grid[line][col] = "x";
            }
            callback.call(undefined, succeed, isFire);
        },
        setActiveShipPosition: function (x, y) {
            var ship = this.fleet[this.activeShip];
            var i = 0;
            // console.log(ship)
            // console.log(y);
            if (ship.getIsHorizontal()) {
                //if (ship.getLife() == 3);

                if (ship.getLife() === 3) {
                    x = x - 1
                } else {
                    x = x - 2
                }
                while (i < ship.getLife()) {
                    if (this.grid[y][x + i] > 0) {
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

            } else {
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
            return true;
        },
        clearPreview: function () {
            this.fleet.forEach(function (ship) {
                //console.log(ship)
                if (ship.dom.parentNode) {
                    ship.dom.parentNode.removeChild(ship.dom);
                }
            });
        },
        resetShipPlacement: function () {
            this.clearPreview();

            this.activeShip = 0;
            this.grid = utils.createGrid(10, 10);
        },
        activateNextShip: function () {
            if (this.activeShip < this.fleet.length - 1) {
                this.activeShip += 1;
                return true;
            } else {
                return false;
            }
        },
        renderTries: function (grid, status) {
            var that = this;
            setTimeout(function () {


                that.tries.forEach(function (row, rid) {

                    row.forEach(function (val, col) {

                        var node = grid.querySelector('.row:nth-child(' + (rid + 1) + ') .cell:nth-child(' + (col + 1) + ')');
                        if (val === true) {
                            node.innerHTML = '<div class="hit fire ng-scope" ng-if="cell.player &amp;&amp; cell.checked &amp;&amp; !cell.isDestroyed" style=""> \n' +
                                '  <div class="particle"></div> \n' +
                                '  <div class="particle"></div>\n' +
                                '  <div class="particle"></div> \n' +
                                '</div>';
                            node.style.backgroundColor = '#e60019';
                        } else if (val === false && status !== 'bot') {
                            return animLoose(node);
                        }
                    });
                });
            }, 100)
        },
        setGame(game) {
            this.game = game;
        },
        renderShips: function (grid) {
        }
    };

    global.player = player;

}(this));

function animLoose(elem) {
    if (elem.style.background === "") {
        elem.innerHTML = '<div class="percent">\n' +
            '     <div class="percentNum" id="count"></div>\n' +
            '  </div>\n' +
            '  <div id="water" class="water">\n' +
            '    <svg viewBox="0 0 560 20" class="water_wave water_wave_back">\n' +
            '      <use xlink:href="#wave"></use>\n' +
            '    </svg>\n' +
            '    <svg viewBox="0 0 560 20" class="water_wave water_wave_front">\n' +
            '      <use xlink:href="#wave"></use>\n' +
            '    </svg>\n' +
            '  </div>';
        const cnt = elem.childNodes[0].children[0];
        const water = elem.childNodes[2];
        let percent = cnt.innerText;
        let interval;
        interval = setInterval(function () {
            percent++;
            water.style.transform = 'translate(0' + ',' + (100 - percent) + '%)';
            if (percent === 100) {
                elem.innerHTML = "";
                elem.style.background = '#aeaeae';
                clearInterval(interval);
            }
        }, 20);
    }
}