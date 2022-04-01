#define WIFI_SSID "SSID"
#define WIFI_PASSWORD "PASSWORD"

#define thermoDO 19 // MAX6675 DO
#define thermoCS 23 // MAX6675 CS
#define thermoCLK 5 // MAX6675 CLK
#define relayPin 14  // SSR VCC pin

#define espressoSetPoint 96
#define steamingSetPoint 122


//PID defaults
#define kpValue 60
#define kiValue 0
#define kdValue 3

//PID for optimised brewing
#define otpimisedBrewing false // fales = DISABLED, true = ENABLED, Enables other PID values while the timer is running
#define kpOptimised 80
#define kiOptimised 0
#define kdOptimised 50


#define GET_KTYPE_READ_EVERY 500 
