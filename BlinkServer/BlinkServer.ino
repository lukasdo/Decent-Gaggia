#include <RBDdimmer.h>

#include <PID_v1.h>

#include <AsyncWebSocket.h>
#include <ArduinoJson.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <WiFi.h>
#include "aWOT.h"
#include "StaticFiles.h"
#include "config.h"
#include <aJSON.h>
#include <max6675.h>
#include <ESPmDNS.h>
#include <WiFiUdp.h>
#include <ArduinoOTA.h>

unsigned long thermoTimer;
unsigned long myTime;
WiFiServer server(8080);
Application app;
AsyncWebServer webSocketServer(80);
AsyncWebSocket ws("/ws");

AsyncWebSocketClient * globalClient = NULL;


bool relayState;
double temperature;


//Define Variables we'll be connecting to
double Setpoint, Input, Output;

//Specify the links and initial tuning parameters
double Kp=5, Ki=2, Kd=1;
PID myPID(&temperature, &Output, &Setpoint, Kp, Ki, Kd, DIRECT);

int WindowSize = 5000;
unsigned long windowStartTime;


#define dimmerPin 25 // dimmer psm pin GPIO25
#define gndPin 22 // GPIO 22

dimmerLamp dimmer(dimmerPin,gndPin);

//Init the thermocouples with the appropriate pins defined above with the prefix "thermo"
MAX6675 thermocouple(thermoCLK, thermoCS, thermoDO);

bool ledOn;

void readLed(Request &req, Response &res) {
  res.print(ledOn);
}

void getCurrentTemp(Request &req, Response &res) {

}
void getTemp(Request &req, Response &res) {
res.set("Content-Type", "application/json");

  StaticJsonDocument<100> testDocument;  
 testDocument["temp"].add(3);
 testDocument["temp"].add(2);
  char buffer[100];
 
  serializeJson(testDocument, buffer);
 
  Serial.println(buffer);
  res.print(buffer);
}

void updateSetPoint(Request &req, Response &res) {
    Serial.println(req.read());
    
}
//##############################################################################################################################
//###########################################___________SETUP____________________###############################################
//##############################################################################################################################
void setup() {
  
  // relay port init and set initial operating mode
  
  pinMode(relayPin, OUTPUT);
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(WiFi.localIP());

  

  ArduinoOTA
    .onStart([]() {
      String type;
      if (ArduinoOTA.getCommand() == U_FLASH)
        type = "sketch";
      else // U_SPIFFS
        type = "filesystem";

      // NOTE: if updating SPIFFS this would be the place to unmount SPIFFS using SPIFFS.end()
      Serial.println("Start updating " + type);
    })
    .onEnd([]() {
      Serial.println("\nEnd");
    })
    .onProgress([](unsigned int progress, unsigned int total) {
      Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
    })
    .onError([](ota_error_t error) {
      Serial.printf("Error[%u]: ", error);
      if (error == OTA_AUTH_ERROR) Serial.println("Auth Failed");
      else if (error == OTA_BEGIN_ERROR) Serial.println("Begin Failed");
      else if (error == OTA_CONNECT_ERROR) Serial.println("Connect Failed");
      else if (error == OTA_RECEIVE_ERROR) Serial.println("Receive Failed");
      else if (error == OTA_END_ERROR) Serial.println("End Failed");
    });

  ArduinoOTA.begin();
  
  app.get("/led", &readLed);
  app.get("/setPoint", &getCurrentTemp);
 // app.get("/setPoint", &getTemp);
  app.put("/setPoint", &updateSetPoint);

  
 // app.put("/led", &updateLed);
  app.route(staticFiles());

  server.begin();
  webSocketServer.begin();

  ws.onEvent(onWsEvent);
  webSocketServer.addHandler(&ws);

  thermoTimer = millis();

  
  //initialize the variables we're linked to
  Setpoint = 95;

  //tell the PID to range between 0 and the full window size
  myPID.SetOutputLimits(0, WindowSize);

  //turn the PID on
  myPID.SetMode(AUTOMATIC);

  dimmer.begin(NORMAL_MODE, ON); 
  //dimmer initialisation: name.begin(MODE, STATE)

  dimmer.setPower(80);
}

//##############################################################################################################################
//###########################################___________WEBSOCKET________________###############################################
//##############################################################################################################################
void onWsEvent(AsyncWebSocket * server, AsyncWebSocketClient * client, AwsEventType type, void * arg, uint8_t *data, size_t len){
 
  if(type == WS_EVT_CONNECT){
 
    Serial.println("Websocket client connection received");
    globalClient = client;
 
  } else if(type == WS_EVT_DISCONNECT){
 
    Serial.println("Websocket client connection finished");
    globalClient = NULL;
 
  }
}

//##############################################################################################################################
//###########################################___________THERMOCOUPLE_READ________###############################################
//##############################################################################################################################

// K-TYPE thermocouple read function
void kThermoRead() { // Reading the thermocouple temperature
  // Reading the temperature every 350ms between the loops
  if ((millis() - thermoTimer) > GET_KTYPE_READ_EVERY){
    temperature = thermocouple.readCelsius();  // Making sure we're getting a value
    while (temperature <= 0 || temperature == NAN || temperature > 170.0) {
      digitalWrite(relayPin, LOW);  // relayPin -> LOW
      if ((millis() - thermoTimer) > GET_KTYPE_READ_EVERY){
        temperature = thermocouple.readCelsius();  // Making sure we're getting a value
        thermoTimer = millis();
      }
    }
    thermoTimer = millis();
  }
}


//##############################################################################################################################
//###########################################___________HEAT_____________________###############################################
//##############################################################################################################################
void heat() {
  /************************************************
   * turn the output pin on/off based on pid output
   ************************************************/
  if (millis() - windowStartTime > WindowSize)
  { //time to shift the Relay Window
    windowStartTime += WindowSize;
  }

  if (Output < millis() - windowStartTime) {
    digitalWrite(relayPin, LOW);
    }
  else {
    digitalWrite(relayPin, HIGH);
  }
  
}

void wsSendData() {
     if(globalClient != NULL && globalClient->status() == WS_CONNECTED){
    StaticJsonDocument<100> testDocument;  
     testDocument["temp"] = temperature;
      testDocument["brewTemp"] = temperature;
      myTime = millis() /1000;
      testDocument["brewTime"] = myTime; 

      char buffer[100];
      delay(500);
      serializeJson(testDocument, buffer);
    
      globalClient->text(buffer);

   }
}

//##############################################################################################################################
//###########################################___________LOOP_____________________###############################################
//##############################################################################################################################
void loop() {
  
  myPID.Compute();
  heat();
  

  //Serial.println(dimmer.getOutput());
   ArduinoOTA.handle();
  WiFiClient client = server.available();
  kThermoRead();
  if (client.connected()) {
    app.process(&client); 
  }
  wsSendData();

}
