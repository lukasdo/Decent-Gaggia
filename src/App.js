import React, {Component} from 'react';
import './App.css';
import Chart from "./components/Chart";
import Temperature from "./components/Temperature";
import BasicTabs from "./components/BasicTabs";

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            ledOn: false,
            activeIndex: 0,
        };
    }

    handleActiveIndexUpdate = (activeIndex) => this.setState({activeIndex});

    setLedState(state) {
        this.setState({ledOn: state !== '0'})
    }
    getCurrentTab() {
        let content_array = [<Chart></Chart>, <Temperature></Temperature>];
        return content_array[this.state.activeIndex];
    }
    componentDidMount() {
        fetch('/led')
            .then(response => response.text())
            .then(state => this.setLedState(state));
    }

    handleStateChange(ledOn) {
        fetch('/led', {method: 'PUT', body: ledOn ? '0' : '1'})
            .then(response => response.text())
            .then(state => this.setLedState(state));
    }

    render() {
        return (
            <div className="App">
                <BasicTabs></BasicTabs>
                {/*<TabBar*/}
                {/*    activeIndex={this.state.activeIndex}*/}
                {/*    handleActiveIndexUpdate={this.handleActiveIndexUpdate}*/}
                {/*>*/}
                {/*    <Tab>*/}
                {/*        <span className='mdc-tab__text-label'>Settings</span>*/}
                {/*    </Tab>*/}
                {/*    <Tab>*/}
                {/*        <span className='mdc-tab__text-label'>Shot</span>*/}
                {/*    </Tab>*/}
                {/*</TabBar>*/}
                {/*<div>*/}
                {/*    {this.getCurrentTab()}*/}
                {/*</div>*/}

            </div>
        );
    }
}

export default App;
