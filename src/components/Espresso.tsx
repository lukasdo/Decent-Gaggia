import { Switch } from "@mui/material";
import React from 'react';
import { ChartComponentProps, Line } from "react-chartjs-2";
import './../App.css';
import ARDUINO_IP from '../config';
import Timer from "./Timer";

interface IMessage {
    temp: number;
    brewTemp: number;
    brewTime: number;
}

interface IProps {
}

interface IState {
    update: boolean;
    temp: number;
    brewTemp: number[];
    brewTime: number[];
    setPoint: number;
    data: ChartComponentProps;
    steaming: boolean;
    startUp: boolean;
    wsConnected: boolean;

}

const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    scales: {
        yAxes: [{
            display: true,
            ticks: {
                suggestedMin: 80,    // minimum will be 0, unless there is a lower value.

                maxTicksLimit: 5,
            }
        }],
        xAxes: [{
            type: 'time',
            time: {
                parser: 'HH:mm:ss',
                unit: 'minute',
                displayFormats: {
                    'minute': 'HH:mm:ss',
                    'hour': 'HH:mm:ss'
                }
            },
            ticks: {
                source: 'data',
                autoSkip: true,
                maxTicksLimit: 10,
            },
        }]
    }
}



class Espresso extends React.Component<IProps, IState> {
    ws = new WebSocket(`ws://${ARDUINO_IP.ARDUINO_IP}:90/ws`);

    private myRef: React.RefObject<Line>;
    constructor(props: IProps) {
        super(props);
        this.changeSteamingState = this.changeSteamingState.bind(this);
        this.myRef = React.createRef();

        let sessionData = sessionStorage.getItem('data');
        if (sessionData) {
            let sessionState = JSON.parse(sessionData);
            this.state = sessionState;
            this.myRef.current?.chartInstance.update();

        } else {
            this.state = {
                update: false,
                temp: 20,
                brewTemp: [],
                brewTime: [],
                setPoint: 95,
                startUp: false,
                steaming: false,
                wsConnected: false,
                data: {
                    data: {
                        datasets: [
                            {
                                label: "Temperature",
                                data: [],
                            },
                        ]
                    }
                }
            }

        }
    }

    getTimeString() {
        return Date.now();
    }

    componentDidMount() {
        this.myRef.current?.chartInstance.update();
        this.setState({ wsConnected: false });

        fetch(`http://${ARDUINO_IP.ARDUINO_IP}:80/steaming`)
            .then(response => response.text())
            .then((state) => {
                this.setSteamingState(JSON.parse(state))
            })
            .catch(error => {
                console.error(error);
                alert("Could not fetch steaming state, setting default to espresso");
            });
    }

    componentWillUnmount() {
        let seen: any[] = [];

        let stringified = JSON.stringify(this.state, function (key, val) {
            if (val != null && typeof val == "object") {
                if (seen.indexOf(val) >= 0) {
                    return;
                }
                seen.push(val);
            }
            return val;
        });
        sessionStorage.setItem('data', stringified);
    }


    setSteamingState(state: boolean) {
        this.setState({ steaming: state })
    }

    startConnection = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (this.state.wsConnected) {
            this.ws.close();
            this.setState({ wsConnected: false });
        }

        if (event.target.checked) {
            this.ws = new WebSocket(`ws://${ARDUINO_IP.ARDUINO_IP}:90/ws`);
        }
        this.ws.onopen = () => {
            // on connecting, do nothing but log it to the console
            console.log('connected')
            this.setState({ wsConnected: true })
        }

        this.ws.onmessage = evt => {
            // listen to data sent from the websocket server
            const message: IMessage = JSON.parse(evt.data);
            this.setState({
                temp: message.temp,
                brewTime: [...this.state.brewTime, this.getTimeString()],
                brewTemp: [...this.state.brewTemp, message.brewTemp],
                data: {
                    data: {
                        labels: this.state.brewTime,
                        datasets: [
                            {
                                label: "Temperature",
                                data: this.state.brewTemp,
                                fill: true,
                                backgroundColor: "rgba(75,192,192,0.2)",
                                borderColor: "rgba(75,192,192,1)"
                            },
                        ]
                    }
                }
            });
        }
        this.ws.onclose = () => {
            console.log('disconnected')

            this.setState({ wsConnected: false })
        }
    }


    stopConnec = () => {
        this.ws.close();
    }

    changeSteamingState(event: React.ChangeEvent<HTMLInputElement>) {
        let formData = new FormData();
        formData.append('steaming', event.target.checked ? '1' : '0');
        fetch(`http://${ARDUINO_IP.ARDUINO_IP}:80/steaming`,
            {
                method: 'POST',
                body: formData
            })
            .then(response => response.text())
            .then(state => this.setSteamingState(JSON.parse(state)))
            .catch(error => {
                console.error(error);
            });
    }


    render() {
        return (
            <div className="container">
                <div className="row">
                    <div className="col-3">

                        <Line ref={this.myRef} options={chartOptions} data={this.state.data.data} />
                    </div>
                    <div className="col-1">
                        <div>
                            <p>Temperature</p>
                            <div id="gauge3" className="gauge-container three">
                                <span className="time">{this.state.temp}</span>
                            </div>
                            <Timer></Timer>
                            <p>Connect</p>
                            <Switch
                                checked={this.state.wsConnected}
                                onChange={this.startConnection}
                                inputProps={{ 'aria-label': 'controlled' }}
                            />
                            <p>Steaming</p>
                            <Switch
                                checked={this.state.steaming}
                                onChange={this.changeSteamingState}
                                inputProps={{ 'aria-label': 'controlled' }}
                            />
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-3"></div>
                    <div className="col-1">

                    </div>

                </div>
            </div>

        );
    }
}

export default Espresso;