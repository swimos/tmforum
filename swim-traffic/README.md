# Swim traffic

A real-time streaming traffic application that processes sensor data from connected traffic intersections.

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
