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

// Exact Voltage Sensor component ID
const char* VOLTAGE_SENSOR_COMPONENT_ID =
  "736a21d2-ce93-4026-a260-5d192a7c31f7";

// =====================================================
// ESP32 Configuration
// =====================================================

// Voltage sensor Signal (S) connected to GPIO 34
#define VOLTAGE_SENSOR_PIN 34

// ADC threshold
// Above this value = sensor connected
// At or below this value = sensor disconnected
const int VOLTAGE_THRESHOLD = 100;

// Automatic sensor checking interval
const unsigned long CHECK_INTERVAL = 2000;

// =====================================================
// Variables
// =====================================================

// Previous automatic sensor status
bool lastStatus = false;

// Timer
unsigned long lastCheck = 0;

// Automatic mode by default
bool automaticMode = true;


// =====================================================
// Connect to WiFi
// =====================================================

void connectWiFi() {

  Serial.println();
  Serial.println("Connecting to WiFi...");

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

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
// Read Voltage Sensor
// =====================================================

bool isVoltageSensorConnected() {

  int sensorValue = analogRead(VOLTAGE_SENSOR_PIN);

  Serial.print("Voltage Sensor ADC: ");
  Serial.println(sensorValue);

  if (sensorValue > VOLTAGE_THRESHOLD) {

    return true;

  } else {

    return false;
  }
}


// =====================================================
// Update Supabase Status
// =====================================================

void updateSupabaseStatus(bool status) {

  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {

    Serial.println("WiFi disconnected.");
    Serial.println("Cannot update Supabase.");

    return;
  }

  HTTPClient http;

  // ---------------------------------------------------
  // Supabase REST API
  // ---------------------------------------------------

  String url =
    String(SUPABASE_URL) +
    "/rest/v1/components?comp_id=eq." +
    String(VOLTAGE_SENSOR_COMPONENT_ID);

  Serial.println();
  Serial.println("----------------------------------------");
  Serial.println("Updating Supabase");
  Serial.println("----------------------------------------");

  Serial.print("Component ID: ");
  Serial.println(VOLTAGE_SENSOR_COMPONENT_ID);

  Serial.print("Status: ");

  if (status) {
    Serial.println("TRUE");
  } else {
    Serial.println("FALSE");
  }

  // Start HTTP connection
  http.begin(url);

  // Headers
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_KEY);

  http.addHeader(
    "Authorization",
    String("Bearer ") + SUPABASE_KEY
  );

  http.addHeader("Prefer", "return=minimal");

  // JSON
  String json =
    "{\"status\":" +
    String(status ? "true" : "false") +
    "}";

  Serial.print("Sending: ");
  Serial.println(json);

  // PATCH request
  int httpCode = http.PATCH(json);

  Serial.print("HTTP Response Code: ");
  Serial.println(httpCode);

  // Check result
  if (httpCode >= 200 && httpCode < 300) {

    Serial.println("SUCCESS: Supabase updated!");

  } else {

    Serial.println("ERROR: Supabase update failed.");

    String response = http.getString();

    if (response.length() > 0) {

      Serial.println("Supabase response:");
      Serial.println(response);
    }
  }

  http.end();

  Serial.println("----------------------------------------");
}


// =====================================================
// Print Serial Commands
// =====================================================

void printCommands() {

  Serial.println();
  Serial.println("========================================");
  Serial.println("AdlaWatt Voltage Sensor Test");
  Serial.println("========================================");
  Serial.println("Voltage Sensor Signal : GPIO 34");
  Serial.println("Component ID          :");
  Serial.println(VOLTAGE_SENSOR_COMPONENT_ID);
  Serial.println();
  Serial.println("Serial Commands:");
  Serial.println("T = Set status TRUE");
  Serial.println("F = Set status FALSE");
  Serial.println("A = Automatic sensor mode");
  Serial.println();
  Serial.println("Current Mode:");
  
  if (automaticMode) {
    Serial.println("AUTOMATIC");
  } else {
    Serial.println("MANUAL");
  }

  Serial.println("========================================");
  Serial.println();
}


// =====================================================
// Process Serial Commands
// =====================================================

void processSerialCommand() {

  if (Serial.available() > 0) {

    char command = Serial.read();

    // Convert lowercase to uppercase
    command = toupper(command);

    // -------------------------------------------------
    // T = TRUE
    // -------------------------------------------------

    if (command == 'T') {

      automaticMode = false;

      Serial.println();
      Serial.println("Manual command received: TRUE");

      updateSupabaseStatus(true);

    }

    // -------------------------------------------------
    // F = FALSE
    // -------------------------------------------------

    else if (command == 'F') {

      automaticMode = false;

      Serial.println();
      Serial.println("Manual command received: FALSE");

      updateSupabaseStatus(false);

    }

    // -------------------------------------------------
    // A = AUTOMATIC MODE
    // -------------------------------------------------

    else if (command == 'A') {

      automaticMode = true;

      Serial.println();
      Serial.println("Automatic sensor mode ENABLED.");

      // Immediately check sensor
      bool currentStatus =
        isVoltageSensorConnected();

      lastStatus = currentStatus;

      updateSupabaseStatus(currentStatus);
    }
  }
}


// =====================================================
// Setup
// =====================================================

void setup() {

  Serial.begin(115200);

  delay(1000);

  // Configure GPIO 34 as input
  pinMode(VOLTAGE_SENSOR_PIN, INPUT);

  // Connect WiFi
  connectWiFi();

  // Show commands
  printCommands();

  // ---------------------------------------------------
  // Initial automatic sensor reading
  // ---------------------------------------------------

  Serial.println("Performing initial sensor check...");

  bool currentStatus =
    isVoltageSensorConnected();

  lastStatus = currentStatus;

  // Send initial status to Supabase
  updateSupabaseStatus(currentStatus);

  Serial.println();
  Serial.println("System ready.");
  Serial.println("Enter T, F, or A in Serial Monitor.");
}


// =====================================================
// Main Loop
// =====================================================

void loop() {

  // Always listen for Serial commands
  processSerialCommand();

  // ---------------------------------------------------
  // Automatic sensor mode
  // ---------------------------------------------------

  if (automaticMode) {

    if (millis() - lastCheck >= CHECK_INTERVAL) {

      lastCheck = millis();

      // Read sensor
      bool currentStatus =
        isVoltageSensorConnected();

      Serial.print("Sensor Status: ");

      if (currentStatus) {
        Serial.println("CONNECTED / TRUE");
      } else {
        Serial.println("DISCONNECTED / FALSE");
      }

      // Only update Supabase if status changed
      if (currentStatus != lastStatus) {

        Serial.println();
        Serial.println("Sensor status changed!");

        updateSupabaseStatus(currentStatus);

        lastStatus = currentStatus;
      }
    }
  }
}