import React from 'react';
import './../App.css';
import Timer from "./Timer";

interface IProps {
}

interface IState {
    temp?: number;
}
interface ITemp {
    temp: number[];
}
class Temperature extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            temp: 0
        };
    }

    componentDidMount() {
        // fetch('/temp')
        //     .then(response => response.text())
        //     .then(state => {
        //         let bla: ITemp;
        //             // this.setLedState(state);
        //         bla = JSON.parse(state) as ITemp;
        //             console.log(bla.temp);
        //         });
    }

    // handleStateChange(ledOn) {
    //   fetch('/temp', { method: 'PUT', body: ledOn ? '0' : '1' })
    //     .then(response => response.text())
    //     .then(state => this.setLedState(state));
    // }
    render() {
        return (
            <div>
                <div>
                    {/* <p>
                        Temp: {this.state.temp}
                    </p> */}
                </div>
                <div>
                    <Timer></Timer>
                </div>

            </div>
        );
    }
}

export default Temperature;
