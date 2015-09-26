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
    let diff = Math.abs(placedBlock.left - prevBlock.left);
    let absDiff = Math.abs(diff);
    console.log(absDiff);

    let left, width;
    if (absDiff >= placedBlock.width) {
      console.log('Game over');
    } else if (absDiff > 0) {
      width = placedBlock.width - diff;
      left = prevBlock.left; 
    } else {
      width = placedBlock.width;
      left = placedBlock.left;
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


const SoHighApp = React.createClass({
  render() {
    return <Stack />;
  }
});


React.render(
  <Stack />,
  document.getElementById('ui-content')
);
