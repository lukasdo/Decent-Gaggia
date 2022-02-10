#include <ArduinoJson.h>

#include <WiFi.h>
#include "aWOT.h"
#include "StaticFiles.h"
#include "config.h"
#define LED_BUILTIN 2

#include <aJSON.h>

WiFiServer server(80);
Application app;

bool ledOn;

void readLed(Request &req, Response &res) {
  res.print(ledOn);
}

void getCurrentTemp(Request &req, Response &res) {
  res.print(3);
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

void updateLed(Request &req, Response &res) {
  ledOn = (req.read() != '0');
  digitalWrite(LED_BUILTIN, ledOn);
  return readLed(req, res);
}

void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(115200);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(WiFi.localIP());

  app.get("/led", &readLed);
  
  app.get("/temp/current", &getCurrentTemp);
  app.get("/temp", &getTemp);
  app.put("/led", &updateLed);
  app.route(staticFiles());

  server.begin();
}

void loop() {
  WiFiClient client = server.available();

  if (client.connected()) {
    app.process(&client);
  }
}
