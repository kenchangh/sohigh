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

var RoomList = React.createClass({
  displayName: "RoomList",

  getInitialState: function getInitialState() {
    return {
      rooms: [],
      creating: false,
      somethingEntered: false,
      created: false
    };
  },

  componentDidMount: function componentDidMount() {
    var _this3 = this;

    $("#modal-open").animatedModal({
      modalTarget: 'animatedModal',
      animatedIn: 'bounceInUp',
      animatedOut: 'bounceOutDown',
      color: '#26A69A',
      animationDuration: '.5s'
    });

    $.getJSON('/room', function (response) {
      _this3.setState({ rooms: response.data });
    });
  },

  styles: {
    enter: {
      borderRadius: '50%',
      backgroundColor: '#E74B3D',
      width: 100,
      height: 100,
      textAlign: 'center',
      fontSize: 25,
      marginTop: 20,
      marginBottom: 20,
      position: 'relative',
      lineHeight: '100px',
      padding: 0
    },
    enterBox: {
      marginTop: 100,
      textAlign: 'center'
    },
    closeModal: {
      paddingTop: 20,
      paddingBottom: 20,
      fontSize: 20,
      cursor: 'pointer'
    },
    modal: {
      color: 'white'
    },
    modalContent: {
      paddingTop: 30,
      paddingBottom: 30
    },
    room: {
      fontSize: 20,
      listStyleType: 'none',
      paddingLeft: 0
    },
    createRoom: {
      width: '100%',
      backgroundColor: '#EF5350',
      position: 'fixed',
      left: 0,
      bottom: 0,
      height: 80,
      paddingTop: 20,
      fontSize: 30,
      cursor: 'pointer'
    },
    createRoomInput: {
      left: 0,
      bottom: 0,
      height: 80,
      fontSize: 30,
      textAlign: 'center',
      paddingTop: 20,
      width: '100%',
      position: 'fixed',
      backgroundColor: 'white',
      color: 'grey'
    }
  },

  renderRooms: function renderRooms() {
    if (this.state.rooms.length) {
      var roomNodes = this.state.rooms.map(function (room) {
        return React.createElement(
          "li",
          null,
          room
        );
      });

      return React.createElement(
        "ul",
        { style: this.styles.room },
        roomNodes
      );
    } else {
      return React.createElement(
        "p",
        { style: this.styles.room },
        "No rooms created so far... :("
      );
    }
  },

  renderCreateRoom: function renderCreateRoom() {
    var roomList = this;

    function onSomethingEntered(e) {
      if (!roomList.state.somethingEntered) {
        roomList.setState({
          somethingEntered: true
        });
      } else {
        if (e.which === 13) {
          roomList.reqCreateRoom();
        }
      }
    }

    if (this.state.creating) {
      return React.createElement("div", {
        ref: "createRoomInput",
        style: this.styles.createRoomInput,
        contentEditable: "true",
        placeholder: "Enter your room name",
        onKeyPress: onSomethingEntered });
    }
  },

  checkJoinedTick: function checkJoinedTick() {},

  reqCreateRoom: function reqCreateRoom() {
    var _this4 = this;

    var $createRoomInput = $(React.findDOMNode(this.refs.createRoomInput));
    var roomName = $createRoomInput.text();
    var rooms = this.state.rooms;

    if (roomName !== '') {
      var payload = {
        roomName: roomName,
        userId: 'creator'
      };

      rooms.push(roomName);
      $.post('/room/create', payload, function (response) {
        _this4.setState({ rooms: rooms, roomName: roomName, created: true });
      });
    }
  },

  createRoom: function createRoom() {
    var _this5 = this;

    if (!this.state.creating) {
      var $createRoomBtn = $(React.findDOMNode(this.refs.createRoom));
      $createRoomBtn.velocity({
        bottom: 80
      }, {
        duration: 200,
        easing: 'easeInBounce',
        complete: function complete() {
          _this5.setState({ creating: true });
        }
      });
    } else {
      this.reqCreateRoom();
    }
  },

  renderModalContent: function renderModalContent() {
    if (this.state.created && this.state.roomName) {
      return React.createElement(
        "div",
        { style: this.styles.modalContent, className: "col-md-6 col-md-offset-3" },
        React.createElement(
          "h1",
          { style: { marginBottom: 20 } },
          this.state.roomName
        ),
        React.createElement(
          "p",
          { style: this.styles.room },
          "Waiting for another player to join..."
        )
      );
    } else {
      return React.createElement(
        "div",
        { style: this.styles.modalContent, className: "col-md-6 col-md-offset-3" },
        React.createElement(
          "h1",
          { style: { marginBottom: 20 } },
          "Rooms"
        ),
        this.renderRooms(),
        React.createElement(
          "div",
          { ref: "createRoom", onClick: this.createRoom, style: this.styles.createRoom },
          this.state.somethingEntered ? 'SUBMIT' : 'CREATE ROOM'
        ),
        this.renderCreateRoom()
      );
    }
  },

  render: function render() {
    return React.createElement(
      "div",
      { style: this.styles.enterBox, className: "col-md-6 col-md-offset-3" },
      React.createElement(
        "a",
        { style: this.styles.enter, className: "btn btn-danger", id: "modal-open", href: "#animatedModal", role: "button" },
        "PLAY"
      ),
      React.createElement(
        "div",
        { style: this.styles.modal, id: "animatedModal" },
        React.createElement(
          "div",
          { style: this.styles.closeModal, className: "close-animatedModal" },
          "BACK"
        ),
        React.createElement(
          "div",
          { style: { backgroundColor: '#26A69A' }, className: "modal-content" },
          this.renderModalContent()
        )
      )
    );
  }
});

var SoHighApp = React.createClass({
  displayName: "SoHighApp",

  render: function render() {
    return React.createElement(RoomList, null);
  }
});

React.render(React.createElement(SoHighApp, null), document.getElementById('ui-content'));
