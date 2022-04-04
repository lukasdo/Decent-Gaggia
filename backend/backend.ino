#include <PID_v1.h>
#include <AsyncWebSocket.h>
#include <ArduinoJson.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <WiFi.h>
#include <max6675.h>
#include <WiFiUdp.h>
#include <ArduinoOTA.h>

#include "aWOT.h"
#include "config.h"
#include "StaticFiles.h"


#define pressurePin 33

unsigned long thermoTimer;
unsigned long myTime;

WiFiServer server(8080);
Application app;
AsyncWebServer webSocketServer(90);
AsyncWebSocket ws("/ws");

// Create AsyncWebServer object on port 80
AsyncWebServer asyncServer(80);
hw_timer_t *timer = NULL;

const unsigned int windowSize = 1000;
unsigned int isrCounter = 0; // counter for ISR
AsyncWebSocketClient *globalClient = NULL;
  const float voltageOffset = 0.49; 
bool relayState;
double temperature;
float pressure_bar;

double Setpoint, Input, Output;

// PID Values
double Kp = kpValue, Ki = kiValue, Kd = kdValue;
PID myPID(&temperature, &Output, &Setpoint, Kp, Ki, Kd, DIRECT);
int WindowSize = 5000;

// Init the thermocouples with the appropriate pins defined above with the prefix "thermo"
MAX6675 thermocouple(thermoCLK, thermoCS, thermoDO);

bool isSteaming = false;
#include "ISR.h"

//##############################################################################################################################
//###########################################___________BREWDETECTION________________###########################################
//##############################################################################################################################

void brewDetection(bool isBrewingActivated)
{
  if (otpimisedBrewing){
    if (!isBrewingActivated)
    {
      Serial.println("Brewing activated");
      myPID.SetTunings(kpOptimised, kiOptimised, kdOptimised);
    }
    else
    {
      Serial.println("Brewing deactivated");
      myPID.SetTunings(Kp, Ki, Kd);
    }
  }
}

//##############################################################################################################################
//###########################################___________SETUP____________________###############################################
//##############################################################################################################################
void setup()
{

  // relay port init and set initial operating mode
  Setpoint = espressoSetPoint;
  pinMode(relayPin, OUTPUT);
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Serial.println(WiFi.localIP());

  ArduinoOTA
      .onStart([]()
               {
      String type;
      if (ArduinoOTA.getCommand() == U_FLASH)
        type = "sketch";
      else // U_SPIFFS
        type = "filesystem";

      // NOTE: if updating SPIFFS this would be the place to unmount SPIFFS using SPIFFS.end()
      Serial.println("Start updating " + type); })
      .onEnd([]()
             { Serial.println("\nEnd"); })
      .onProgress([](unsigned int progress, unsigned int total)
                  { Serial.printf("Progress: %u%%\r", (progress / (total / 100))); })
      .onError([](ota_error_t error)
               {
      Serial.printf("Error[%u]: ", error);
      if (error == OTA_AUTH_ERROR) Serial.println("Auth Failed");
      else if (error == OTA_BEGIN_ERROR) Serial.println("Begin Failed");
      else if (error == OTA_CONNECT_ERROR) Serial.println("Connect Failed");
      else if (error == OTA_RECEIVE_ERROR) Serial.println("Receive Failed");
      else if (error == OTA_END_ERROR) Serial.println("End Failed"); });

  ArduinoOTA.begin();

  app.route(staticFiles());

  // Send a GET request to <ESP_IP>/update?output=<inputMessage1>&state=<inputMessage2>
  asyncServer.on("/steaming", HTTP_GET, [](AsyncWebServerRequest *request)
                 { request->send(200, "text/plain", isSteaming ? "true" : "false"); });

  asyncServer.on("/steaming", HTTP_POST, [](AsyncWebServerRequest *request)
                 { 
   if(request->hasParam("steaming", true)) {
    AsyncWebParameter* p = request->getParam("steaming", true); 
    isSteaming = (p->value()  != "0");
    request->send(200, "text/plain", isSteaming ? "true" : "false");
    } });

  asyncServer.on("/brewing", HTTP_POST, [](AsyncWebServerRequest *request)
                 { 
    bool isBrewing = false;
   if(request->hasParam("brewing", true)) {
    AsyncWebParameter* p = request->getParam("brewing", true); 
    isBrewing = (p->value()  != "0");
    brewDetection(isBrewing);
    request->send(200);
    } });

  asyncServer.onNotFound([](AsyncWebServerRequest *request)
                         {
  if (request->method() == HTTP_OPTIONS) {
      AsyncWebServerResponse * response = request->beginResponse(200);
        response->addHeader("Access-Control-Max-Age", "10000");
        response->addHeader("Access-Control-Allow-Methods", "PUT,POST,GET,OPTIONS");
        response->addHeader("Access-Control-Allow-Headers", "*");
    request->send(response);
  } else {
    request->send(404);
  } });

  // Enable cors
  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Origin", "*");
  server.begin();
  asyncServer.begin();
  webSocketServer.begin();

  ws.onEvent(onWsEvent);
  webSocketServer.addHandler(&ws);

  thermoTimer = millis();

  // tell the PID to range between 0 and the full window size
  myPID.SetOutputLimits(0, WindowSize);

  // turn the PID on
  myPID.SetMode(AUTOMATIC);

  initTimer1();
  enableTimer1();
}

//##############################################################################################################################
//###########################################___________WEBSOCKET________________###############################################
//##############################################################################################################################
void onWsEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, AwsEventType type, void *arg, uint8_t *data, size_t len)
{

  if (type == WS_EVT_CONNECT)
  {

    Serial.println("Websocket client connection received");
    globalClient = client;
  }
  else if (type == WS_EVT_DISCONNECT)
  {

    Serial.println("Websocket client connection finished");
    globalClient = NULL;
  }
}

//##############################################################################################################################
//###########################################___________THERMOCOUPLE_READ________###############################################
//##############################################################################################################################
void kThermoRead()
{ 
  // Reading the temperature every 350ms between the loops
  if ((millis() - thermoTimer) > GET_KTYPE_READ_EVERY)
  {
    temperature = thermocouple.readCelsius(); 
    while (temperature <= 0 || temperature == NAN || temperature > 170.0)
    {
      if ((millis() - thermoTimer) > GET_KTYPE_READ_EVERY)
      {
        temperature = thermocouple.readCelsius();
        thermoTimer = millis();
      }
    }
    thermoTimer = millis();
  }
}

//##############################################################################################################################
//###########################################___PRESSURE_READ____________________###############################################
//##############################################################################################################################
void pressureReading()
{ 
  if ((millis() - thermoTimer) > GET_KTYPE_READ_EVERY){
  float voltage = (analogRead(pressurePin)*5.0)/4096.0;   
  float pressure_pascal = (3.0*((float)voltage-voltageOffset))*1000000.0;                       //calibrate here
  pressure_bar = pressure_pascal/10e5;
  float pressure_psi = pressure_bar*14.5038;
 }
}


//##############################################################################################################################
//###########################################___________WEBSOCKET________________###############################################
//##############################################################################################################################
void wsSendData()
{
  if (globalClient != NULL && globalClient->status() == WS_CONNECTED)
  {
    StaticJsonDocument<100> testDocument;
    testDocument["temp"] = temperature;
    testDocument["brewTemp"] = temperature;
    
    testDocument["pressure"] = pressure_bar;
    myTime = millis() / 1000;
    testDocument["brewTime"] = myTime;

    char buffer[100];
    delay(500);
    serializeJson(testDocument, buffer);

    globalClient->text(buffer);
  }
}

//##############################################################################################################################
//###########################################___________BREWMODE________________################################################
//##############################################################################################################################
void checkBrewMode()
{
  if (isSteaming)
  {
    Setpoint = steamingSetPoint;
  }
  else
  {
    Setpoint = espressoSetPoint;
  }
}

//##############################################################################################################################
//###########################################___________LOOP_____________________###############################################
//##############################################################################################################################
void loop()
{
  checkBrewMode();
  pressureReading();
  ArduinoOTA.handle();
  WiFiClient client = server.available();
  kThermoRead();
  if (client.connected())
  {
    app.process(&client);
  }
  wsSendData();
}
