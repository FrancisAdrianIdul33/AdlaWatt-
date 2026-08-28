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

// Current prototype user
const char* USER_ID =
  "a3d0385a-43e0-4921-95b2-f1102cc75de7";

// Fixed prototype monitor ID
const int MONITOR_ID = 300;

// Voltage sensor component
const char* VOLTAGE_SENSOR_COMPONENT_ID =
  "736a21d2-ce93-4026-a260-5d192a7c31f7";

// =====================================================
// ESP32 Configuration
// =====================================================

const int VOLTAGE_SENSOR_PIN = 34;

// =====================================================
// Sampling / Database Timing
// =====================================================

// Real-time voltage sampling
const unsigned long SAMPLE_INTERVAL = 200;

// Supabase update interval
const unsigned long DATABASE_UPDATE_INTERVAL = 5000;

unsigned long previousSampleMillis = 0;
unsigned long previousDatabaseMillis = 0;

// =====================================================
// Voltage Sensor Configuration
// =====================================================

// Standard 0-25V voltage sensor module
const float R1 = 30000.0;
const float R2 = 7500.0;
const float REF_VOLTAGE = 3.3;

// ESP32 12-bit ADC
const float ADC_MAX_VALUE = 4095.0;

// =====================================================
// Battery Configuration
// =====================================================

// 12V / 60Ah lithium battery
const float BATTERY_NOMINAL_VOLTAGE = 12.0;
const float BATTERY_CAPACITY_AH = 60.0;

// 12V × 60Ah = 720Wh
const float TOTAL_BATTERY_CAPACITY_WH =
  BATTERY_NOMINAL_VOLTAGE *
  BATTERY_CAPACITY_AH;

// 80% DoD
const float DOD_PERCENT = 80.0;

// 720Wh × 80% = 576Wh usable
const float USABLE_BATTERY_CAPACITY_WH =
  TOTAL_BATTERY_CAPACITY_WH *
  (DOD_PERCENT / 100.0);

// 20% physical reserve
const float MIN_PHYSICAL_SOC = 20.0;

// =====================================================
// LiFePO4 Voltage / SOC Table
// =====================================================
//
// Initial approximation for a 4S LiFePO4 battery.
// Voltage-only SOC is an estimate.
//
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

float currentBatteryVoltage = 0.0;
float currentBatteryLevel = 0.0;
bool currentSensorStatus = false;

// =====================================================
// WiFi Connection
// =====================================================

void connectWiFi() {

  Serial.println();
  Serial.println("Connecting to WiFi...");

  WiFi.begin(
    WIFI_SSID,
    WIFI_PASSWORD
  );

  unsigned long startTime =
    millis();

  while (
    WiFi.status() != WL_CONNECTED &&
    millis() - startTime < 20000
  ) {

    delay(500);
    Serial.print(".");
  }

  Serial.println();

  if (
    WiFi.status() == WL_CONNECTED
  ) {

    Serial.println(
      "WiFi connected!"
    );

    Serial.print(
      "IP Address: "
    );

    Serial.println(
      WiFi.localIP()
    );

  } else {

    Serial.println(
      "ERROR: WiFi connection failed."
    );
  }
}

// =====================================================
// Read Voltage Sensor
// =====================================================

float readBatteryVoltage() {

  int adcValue =
    analogRead(
      VOLTAGE_SENSOR_PIN
    );

  float adcVoltage =
    (
      adcValue *
      REF_VOLTAGE
    ) /
    ADC_MAX_VALUE;

  float inputVoltage =
    adcVoltage *
    (
      (R1 + R2) / R2
    );

  Serial.print("[");
  Serial.print(
    millis() / 1000.0,
    2
  );

  Serial.print("s] ADC: ");
  Serial.print(
    adcValue
  );

  Serial.print(
    " | ADC Voltage: "
  );

  Serial.print(
    adcVoltage,
    3
  );

  Serial.print(
    " V | Battery Voltage: "
  );

  Serial.print(
    inputVoltage,
    2
  );

  Serial.println(" V");

  return inputVoltage;
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
// Voltage → Physical SOC
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
        ratio *
        (
          highSOC -
          lowSOC
        );
    }
  }

  return 0.0;
}

// =====================================================
// Physical SOC → AdlaWatt Battery Level
// =====================================================
//
// 20% physical SOC = AdlaWatt 0%
// 100% physical SOC = AdlaWatt 100%
//
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
    ) *
    100.0;

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
    batteryLevel,
    2
  );

  Serial.println("%");

  return batteryLevel;
}

// =====================================================
// Update Monitoring Through Hardware RPC
// =====================================================
//
// RPC:
// update_monitoring_from_hardware(
//     integer,
//     numeric
// )
//
// =====================================================

void updateBatteryLevel(
  float batteryLevel
) {

  if (
    WiFi.status() != WL_CONNECTED
  ) {

    Serial.println(
      "ERROR: WiFi is not connected."
    );

    return;
  }

  batteryLevel =
    constrain(
      batteryLevel,
      0.0,
      100.0
    );

  HTTPClient http;

  String url =
    String(SUPABASE_URL) +
    "/rest/v1/rpc/update_monitoring_from_hardware";

  // monitor_id is now INTEGER.
  String json =
    "{\"target_monitor_id\":" +
    String(MONITOR_ID) +
    ",\"new_battery_level\":" +
    String(
      batteryLevel,
      2
    ) +
    "}";

  Serial.println();
  Serial.println(
    "----------------------------------------"
  );

  Serial.println(
    "Updating Monitoring"
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

  Serial.print(
    "JSON: "
  );

  Serial.println(
    json
  );

  if (
    !http.begin(url)
  ) {

    Serial.println(
      "ERROR: HTTP connection could not start."
    );

    return;
  }

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
    "return=representation"
  );

  int httpCode =
    http.POST(json);

  Serial.print(
    "HTTP Response Code: "
  );

  Serial.println(
    httpCode
  );

  String response =
    http.getString();

  Serial.print(
    "Supabase Response: "
  );

  if (
    response.length() > 0
  ) {

    Serial.println(
      response
    );

  } else {

    Serial.println(
      "<empty>"
    );
  }

  if (
    httpCode >= 200 &&
    httpCode < 300
  ) {

    Serial.println(
      "SUCCESS: Monitoring updated."
    );

  } else if (
    httpCode == 401
  ) {

    Serial.println(
      "AUTH ERROR: Invalid API credentials."
    );

  } else if (
    httpCode == 403
  ) {

    Serial.println(
      "ACCESS ERROR: Hardware RPC denied."
    );

  } else if (
    httpCode == 404
  ) {

    Serial.println(
      "ERROR: RPC endpoint not found."
    );

  } else {

    Serial.println(
      "ERROR: Monitoring update failed."
    );
  }

  http.end();

  Serial.println(
    "----------------------------------------"
  );
}

// =====================================================
// Update Voltage Sensor Component Status
// =====================================================
//
// NOTE:
// This still uses the normal components RLS.
// If ESP32 receives 403 here, that is expected
// until a hardware RPC for components is added.
//
// =====================================================

void updateSensorStatus(
  bool connected
) {

  if (
    WiFi.status() != WL_CONNECTED
  ) {

    Serial.println(
      "ERROR: WiFi is not connected."
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
    "Updating Voltage Sensor Status..."
  );

  Serial.print(
    "Component ID: "
  );

  Serial.println(
    VOLTAGE_SENSOR_COMPONENT_ID
  );

  Serial.print(
    "Status: "
  );

  Serial.println(
    connected
      ? "TRUE"
      : "FALSE"
  );

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
    "return=representation"
  );

  int httpCode =
    http.PATCH(json);

  Serial.print(
    "Component HTTP Code: "
  );

  Serial.println(
    httpCode
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

  if (
    httpCode >= 200 &&
    httpCode < 300
  ) {

    Serial.println(
      "SUCCESS: Sensor status updated."
    );

  } else if (
    httpCode == 403
  ) {

    Serial.println(
      "WARNING: Components RLS blocked ESP32."
    );

  } else {

    Serial.println(
      "ERROR: Component update failed."
    );
  }

  http.end();
}

// =====================================================
// Sample Voltage
// =====================================================

void sampleVoltage() {

  currentBatteryVoltage =
    readBatteryVoltage();

  currentSensorStatus =
    isVoltageSensorConnected(
      currentBatteryVoltage
    );

  Serial.print(
    "Sensor Status: "
  );

  Serial.println(
    currentSensorStatus
      ? "CONNECTED"
      : "DISCONNECTED"
  );

  if (
    currentSensorStatus
  ) {

    currentBatteryLevel =
      calculateBatteryLevel(
        currentBatteryVoltage
      );

  } else {

    currentBatteryLevel =
      0.0;
  }

  // Only update component when status changes.
  if (
    currentSensorStatus !=
    lastSensorStatus
  ) {

    updateSensorStatus(
      currentSensorStatus
    );

    lastSensorStatus =
      currentSensorStatus;
  }
}

// =====================================================
// Send Battery Update
// =====================================================

void sendBatteryUpdate() {

  if (
    !currentSensorStatus
  ) {

    Serial.println(
      "Battery update skipped."
    );

    Serial.println(
      "Reason: voltage sensor disconnected."
    );

    return;
  }

  updateBatteryLevel(
    currentBatteryLevel
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
    "AdlaWatt Prototype Monitor"
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
    "Total Battery Capacity: "
  );

  Serial.print(
    TOTAL_BATTERY_CAPACITY_WH
  );

  Serial.println(
    " Wh"
  );

  Serial.print(
    "Usable Battery Capacity: "
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

  // Initial sensor reading
  sampleVoltage();

  // Initial database update
  sendBatteryUpdate();

  previousSampleMillis =
    millis();

  previousDatabaseMillis =
    millis();
}

// =====================================================
// Main Loop
// =====================================================

void loop() {

  unsigned long currentMillis =
    millis();

  // -----------------------------------------------
  // Voltage sampling every 200 ms
  // -----------------------------------------------

  if (
    currentMillis -
      previousSampleMillis >=
    SAMPLE_INTERVAL
  ) {

    previousSampleMillis =
      currentMillis;

    sampleVoltage();
  }

  // -----------------------------------------------
  // Database update every 5 seconds
  // -----------------------------------------------

  if (
    currentMillis -
      previousDatabaseMillis >=
    DATABASE_UPDATE_INTERVAL
  ) {

    previousDatabaseMillis =
      currentMillis;

    sendBatteryUpdate();
  }
}