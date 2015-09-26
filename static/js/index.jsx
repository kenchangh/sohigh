const Block = React.createClass({
  getInitialState() {
    // set midpoint at initialState
    // query dom only once
    const windowWidth = $(window).width();
    return {
      windowWidth
    };
  },

  onBlockStop() {
    const $block = $(React.findDOMNode(this.refs.block));
    this.props.onBlockStop($block);
  },

  componentDidMount() {
    if (this.props.moving) {
      const $block = $(React.findDOMNode(this.refs.block));
      const block = this;
      let stopAnim = false;

      $('body').keyup((e) => {
        if ((e.which === 27) && (block.props.player === 1)) {
          stopAnim = true;
        } else if ((e.which === 13) && (block.props.player === 2)) {
          stopAnim = true;
        } else {
          stopAnim = false;
        }
      });

      function panLeftAndRight() {
        $block
          .velocity({
            left: 0,
          }, {
            duration: 2000,
            progress() {
              if (stopAnim) {
                $block.velocity("stop", true); // true stops all chained animations
                block.onBlockStop();
              }
            }
          })
          .velocity({
            left: block.state.windowWidth-200,
          }, {
            duration: 2000,
            progress() {
              if (stopAnim) {
                $block.velocity("stop", true); // true stops all chained animations
                block.onBlockStop();
              }
            },
            complete() {
              if (!stopAnim) {
                panLeftAndRight();
              }
            }
          });
      }
      panLeftAndRight();
    }
  },

  render() {
    let style = {
      width: this.props.width,
      height: 100,
      left: this.props.left,
      bottom: 100 * (this.props.index+1),
      position: 'absolute',
    }

    if (this.props.player === 1) {
      style.backgroundColor = '#2196F3';
    } else if (this.props.player === 2) {
      style.backgroundColor = '#EF5350';
    }

    return (
      <div ref="block" style={style}>
      </div>
    );
  }
});


const Stack = React.createClass({
  getInitialState() {
    const windowWidth = $(window).width();
    const midpt = windowWidth/2;

    return {
      stack: [
        { player: 1, width: 200, left: midpt-100, moving: false },
        { player: 2, width: 200, left: midpt-100, moving: true },
      ]          
    };
  },

  styles: {
    base: {
      position: 'absolute',
      backgroundColor: 'grey',
      left: 0,
      bottom: 0,
      height: 100,
      width: '100%',
    }
  },

  onBlockStop($block) {
    const stack = this.state.stack;
    let prevBlock = stack[stack.length-2];
    let placedBlock = stack[stack.length-1];
    placedBlock.moving = false;
    placedBlock.left = $block.position().left;

    let player = placedBlock.player === 1 ? 2 : 1;
    let diff = placedBlock.left - prevBlock.left;
    let absDiff = Math.abs(diff);
    const leftBound = prevBlock.left;
    const rightBound = prevBlock.left + prevBlock.width;

    let left, width;
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

    stack.push({ player, width, left, moving: true });
    this.setState({ stack });
  },

  renderBlockNodes() {
    return this.state.stack.map((block, index) => {
      return (
        <Block
          player={block.player}
          index={index}
          key={index}
          width={block.width}
          left={block.left}
          moving={block.moving}
          onBlockStop={this.onBlockStop}
        />
      );
    });
  },

  render() {
    return (
      <div style={this.styles.base}>
        {this.renderBlockNodes()}
      </div>
    );
  }
});


const RoomList = React.createClass({
  getInitialState() {
    return {
      rooms: [],
      creating: false,
      somethingEntered: false,
      created: false,
    };
  },

  componentDidMount() {
    $("#modal-open").animatedModal({
      modalTarget: 'animatedModal',
      animatedIn: 'bounceInUp',
      animatedOut: 'bounceOutDown',
      color: '#26A69A',
      animationDuration: '.5s',
    });

    $.getJSON('/room', (response) => {
      this.setState({ rooms: response.data });
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
      padding: 0,
    },
    enterBox: {
      marginTop: 100,
      textAlign: 'center',
    },
    closeModal: {
      paddingTop: 20,
      paddingBottom: 20,
      fontSize: 20,
      cursor: 'pointer',
    },
    modal: {
      color: 'white',
    },
    modalContent: {
      paddingTop: 30,
      paddingBottom: 30,
    },
    room: {
      fontSize: 20,
      listStyleType: 'none',
      paddingLeft: 0,
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
      cursor: 'pointer',
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
      color: 'grey',
    }
  },

  renderRooms() {
    if (this.state.rooms.length) {
      const roomNodes = this.state.rooms.map((room) => {
        return <li>{room}</li>;
      });

      return (
        <ul style={this.styles.room}>
          {roomNodes}
        </ul>
      );
    } else {
      return <p style={this.styles.room}>No rooms created so far... :(</p>;
    }
  },

  renderCreateRoom() {
    const roomList = this;

    function onSomethingEntered(e) {
      if (!roomList.state.somethingEntered) {
        roomList.setState({
          somethingEntered: true,
        });
      } else {
        if (e.which === 13) {
          roomList.reqCreateRoom();
        }
      }
    }

    if (this.state.creating) {
      return (
        <div
          ref="createRoomInput"
          style={this.styles.createRoomInput}
          contentEditable="true"
          placeholder="Enter your room name"
          onKeyPress={onSomethingEntered}>
        </div>
      );
    }
  },

  checkJoinedTick() {

  },

  reqCreateRoom() {
    const $createRoomInput = $(React.findDOMNode(this.refs.createRoomInput));
    const roomName = $createRoomInput.text();
    let rooms = this.state.rooms;

    if (roomName !== '') {
      const payload = {
        roomName,
        userId: 'creator',
      };

      rooms.push(roomName);
      $.post('/room/create', payload, (response) => {
        this.setState({ rooms, roomName, created: true });
      });
    }
  },

  createRoom() {
    if (!this.state.creating) {
      const $createRoomBtn = $(React.findDOMNode(this.refs.createRoom));
      $createRoomBtn.velocity({
        bottom: 80,
      }, {
        duration: 200,
        easing: 'easeInBounce',
        complete: () => { this.setState({ creating: true }) }
      });
    } else {
      this.reqCreateRoom(); 
    }
  },

  renderModalContent() {
    if (this.state.created && this.state.roomName) {
      return (
        <div style={this.styles.modalContent} className="col-md-6 col-md-offset-3">
          <h1 style={{marginBottom: 20}}>{this.state.roomName}</h1>
          <p style={this.styles.room}>Waiting for another player to join...</p>
        </div>
      );
    } else {
      return (
        <div style={this.styles.modalContent} className="col-md-6 col-md-offset-3">
          <h1 style={{marginBottom: 20}}>Rooms</h1>
          {this.renderRooms()}

          <div ref="createRoom" onClick={this.createRoom} style={this.styles.createRoom}>
            {this.state.somethingEntered ? 'SUBMIT' : 'CREATE ROOM'}
          </div>

          {this.renderCreateRoom()}
        </div>
      );
    }
  },

  render() {
    return (
      <div style={this.styles.enterBox} className="col-md-6 col-md-offset-3">
        <a style={this.styles.enter} className="btn btn-danger" id="modal-open" href="#animatedModal" role="button">
          PLAY
        </a>
        <div style={this.styles.modal} id="animatedModal">
          <div style={this.styles.closeModal} className="close-animatedModal"> 
            BACK
          </div>

          <div style={{backgroundColor: '#26A69A'}} className="modal-content">
            {this.renderModalContent()}
          </div>
        </div>
      </div>
    );
  }
});


const SoHighApp = React.createClass({
  render() {
    return <RoomList />;
  }
});


React.render(
  <SoHighApp />,
  document.getElementById('ui-content')
);
