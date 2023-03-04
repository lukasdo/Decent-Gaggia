import React, {useRef, useState} from 'react';
import './../App.css';

import ARDUINO_IP from '../config';
import {Button, Slider} from "@mui/material";

const Config = () => {

    const input = useRef()
    const [setPointVal, setSetPointVal] = useState(96);

    function handleChange(e) {
        setSetPointVal(e.target.value);
    }

    function submitData() {
        let formData = new FormData();
        formData.append('setpoint', setPointVal.toString());
        console.log(setPointVal);
        fetch(`http://${ARDUINO_IP.ARDUINO_IP}:80/setPoint`,
            {
                method: 'POST',
                body: formData
            })
            .catch(error => {
                alert('An error occurred');
                console.error(error);
            });
    }


    return (
        <div className="container">
            <Slider
                valueLabelDisplay="auto"
                defaultValue={96}
                max={100}
                min={85}
                marks
                onChange={handleChange}
                ref={input}
            />
            <Button onClick={submitData}>Update set point</Button>
        </div>

    );
};

export default Config;
