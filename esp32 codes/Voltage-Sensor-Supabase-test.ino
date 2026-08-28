#include <WiFi.h>
#include <HTTPClient.h>

// =====================================================
// WiFi Configuration
// =====================================================

const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// =====================================================
// Supabase Configuration
// =====================================================

const char* SUPABASE_URL =
  "https://nxdabgvbwunyeffzrzta.supabase.co";

const char* SUPABASE_KEY =
  "YOUR_SUPABASE_PUBLISHABLE_KEY";

// =====================================================
// User / Component Configuration
// =====================================================

const char* USER_ID =
  "a3d0385a-43e0-4921-95b2-f1102cc75de7";

const char* VOLTAGE_SENSOR_COMPONENT_ID =
  "736a21d2-ce93-4026-a260-5d192a7c31f7";

// =====================================================
// ESP32 Configuration
// =====================================================

#define VOLTAGE_SENSOR_PIN 34

const unsigned long UPDATE_INTERVAL = 5000;
unsigned long lastUpdate = 0;

// =====================================================
// Battery Configuration
// =====================================================

// 12 V / 60 Ah lithium battery
const float BATTERY_NOMINAL_VOLTAGE = 12.0;
const float BATTERY_CAPACITY_AH = 60.0;

// 720 Wh nominal capacity
const float TOTAL_BATTERY_CAPACITY_WH =
  BATTERY_NOMINAL_VOLTAGE *
  BATTERY_CAPACITY_AH;

// 80% DoD
const float DOD_PERCENT = 80.0;

// 576 Wh usable capacity
const float USABLE_BATTERY_CAPACITY_WH =
  TOTAL_BATTERY_CAPACITY_WH *
  (DOD_PERCENT / 100.0);

// Physical SOC at DoD limit
// 80% DoD means 20% physical SOC remains.
const float MIN_PHYSICAL_SOC = 20.0;

// =====================================================
// Voltage Sensor Configuration
// =====================================================

// Common 0-25 V sensor:
// Battery voltage ≈ ADC voltage × 5
const float SENSOR_RATIO = 5.0;

const float ADC_REFERENCE_VOLTAGE = 3.3;
const int ADC_MAX_VALUE = 4095;

const int ADC_SAMPLES = 20;

// =====================================================
// LiFePO4 Voltage / SOC Calibration
// =====================================================
//
// Approximate resting-voltage relationship for a
// 4S LiFePO4 battery.
//
// IMPORTANT:
// Voltage-only SOC is approximate.
// Calibrate these values against your battery.
//
// Higher voltage = higher physical SOC.
// =====================================================

struct VoltagePoint {
  float voltage;
  float soc;
};

const VoltagePoint SOC_TABLE[] = {
  { 12.00, 0.0  },
  { 12.20, 10.0 },
  { 12.40, 20.0 },
  { 12.80, 40.0 },
  { 13.00, 50.0 },
  { 13.20, 70.0 },
  { 13.30, 80.0 },
  { 13.40, 90.0 },
  { 13.50, 100.0 }
};

const int SOC_TABLE_SIZE =
  sizeof(SOC_TABLE) /
  sizeof(SOC_TABLE[0]);

// =====================================================
// Sensor State
// =====================================================

bool lastSensorStatus = false;

// =====================================================
// Connect WiFi
// =====================================================

void connectWiFi() {

  Serial.println();
  Serial.println("Connecting to WiFi...");

  WiFi.begin(
    WIFI_SSID,
    WIFI_PASSWORD
  );

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("WiFi connected!");

  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

// =====================================================
// Read ADC
// =====================================================

int readADC() {

  long total = 0;

  for (int i = 0; i < ADC_SAMPLES; i++) {
    total += analogRead(
      VOLTAGE_SENSOR_PIN
    );

    delay(5);
  }

  return total / ADC_SAMPLES;
}

// =====================================================
// Read Battery Voltage
// =====================================================

float readBatteryVoltage() {

  int adcValue = readADC();

  float adcVoltage =
    (
      adcValue *
      ADC_REFERENCE_VOLTAGE
    ) /
    ADC_MAX_VALUE;

  float batteryVoltage =
    adcVoltage * SENSOR_RATIO;

  Serial.print("ADC: ");
  Serial.println(adcValue);

  Serial.print("Battery Voltage: ");
  Serial.print(
    batteryVoltage,
    2
  );

  Serial.println(" V");

  return batteryVoltage;
}

// =====================================================
// Detect Voltage Sensor
// =====================================================

bool isVoltageSensorConnected(
  float batteryVoltage
) {

  return batteryVoltage > 1.0;
}

// =====================================================
// Convert Voltage to Physical SOC
// =====================================================

float voltageToPhysicalSOC(
  float voltage
) {

  if (
    voltage <=
    SOC_TABLE[0].voltage
  ) {
    return 0.0;
  }

  if (
    voltage >=
    SOC_TABLE[
      SOC_TABLE_SIZE - 1
    ].voltage
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
        (
          voltage -
          lowVoltage
        ) /
        (
          highVoltage -
          lowVoltage
        );

      return lowSOC +
        (
          ratio *
          (highSOC - lowSOC)
        );
    }
  }

  return 0.0;
}

// =====================================================
// Convert Physical SOC to AdlaWatt Usable Percentage
// =====================================================
//
// Physical:
// 20% SOC = AdlaWatt 0%
// 100% SOC = AdlaWatt 100%
//
// This protects the final 20% battery reserve.
// =====================================================

float physicalSOCToAdlaWatt(
  float physicalSOC
) {

  float usablePercent =
    (
      (physicalSOC -
       MIN_PHYSICAL_SOC) /
      (100.0 -
       MIN_PHYSICAL_SOC)
    ) * 100.0;

  return constrain(
    usablePercent,
    0.0,
    100.0
  );
}

// =====================================================
// Calculate Battery Level
// =====================================================

float calculateBatteryLevel(
  float batteryVoltage
) {

  float physicalSOC =
    voltageToPhysicalSOC(
      batteryVoltage
    );

  float applicationSOC =
    physicalSOCToAdlaWatt(
      physicalSOC
    );

  Serial.print(
    "Physical SOC: "
  );

  Serial.print(
    physicalSOC,
    1
  );

  Serial.println("%");

  Serial.print(
    "AdlaWatt Battery Level: "
  );

  Serial.print(
    applicationSOC,
    1
  );

  Serial.println("%");

  return applicationSOC;
}

// =====================================================
// Update Monitoring Battery Level
// =====================================================

void updateBatteryLevel(
  float batteryLevel
) {

  if (
    WiFi.status() != WL_CONNECTED
  ) {
    Serial.println(
      "WiFi disconnected."
    );

    return;
  }

  HTTPClient http;

  String url =
    String(SUPABASE_URL) +
    "/rest/v1/monitoring" +
    "?user_id=eq." +
    String(USER_ID);

  http.begin(url);

  http.addHeader(
    "Content-Type",
    "application/json"
  );

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
    "Prefer",
    "return=minimal"
  );

  batteryLevel =
    constrain(
      batteryLevel,
      0.0,
      100.0
    );

  String json =
    "{\"battery_level\":" +
    String(
      batteryLevel,
      2
    ) +
    "}";

  int httpCode =
    http.PATCH(json);

  Serial.print(
    "Monitoring update: "
  );

  Serial.println(
    httpCode
  );

  if (
    httpCode >= 200 &&
    httpCode < 300
  ) {

    Serial.println(
      "Battery level updated successfully."
    );

  } else {

    Serial.println(
      "Battery level update failed."
    );

    Serial.println(
      http.getString()
    );
  }

  http.end();
}

// =====================================================
// Update Voltage Sensor Status
// =====================================================

void updateSensorStatus(
  bool connected
) {

  if (
    WiFi.status() != WL_CONNECTED
  ) {
    return;
  }

  HTTPClient http;

  String url =
    String(SUPABASE_URL) +
    "/rest/v1/components" +
    "?comp_id=eq." +
    String(
      VOLTAGE_SENSOR_COMPONENT_ID
    ) +
    "&user_id=eq." +
    String(USER_ID);

  http.begin(url);

  http.addHeader(
    "Content-Type",
    "application/json"
  );

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
    "Prefer",
    "return=minimal"
  );

  String json =
    "{\"status\":" +
    String(
      connected
        ? "true"
        : "false"
    ) +
    "}";

  int httpCode =
    http.PATCH(json);

  Serial.print(
    "Sensor status update: "
  );

  Serial.println(
    httpCode
  );

  if (
    httpCode >= 200 &&
    httpCode < 300
  ) {

    Serial.println(
      "Sensor status updated."
    );
  }

  http.end();
}

// =====================================================
// Battery Monitoring
// =====================================================

void monitorBattery() {

  float voltage =
    readBatteryVoltage();

  bool sensorConnected =
    isVoltageSensorConnected(
      voltage
    );

  Serial.print(
    "Voltage Sensor: "
  );

  Serial.println(
    sensorConnected
      ? "CONNECTED"
      : "DISCONNECTED"
  );

  // -----------------------------------------------
  // Sensor state changed
  // -----------------------------------------------

  if (
    sensorConnected !=
    lastSensorStatus
  ) {

    updateSensorStatus(
      sensorConnected
    );

    lastSensorStatus =
      sensorConnected;
  }

  // -----------------------------------------------
  // Stop if sensor is disconnected
  // -----------------------------------------------

  if (!sensorConnected) {

    Serial.println(
      "No valid battery voltage."
    );

    return;
  }

  // -----------------------------------------------
  // Calculate AdlaWatt percentage
  // -----------------------------------------------

  float batteryLevel =
    calculateBatteryLevel(
      voltage
    );

  // -----------------------------------------------
  // Upload battery level
  // -----------------------------------------------

  updateBatteryLevel(
    batteryLevel
  );

  Serial.println(
    "----------------------------------------"
  );
}

// =====================================================
// Setup
// =====================================================

void setup() {

  Serial.begin(115200);

  delay(1000);

  pinMode(
    VOLTAGE_SENSOR_PIN,
    INPUT
  );

  analogReadResolution(12);

  connectWiFi();

  Serial.println();
  Serial.println(
    "========================================"
  );

  Serial.println(
    "AdlaWatt Lithium Battery Monitor"
  );

  Serial.println(
    "========================================"
  );

  Serial.print(
    "Battery: "
  );

  Serial.print(
    BATTERY_CAPACITY_AH
  );

  Serial.println(
    " Ah"
  );

  Serial.print(
    "Nominal Capacity: "
  );

  Serial.print(
    TOTAL_BATTERY_CAPACITY_WH
  );

  Serial.println(
    " Wh"
  );

  Serial.print(
    "Usable Capacity: "
  );

  Serial.print(
    USABLE_BATTERY_CAPACITY_WH
  );

  Serial.println(
    " Wh"
  );

  Serial.print(
    "DoD: "
  );

  Serial.print(
    DOD_PERCENT
  );

  Serial.println("%");

  Serial.println(
    "========================================"
  );

  Serial.println();

  // Initial reading
  monitorBattery();

  lastUpdate =
    millis();
}

// =====================================================
// Main Loop
// =====================================================

void loop() {

  if (
    millis() - lastUpdate >=
    UPDATE_INTERVAL
  ) {

    lastUpdate =
      millis();

    monitorBattery();
  }
}