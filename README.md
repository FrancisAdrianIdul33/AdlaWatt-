Absolutely. Based on the **AdlaWatt capstone paper**, the current **React Native + Expo application**, and the implementation details we've established, here is a complete `README.md`. I kept the README aligned with the current state of the project, including the fact that the database and IoT backend are **not yet connected** and the application currently uses static/mock data.

The capstone describes AdlaWatt as a transportable IoT-based off-grid solar energy harvesting system with battery storage, a built-in AC outlet, real-time monitoring, appliance recommendations, and a cross-platform mobile application.  The documented architecture uses ESP32, INA219, INA226, DS18B20, voltage sensing, Supabase, and mobile monitoring. 

````markdown
# AdlaWatt

An IoT-based transportable off-grid solar energy harvesting system with a mobile application for real-time energy monitoring, appliance recommendations, notifications, and backup power management during electricity interruptions.

AdlaWatt is designed to provide households with an alternative backup power source by harvesting solar energy, storing it in a battery, and supplying electricity through a built-in AC outlet. The mobile application allows users to monitor battery status, solar energy, power consumption, temperature, system status, energy history, and appliance recommendations.

> **Project Status:** In Development  
> The current mobile application uses static/mock data while the IoT hardware, Supabase database, and backend services are being integrated.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Components](#system-components)
- [Mobile Application](#mobile-application)
- [Tech Stack](#tech-stack)
- [Hardware Components](#hardware-components)
- [Software Architecture](#software-architecture)
- [Project Structure](#project-structure)
- [Application Screens](#application-screens)
- [System Workflow](#system-workflow)
- [Data and Backend](#data-and-backend)
- [Installation](#installation)
- [Development](#development)
- [Build and Deployment](#build-and-deployment)
- [Current Development Status](#current-development-status)
- [Limitations](#limitations)
- [SDG Alignment](#sdg-alignment)
- [Research Evaluation](#research-evaluation)
- [Future Improvements](#future-improvements)
- [Contributors](#contributors)
- [License](#license)

---

## Overview

AdlaWatt is an IoT-based off-grid solar energy harvesting system developed as a backup power solution for households during electricity interruptions.

The system collects solar energy through a solar panel and stores the generated energy in a 12V battery housed inside a transportable lockable enclosure. A built-in AC outlet allows compatible household appliances to use the stored energy.

The system also monitors energy generation, energy consumption, battery status, battery temperature, and solar panel temperature. The collected data is intended to be transmitted through an ESP32 to a cloud database and displayed through the AdlaWatt mobile application.

One of the main features of AdlaWatt is its appliance recommendation system. Users can identify appliances they plan to use, and the application can recommend suitable appliances based on the available battery level.

AdlaWatt is intended as a backup power source during electricity interruptions and is not designed to replace the electrical grid.

---

## Features

### Real-Time Monitoring

The mobile application provides monitoring information for:

- Battery percentage
- Battery voltage
- Incoming solar energy
- Solar input
- Energy consumption
- Current appliance load
- Battery temperature
- Solar panel temperature
- System status
- Energy history

### Appliance Recommendation

The application allows users to view or select household appliances and receive recommendations based on the available battery level.

The purpose of this feature is to help users determine which appliances are suitable to operate using the available backup power.

### Dashboard

The dashboard provides a summary of the current AdlaWatt system condition, including:

- Battery status
- Solar input
- Current load
- Device status
- Battery temperature
- Appliance recommendations
- Recent activity logs

### Notifications

The application provides notifications for important system conditions and alerts.

Potential notifications include:

- Low battery
- High battery temperature
- System status changes
- Important monitoring alerts
- Other system-generated events

### Activity Logs

The application provides an activity log for viewing recorded system activities and events.

The dashboard also provides a preview of recent activity logs with an option to view all recorded activities.

### Appliance Management

Users can access the appliance section to view available appliances and their relevant power requirements.

This information can be used by the recommendation feature when determining suitable appliances for the current battery condition.

### Component Monitoring

The Components section is intended to provide information about the IoT and power components used by the AdlaWatt system.

### Settings

The Settings section is intended to provide application preferences and configuration options.

### About Us

The About Us section provides information about the AdlaWatt project and its developers.

### Authentication

The application includes:

- Login
- Registration
- Username/email authentication input
- Password authentication
- Remember Me option
- Terms and Conditions
- Logout functionality

---

## System Components

AdlaWatt consists of three major parts:

### 1. Physical Power System

The physical system consists of:

- Solar panel
- Solar charge controller
- 12V battery
- Inverter
- Built-in AC outlet
- Protection components
- Transportable lockable enclosure

### 2. IoT Monitoring System

The IoT system collects and processes information from the physical power system using an ESP32 and connected sensors.

### 3. Software System

The software system consists of:

- Cross-platform mobile application for household users
- Web-based admin dashboard for researchers
- Cloud database and real-time data services

The capstone identifies the household user and admin as the primary actors. Household users monitor the system through the mobile application, while administrators can monitor data, view historical information, and configure alert thresholds. 

---

## Mobile Application

The AdlaWatt mobile application is designed as a cross-platform application for household users.

### Main Navigation

The application currently includes the following navigation items:

| Screen | Purpose |
|---|---|
| Dashboard | Displays system overview and real-time monitoring |
| Appliances | Displays household appliances and recommendations |
| Components | Displays IoT and system component information |
| Notifications | Displays system notifications and alerts |
| Activity Logs | Displays system activity history |
| About Us | Displays information about AdlaWatt |
| Settings | Provides application configuration |
| Log Out | Logs the current user out of the application |
| Exit | Closes the current application flow |

### Navigation Components

The application uses:

- Fixed navigation bar
- Notification icon
- Sidebar navigation
- Sidebar overlay
- Navigation routing
- Screen-specific containers

The sidebar slides from the left side of the screen and provides navigation to the application's primary sections.

---

## Tech Stack

### Mobile Application

- **React Native** — Cross-platform mobile application framework
- **Expo** — React Native development platform
- **Expo Router** — Application routing and navigation
- **TypeScript** — Static typing and application development
- **React** — Component-based user interface
- **React Native StyleSheet** — Component styling
- **Expo Linear Gradient** — Gradient navigation interface
- **@expo/vector-icons / Ionicons** — Application icons
- **EAS Build** — Android application builds
- **Git** — Version control
- **GitHub** — Source code repository

### Backend and Cloud

Planned technologies:

- **Supabase** — Cloud database and real-time data streaming
- **REST/HTTP communication** — Communication between the IoT system and cloud services
- **ESP32 Wi-Fi** — Wireless transmission of sensor data

The capstone architecture specifies the ESP32 transmitting sensor information through Wi-Fi to Supabase, where data can be stored and streamed in real time to the mobile application. 

### Development Tools

- **Visual Studio Code** — Application development
- **Android Studio** — Android testing and emulation
- **Expo CLI / EAS CLI** — Development and application builds
- **Git / GitHub** — Version control

---

## Hardware Components

The AdlaWatt physical prototype consists of power and IoT components.

### Power Components

| Component | Purpose |
|---|---|
| Solar Panel | Collects solar energy |
| PWM Charge Controller | Regulates battery charging |
| 12V Battery | Stores electrical energy |
| 1000W Inverter | Converts DC power to AC power |
| Breaker | Provides overcurrent protection |
| Surge Protection Device | Protects against voltage surges |
| AC Outlet | Supplies power to compatible appliances |

### IoT Components

| Component | Purpose |
|---|---|
| ESP32 | Main microcontroller and Wi-Fi communication |
| INA219 | Monitors solar panel voltage and current |
| INA226 | Monitors load voltage and current |
| DS18B20 | Monitors battery temperature |
| Voltage Sensor | Measures system voltage |
| Relay Module | Controls load and cooling fan switching |
| LCD2004 | Displays local real-time system information |
| 5V Fan | Provides cooling when required |

The capstone identifies the INA219 for the solar-panel side and INA226 for the load/appliance side, with the ESP32 collecting the sensor information and transmitting it to the cloud system. 

---

## Software Architecture

The planned system architecture is:

```text
Solar Panel
     │
     ▼
Surge Protection
     │
     ▼
Circuit Breaker
     │
     ▼
PWM Charge Controller
     │
     ▼
12V Battery
     │
     ▼
Inverter
     │
     ▼
Built-in AC Outlet
     │
     ▼
Household Appliance
````

IoT monitoring:

```text
INA219 ─────────────┐
                    │
INA226 ─────────────┤
                    │
DS18B20 ────────────┤
                    │
Voltage Sensor ─────┤
                    ▼
                  ESP32
                    │
                  Wi-Fi
                    │
                    ▼
               Supabase
                    │
                    ▼
          AdlaWatt Mobile App
```

The documented system architecture follows this flow, with sensor information collected by the ESP32, transmitted to Supabase, and retrieved by the mobile application for real-time monitoring.

---

## Project Structure

The current mobile application follows a component-based Expo Router structure.

```text
AdlaWatt/
├── app/
│   ├── auth/
│   │   ├── login.tsx
│   │   └── register.tsx
│   │
│   ├── appliances.tsx
│   ├── components.tsx
│   ├── notifications.tsx
│   ├── activity-logs.tsx
│   ├── about-us.tsx
│   ├── settings.tsx
│   ├── index.tsx
│   └── splash.tsx
│
├── assets/
│   └── images/
│       └── adlawatt-logo.png
│
├── components/
│   ├── forms/
│   │   ├── AppCheckbox.tsx
│   │   ├── AppInput.tsx
│   │   ├── Copyright.tsx
│   │   ├── PasswordInput.tsx
│   │   └── TermsModal.tsx
│   │
│   ├── layout/
│   │   ├── AuthHeader.tsx
│   │   ├── Navbar.tsx
│   │   ├── ScreenContainer.tsx
│   │   ├── ScreenContainer2.tsx
│   │   └── Sidebar.tsx
│   │
│   └── ui/
│       ├── AppButton.tsx
│       ├── AppInput.tsx
│       ├── AppLogo.tsx
│       └── AppText.tsx
│
├── constants/
│   ├── colors.ts
│   ├── routes.ts
│   └── theme.ts
│
├── package.json
├── tsconfig.json
└── README.md
```

> The structure may change as additional screens, services, database integration, and reusable components are implemented.

---

## Application Screens

### Splash Screen

Displays the AdlaWatt logo when the application starts before navigating to authentication.

### Login

Allows users to sign in using:

* Username/email
* Password
* Remember Me

### Register

Allows users to create an account and review the application's Terms and Conditions.

### Dashboard

The dashboard provides the primary system overview.

Current dashboard sections include:

* Dashboard title
* Appliance Recommendation
* Real-Time Monitoring
* Battery status
* Solar input
* Current load
* Device status
* Battery temperature
* Recent activity logs
* View All Activity Logs

### Appliances

The Appliances screen is intended to manage and display compatible household appliances and their power requirements.

### Components

The Components screen is intended to display information about AdlaWatt's physical and IoT components.

### Notifications

The Notifications screen displays system-generated alerts and notifications.

### Activity Logs

The Activity Logs screen provides a complete view of recorded system activities.

### About Us

Provides information about the AdlaWatt project and its developers.

### Settings

Provides application configuration and user preferences.

---

## Data and Backend

### Current Development State

The application currently uses static data for interface development.

The mobile application is being developed independently of the final database and IoT connection so that the user interface and navigation can be completed before backend integration.

Current examples of static dashboard values include:

```text
Battery: 50%
Solar Input: 46W
Load Now: 170W
Device: Online
Battery Temperature: 20.0°C
```

These values are placeholders for development and do not represent live hardware measurements.

### Planned Backend

The planned backend will use Supabase for:

* User data
* System monitoring data
* Appliance records
* Activity logs
* Notifications
* Historical energy data
* Real-time data streaming

The ESP32 is expected to transmit sensor data through Wi-Fi to Supabase using HTTP requests.

---

## Data Flow

The intended data flow is:

```text
Physical Sensors
       │
       ▼
     ESP32
       │
       ▼
     Wi-Fi
       │
       ▼
   Supabase
       │
       ├──────────────► Admin Dashboard
       │
       ▼
AdlaWatt Mobile App
       │
       ├── Dashboard
       ├── Notifications
       ├── Activity Logs
       ├── Appliances
       └── Components
```

---

## Installation

### Prerequisites

Install the following before running the project:

* Node.js
* npm
* Git
* Expo CLI / Expo development environment
* Android Studio for Android development and emulation
* Visual Studio Code or another code editor

### Clone the Repository

```bash
git clone <repository-url>
cd AdlaWatt
```

### Install Dependencies

```bash
npm install
```

### Start the Development Server

```bash
npx expo start
```

### Android Development

To open the application on an Android emulator:

```bash
npx expo start --android
```

Alternatively, scan the Expo QR code using a compatible Expo development environment.

---

## Development

### Start Development Server

```bash
npx expo start
```

### Clear Expo Cache

If the application behaves unexpectedly:

```bash
npx expo start -c
```

### TypeScript Checking

Run the project's TypeScript compiler:

```bash
npx tsc --noEmit
```

### Git

Check the current repository status:

```bash
git status
```

Create a commit:

```bash
git add .
git commit -m "Update AdlaWatt application"
```

Push changes:

```bash
git push
```

---

## Build and Deployment

The Android application is intended to be built using Expo Application Services (EAS).

### Install EAS CLI

```bash
npm install -g eas-cli
```

### Login to Expo

```bash
eas login
```

### Configure EAS

```bash
eas build:configure
```

### Android Build

For an Android APK development/testing build:

```bash
eas build --platform android --profile preview
```

For an Android production build:

```bash
eas build --platform android --profile production
```

The final build configuration may change as the project approaches deployment.

---

## Current Development Status

### Completed

* [x] Expo React Native project setup
* [x] TypeScript configuration
* [x] Splash screen
* [x] Login screen
* [x] Registration screen
* [x] Terms and Conditions modal
* [x] Copyright component
* [x] Reusable UI components
* [x] Authentication layout
* [x] Fixed navigation bar
* [x] Notification navigation
* [x] Custom sidebar
* [x] Sidebar overlay
* [x] Sidebar navigation
* [x] Dashboard layout
* [x] Dashboard static monitoring data
* [x] Appliance recommendation section
* [x] Activity log preview
* [x] Activity Log routing
* [x] Notifications screen
* [x] Application color system
* [x] Gradient navigation bar
* [x] Light cream application background
* [x] Green and orange brand colors
* [x] EAS Android build configuration

### In Progress

* [ ] Appliance screen functionality
* [ ] Component monitoring screen
* [ ] Notifications functionality
* [ ] Activity log functionality
* [ ] Settings functionality
* [ ] About Us screen
* [ ] Dynamic authentication
* [ ] Database integration
* [ ] Supabase integration
* [ ] ESP32 integration
* [ ] Real-time sensor data
* [ ] Real-time notifications
* [ ] Appliance recommendation logic
* [ ] Historical energy data
* [ ] Admin dashboard

---

## Limitations

The current prototype has several limitations.

### Prototype Limitation

The project is currently a prototype and is not intended for commercial production or large-scale deployment.

### Backup Power Only

AdlaWatt is designed as an alternative power source during electricity interruptions. It is not intended to replace the electrical grid.

### Solar Dependence

Energy harvesting depends on available sunlight.

### Compatible Appliances

The system is intended for compatible household appliances within the supported power capacity.

### Internet Connectivity

Real-time mobile monitoring requires network connectivity between the IoT system, cloud services, and mobile application.

### Development Data

The current mobile application uses static/mock data while the hardware and backend systems are being integrated.

### Backend Integration

The Supabase database and IoT communication layer are planned components and are not yet fully integrated into the current application.

---

## System Specifications

The capstone documentation identifies the following major system characteristics:

| Specification          | Description                                       |
| ---------------------- | ------------------------------------------------- |
| System Type            | IoT-based off-grid solar energy harvesting system |
| Intended Use           | Backup power during electricity interruptions     |
| Battery                | 12V battery                                       |
| Inverter               | 1000W                                             |
| Solar Monitoring       | INA219                                            |
| Load Monitoring        | INA226                                            |
| Temperature Monitoring | DS18B20                                           |
| Main Controller        | ESP32                                             |
| Local Display          | LCD2004                                           |
| Cloud Platform         | Supabase                                          |
| Mobile Platform        | Android / Cross-platform mobile application       |
| Mobile Monitoring      | Real-time system information                      |
| Evaluation             | System Usability Scale (SUS)                      |

---

## Sustainable Development Goals

AdlaWatt supports the following United Nations Sustainable Development Goals:

### SDG 7 — Affordable and Clean Energy

AdlaWatt promotes the use of solar energy as a renewable source of backup electricity.

### SDG 11 — Sustainable Cities and Communities

The system provides households with an alternative source of electricity during power interruptions.

### SDG 13 — Climate Action

The project encourages the use of solar energy and renewable electricity sources.

The capstone specifically identifies SDG 7, SDG 11, and SDG 13 as the primary SDG alignments of the study.

---

## Research Evaluation

The AdlaWatt study uses the **System Usability Scale (SUS)** to evaluate the usability of the mobile application.

The evaluation focuses on users' assessment of:

* Real-time monitoring
* Appliance recommendation
* Overall user experience
* Mobile application usability

The SUS consists of 10 evaluation items and is interpreted using a Likert scale.

The SUS calculation follows:

```text
SUS Score = (Sum of Score Contributions) × 2.5
```

The capstone identifies SUS as the evaluation tool for assessing the usability of the developed mobile application. 

---

## Development Approach

The project follows an iterative development process for the hardware and software components.

The development process includes:

1. Requirements Analysis
2. Planning
3. System Design
4. Hardware Development
5. Software Development
6. Unit Testing
7. Integration Testing
8. System Testing
9. Acceptance Testing

The research documentation identifies experimental research as the study design and uses the V-Model development approach for system development and testing. 

---

## Future Improvements

Future development may include:

* Full Supabase database integration
* ESP32 integration
* Real-time sensor data
* Real-time battery monitoring
* Real-time solar monitoring
* Real-time load monitoring
* Battery temperature alerts
* Solar panel temperature alerts
* Automatic notification generation
* Dynamic appliance recommendations
* Appliance power consumption calculations
* Historical energy charts
* User account management
* Admin dashboard
* Remote monitoring
* Improved authentication
* Offline data handling
* Improved accessibility
* Application performance optimization
* Production deployment

---

## Research Purpose

AdlaWatt was developed to address the need for a practical and affordable backup power solution during electricity interruptions.

The research identifies a gap in existing systems that commonly provide energy monitoring but do not combine portable off-grid solar harvesting, real-time battery monitoring, temperature monitoring, appliance recommendations, and mobile application monitoring in one system. 

The project therefore combines these features into a single system intended to help households monitor and manage available backup energy more safely and efficiently.

---

## Contributors

**AdlaWatt Research and Development Team**

Northern Bukidnon State College
Bukidnon, Philippines

This project was developed as part of an academic capstone research project.

---

## License

This project is an academic capstone project.

The project currently has **no separate open-source license specified**. Unless a license is added by the project authors, the source code and associated materials should not be assumed to be available for unrestricted commercial use, redistribution, or modification.

Copyright © 2026 AdlaWatt Research and Development Team.

```

### A few important choices I made

- I used **React Native + Expo + TypeScript** as the current mobile stack rather than copying the older `React.js + Capacitor.js` stack from the defense reviewer, because your **actual application we are developing now uses Expo, React Native, TypeScript, and Expo Router**. The implementation plan also confirms the React Native/Expo direction. :contentReference[oaicite:5]{index=5}
- I included **Supabase as planned/backend technology**, not as something already fully working, because the current app is still using static data.
- I included the actual hardware architecture from the capstone, including **ESP32, INA219, INA226, DS18B20, voltage sensor, relay, LCD2004, battery, inverter, and solar panel**. :contentReference[oaicite:6]{index=6}
- I did **not invent a specific open-source license**. Since you haven't established MIT, Apache, GPL, etc., the README explicitly says the project currently has no separate license.

This should be much more appropriate as the project's **actual GitHub `README.md`** rather than a generic description, while still documenting the research basis of AdlaWatt.
```
