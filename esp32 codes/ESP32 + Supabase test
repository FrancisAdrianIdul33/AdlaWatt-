#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

// ============================================
// WiFi Configuration
// ============================================

const char* WIFI_SSID = "shinakira";
const char* WIFI_PASSWORD = "12312309";

// ============================================
// Supabase Configuration
// ============================================

const char* SUPABASE_URL =
  "https://nxdabgvbwunyeffzrzta.supabase.co";

const char* SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54ZGFiZ3Zid3VueWVmZnpyenRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxNjAxNzksImV4cCI6MjEwMTczNjE3OX0.ya4SFGY1pHhc7AywIWH3mg_IufbN4_z8OHetMAbZeFs";

// ============================================
// Hardware Monitoring ID
// ============================================

// The hardware decides which monitoring
// record it belongs to.
const int MONITOR_ID = 300;

// ============================================
// Heartbeat
// ============================================

const unsigned long HEARTBEAT_INTERVAL = 1000;

unsigned long previousHeartbeat = 0;

// ============================================
// Send Heartbeat
// ============================================

bool sendHeartbeat() {

  if (WiFi.status() != WL_CONNECTED) {

    Serial.println(
      "[STATUS] Offline - No Internet"
    );

    return false;
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

  if (!http.begin(client, url)) {

    Serial.println(
      "[STATUS] Offline - HTTP failed"
    );

    return false;
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

  String response =
    http.getString();

  http.end();

  if (
    code >= 200 &&
    code < 300
  ) {

    Serial.println(
      "[STATUS] Online"
    );

    Serial.print(
      "[HEARTBEAT] HTTP "
    );

    Serial.println(
      code
    );

    return true;
  }

  Serial.println(
    "[STATUS] Offline - Supabase unavailable"
  );

  Serial.print(
    "[HTTP] "
  );

  Serial.println(
    code
  );

  if (response.length() > 0) {

    Serial.println(
      response
    );
  }

  return false;
}

// ============================================
// WiFi Maintenance
// ============================================

void maintainWiFi() {

  if (
    WiFi.status() == WL_CONNECTED
  ) {
    return;
  }

  Serial.println(
    "[WiFi] Disconnected - reconnecting..."
  );

  WiFi.disconnect();
  WiFi.begin(
    WIFI_SSID,
    WIFI_PASSWORD
  );
}

// ============================================
// Setup
// ============================================

void setup() {

  Serial.begin(
    115200
  );

  delay(500);

  Serial.println();
  Serial.println(
    "======================================"
  );

  Serial.println(
    "AdlaWatt ESP32 Connectivity Test"
  );

  Serial.println(
    "======================================"
  );

  WiFi.mode(
    WIFI_STA
  );

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

  Serial.print(
    "IP Address: "
  );

  Serial.println(
    WiFi.localIP()
  );

  // Initial heartbeat
  sendHeartbeat();

  previousHeartbeat =
    millis();
}

// ============================================
// Main Loop
// ============================================

void loop() {

  unsigned long currentMillis =
    millis();

  maintainWiFi();

  if (
    currentMillis -
      previousHeartbeat >=
    HEARTBEAT_INTERVAL
  ) {

    previousHeartbeat =
      currentMillis;

    sendHeartbeat();
  }
}