import { Slider, Switch } from "@mui/material";
import Box from "@mui/material/Box";
import React from 'react';
import { ChartComponentProps, Line } from "react-chartjs-2";
import ARDUINO_IP from './../config';
import './../App.css';



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


function valuetext(value: number) {
    return `${value}°C`;
}

const marks = [
    {
        value: 80,
        label: '80°C',
    },
    {
        value: 100,
        label: '100°C',
    },
];

let data = {};

class Chart extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);

        this.changeSteamingState = this.changeSteamingState.bind(this);

        let sessionData = sessionStorage.getItem('data');

        if (sessionData) {
            let sessionState = JSON.parse(sessionData);
            this.state = sessionState;
        } else {
            this.state = {
                wsConnected: false,
                update: false,
                temp: 20,
                brewTemp: [],
                brewTime: [],
                setPoint: 95,
                startUp: false,

                steaming: false,
                data: {
                    data: {
                        labels: [],
                        datasets: [
                            {
                                label: "Temperature",
                                data: [],
                                fill: true,
                                backgroundColor: "rgba(75,192,192,0.2)",
                                borderColor: "rgba(75,192,192,1)"
                            },
                        ]
                    },
                    options: {

                        maintainAspectRatio: false,
                        responsive: true,
                        scales: {
                            yAxes: [{
                                display: true,
                                ticks: {
                                    beginAtZero: true   // minimum value will be 0.
                                },
                                min: 20,
                                max: 120
                            }]
                        }
                    }
                }
            }
        }

    }

    componentDidMount() {

        fetch(`http://${ARDUINO_IP.ARDUINO_IP}:80/steaming`)
            .then(response => response.text())
            .then((state) => {
                console.log(JSON.parse(state));
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
        localStorage.setItem('data', stringified);
    }


    setSteamingState(state: boolean) {
        this.setState({ steaming: state })
    }

    handleChange = (event: React.SyntheticEvent | Event, value: number | number[]) => {
        console.log(value);
        // setValue(newValue as number);
        fetch(`http://${ARDUINO_IP.ARDUINO_IP}:8080/steaming`, { method: 'PUT', body: JSON.stringify({ "temp": value.toString() }) })
            .then(response => response.text());
    };
    //
    ws = new WebSocket(`ws://${ARDUINO_IP.ARDUINO_IP}:90/ws`);
    startConnection = () => {

        if (this.state.wsConnected) {
            this.ws.close();
            this.setState({ wsConnected: false });
        }

        this.ws = new WebSocket(`ws://${ARDUINO_IP.ARDUINO_IP}:90/ws`);
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
                brewTime: [...this.state.brewTime, message.brewTime],
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
                    },
                    options: {
                        maintainAspectRatio: false,
                        responsive: true,
                        scales: {
                            yAxes: [{
                                display: true,
                                min: 20,
                                max: 120
                            }],
                            xAxes: {
                                type: 'time',
                                time: {
                                    displayFormats: {
                                        quarter: 'HH MM'
                                    }
                                }
                            }
                        }
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

                        <Line options={this.state.data.options} data={this.state.data.data} />
                    </div>
                    <div className="col-1">
                        <div>
                            <p>Temperature</p>
                            <div id="gauge3" className="gauge-container three">
                                <span>{this.state.temp}</span>
                            </div>
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
                <div>
                </div>
                {/* <Box sx={{ width: 300 }}>
                    <Slider
                        aria-label="Custom marks"
                        defaultValue={90}
                        getAriaValueText={valuetext}
                        step={1}
                        min={80}
                        max={100}
                        valueLabelDisplay="auto"
                        marks={marks}
                        onChangeCommitted={this.handleChange}
                    />
                </Box> */}
            </div>

        );
    }
}

export default Chart;
