#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

// ============================================
// WiFi
// ============================================

// ============================================
// WiFi Configuration
// ============================================

const char* WIFI_SSID = "shinakira";
const char* WIFI_PASSWORD = "12312309";
// ============================================

const char* SUPABASE_URL =
  "https://nxdabgvbwunyeffzrzta.supabase.co";

const char* SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54ZGFiZ3Zid3VueWVmZnpyenRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxNjAxNzksImV4cCI6MjEwMTczNjE3OX0.ya4SFGY1pHhc7AywIWH3mg_IufbN4_z8OHetMAbZeFs";

// ============================================
// Monitoring Target
// ============================================

// Third monitoring row
// 100 = row 1
// 200 = row 2
// 300 = row 3

const int MONITOR_ID = 300;

// ============================================
// Voltage Sensor
// ============================================

// Voltage sensor S -> GPIO 34
const int VOLTAGE_SENSOR_PIN = 34;

// Standard 0-25V voltage sensor
const float R1 = 30000.0;
const float R2 = 7500.0;

const float REF_VOLTAGE = 3.3;
const float ADC_MAX = 4095.0;

// ============================================
// Sampling
// ============================================

const unsigned long SAMPLE_INTERVAL = 200;
const unsigned long DATABASE_INTERVAL = 2000;

unsigned long previousSampleMillis = 0;
unsigned long previousDatabaseMillis = 0;

// ============================================
// Battery Voltage / SoC Table
// ============================================
// Based on the supplied resting-voltage table.
//
// 13.50V = 100%
// 13.40V = 100%
// 13.35V = 95%
// 13.30V = 90%
// 13.28V = 85%
// 13.25V = 80%
// 13.22V = 75%
// 13.20V = 70%
// 13.18V = 65%
// 13.16V = 60%
// 13.15V = 55%
// 13.14V = 50%
// 13.12V = 45%
// 13.10V = 40%
// 13.05V = 35%
// 13.00V = 30%
// 12.90V = 25%
// 12.40V = 20%
// 12.20V = 15%
// 12.00V = 10%
// 11.50V = 5%
// 10.00V = 0%
//
// The AdlaWatt 80% DoD target is 12.40V = 20% physical SoC.
// Therefore:
// 12.40V = 0% AdlaWatt
// 13.40V = 100% AdlaWatt
// ============================================

struct VoltagePoint {
  float voltage;
  float soc;
};

const VoltagePoint SOC_TABLE[] = {

  {10.00,   0.0},
  {11.50,   5.0},
  {12.00,  10.0},
  {12.20,  15.0},
  {12.40,  20.0},
  {12.90,  25.0},
  {13.00,  30.0},
  {13.05,  35.0},
  {13.10,  40.0},
  {13.12,  45.0},
  {13.14,  50.0},
  {13.15,  55.0},
  {13.16,  60.0},
  {13.18,  65.0},
  {13.20,  70.0},
  {13.22,  75.0},
  {13.25,  80.0},
  {13.28,  85.0},
  {13.30,  90.0},
  {13.35,  95.0},
  {13.40, 100.0},
  {13.50, 100.0}

};

const int SOC_TABLE_SIZE =
  sizeof(SOC_TABLE) /
  sizeof(SOC_TABLE[0]);

// ============================================
// Current Reading
// ============================================

float currentVoltage = 0.0;
float currentBatteryLevel = 0.0;

// ============================================
// Read Battery Voltage
// ============================================

float readBatteryVoltage() {

  int adcValue =
    analogRead(VOLTAGE_SENSOR_PIN);

  float adcVoltage =
    (adcValue * REF_VOLTAGE) /
    ADC_MAX;

  float batteryVoltage =
    adcVoltage *
    ((R1 + R2) / R2);

  if (adcValue < 10) {
    batteryVoltage = 0.0;
  }

  return batteryVoltage;
}

// ============================================
// Voltage → Physical SoC
// ============================================

float voltageToPhysicalSOC(
  float voltage
) {

  if (
    voltage <= SOC_TABLE[0].voltage
  ) {
    return 0.0;
  }

  if (
    voltage >=
    SOC_TABLE[SOC_TABLE_SIZE - 1].voltage
  ) {
    return 100.0;
  }

  for (
    int i = 0;
    i < SOC_TABLE_SIZE - 1;
    i++
  ) {

    float lowVoltage =
      SOC_TABLE[i].voltage;

    float highVoltage =
      SOC_TABLE[i + 1].voltage;

    if (
      voltage >= lowVoltage &&
      voltage <= highVoltage
    ) {

      float lowSOC =
        SOC_TABLE[i].soc;

      float highSOC =
        SOC_TABLE[i + 1].soc;

      float ratio =
        (voltage - lowVoltage) /
        (highVoltage - lowVoltage);

      return lowSOC +
        ratio * (highSOC - lowSOC);
    }
  }

  return 0.0;
}

// ============================================
// Physical SoC → AdlaWatt %
// ============================================
// 20% physical SoC = 0% AdlaWatt
// 100% physical SoC = 100% AdlaWatt
//
// This represents the 80% usable DoD window.
// ============================================

float physicalSOCToAdlaWatt(
  float physicalSOC
) {

  float adlaWattLevel =
    (
      (physicalSOC - 20.0) /
      80.0
    ) * 100.0;

  return constrain(
    adlaWattLevel,
    0.0,
    100.0
  );
}

// ============================================
// Calculate AdlaWatt Battery Level
// ============================================

float calculateBatteryLevel(
  float voltage
) {

  float physicalSOC =
    voltageToPhysicalSOC(voltage);

  float batteryLevel =
    physicalSOCToAdlaWatt(physicalSOC);

  return batteryLevel;
}

// ============================================
// Update Supabase
// ============================================

void updateBatteryLevel(
  float batteryLevel
) {

  if (WiFi.status() != WL_CONNECTED) {
    return;
  }

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;

  String url =
    String(SUPABASE_URL) +
    "/rest/v1/monitoring" +
    "?monitor_id=eq." +
    String(MONITOR_ID);

  String json =
    "{\"battery_level\":" +
    String(batteryLevel, 2) +
    "}";

  if (!http.begin(client, url)) {
    return;
  }

  http.addHeader(
    "apikey",
    SUPABASE_KEY
  );

  http.addHeader(
    "Authorization",
    String("Bearer ") +
    SUPABASE_KEY
  );

  http.addHeader(
    "Content-Type",
    "application/json"
  );

  http.addHeader(
    "Prefer",
    "return=minimal"
  );

  int responseCode =
    http.PATCH(json);

  Serial.print("Supabase HTTP: ");
  Serial.println(responseCode);

  if (
    responseCode < 200 ||
    responseCode >= 300
  ) {

    Serial.println(
      http.getString()
    );
  }

  http.end();
}

// ============================================
// Sample Voltage
// ============================================

void sampleVoltage() {

  currentVoltage =
    readBatteryVoltage();

  currentBatteryLevel =
    calculateBatteryLevel(
      currentVoltage
    );

  // ==========================================
  // Serial Monitor
  // ==========================================

  Serial.println();
  Serial.println(
    "======================================"
  );

  Serial.print(
    "Battery Voltage: "
  );

  Serial.print(
    currentVoltage,
    2
  );

  Serial.println(
    " V"
  );

  Serial.print(
    "Physical SoC: "
  );

  Serial.print(
    voltageToPhysicalSOC(
      currentVoltage
    ),
    2
  );

  Serial.println(
    "%"
  );

  Serial.print(
    "AdlaWatt Battery Level: "
  );

  Serial.print(
    currentBatteryLevel,
    2
  );

  Serial.println(
    "%"
  );

  Serial.println(
    "======================================"
  );
}

// ============================================
// Setup
// ============================================

void setup() {

  Serial.begin(115200);

  delay(500);

  pinMode(
    VOLTAGE_SENSOR_PIN,
    INPUT
  );

  analogReadResolution(12);

  // ==========================================
  // WiFi
  // ==========================================

  WiFi.begin(
    WIFI_SSID,
    WIFI_PASSWORD
  );

  Serial.print(
    "Connecting to WiFi"
  );

  while (
    WiFi.status() != WL_CONNECTED
  ) {

    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println(
    "WiFi connected."
  );

  // Initial reading
  sampleVoltage();

  // Initial database update
  updateBatteryLevel(
    currentBatteryLevel
  );

  previousSampleMillis =
    millis();

  previousDatabaseMillis =
    millis();
}

// ============================================
// Loop
// ============================================

void loop() {

  unsigned long currentMillis =
    millis();

  // ------------------------------------------
  // Sensor sampling every 200 ms
  // ------------------------------------------

  if (
    currentMillis -
      previousSampleMillis >=
    SAMPLE_INTERVAL
  ) {

    previousSampleMillis =
      currentMillis;

    sampleVoltage();
  }

  // ------------------------------------------
  // Database update every 2 seconds
  // ------------------------------------------

  if (
    currentMillis -
      previousDatabaseMillis >=
    DATABASE_INTERVAL
  ) {

    previousDatabaseMillis =
      currentMillis;

    updateBatteryLevel(
      currentBatteryLevel
    );
  }
}