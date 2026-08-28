#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// ============================================
// WiFi
// ============================================

const char* WIFI_SSID = "shinakira";
const char* WIFI_PASSWORD = "12312309";

// ============================================
// Supabase
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
// DS18B20
// ============================================

// DS18B20 DATA → GPIO 4
const int DS18B20_PIN = 4;

OneWire oneWire(DS18B20_PIN);
DallasTemperature sensors(&oneWire);

// ============================================
// Timing
// ============================================

const unsigned long UPDATE_INTERVAL = 2000;

unsigned long previousMillis = 0;

// ============================================
// Operating Mode
// ============================================

enum OperatingMode {
  IDLE,
  DISCHARGING,
  CHARGING,
  PASS_THROUGH
};

// ============================================
// Read Current Monitoring Mode
// ============================================

OperatingMode getOperatingMode() {

  if (
    WiFi.status() != WL_CONNECTED
  ) {
    return IDLE;
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
    return IDLE;
  }

  http.addHeader(
    "apikey",
    SUPABASE_KEY
  );

  http.addHeader(
    "Authorization",
    String("Bearer ") + SUPABASE_KEY
  );

  int code = http.GET();

  String response = http.getString();

  http.end();

  if (
    code < 200 ||
    code >= 300 ||
    response.length() == 0
  ) {
    return IDLE;
  }

  // Simple parsing for current monitoring values.
  bool charging =
    response.indexOf("\"battery_status\":\"Charging\"") >= 0;

  bool discharging =
    response.indexOf("\"battery_status\":\"Discharging\"") >= 0;

  bool loadActive =
    response.indexOf("\"current_load\":0") < 0;

  if (charging && loadActive) {
    return PASS_THROUGH;
  }

  if (charging) {
    return CHARGING;
  }

  if (discharging || loadActive) {
    return DISCHARGING;
  }

  return IDLE;
}

// ============================================
// Classify Temperature
// ============================================

const char* classifyTemperature(
  float temperature,
  OperatingMode mode
) {

  switch (mode) {

    case IDLE:

      if (temperature >= 15.0 &&
          temperature <= 30.0) {
        return "Normal";
      }

      if (temperature <= 45.0) {
        return "Moderate";
      }

      return "Alarming";


    case DISCHARGING:

      if (temperature >= 0.0 &&
          temperature <= 40.0) {
        return "Normal";
      }

      if (temperature <= 50.0) {
        return "Moderate";
      }

      return "Alarming";


    case CHARGING:

      if (temperature >= 0.0 &&
          temperature <= 40.0) {
        return "Normal";
      }

      if (temperature <= 45.0) {
        return "Moderate";
      }

      return "Alarming";


    case PASS_THROUGH:

      if (temperature >= 0.0 &&
          temperature <= 35.0) {
        return "Normal";
      }

      if (temperature <= 45.0) {
        return "Moderate";
      }

      return "Alarming";
  }

  return "Alarming";
}

// ============================================
// Mode Name
// ============================================

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

// ============================================
// Update Monitoring
// ============================================

void updateMonitoring(
  float temperature,
  const char* status
) {

  if (
    WiFi.status() != WL_CONNECTED
  ) {
    Serial.println(
      "WiFi disconnected."
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
    "{\"battery_temperature\":" +
    String(temperature, 2) +
    ",\"battery_temperature_status\":\"" +
    String(status) +
    "\"}";

  if (!http.begin(client, url)) {

    Serial.println(
      "HTTP connection failed."
    );

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

  int code =
    http.PATCH(json);

  Serial.print(
    "Database HTTP: "
  );

  Serial.println(code);

  if (
    code >= 200 &&
    code < 300
  ) {

    Serial.println(
      "Database updated."
    );

  } else {

    Serial.println(
      "Database update failed."
    );

    Serial.println(
      http.getString()
    );
  }

  http.end();
}

// ============================================
// Read and Process Temperature
// ============================================

void monitorTemperature() {

  sensors.requestTemperatures();

  float temperature =
    sensors.getTempCByIndex(0);

  // Sensor error
  if (
    temperature == DEVICE_DISCONNECTED_C
  ) {

    Serial.println(
      "DS18B20: DISCONNECTED"
    );

    return;
  }

  // Safety range check
  if (
    temperature > 100.0
  ) {

    Serial.println(
      "WARNING: Temperature exceeded 100°C."
    );
  }

  OperatingMode mode =
    getOperatingMode();

  const char* status =
    classifyTemperature(
      temperature,
      mode
    );

  // ==========================================
  // Serial Monitor
  // ==========================================

  Serial.println();
  Serial.println(
    "===================================="
  );

  Serial.print(
    "Battery Temperature: "
  );

  Serial.print(
    temperature,
    2
  );

  Serial.println(
    " °C"
  );

  Serial.print(
    "Operating Mode: "
  );

  Serial.println(
    getModeName(mode)
  );

  Serial.print(
    "Temperature Status: "
  );

  Serial.println(
    status
  );

  Serial.print(
    "Monitor ID: "
  );

  Serial.println(
    MONITOR_ID
  );

  Serial.println(
    "===================================="
  );

  // ==========================================
  // Update Supabase
  // ==========================================

  updateMonitoring(
    temperature,
    status
  );
}

// ============================================
// Setup
// ============================================

void setup() {

  Serial.begin(115200);

  sensors.begin();

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

  Serial.println(
    "DS18B20 initialized."
  );

  monitorTemperature();

  previousMillis =
    millis();
}

// ============================================
// Loop
// ============================================

void loop() {

  unsigned long currentMillis =
    millis();

  if (
    currentMillis -
      previousMillis >=
    UPDATE_INTERVAL
  ) {

    previousMillis =
      currentMillis;

    monitorTemperature();
  }
}