/********************************************************
    Timer 1 - ISR for PID calculation and heat realay output
******************************************************/

#include <Arduino.h>

int T1C;
int TCTE;

void IRAM_ATTR onTimer()
{

    // timer1_write(50000); // set interrupt time to 10ms
    timerAlarmWrite(timer, 10000, true);
    if (Output <= isrCounter)
    {
        digitalWrite(relayPin, LOW);
    }
    else
    {
        digitalWrite(relayPin, HIGH);
    }

    isrCounter += 10; // += 10 because one tick = 10ms
    // set PID output as relais commands
    if (isrCounter >= windowSize)
    {
        isrCounter = 0;
    }

    // run PID calculation
    myPID.Compute();
}


void initTimer1(void)
{

    /********************************************************
      Timer1 ISR - Initialisierung
      TIM_DIV1 = 0,   //80MHz (80 ticks/us - 104857.588 us max)
      TIM_DIV16 = 1,  //5MHz (5 ticks/us - 1677721.4 us max)
      TIM_DIV256 = 3  //312.5Khz (1 tick = 3.2us - 26843542.4 us max)
    ******************************************************/
    timer = timerBegin(0, 80, true);             // m
    timerAttachInterrupt(timer, &onTimer, true); // m
    timerAlarmWrite(timer, 10000, true);         // m
}

void enableTimer1(void)
{
    timerAlarmEnable(timer);
}

void disableTimer1(void)
{
    timerAlarmDisable(timer);
}

bool isTimer1Enabled(void)
{
    bool timerEnabled = false;

    timerEnabled = timerAlarmEnabled(timer);

    return timerEnabled;
}