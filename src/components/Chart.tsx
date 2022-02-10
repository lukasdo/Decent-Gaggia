//  const labels = [
//      1,2,3,4,5,6,8,9,10,11,12,13,14,15,16,17,18,19
//    ];
//    console.log("%PRESSURE%")
//
//    const data = {
//      labels: labels,
//      datasets: [{
//        label: 'Pressure',
//        backgroundColor: 'rgb(255, 99, 132)',
//        borderColor: 'rgb(255, 99, 132)',
//        data: [%PRESSURE%],
//      }]
//    };
//
//    const config = {
//      type: 'line',
//      data: data,
//      options: {}
//    };
//  </script>
//  <script>
//    const myChart = new Chart(
//      document.getElementById('myChart'),
//      config
//    );
//  </script>
import React, {Component} from 'react';
import './../App.css';
import {Line} from "react-chartjs-2";

interface ITemp {
    temp: number[];
}

interface IProps {
}

interface IState {
    update: boolean;
}

let data = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
        {
            label: "First dataset",
            data: [33, 53, 85, 41, 44, 65],
            fill: true,
            backgroundColor: "rgba(75,192,192,0.2)",
            borderColor: "rgba(75,192,192,1)"
        },
        {
            label: "Second dataset",
            data: [33, 25, 35, 51, 54, 76],
            fill: false,
            borderColor: "#742774"
        }
    ]
};

class Chart extends React.Component<IProps, IState> {
    constructor(props: IProps) {
        super(props);
        this.state = {
            update: false
        }
    }

    // setLedState(state) {
    //   this.setState({ ledOn: state !== '0' })
    // }
    //
    componentDidMount() {
        fetch('/temp')
            .then(response => response.text())
            .then(state => {

                // this.setLedState(state);
                let bla = JSON.parse(state) as ITemp;
                data.datasets[0].data = bla.temp;
                console.log(bla.temp);
            });
    }

    //
    // handleStateChange(ledOn) {
    //   fetch('/led', { method: 'PUT', body: ledOn ? '0' : '1' })
    //     .then(response => response.text())
    //     .then(state => this.setLedState(state));
    // }

    render() {
        return (
            <div>
                <Line data={data}/>
                {/*<ToggleButton*/}
                {/*  value={this.state.ledOn}*/}
                {/*  onToggle={value => this.handleStateChange(value)}*/}
                {/*/>*/}
            </div>
        );
    }
}

export default Chart;
