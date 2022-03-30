import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import './../App.css';

import ARDUINO_IP from '../config';
const Timer = () => {
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);

    function toggle() {
        setIsActive(!isActive);
        let formData = new FormData();
        formData.append('brewing', isActive ? '1' : '0');
        fetch(`http://${ARDUINO_IP.ARDUINO_IP}:80/brewing`,
            {
                method: 'POST',
                body: formData
            })
            .catch(error => {
                console.error(error);
            });
    }

    function reset() {
        setSeconds(0);
        setIsActive(false);
    }

    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                setSeconds(seconds => seconds + 1);
            }, 1000);
        } else if (!isActive && seconds !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds]);

    return (
        <div className="app">
            <div className="time">
                {seconds}s
            </div>
            <div className="row">

                <Button mat-button color="primary" onClick={toggle}>
                    {isActive ? 'Pause' : 'Start'}
                </Button>
                <Button className="button" onClick={reset}>
                    Reset
                </Button>
            </div>
        </div>
    );
};

export default Timer;