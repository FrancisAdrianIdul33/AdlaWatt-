#include <OneWire.h>
#include <DallasTemperature.h>

// DS18B20 DATA pin
#define ONE_WIRE_BUS 4

// Create OneWire instance
OneWire oneWire(ONE_WIRE_BUS);

// Connect DallasTemperature to OneWire
DallasTemperature sensors(&oneWire);

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("================================");
  Serial.println("   AdlaWatt DS18B20 Test");
  Serial.println("================================");

  sensors.begin();

  // Check if a DS18B20 is detected
  int deviceCount = sensors.getDeviceCount();

  Serial.print("DS18B20 devices detected: ");
  Serial.println(deviceCount);

  if (deviceCount > 0) {
    Serial.println("DS18B20 sensor connected.");
  } else {
    Serial.println("DS18B20 sensor NOT detected.");
  }

  Serial.println("--------------------------------");
}

void loop() {

  // Request temperature from sensor
  sensors.requestTemperatures();

  float temperatureC = sensors.getTempCByIndex(0);

  // Check if sensor is disconnected
  if (temperatureC == DEVICE_DISCONNECTED_C) {

    Serial.println("DS18B20: DISCONNECTED");

  } else {

    Serial.print("DS18B20 Temperature: ");
    Serial.print(temperatureC);
    Serial.println(" °C");
  }

  delay(1000);
}