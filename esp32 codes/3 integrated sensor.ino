#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// ============================================================
// WiFi Configuration
// ============================================================

const char* WIFI_SSID = "shinakira";
const char* WIFI_PASSWORD = "12312309";

// ============================================================
// Supabase Configuration
// ============================================================

const char* SUPABASE_URL =
  "https://nxdabgvbwunyeffzrzta.supabase.co";

const char* SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54ZGFiZ3Zid3VueWVmZnpyenRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxNjAxNzksImV4cCI6MjEwMTczNjE3OX0.ya4SFGY1pHhc7AywIWH3mg_IufbN4_z8OHetMAbZeFs";

// ============================================================
// Monitoring Target
// ============================================================

const int MONITOR_ID = 300;

// ============================================================
// ESP32 Pin Configuration
// ============================================================

// Voltage Sensor S
const int VOLTAGE_SENSOR_PIN = 34;

// DS18B20 DATA
const int DS18B20_PIN = 4;

// Buzzer
const int BUZZER_PIN = 25;

// ============================================================
// DS18B20
// ============================================================

OneWire oneWire(DS18B20_PIN);
DallasTemperature sensors(&oneWire);

// ============================================================
// Voltage Sensor Configuration
// ============================================================

// Standard 0-25V voltage sensor
const float R1 = 30000.0;
const float R2 = 7500.0;

const float REF_VOLTAGE = 3.3;
const float ADC_MAX = 4095.0;

// ============================================================
// Battery Configuration
// ============================================================

// 2 x 12V 30Ah batteries in parallel

const float TOTAL_BATTERY_ENERGY_WH = 720.0;

const int MAX_DOD_PERCENT = 80;
const int MINIMUM_SOC_PERCENT = 20;

// Voltage operating range

const float BATTERY_MIN_VOLTAGE = 8.4;
const float BATTERY_MAX_VOLTAGE = 12.6;

// ============================================================
// Battery Voltage / SoC Table
// ============================================================
//
// 12.60V = 100%
// 12.18V = 90%
// 11.76V = 80%
// 11.34V = 70%
// 10.92V = 60%
// 10.50V = 50%
// 10.08V = 40%
//  9.66V = 30%
//  9.24V = 20%  <-- 80% DoD Threshold
//  8.82V = 10%
//  8.40V = 0%
//

struct VoltagePoint {
  float voltage;
  float percentage;
};

const VoltagePoint SOC_TABLE[] = {

  {8.40, 0.0},
  {8.82, 10.0},
  {9.24, 20.0},
  {9.66, 30.0},
  {10.08, 40.0},
  {10.50, 50.0},
  {10.92, 60.0},
  {11.34, 70.0},
  {11.76, 80.0},
  {12.18, 90.0},
  {12.60, 100.0}

};

const int SOC_TABLE_SIZE =
  sizeof(SOC_TABLE) /
  sizeof(SOC_TABLE[0]);

// ============================================================
// Timing
// ============================================================

const unsigned long SENSOR_INTERVAL = 1000;
const unsigned long DATABASE_INTERVAL = 3000;
const unsigned long HEARTBEAT_INTERVAL = 5000;
const unsigned long WIFI_RECONNECT_INTERVAL = 10000;

unsigned long previousSensorMillis = 0;
unsigned long previousDatabaseMillis = 0;
unsigned long previousHeartbeatMillis = 0;
unsigned long previousWiFiAttemptMillis = 0;

// ============================================================
// Buzzer Morse Code Timing
// ============================================================

// Morse Code A = .-

const unsigned long MORSE_UNIT = 200;

bool dangerActive = false;

int buzzerStep = 0;
unsigned long buzzerStepStart = 0;

// ============================================================
// Operating Modes
// ============================================================

enum OperatingMode {

  IDLE,
  DISCHARGING,
  CHARGING,
  PASS_THROUGH

};

OperatingMode currentMode = IDLE;

// ============================================================
// Current Sensor Data
// ============================================================

float currentVoltage = 0.0;
int currentBatteryPercentage = 0;
int currentDoD = 0;
int currentRemainingEnergy = 0;

float currentTemperature = DEVICE_DISCONNECTED_C;
String currentTemperatureStatus = "Unknown";

// ============================================================
// WiFi Maintenance
// ============================================================

void maintainWiFi() {

  if (WiFi.status() == WL_CONNECTED) {
    return;
  }

  unsigned long currentMillis = millis();

  if (
    currentMillis - previousWiFiAttemptMillis >=
    WIFI_RECONNECT_INTERVAL
  ) {

    previousWiFiAttemptMillis = currentMillis;

    Serial.println("[WiFi] Reconnecting...");

    WiFi.disconnect();
    WiFi.begin(
      WIFI_SSID,
      WIFI_PASSWORD
    );

  }

}

// ============================================================
// Read Battery Voltage
// ============================================================

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
    return 0.0;
  }

  return batteryVoltage;

}

// ============================================================
// Voltage to Battery Percentage
// ============================================================

float voltageToBatteryLevel(
  float voltage
) {

  if (
    voltage <= BATTERY_MIN_VOLTAGE
  ) {
    return 0.0;
  }

  if (
    voltage >= BATTERY_MAX_VOLTAGE
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

      float lowPercentage =
        SOC_TABLE[i].percentage;

      float highPercentage =
        SOC_TABLE[i + 1].percentage;

      float ratio =
        (voltage - lowVoltage) /
        (highVoltage - lowVoltage);

      return
        lowPercentage +
        ratio *
        (highPercentage - lowPercentage);

    }

  }

  return 0.0;

}

// ============================================================
// Read Battery
// ============================================================

void readBattery() {

  currentVoltage =
    readBatteryVoltage();

  float precisePercentage =
    voltageToBatteryLevel(
      currentVoltage
    );

  currentBatteryPercentage =
    round(precisePercentage);

  currentBatteryPercentage =
    constrain(
      currentBatteryPercentage,
      0,
      100
    );

  currentDoD =
    100 -
    currentBatteryPercentage;

  currentRemainingEnergy =
    round(
      TOTAL_BATTERY_ENERGY_WH *
      (
        currentBatteryPercentage /
        100.0
      )
    );

}

// ============================================================
// Get Operating Mode from Supabase
// ============================================================

OperatingMode getOperatingMode() {

  if (
    WiFi.status() != WL_CONNECTED
  ) {
    return currentMode;
  }

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;

  String url =
    String(SUPABASE_URL) +
    "/rest/v1/monitoring" +
    "?monitor_id=eq." +
    String(MONITOR_ID) +
    "&select=battery_status,current_load";

  if (!http.begin(client, url)) {
    return currentMode;
  }

  http.setTimeout(3000);

  http.addHeader(
    "apikey",
    SUPABASE_KEY
  );

  http.addHeader(
    "Authorization",
    String("Bearer ") +
    SUPABASE_KEY
  );

  int code =
    http.GET();

  String response =
    http.getString();

  http.end();

  if (
    code < 200 ||
    code >= 300 ||
    response.length() == 0
  ) {
    return currentMode;
  }

  bool charging =
    response.indexOf(
      "\"battery_status\":\"Charging\""
    ) >= 0;

  bool discharging =
    response.indexOf(
      "\"battery_status\":\"Discharging\""
    ) >= 0;

  bool loadActive =
    response.indexOf(
      "\"current_load\":0"
    ) < 0;

  if (
    charging &&
    loadActive
  ) {
    return PASS_THROUGH;
  }

  if (charging) {
    return CHARGING;
  }

  if (
    discharging ||
    loadActive
  ) {
    return DISCHARGING;
  }

  return IDLE;

}

// ============================================================
// Get Mode Name
// ============================================================

const char* getModeName(
  OperatingMode mode
) {

  switch (mode) {

    case IDLE:
      return "Idle / Storage";

    case DISCHARGING:
      return "Discharging";

    case CHARGING:
      return "Charging";

    case PASS_THROUGH:
      return "Pass-Through";

  }

  return "Unknown";

}

// ============================================================
// Classify Temperature
// ============================================================

const char* classifyTemperature(
  float temperature,
  OperatingMode mode
) {

  switch (mode) {

    case IDLE:

      if (
        temperature >= 15.0 &&
        temperature <= 30.0
      ) {
        return "Normal";
      }

      if (temperature <= 45.0) {
        return "Moderate";
      }

      return "Alarming";

    case DISCHARGING:

      if (
        temperature >= 0.0 &&
        temperature <= 40.0
      ) {
        return "Normal";
      }

      if (temperature <= 50.0) {
        return "Moderate";
      }

      return "Alarming";

    case CHARGING:

      if (
        temperature >= 0.0 &&
        temperature <= 40.0
      ) {
        return "Normal";
      }

      if (temperature <= 45.0) {
        return "Moderate";
      }

      return "Alarming";

    case PASS_THROUGH:

      if (
        temperature >= 0.0 &&
        temperature <= 35.0
      ) {
        return "Normal";
      }

      if (temperature <= 45.0) {
        return "Moderate";
      }

      return "Alarming";

  }

  return "Alarming";

}

// ============================================================
// Read DS18B20
// ============================================================

void readTemperature() {

  sensors.requestTemperatures();

  float temperature =
    sensors.getTempCByIndex(0);

  if (
    temperature ==
    DEVICE_DISCONNECTED_C
  ) {

    currentTemperature =
      DEVICE_DISCONNECTED_C;

    currentTemperatureStatus =
      "Sensor Disconnected";

    dangerActive = false;

    return;

  }

  currentTemperature =
    temperature;

  currentMode =
    getOperatingMode();

  currentTemperatureStatus =
    classifyTemperature(
      currentTemperature,
      currentMode
    );

  dangerActive =
    (
      currentTemperatureStatus ==
      "Alarming"
    );

}

// ============================================================
// Non-Blocking Morse Code A
// ============================================================
//
// Morse A = .-
//
// DOT  = 1 unit
// GAP  = 1 unit
// DASH = 3 units
// LETTER GAP = 3 units
//
// Sequence:
// DOT ON
// DOT GAP
// DASH ON
// LETTER GAP
//

void updateBuzzer() {

  unsigned long now =
    millis();

  if (!dangerActive) {

    digitalWrite(
      BUZZER_PIN,
      LOW
    );

    buzzerStep = 0;

    return;

  }

  unsigned long duration = 0;

  switch (buzzerStep) {

    // DOT ON

    case 0:

      digitalWrite(
        BUZZER_PIN,
        HIGH
      );

      duration =
        MORSE_UNIT;

      break;

    // GAP

    case 1:

      digitalWrite(
        BUZZER_PIN,
        LOW
      );

      duration =
        MORSE_UNIT;

      break;

    // DASH ON

    case 2:

      digitalWrite(
        BUZZER_PIN,
        HIGH
      );

      duration =
        MORSE_UNIT * 3;

      break;

    // Letter gap

    case 3:

      digitalWrite(
        BUZZER_PIN,
        LOW
      );

      duration =
        MORSE_UNIT * 3;

      break;

  }

  if (
    now - buzzerStepStart >=
    duration
  ) {

    buzzerStepStart =
      now;

    buzzerStep++;

    if (
      buzzerStep > 3
    ) {
      buzzerStep = 0;
    }

  }

}

// ============================================================
// Update Supabase Monitoring Data
// ============================================================
//
// One PATCH request updates both sensors.
// This reduces simultaneous database requests.
//

void updateMonitoring() {

  if (
    WiFi.status() != WL_CONNECTED
  ) {

    Serial.println(
      "[DATABASE] Skipped - WiFi Offline"
    );

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
    "{";

  json +=
    "\"battery_level\":" +
    String(currentBatteryPercentage);

  if (
    currentTemperature !=
    DEVICE_DISCONNECTED_C
  ) {

    json +=
      ",\"battery_temperature\":" +
      String(
        currentTemperature,
        2
      );

    json +=
      ",\"battery_temperature_status\":\"" +
      currentTemperatureStatus +
      "\"";

  }

  json += "}";

  if (
    !http.begin(
      client,
      url
    )
  ) {

    Serial.println(
      "[DATABASE] HTTP connection failed"
    );

    return;

  }

  http.setTimeout(5000);

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

  Serial.print(
    "[DATABASE] HTTP: "
  );

  Serial.println(
    responseCode
  );

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

// ============================================================
// ESP32 Heartbeat
// ============================================================

void sendHeartbeat() {

  if (
    WiFi.status() != WL_CONNECTED
  ) {
    return;
  }

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;

  String url =
    String(SUPABASE_URL) +
    "/rest/v1/rpc/send_esp32_heartbeat";

  String json =
    "{\"target_monitor_id\":" +
    String(MONITOR_ID) +
    "}";

  if (
    !http.begin(
      client,
      url
    )
  ) {
    return;
  }

  http.setTimeout(3000);

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

  int code =
    http.POST(json);

  http.end();

  Serial.print(
    "[HEARTBEAT] HTTP: "
  );

  Serial.println(code);

}

// ============================================================
// Local Serial Display
// ============================================================

void printStatus() {

  Serial.println();

  Serial.println(
    "================================================"
  );

  Serial.println(
    "              ADLAWATT MONITOR"
  );

  Serial.println(
    "================================================"
  );

  // ------------------------------------------------
  // Battery
  // ------------------------------------------------

  Serial.println(
    "[ BATTERY ]"
  );

  Serial.print(
    "Voltage       : "
  );

  Serial.print(
    currentVoltage,
    2
  );

  Serial.println(
    " V"
  );

  Serial.print(
    "Battery Level : "
  );

  Serial.print(
    currentBatteryPercentage
  );

  Serial.println(
    "%"
  );

  Serial.print(
    "DoD           : "
  );

  Serial.print(
    currentDoD
  );

  Serial.println(
    "%"
  );

  Serial.print(
    "Remaining     : "
  );

  Serial.print(
    currentRemainingEnergy
  );

  Serial.println(
    " Wh"
  );

  // ------------------------------------------------
  // 80% DoD
  // ------------------------------------------------

  if (
    currentBatteryPercentage <=
    MINIMUM_SOC_PERCENT
  ) {

    Serial.println(
      "DoD Status    : THRESHOLD REACHED"
    );

  } else {

    Serial.println(
      "DoD Status    : SAFE"
    );

  }

  Serial.println(
    "------------------------------------------------"
  );

  // ------------------------------------------------
  // Temperature
  // ------------------------------------------------

  Serial.println(
    "[ TEMPERATURE ]"
  );

  if (
    currentTemperature ==
    DEVICE_DISCONNECTED_C
  ) {

    Serial.println(
      "Temperature   : SENSOR DISCONNECTED"
    );

  } else {

    Serial.print(
      "Temperature   : "
    );

    Serial.print(
      currentTemperature,
      2
    );

    Serial.println(
      " C"
    );

  }

  Serial.print(
    "Mode          : "
  );

  Serial.println(
    getModeName(
      currentMode
    )
  );

  Serial.print(
    "Status        : "
  );

  Serial.println(
    currentTemperatureStatus
  );

  // ------------------------------------------------
  // Buzzer
  // ------------------------------------------------

  Serial.println(
    "------------------------------------------------"
  );

  Serial.println(
    "[ BUZZER ]"
  );

  if (dangerActive) {

    Serial.println(
      "Status        : ACTIVE"
    );

    Serial.println(
      "Signal        : MORSE CODE A (. -)"
    );

    Serial.println(
      "Reason        : DANGER TEMPERATURE"
    );

  } else {

    Serial.println(
      "Status        : OFF"
    );

  }

  // ------------------------------------------------
  // Connectivity
  // ------------------------------------------------

  Serial.println(
    "------------------------------------------------"
  );

  Serial.println(
    "[ CONNECTIVITY ]"
  );

  if (
    WiFi.status() ==
    WL_CONNECTED
  ) {

    Serial.println(
      "WiFi          : CONNECTED"
    );

    Serial.print(
      "IP Address    : "
    );

    Serial.println(
      WiFi.localIP()
    );

  } else {

    Serial.println(
      "WiFi          : DISCONNECTED"
    );

  }

  Serial.println(
    "================================================"
  );

}

// ============================================================
// Setup
// ============================================================

void setup() {

  Serial.begin(115200);

  delay(500);

  Serial.println();

  Serial.println(
    "================================================"
  );

  Serial.println(
    "AdlaWatt Integrated Hardware Monitor"
  );

  Serial.println(
    "================================================"
  );

  // Voltage Sensor

  pinMode(
    VOLTAGE_SENSOR_PIN,
    INPUT
  );

  analogReadResolution(12);

  // Buzzer

  pinMode(
    BUZZER_PIN,
    OUTPUT
  );

  digitalWrite(
    BUZZER_PIN,
    LOW
  );

  // DS18B20

  sensors.begin();

  // WiFi

  WiFi.mode(WIFI_STA);

  WiFi.begin(
    WIFI_SSID,
    WIFI_PASSWORD
  );

  Serial.print(
    "Connecting to WiFi"
  );

  while (
    WiFi.status() !=
    WL_CONNECTED
  ) {

    delay(500);

    Serial.print(".");

  }

  Serial.println();

  Serial.println(
    "WiFi Connected"
  );

  Serial.print(
    "IP Address: "
  );

  Serial.println(
    WiFi.localIP()
  );

  // Initial readings

  readBattery();
  readTemperature();

  printStatus();

  updateMonitoring();

  sendHeartbeat();

  previousSensorMillis =
    millis();

  previousDatabaseMillis =
    millis();

  previousHeartbeatMillis =
    millis();

  buzzerStepStart =
    millis();

}

// ============================================================
// Main Loop
// ============================================================

void loop() {

  unsigned long currentMillis =
    millis();

  // Maintain WiFi

  maintainWiFi();

  // ------------------------------------------------
  // Continuous Buzzer Handling
  // ------------------------------------------------

  updateBuzzer();

  // ------------------------------------------------
  // Read Sensors
  // ------------------------------------------------

  if (
    currentMillis -
    previousSensorMillis >=
    SENSOR_INTERVAL
  ) {

    previousSensorMillis =
      currentMillis;

    readBattery();

    readTemperature();

    printStatus();

  }

  // ------------------------------------------------
  // Supabase Update
  // ------------------------------------------------

  if (
    currentMillis -
    previousDatabaseMillis >=
    DATABASE_INTERVAL
  ) {

    previousDatabaseMillis =
      currentMillis;

    updateMonitoring();

  }

  // ------------------------------------------------
  // ESP32 Heartbeat
  // ------------------------------------------------

  if (
    currentMillis -
    previousHeartbeatMillis >=
    HEARTBEAT_INTERVAL
  ) {

    previousHeartbeatMillis =
      currentMillis;

    sendHeartbeat();

  }

}
