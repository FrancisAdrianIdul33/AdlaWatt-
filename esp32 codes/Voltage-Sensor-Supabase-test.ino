#include <WiFi.h>
#include <HTTPClient.h>

// =====================================================
// WiFi Configuration
// =====================================================

const char* WIFI_SSID = "ERROR101(^_^メ^)";
const char* WIFI_PASSWORD = "SystemNotRunning#101";

// =====================================================
// Supabase Configuration
// =====================================================

const char* SUPABASE_URL =
  "https://nxdabgvbwunyeffzrzta.supabase.co";

const char* SUPABASE_KEY =
  "sb_publishable_YiGbcekZEnaKnf-FeOFBkQ_mDEBe-wW";

// =====================================================
// User / Monitoring / Component Configuration
// =====================================================

const char* USER_ID =
  "a3d0385a-43e0-4921-95b2-f1102cc75de7";

const char* MONITOR_ID =
  "589e5b4d-1a94-417d-ba58-f1dbf7b10d53";

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

// Nominal battery capacity
// 12 V × 60 Ah = 720 Wh
const float TOTAL_BATTERY_CAPACITY_WH =
  BATTERY_NOMINAL_VOLTAGE *
  BATTERY_CAPACITY_AH;

// DoD = 80%
const float DOD_PERCENT = 80.0;

// Usable battery energy
// 720 Wh × 80% = 576 Wh
const float USABLE_BATTERY_CAPACITY_WH =
  TOTAL_BATTERY_CAPACITY_WH *
  (DOD_PERCENT / 100.0);

// 20% physical SOC remains as protected reserve
const float MIN_PHYSICAL_SOC = 20.0;

// =====================================================
// Voltage Sensor Configuration
// =====================================================

// Common 0–25 V voltage sensor
const float SENSOR_RATIO = 5.0;

const float ADC_REFERENCE_VOLTAGE = 3.3;
const int ADC_MAX_VALUE = 4095;

const int ADC_SAMPLES = 20;

// =====================================================
// LiFePO4 Voltage / SOC Table
// =====================================================
//
// Initial approximation for a 4S LiFePO4 battery.
//
// Voltage-only SOC is an estimate.
// Calibrate these values against your actual battery.
// =====================================================

struct VoltagePoint {
  float voltage;
  float soc;
};

const VoltagePoint SOC_TABLE[] = {

  {12.00, 0.0},
  {12.20, 10.0},
  {12.40, 20.0},
  {12.80, 40.0},
  {13.00, 50.0},
  {13.20, 70.0},
  {13.30, 80.0},
  {13.40, 90.0},
  {13.50, 100.0}

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

  for (
    int i = 0;
    i < ADC_SAMPLES;
    i++
  ) {

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
    adcVoltage *
    SENSOR_RATIO;

  Serial.print("ADC Value: ");
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
// Convert Physical SOC to AdlaWatt Battery Level
// =====================================================
//
// Physical battery:
// 20% SOC = protected DoD limit
// 100% SOC = fully charged
//
// AdlaWatt:
// 20% physical SOC = 0%
// 100% physical SOC = 100%
// =====================================================

float physicalSOCToAdlaWatt(
  float physicalSOC
) {

  float usablePercentage =
    (
      (
        physicalSOC -
        MIN_PHYSICAL_SOC
      ) /
      (
        100.0 -
        MIN_PHYSICAL_SOC
      )
    ) * 100.0;

  return constrain(
    usablePercentage,
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

  float batteryLevel =
    physicalSOCToAdlaWatt(
      physicalSOC
    );

  Serial.print("Physical SOC: ");
  Serial.print(
    physicalSOC,
    1
  );
  Serial.println("%");

  Serial.print("AdlaWatt Battery Level: ");
  Serial.print(
    batteryLevel,
    1
  );
  Serial.println("%");

  return batteryLevel;
}

// =====================================================
// Update monitoring.battery_level
// =====================================================

void updateBatteryLevel(
  float batteryLevel
) {

  if (
    WiFi.status() != WL_CONNECTED
  ) {

    Serial.println(
      "WiFi disconnected. Cannot update monitoring."
    );

    return;
  }

  HTTPClient http;

  String url =
    String(SUPABASE_URL) +
    "/rest/v1/monitoring" +
    "?monitor_id=eq." +
    String(MONITOR_ID);

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

  Serial.println();
  Serial.println(
    "Updating monitoring..."
  );

  Serial.print(
    "Monitor ID: "
  );

  Serial.println(
    MONITOR_ID
  );

  Serial.print(
    "Battery Level: "
  );

  Serial.print(
    batteryLevel,
    2
  );

  Serial.println("%");

  int httpCode =
    http.PATCH(json);

  Serial.print(
    "HTTP Response Code: "
  );

  Serial.println(
    httpCode
  );

  if (
    httpCode >= 200 &&
    httpCode < 300
  ) {

    Serial.println(
      "SUCCESS: Battery level updated!"
    );

  } else {

    Serial.println(
      "ERROR: Battery level update failed."
    );

    String response =
      http.getString();

    if (
      response.length() > 0
    ) {

      Serial.println(
        "Supabase response:"
      );

      Serial.println(
        response
      );
    }
  }

  http.end();
}

// =====================================================
// Update Voltage Sensor Component Status
// =====================================================

void updateSensorStatus(
  bool connected
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

  Serial.println();
  Serial.println(
    "Updating voltage sensor status..."
  );

  Serial.print(
    "Component ID: "
  );

  Serial.println(
    VOLTAGE_SENSOR_COMPONENT_ID
  );

  int httpCode =
    http.PATCH(json);

  Serial.print(
    "HTTP Response Code: "
  );

  Serial.println(
    httpCode
  );

  if (
    httpCode >= 200 &&
    httpCode < 300
  ) {

    Serial.println(
      "SUCCESS: Sensor status updated!"
    );

  } else {

    Serial.println(
      "ERROR: Sensor status update failed."
    );

    String response =
      http.getString();

    if (
      response.length() > 0
    ) {

      Serial.println(
        response
      );
    }
  }

  http.end();
}

// =====================================================
// Complete Battery Monitoring
// =====================================================

void monitorBattery() {

  Serial.println();
  Serial.println(
    "========================================"
  );

  Serial.println(
    "Battery Monitoring"
  );

  Serial.println(
    "========================================"
  );

  float batteryVoltage =
    readBatteryVoltage();

  bool sensorConnected =
    isVoltageSensorConnected(
      batteryVoltage
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
  // Sensor status changed
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
  // Stop if sensor disconnected
  // -----------------------------------------------

  if (!sensorConnected) {

    Serial.println(
      "Battery percentage not updated."
    );

    Serial.println(
      "Reason: no valid voltage signal."
    );

    return;
  }

  // -----------------------------------------------
  // Calculate battery level
  // -----------------------------------------------

  float batteryLevel =
    calculateBatteryLevel(
      batteryVoltage
    );

  // -----------------------------------------------
  // Update Supabase
  // -----------------------------------------------

  updateBatteryLevel(
    batteryLevel
  );

  Serial.println(
    "========================================"
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
    "User ID: "
  );

  Serial.println(
    USER_ID
  );

  Serial.print(
    "Monitor ID: "
  );

  Serial.println(
    MONITOR_ID
  );

  Serial.print(
    "Voltage Sensor Component ID: "
  );

  Serial.println(
    VOLTAGE_SENSOR_COMPONENT_ID
  );

  Serial.print(
    "Battery Capacity: "
  );

  Serial.print(
    BATTERY_CAPACITY_AH
  );

  Serial.println(
    " Ah"
  );

  Serial.print(
    "Total Battery Energy: "
  );

  Serial.print(
    TOTAL_BATTERY_CAPACITY_WH
  );

  Serial.println(
    " Wh"
  );

  Serial.print(
    "Usable Energy at 80% DoD: "
  );

  Serial.print(
    USABLE_BATTERY_CAPACITY_WH
  );

  Serial.println(
    " Wh"
  );

  Serial.println(
    "========================================"
  );

  // Initial battery reading
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