"use strict";

var Block = React.createClass({
  displayName: "Block",

  getInitialState: function getInitialState() {
    // set midpoint at initialState
    // query dom only once
    var windowWidth = $(window).width();
    return {
      windowWidth: windowWidth
    };
  },

  onBlockStop: function onBlockStop() {
    var $block = $(React.findDOMNode(this.refs.block));
    this.props.onBlockStop($block);
  },

  componentDidMount: function componentDidMount() {
    var _this = this;

    if (this.props.moving) {
      (function () {
        var panLeftAndRight = function panLeftAndRight() {
          $block.velocity({
            left: 0
          }, {
            duration: 2000,
            progress: function progress() {
              if (stopAnim) {
                $block.velocity("stop", true); // true stops all chained animations
                block.onBlockStop();
              }
            }
          }).velocity({
            left: block.state.windowWidth - 200
          }, {
            duration: 2000,
            progress: function progress() {
              if (stopAnim) {
                $block.velocity("stop", true); // true stops all chained animations
                block.onBlockStop();
              }
            },
            complete: function complete() {
              if (!stopAnim) {
                panLeftAndRight();
              }
            }
          });
        };

        var $block = $(React.findDOMNode(_this.refs.block));
        var block = _this;
        var stopAnim = false;

        $('body').keyup(function (e) {
          if (e.which === 27 && block.props.player === 1) {
            stopAnim = true;
          } else if (e.which === 13 && block.props.player === 2) {
            stopAnim = true;
          } else {
            stopAnim = false;
          }
        });

        panLeftAndRight();
      })();
    }
  },

  render: function render() {
    var style = {
      width: this.props.width,
      height: 100,
      left: this.props.left,
      bottom: 100 * (this.props.index + 1),
      position: 'absolute'
    };

    if (this.props.player === 1) {
      style.backgroundColor = '#2196F3';
    } else if (this.props.player === 2) {
      style.backgroundColor = '#EF5350';
    }

    return React.createElement("div", { ref: "block", style: style });
  }
});

var Stack = React.createClass({
  displayName: "Stack",

  getInitialState: function getInitialState() {
    var windowWidth = $(window).width();
    var midpt = windowWidth / 2;

    return {
      stack: [{ player: 1, width: 200, left: midpt - 100, moving: false }, { player: 2, width: 200, left: midpt - 100, moving: true }]
    };
  },

  styles: {
    base: {
      position: 'absolute',
      backgroundColor: 'grey',
      left: 0,
      bottom: 0,
      height: 100,
      width: '100%'
    }
  },

  onBlockStop: function onBlockStop($block) {
    var stack = this.state.stack;
    var prevBlock = stack[stack.length - 2];
    var placedBlock = stack[stack.length - 1];
    placedBlock.moving = false;
    placedBlock.left = $block.position().left;

    var player = placedBlock.player === 1 ? 2 : 1;
    var diff = placedBlock.left - prevBlock.left;
    var absDiff = Math.abs(diff);
    var leftBound = prevBlock.left;
    var rightBound = prevBlock.left + prevBlock.width;

    var left = undefined,
        width = undefined;
    if (placedBlock.left < leftBound) {
      if (absDiff >= placedBlock.width) {
        console.log('Game over');
      } else {
        left = leftBound;
        width = placedBlock.width - absDiff;
      }
    } else if (placedBlock.left > leftBound) {
      if (absDiff >= prevBlock.width) {
        console.log('Game over');
      } else {
        left = placedBlock.left;
        width = rightBound - placedBlock.left;
      }
    } else {
      left = placedBlock.left;
      width = placedBlock.width;
    }

    stack.push({ player: player, width: width, left: left, moving: true });
    this.setState({ stack: stack });
  },

  renderBlockNodes: function renderBlockNodes() {
    var _this2 = this;

    return this.state.stack.map(function (block, index) {
      return React.createElement(Block, {
        player: block.player,
        index: index,
        key: index,
        width: block.width,
        left: block.left,
        moving: block.moving,
        onBlockStop: _this2.onBlockStop
      });
    });
  },

  render: function render() {
    return React.createElement(
      "div",
      { style: this.styles.base },
      this.renderBlockNodes()
    );
  }
});

var SoHighApp = React.createClass({
  displayName: "SoHighApp",

  render: function render() {
    return React.createElement(Stack, null);
  }
});

React.render(React.createElement(Stack, null), document.getElementById('ui-content'));
