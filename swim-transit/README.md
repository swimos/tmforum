# Swim transit

A real-time streaming map application that processes telemetry data from public transit vehicles

## Getting Started

### Prerequisites

#### [Install JDK 11+](https://www.oracle.com/technetwork/java/javase/downloads/index.html)

- Ensure that your `JAVA_HOME` environment variable points to the Java installation.
- Ensure that your `PATH` includes `$JAVA_HOME`.

### Running on Windows

```bat
$ gradlew.bat run
```

### Running on Linux or MacOS

```bash
$ ./gradlew run
```

## Repository Structure

### Key files

- [gradlew](gradlew)/[gradlew.bat](gradlew.bat) — backend build script
- [build.gradle](build.gradle) — backend project configuration script
- [gradle.properties](gradle.properties) — backend project configuration variables

### Key directories

- [src](src) — backend and frontend source code, and configuration resources
  - [main/java](src/main/java) — backend source code
  - [main/resources](src/main/resources) — backend configuration resources
- [pkg](pkg) — support files for generated OS packages
- [gradle](gradle) — support files for the `gradlew` build script


### Transit Server-Side Walkthrough

Four different high-level concepts are fundamental to this application: vehicles, agencies, states, and countries.

These concepts share a strictly hierarchical relationship. Each vehicle falls under exactly one (of 67 possible) agencies. Each agency likewise falls under exactly one state, and each state falls under exactly one country.


#### `NextBusHttpAPI` class

NextBus Incorporated provides a publicly-available feed of transit data. The spec can be found [here](https://retro.umoiq.com/xmlFeedDocs/NextBusXMLFeed.pdf), and it details the various XML responses that one can receive from specified REST endpoints.


#### `model` package

A set of Plain Old Java Objects (POJOs) fundamental to the Swim server's logic.

These should be self-explanatory, as most of them simply wrap a handful of fields and lack non-getter and -setter methods. The only tricky piece is that any classes that are used as lane types within our Web Agents must be serializable/deserializable to/from Recon. Recall that a `swim.structure.Form` object has methods to store these rules; we generate `Forms` for all

Further reading: [Forms](/TODO).

