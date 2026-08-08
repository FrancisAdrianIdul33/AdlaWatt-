# AdlaWatt Mobile Application

A mobile application for **AdlaWatt**, an IoT-based portable off-grid solar energy harvesting system developed as a capstone project at Northern Bukidnon State College (NBSC).

AdlaWatt is designed to provide households with an alternative source of electricity during temporary power interruptions. The system harvests solar energy, stores it in a battery housed inside a transportable lockable enclosure, and supplies power to compatible household appliances through a built-in AC outlet.

The mobile application provides real-time monitoring of solar energy, battery status, energy consumption, system status, temperature information, historical data, notifications, and appliance recommendations.

---

## Table of Contents

- [Features](#features)
- [System Overview](#system-overview)
- [Tech Stack](#tech-stack)
- [Hardware](#hardware)
- [Mobile Application Structure](#mobile-application-structure)
- [System Architecture](#system-architecture)
- [Installation](#installation)
- [Development](#development)
- [Configuration](#configuration)
- [Scope and Limitations](#scope-and-limitations)
- [Research Alignment](#research-alignment)
- [Development Status](#development-status)

---

## Features

### Dashboard

- **Real-Time Monitoring** — Displays current information from the AdlaWatt system.
- **Battery Monitoring** — Displays battery level and battery status.
- **Solar Input Monitoring** — Displays solar energy input information.
- **Load Monitoring** — Displays current energy consumption from connected appliances.
- **Temperature Monitoring** — Displays battery and system temperature information.
- **System Status** — Displays the current status of the AdlaWatt system.
- **Historical Data** — Provides access to previous energy and monitoring records.
- **Appliance Recommendation** — Recommends suitable appliances based on the current battery

### Appliance Management

- View compatible household appliances.
- View appliance power consumption information.
- Input appliances that the user plans to use.
- Receive appliance recommendations based on available battery power.

### Notifications

- Display system notifications.
- Display important system alerts.
- Provide critical energy-related notifications.
- Quick access through the notification icon in the navigation bar.

### Activity Logs

- Display recorded system activities.
- View previous system events and activities.
- Provide users with a history of relevant system information.

### Navigation

- Fixed navigation bar.
- Notification shortcut.
- Sidebar navigation.
- Dashboard navigation.
- Appliances navigation.
- Components navigation.
- Activity Logs navigation.
- About Us navigation.
- Settings navigation.
- Log Out and Exit actions.

### Authentication

- User login.
- User registration.
- Username or email login.
- Password input with show/hide functionality.
- Remember Me option.
- Terms and Conditions modal.
- Authentication-specific screen layout.

## System Overview

AdlaWatt combines solar energy harvesting, energy storage, IoT monitoring, cloud data processing, and mobile application monitoring.

The system is designed around four major stages:

```text
Solar Energy Harvesting
        ↓
IoT Hardware Processing
        ↓
Supabase Cloud Storage
and Real-Time Streaming
        ↓
Mobile Application Display