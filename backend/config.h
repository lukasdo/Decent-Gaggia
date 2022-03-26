#define WIFI_SSID "SSID"
#define WIFI_PASSWORD "PASSWORD"

#define thermoDO 19 // MAX6675 DO
#define thermoCS 23 // MAX6675 CS
#define thermoCLK 5 // MAX6675 CLK
#define relayPin 14  // SSR VCC pin


#define LED_BUILTIN 2 // BUILT IN LED


#define GET_KTYPE_READ_EVERY 500 // thermocouple data read interval not recommended to be changed to lower than 250 (ms)

// PID - offline values
#define SETPOINT 95                // Temperatur setpoint
#define STEAMSETPOINT 120          // Temperatur setpoint
#define BREWDETECTIONLIMIT 150     // brew detection limit, be carefull: if too low, then there is the risk of wrong brew detection and rising temperature
#define AGGKP 69                   // Kp normal
#define AGGTN 399                  // Tn
#define AGGTV 0                    // Tv

// PID coldstart
#define STARTKP 50                 // Start Kp during coldstart
#define STARTTN 150                // Start Tn during cold start

// PID - offline brewdetection values
#define AGGBKP 50                  // Kp
#define AGGBTN 0                   // Tn 
#define AGGBTV 20                  // Tv
