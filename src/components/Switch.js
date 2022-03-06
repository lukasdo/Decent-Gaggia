import React, { Component } from 'react';
import ToggleButton from 'react-toggle-button';
import logo from './logo.svg';
import Tab from '@material/react-tab';
import TabBar from '@material/react-tab-bar';
import './App.css';

class Chart extends Component {
  constructor(props) {
    super(props);
    this.state = {
        ledOn: false,
        activeIndex: 0,
     };
  }

  setLedState(state) {
    this.setState({ ledOn: state !== '0' })
  }

  componentDidMount() {
    // fetch('/led')
    //   .then(response => response.text())
    //   .then(state => this.setLedState(state));
  }

  handleStateChange(ledOn) {
    // fetch('/led', { method: 'PUT', body: ledOn ? '0' : '1' })
    //   .then(response => response.text())
    //   .then(state => this.setLedState(state));
  }
  render() {
    return (
      <div className="App">

         <TabBar
                  activeIndex={this.state.activeIndex}
                  handleActiveIndexUpdate={this.handleActiveIndexUpdate}
                >
                  <Tab>
                    <span className='mdc-tab__text-label'>Settings</span>
                  </Tab>
                     <Tab>
                                      <span className='mdc-tab__text-label'>Shot</span>
                                    </Tab>
                </TabBar>
          <ToggleButton
            value={this.state.ledOn}
            onToggle={value => this.handleStateChange(value)}
          />
      </div>
    );
  }
}

export default Chart;
