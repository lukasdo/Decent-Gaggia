import { Slider } from "@mui/material";
import Box from "@mui/material/Box";
import React from 'react';
import { ChartComponentProps, Line } from "react-chartjs-2";
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
    data: ChartComponentProps
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
        this.state = {
            update: false,
            temp: 95,
            brewTemp: [],
            brewTime: [],
            setPoint: 95,
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
    ws = new WebSocket('ws://192.168.2.116:80/ws')

    componentDidMount() {
        fetch('http://192.168.2.116:8080/setPoint')
            .then(response => response.text())
            .then(state => {
                // let bla: IMessage;
                let bla = JSON.parse(state);
                console.log(bla);
                this.setState({ setPoint: bla });
            });

        
    }
    handleChange = (event: React.SyntheticEvent | Event, value: number | number[]) => {
        console.log(value);
        // setValue(newValue as number);
        fetch('http://192.168.2.116:8080/setPoint', { method: 'PUT', body: value.toString() })
            .then(response => response.text());
    };
    //
    startConnection = () => {
        this.ws = new WebSocket('ws://192.168.2.116:80/ws');
        this.ws.onopen = () => {
            // on connecting, do nothing but log it to the console
            console.log('connected')
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
                            // {
                            //     label: "Pressure",
                            //     data: [33, 25, 35, 51, 54, 76],
                            //     fill: false,
                            //     borderColor: "#742774"
                            // }
                        ]
                    },
                    options: {
                        scales: {
                            yAxes: [{
                                display: true,
                                min: 20,
                                max: 120
                            }]
                        }
                    }
                }
            });
            console.log(this.state)
        }
        this.ws.onclose = () => {
            console.log('disconnected')
        }
      
    }


    stopConnec = () => {

        this.ws.close();

    }


    render() {
        return (
            <div>
                <Line options={this.state.data.options} data={this.state.data.data} />
                <Box sx={{ width: 300 }}>
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
                </Box>
                <div id="gauge3" className="gauge-container three">
                    <span>{this.state.temp}</span>
                </div>
                <button onClick={this.startConnection}>Start</button>

                <button onClick={this.stopConnec}>Stop</button>
            </div>

        );
    }
}

export default Chart;
