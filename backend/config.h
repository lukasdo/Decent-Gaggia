#define WIFI_SSID "SSID"
#define WIFI_PASSWORD "PASSWORD"

#define thermoDO 19 // MAX6675 DO
#define thermoCS 23 // MAX6675 CS
#define thermoCLK 5 // MAX6675 CLK
#define relayPin 14  // SSR VCC pin
#define solenoidPin 13  // Solenoid control pin
#define optoPin 27  // Optocoupler pin
#define pumpPin 12  // Pump control pin
#define zeroCross  2 // for boards with CHANGEBLE input pins
dimmerLamp dimmer(pumpPin, zeroCross); //initialase port for dimmer for ESP8266, ESP32, Arduino due boards

#define espressoSetPoint 40 //98

#define pressurePin 34

//PID defaults
#define kpValue 70
#define kiValue 1
#define kdValue 40

//PID for optimised brewing
#define otpimisedBrewing false // fales = DISABLED, true = ENABLED, Enables other PID values while the timer is running
#define kpOptimised 80
#define kiOptimised 0
#define kdOptimised 50 
#define GET_KTYPE_READ_EVERY 350
