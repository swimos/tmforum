(function () {
  const COUNTRY_URI = swim.Uri.parse("/country/US");

  const CITIES_URI = swim.Uri.parse("cities");

  const INTERSECTIONS_URI = swim.Uri.parse("intersections");

  const CITY_STATE_URI = swim.Uri.parse("state");

  const INFO_URI = swim.Uri.parse("intersection/info");

  const SCHEMATIC_URI = swim.Uri.parse("intersection/schematic");

  const INTERSECTION_HISTORY_URI = swim.Uri.parse("intersection/history");

  const INFLOW_URI = swim.Uri.parse("intersection/inflow");

  const WAIT_TIMES_URI = swim.Uri.parse("intersection/wait");

  const PHASE_STATE_URI = swim.Uri.parse("phase/state");

  const DETECTOR_STATE_URI = swim.Uri.parse("detector/state");

  const MIN_INTERSECTION_ZOOM = 11;

  const MIN_SCHEMATIC_ZOOM = 14;

  const MIN_STADIUM_ZOOM = 10;

  const RED_COLOR = swim.Color.parse("#f6511d");
  const YELLOW_COLOR = swim.Color.parse("#f9f070");
  const GREEN_COLOR = swim.Color.parse("#66ffdd");

  const cityIcon = swim.VectorIcon.create(24, 24, "M15,11L15,5L12,2L9,5L9,7L3,7L3,21L21,21L21,11L15,11ZM7,19L5,19L5,17L7,17L7,19ZM7,15L5,15L5,13L7,13L7,15ZM7,11L5,11L5,9L7,9L7,11ZM13,19L11,19L11,17L13,17L13,19ZM13,15L11,15L11,13L13,13L13,15ZM13,11L11,11L11,9L13,9L13,11ZM13,7L11,7L11,5L13,5L13,7ZM19,19L17,19L17,17L19,17L19,19ZM19,15L17,15L17,13L19,13L19,15Z");
  const cityIconSize = 48;

  const trafficSignalIcon = swim.VectorIcon.create(24, 24, "M20,10L17,10L17,8.86C18.72,8.41,20,6.86,20,5L17,5L17,4C17,3.45,16.55,3,16,3L8,3C7.45,3,7,3.45,7,4L7,5L4,5C4,6.86,5.28,8.41,7,8.86L7,10L4,10C4,11.86,5.28,13.41,7,13.86L7,15L4,15C4,16.86,5.28,18.41,7,18.86L7,20C7,20.55,7.45,21,8,21L16,21C16.55,21,17,20.55,17,20L17,18.86C18.72,18.41,20,16.86,20,15L17,15L17,13.86C18.72,13.41,20,11.86,20,10ZM12,19C10.89,19,10,18.1,10,17C10,15.9,10.89,15,12,15C13.1,15,14,15.9,14,17C14,18.1,13.11,19,12,19ZM12,14C10.89,14,10,13.1,10,12C10,10.9,10.89,10,12,10C13.1,10,14,10.9,14,12C14,13.1,13.11,14,12,14ZM12,9C10.89,9,10,8.1,10,7C10,5.89,10.89,5,12,5C13.1,5,14,5.89,14,7C14,8.1,13.11,9,12,9Z");
  const trafficSignalIconSize = 24;

  const stadiumIcon = swim.VectorIcon.create(24, 24, "M22.13,6.49C21.62,6.08,21.05,5.73,20.49,5.45C19.07,4.75,17.52,4.31,15.95,4.05L15.74,4.01C15.35,3.95,14.97,3.9,14.59,3.86C12.45,3.62,10.26,3.64,8.13,3.93C7.93,3.96,7.74,3.99,7.54,4.02L7.33,4.06C5.55,4.36,3.78,4.86,2.23,5.77C1.87,5.98,1.5,6.23,1.15,6.52L0.94,6.7C0.18,7.39,-0.4,8.27,-0.35,9.29C-0.29,10.49,0.4,11.41,1.29,12.12L1.29,13.82C0.96,13.54,0.7,13.24,0.53,12.97C0.44,12.81,0.37,12.67,0.32,12.54C0.27,12.41,0.23,12.29,0.21,12.2C0.19,12.1,0.18,12.03,0.17,11.98C0.16,11.93,0.16,11.9,0.16,11.9C0.16,11.9,0.16,11.93,0.15,11.98C0.15,12.03,0.15,12.11,0.15,12.21C0.16,12.41,0.19,12.71,0.35,13.06C0.42,13.24,0.52,13.43,0.65,13.62C0.77,13.82,0.93,14.01,1.11,14.21C1.17,14.27,1.23,14.33,1.29,14.39L1.29,15.93C0.96,15.65,0.7,15.36,0.53,15.08C0.44,14.93,0.37,14.78,0.32,14.65C0.27,14.52,0.23,14.41,0.21,14.31C0.19,14.22,0.18,14.14,0.17,14.09C0.16,14.04,0.16,14.01,0.16,14.01C0.16,14.01,0.16,14.04,0.15,14.09C0.15,14.14,0.15,14.22,0.15,14.32C0.16,14.52,0.19,14.82,0.35,15.18C0.42,15.35,0.52,15.54,0.65,15.74C0.77,15.93,0.93,16.13,1.11,16.32C1.17,16.38,1.23,16.44,1.29,16.5L1.34,16.54C1.66,16.86,2.06,17.16,2.51,17.44C2.79,17.61,3.09,17.77,3.4,17.93C3.72,18.08,4.05,18.23,4.39,18.36C5.09,18.63,5.84,18.87,6.62,19.05C7.02,19.14,7.42,19.22,7.83,19.29C7.85,19.3,7.87,19.3,7.89,19.3L8.01,19.69L8.25,19.62L8.5,19.54L7.63,16.62C10.32,15.93,12.95,15.93,15.65,16.62L14.77,19.54L15.02,19.62L15.27,19.69L15.38,19.3C15.4,19.3,15.42,19.3,15.44,19.29C15.85,19.22,16.26,19.14,16.65,19.05C17.44,18.87,18.19,18.63,18.88,18.36C19.23,18.23,19.56,18.08,19.87,17.93C20.19,17.77,20.49,17.61,20.76,17.44C21.21,17.16,21.61,16.86,21.94,16.54L21.98,16.5C22.05,16.44,22.1,16.38,22.16,16.32C22.53,15.93,22.79,15.53,22.93,15.18C23.08,14.82,23.12,14.52,23.12,14.32C23.13,14.22,23.13,14.14,23.12,14.09C23.12,14.04,23.11,14.01,23.11,14.01C23.11,14.01,23.11,14.04,23.1,14.09C23.1,14.14,23.08,14.22,23.06,14.31C23.04,14.41,23.01,14.52,22.96,14.65C22.9,14.78,22.83,14.93,22.74,15.08C22.64,15.23,22.53,15.39,22.38,15.55C22.27,15.68,22.13,15.81,21.98,15.93L21.98,14.39C22.05,14.33,22.1,14.27,22.16,14.21C22.53,13.82,22.79,13.42,22.93,13.06C23.08,12.71,23.12,12.41,23.12,12.21C23.13,12.11,23.13,12.03,23.12,11.98C23.12,11.93,23.11,11.9,23.11,11.9C23.11,11.9,23.11,11.93,23.1,11.98C23.1,12.03,23.08,12.1,23.06,12.2C23.04,12.29,23.01,12.41,22.96,12.54C22.9,12.67,22.83,12.81,22.74,12.97C22.64,13.12,22.53,13.28,22.38,13.43C22.27,13.56,22.13,13.69,21.98,13.82L21.98,12.14C22.88,11.43,23.58,10.5,23.65,9.29C23.64,8.23,23.09,7.36,22.34,6.68L22.13,6.49ZM16.05,5.1C17.06,5.3,18.06,5.57,19.01,5.94C19.87,6.27,20.92,6.76,21.66,7.46L17.59,9.99C16.79,9.37,15.49,8.89,13.94,8.64L16.05,5.1ZM12.99,4.74C13.8,4.79,14.61,4.87,15.41,4.99L13.29,8.55C12.76,8.5,12.21,8.47,11.64,8.47C11.07,8.47,10.51,8.5,9.98,8.55L7.86,4.99C9.56,4.73,11.28,4.65,12.99,4.74ZM2.36,6.89C3.8,5.93,5.53,5.42,7.23,5.1L9.33,8.64C7.78,8.89,6.49,9.37,5.68,9.99L1.61,7.46C1.85,7.25,2.1,7.06,2.36,6.89ZM4.16,17.44C3.67,17.28,3.22,17.09,2.81,16.89C2.53,16.76,2.28,16.62,2.04,16.47C1.99,16.44,1.94,16.41,1.89,16.38L1.89,14.9C2.09,15.05,2.29,15.19,2.51,15.32C2.79,15.49,3.09,15.66,3.4,15.81C3.64,15.93,3.9,16.05,4.16,16.15L4.16,17.44L4.16,17.44ZM4.16,15.33C3.67,15.16,3.22,14.98,2.81,14.78C2.53,14.65,2.28,14.51,2.04,14.36C1.99,14.33,1.94,14.3,1.89,14.27L1.89,12.55C2.1,12.69,2.32,12.81,2.54,12.93C3.06,13.21,3.6,13.45,4.16,13.66L4.16,15.33L4.16,15.33ZM3.63,12.31C2.78,11.93,1.93,11.45,1.31,10.74C1.02,10.4,0.58,9.76,0.67,9.26C0.72,9.02,0.78,8.61,0.94,8.3C1.01,8.16,1.1,8.03,1.2,7.91L5.23,10.42C4.94,10.75,4.79,11.11,4.79,11.49C4.79,12.08,5.17,12.63,5.84,13.09C5.08,12.89,4.34,12.64,3.63,12.31ZM6.82,18.12C6.1,17.99,5.41,17.83,4.76,17.64L4.76,16.39C5.35,16.6,5.97,16.78,6.62,16.94C6.82,16.98,7.02,17.03,7.22,17.07L7.57,18.25C7.32,18.21,7.07,18.17,6.82,18.12ZM18.51,17.64C17.87,17.83,17.18,17.99,16.46,18.12C16.21,18.17,15.96,18.21,15.7,18.25L16.05,17.07C16.26,17.03,16.45,16.98,16.65,16.94C17.3,16.78,17.93,16.6,18.51,16.39L18.51,17.64L18.51,17.64ZM18.51,15.52C17.87,15.71,17.18,15.88,16.46,16.01C16.24,16.05,16.01,16.09,15.78,16.12C13,15.41,10.28,15.41,7.49,16.12C7.26,16.09,7.04,16.05,6.82,16.01C6.1,15.88,5.41,15.71,4.76,15.52L4.76,13.86C5.99,14.26,7.27,14.5,8.53,14.66C10.62,14.91,12.75,14.91,14.84,14.65C16.07,14.5,17.32,14.26,18.51,13.87L18.51,15.52L18.51,15.52ZM21.38,16.38C21.33,16.41,21.29,16.44,21.24,16.48C21,16.62,20.74,16.76,20.47,16.89C20.05,17.09,19.6,17.28,19.12,17.44L19.12,16.15C19.38,16.05,19.63,15.93,19.87,15.81C20.19,15.66,20.49,15.5,20.76,15.32C20.98,15.19,21.19,15.05,21.38,14.9L21.38,16.38ZM21.38,14.27C21.33,14.3,21.29,14.33,21.24,14.36C21,14.51,20.74,14.65,20.47,14.78C20.05,14.98,19.6,15.16,19.12,15.33L19.12,13.66C19.63,13.48,20.13,13.26,20.61,13.01C20.87,12.88,21.13,12.73,21.38,12.57L21.38,14.27ZM22.58,9.26C22.57,10.18,21.75,11.05,20.94,11.59C19.9,12.29,18.69,12.75,17.46,13.08C18.11,12.62,18.49,12.07,18.49,11.49C18.49,11.11,18.33,10.75,18.05,10.42L22.07,7.92C22.35,8.31,22.55,8.75,22.58,9.26Z");
  const stadiumIconSize = 48;

  class TrafficIntersectionSchematicDownlink extends swim.ValueDownlinkTrait {
    constructor(entityTrait, nodeUri, laneUri) {
      super();
      this.entityTrait = entityTrait;
      this.phases = {};
      this.detectors = {};
      this.downlink.nodeUri(nodeUri).laneUri(laneUri);
    }
    downlinkDidSet(value) {
      //console.log("TrafficIntersectionSchematicDownlink.downlinkDidSet " + this.downlink.nodeUri() + ":", value.toAny());
      value.forEach(function (item) {
        if (item.tag === "approach") {
          const approachId = item.get("id").stringValue();
          const approachPath = this.downlink.nodeUri().path.appended("approach", approachId);
          const approachModel = this.getOrCreateApproachModel(approachPath, item);
          approachModel.approachId = approachId;
        }
      }, this);
    }
    getOrCreateApproachModel(approachPath, approachValue) {
      //console.log("TrafficIntersectionSchematicDownlink.getOrCreateApproachModel " + approachPath + ":", approachValue.toAny());
      const subdistricts = this.entityTrait.parentModel;
      let approachModel = subdistricts.getChildModel(approachPath.toString());
      if (approachModel === null) {
        approachModel = subdistricts.createNodeModel(approachPath.toString());
        this.initApproachModel(approachModel, approachValue);
        subdistricts.appendChildModel(approachModel, approachPath.toString());
      }
      return approachModel;
    }
    initApproachModel(approachModel, approachValue) {
      //console.log("TrafficIntersectionSchematicDownlink.initApproachModel:", approachModel);

      const statusTrait = approachModel.getTrait(swim.StatusTrait);
      statusTrait.setStatusFactor("operational", swim.StatusFactor.create("Operational", swim.StatusVector.of([swim.Status.normal, 1])));

      const locationTrait = new swim.LocationTrait();
      locationTrait.setZoomRange(MIN_SCHEMATIC_ZOOM, Infinity);
      approachModel.setTrait("location", locationTrait);

      const geographic = swim.GeographicArea.fromInit({
        geometry: approachValue.get("coords").toAny(),
      });
      locationTrait.setGeographic(geographic);

      const phaseId = approachValue.get("phase").toAny();
      if (phaseId !== void 0) {
        const phaseApproaches = this.phases[phaseId] || [];
        phaseApproaches.push(approachModel);
        this.phases[phaseId] = phaseApproaches;
      }
      const detectorId = approachValue.get("detector").toAny();
      if (detectorId !== void 0) {
        const detectorApproaches = this.detectors[detectorId] || [];
        detectorApproaches.push(approachModel);
        this.detectors[detectorId] = detectorApproaches;
      }
    }
    updateApproachModel(approachModel) {
      //console.log("TrafficIntersectionSchematicDownlink.updateApproachModel:", approachModel);
      const phase = approachModel.phase;
      const occupied = approachModel.occupied;

      const statusTrait = approachModel.getTrait(swim.StatusTrait);
      const locationTrait = approachModel.getTrait(swim.LocationTrait);

      let geographic = locationTrait.geographic;
      if (phase === 1) { // red
        geographic = swim.GeographicArea.fromInit({
          geometry: geographic.geometry,
          fill: RED_COLOR.alpha(occupied ? 0.7 : 0.5),
          stroke: RED_COLOR.alpha(occupied ? 0.8 : 0.6),
        });
        locationTrait.setGeographic(geographic);
      } else if (phase === 2) { // yellow
        geographic = swim.GeographicArea.fromInit({
          geometry: geographic.geometry,
          fill: YELLOW_COLOR.alpha(occupied ? 0.7 : 0.5),
          stroke: YELLOW_COLOR.alpha(occupied ? 0.8 : 0.6),
        });
        locationTrait.setGeographic(geographic);
      } else if (phase === 3) { // green
        geographic = swim.GeographicArea.fromInit({
          geometry: geographic.geometry,
          fill: GREEN_COLOR.alpha(occupied ? 0.7 : 0.5),
          stroke: GREEN_COLOR.alpha(occupied ? 0.8 : 0.6),
        });
        locationTrait.setGeographic(geographic);
      }

      if (occupied) {
        statusTrait.setStatusFactor("occupied" + approachModel.approachId, swim.StatusFactor.create("Occupied", swim.StatusVector.of([swim.Status.warning, 1])));
      } else {
        statusTrait.setStatusFactor("occupied" + approachModel.approachId, null);
      }

      //if (phase === 1) { // red
      //  statusTrait.setStatusFactor("phase" + approachModel.approachId, swim.StatusFactor.create("Phase", swim.StatusVector.of([swim.Status.alert, 1])));
      //} else if (phase === 2) { // yellow
      //  statusTrait.setStatusFactor("phase" + approachModel.approachId, swim.StatusFactor.create("Phase", swim.StatusVector.of([swim.Status.warning, 1])));
      //} else if (phase === 3) { // green
      //  statusTrait.setStatusFactor("phase" + approachModel.approachId, swim.StatusFactor.create("Phase", swim.StatusVector.of([swim.Status.normal, 1])));
      //} else {
      //  statusTrait.setStatusFactor("phase" + approachModel.approachId, swim.StatusFactor.create("Phase", swim.StatusVector.of([swim.Status.inactive, 1])));
      //}
    }
  }

  class TrafficIntersectionHistoryDownlink extends swim.MapDownlinkTrait {
    constructor(plot0Model, plot1Model, nodeUri, laneUri) {
      super();
      this.plot0Model = plot0Model;
      this.plot1Model = plot1Model;
      this.downlink.nodeUri(nodeUri).laneUri(laneUri);
    }

    downlinkDidUpdate(key, value) {
      const t = key.numberValue();
      const phase0 = value.get("signalPhases").get(0).get('red').numberValue() || 0;
      const phase1 = value.get("signalPhases").get(1).get('red').numberValue() || 0;
      this.updatePlot(t, phase0, this.plot0Model);
      this.updatePlot(t, phase1, this.plot1Model);
    }

    updatePlot(t, v, plotModel) {
      const dataPointModel = new swim.CompoundModel();
      const dataPointTrait = new swim.DataPointTrait();
      dataPointTrait.x.setState(new swim.DateTime(t));
      dataPointTrait.y.setState(v);
      dataPointModel.setTrait("dataPoint", dataPointTrait);
      plotModel.appendChildModel(dataPointModel, "" + t);
    }
  }

  class TrafficIntersectionWaitTimesDownlink extends swim.MapDownlinkTrait {
    constructor(plotModel, nodeUri, laneUri) {
      super();
      this.plotModel = plotModel;
      this.downlink.nodeUri(nodeUri).laneUri(laneUri);
    }

    downlinkDidUpdate(key, value) {
      const t = key.numberValue();
      const y = value.numberValue(void 0);
      const dataPointModel = new swim.CompoundModel();
      const dataPointTrait = new swim.DataPointTrait();
      dataPointTrait.x.setState(new swim.DateTime(t));
      dataPointTrait.y.setState(-y);
      dataPointModel.setTrait("dataPoint", dataPointTrait);
      this.plotModel.appendChildModel(dataPointModel, "" + t);

      const statusTrait = this.plotModel.getTrait(swim.StatusTrait);

      const criticalWait = 90;
      const alertWait = 60;
      const warningWait = 30;
      if (y < warningWait) {
        statusTrait.setStatusFactor("wait", null);
      } else if (y < alertWait) {
        const warning = (y - warningWait) / (alertWait - warningWait);
        statusTrait.setStatusFactor("wait", swim.StatusFactor.create("Wait", swim.StatusVector.of([swim.Status.warning, warning])));
      } else {
        const alert = Math.min((y - alertWait) / (criticalWait - alertWait), 1);
        statusTrait.setStatusFactor("wait", swim.StatusFactor.create("Wait", swim.StatusVector.of([swim.Status.alert, alert])));
      }
    }
  }

  class TrafficIntersectionInflowDownlink extends swim.MapDownlinkTrait {
    constructor(plotModel, nodeUri, laneUri) {
      super();
      this.plotModel = plotModel;
      this.downlink.nodeUri(nodeUri).laneUri(laneUri);
    }

    downlinkDidUpdate(key, value) {
      const t = key.numberValue();
      const y = value.numberValue(void 0);
      const dataPointModel = new swim.CompoundModel();
      const dataPointTrait = new swim.DataPointTrait();
      dataPointTrait.x.setState(new swim.DateTime(t));
      dataPointTrait.y.setState(-y);
      dataPointModel.setTrait("dataPoint", dataPointTrait);
      this.plotModel.appendChildModel(dataPointModel, "" + t);

      const statusTrait = this.plotModel.getTrait(swim.StatusTrait);

      const criticalInflow = 60;
      const alertInflow = 30;
      const warningInflow = 15;
      if (y < warningInflow) {
        statusTrait.setStatusFactor("inflow", null);
      } else if (y < alertInflow) {
        const warning = (y - warningInflow) / (alertInflow - warningInflow);
        statusTrait.setStatusFactor("inflow", swim.StatusFactor.create("Inflow", swim.StatusVector.of([swim.Status.warning, warning])));
      } else {
        const alert = Math.min((y - alertInflow) / (criticalInflow - alertInflow), 1);
        statusTrait.setStatusFactor("inflow", swim.StatusFactor.create("Inflow", swim.StatusVector.of([swim.Status.alert, alert])));
      }
    }
  }

  class TrafficIntersectionPhaseStateDownlink extends swim.MapDownlinkTrait {
    constructor(schematic, nodeUri, laneUri) {
      super();
      this.schematic = schematic;
      this.downlink.nodeUri(nodeUri).laneUri(laneUri);
    }
    downlinkDidUpdate(key, value) {
      //console.log("TrafficIntersectionPhaseStateDownlink.downlinkDidUpdate " + this.downlink.nodeUri() + " " + key.toAny() + ":", value.toAny());
      const phaseId = key.stringValue();
      const phase = value.numberValue();
      const phaseApproaches = this.schematic.phases[phaseId];
      if (phaseApproaches !== void 0) {
        for (let i = 0; i < phaseApproaches.length; i += 1) {
          const approachModel = phaseApproaches[i];
          approachModel.phase = phase;
          this.schematic.updateApproachModel(approachModel);
        }
      }
    }
  }

  class TrafficIntersectionDetectorStateDownlink extends swim.MapDownlinkTrait {
    constructor(schematic, nodeUri, laneUri) {
      super();
      this.schematic = schematic;
      this.downlink.nodeUri(nodeUri).laneUri(laneUri);
    }
    downlinkDidUpdate(key, value) {
      //console.log("TrafficIntersectionDetectorStateDownlink.downlinkDidUpdate " + this.downlink.nodeUri() + " " + key.toAny() + ":", value.toAny());
      const detectorId = key.stringValue();
      const occupied = value.numberValue() !== 0;
      const detectorApproaches = this.schematic.detectors[detectorId];
      if (detectorApproaches !== void 0) {
        for (let i = 0; i < detectorApproaches.length; i += 1) {
          const approachModel = detectorApproaches[i];
          approachModel.occupied = occupied;
          this.schematic.updateApproachModel(approachModel);
        }
      }
    }
  }

  class TrafficIntersectionInfoDownlink extends swim.ValueDownlinkTrait {
    constructor(tableModel, nodeUri, laneUri) {
      super();
      this.tableModel = tableModel;
      this.downlink.nodeUri(nodeUri).laneUri(laneUri);
    }
    downlinkDidSet(value) {
      value.forEach((item) => {
        const key = item.key.stringValue(void 0);
        if (key !== void 0) {
          let displayKey = key;
          const rowModel = this.getOrCreateRowModel(displayKey);
          const valueCell = rowModel.getTrait("value");
          const value = item.toValue().stringValue("");
          valueCell.content.setState(value);
        }
      });
    }
    updateRowModel(key, value) {
      const rowModel = this.getOrCreateRowModel(key, value);
      const valueCell = rowModel.getTrait("value");
      valueCell.content.setState(value);
      return rowModel;
    }
    getOrCreateRowModel(key, value) {
      let rowModel = this.tableModel.getChildModel(key);
      if (rowModel === null) {
        rowModel = this.createRowModel(key);
        this.appendChildModel(rowModel, key);
      }
      return rowModel;
    }
    createRowModel(key) {
      const rowModel = new swim.CompoundModel();
      const rowTrait = new swim.RowTrait();
      const keyCell = new swim.TextCellTrait();
      keyCell.content.setState(key);
      const valueCell = new swim.TextCellTrait();
      rowModel.setTrait("row", rowTrait);
      rowModel.setTrait("key", keyCell);
      rowModel.setTrait("value", valueCell);
      rowModel.setTrait("status", new swim.StatusTrait());
      return rowModel;
    }
  }

  class TrafficIntersectionLocation extends swim.DownlinkLocationTrait {
    constructor(nodeUri, laneUri) {
      super();
      this.downlink.nodeUri(nodeUri).laneUri(laneUri);
    }
    downlinkDidSet(value) {
      //console.log("TrafficIntersectionLocation.downlinkDidSet " + this.downlink.nodeUri() + ":", value.toAny());
      const districtTrait = this.getTrait(swim.DistrictTrait);

      const locationTrait = this.getTrait(swim.LocationTrait);
      const lng = value.get("lng").numberValue(NaN);
      const lat = value.get("lat").numberValue(NaN);
      if (isFinite(lng) && isFinite(lat)) {
        const geographic = swim.GeographicPoint.fromInit({
          geometry: new swim.GeoPoint(lng, lat),
          width: trafficSignalIconSize,
          height: trafficSignalIconSize,
          graphics: trafficSignalIcon,
        });
        locationTrait.setGeographic(geographic);
      } else {
        locationTrait.setGeographic(null);
      }
    }
  }

  class TrafficIntersectionsGroup extends swim.DownlinkNodeGroup {
    constructor(nodeUri, laneUri,  metaHostUri) {
      super(metaHostUri);
      this.downlink.nodeUri(nodeUri).laneUri(laneUri);
    }

    initNodeModel(nodeModel) {
      const entityTrait = nodeModel.getTrait(swim.EntityTrait);
      //console.log("TrafficIntersectionsGroup.initNodeModel " + entityTrait.uri);
      entityTrait.setIcon(cityIcon);

      const statusTrait = nodeModel.getTrait(swim.StatusTrait);
      statusTrait.setStatusFactor("operational", swim.StatusFactor.create("Operational", swim.StatusVector.of([swim.Status.normal, 1])));

      const locationTrait = new TrafficIntersectionLocation(entityTrait.uri, INFO_URI);
      locationTrait.setZoomRange(MIN_INTERSECTION_ZOOM, Infinity);
      nodeModel.setTrait("location", locationTrait);

      const districtTrait = new swim.DistrictTrait();
      districtTrait.setZoomRange(MIN_SCHEMATIC_ZOOM, Infinity);
      entityTrait.setTrait("district", districtTrait);

      const subdistricts = new swim.NodeGroup();
      subdistricts.setTrait("status", new swim.StatusTrait());
      entityTrait.setChildModel("subdistricts", subdistricts);

      const schematicDownlinkTrait = new TrafficIntersectionSchematicDownlink(entityTrait, entityTrait.uri, SCHEMATIC_URI);
      schematicDownlinkTrait.driver.setTrait(districtTrait);
      nodeModel.setTrait("schematicDownlink", schematicDownlinkTrait);

      const phaseStateDownlink = new TrafficIntersectionPhaseStateDownlink(schematicDownlinkTrait, entityTrait.uri, PHASE_STATE_URI);
      phaseStateDownlink.driver.setTrait(districtTrait);
      nodeModel.setTrait("phaseStateDownlink", phaseStateDownlink);

      const detectorStateDownlink = new TrafficIntersectionDetectorStateDownlink(schematicDownlinkTrait, entityTrait.uri, DETECTOR_STATE_URI);
      detectorStateDownlink.driver.setTrait(districtTrait);
      nodeModel.setTrait("detectorStateDownlink", detectorStateDownlink);

      const widgetGroup = new swim.WidgetGroup();
      entityTrait.setTrait("widgets", widgetGroup);

      const phaseWidget = this.createPhaseWidget(entityTrait);
      entityTrait.appendChildModel(phaseWidget, "phase");

      const chart0Model = phaseWidget.getChildModel("phase0");
      const plot0Model = chart0Model.getChildModel("phase0");
      const plot1Model = phaseWidget.getChildModel("phase1").getChildModel("phase1");

      const intersectionHistoryDownlink = new TrafficIntersectionHistoryDownlink(plot0Model, plot1Model, entityTrait.uri, INTERSECTION_HISTORY_URI);
      intersectionHistoryDownlink.driver.setTrait(chart0Model.getTrait("chart"));
      chart0Model.setTrait("downlink", intersectionHistoryDownlink);

      const waitTimeWidget = this.createWaitTimeWidget(entityTrait);
      entityTrait.appendChildModel(waitTimeWidget, "waitTime");

      const inflowWidget = this.createInflowWidget(entityTrait);
      entityTrait.appendChildModel(inflowWidget, "inflow");

      const infoWidget = this.createInfoWidget(entityTrait);
      entityTrait.appendChildModel(infoWidget, "info");
    }

    createPhaseWidget(entityTrait) {
      const widgetModel = new swim.CompoundModel();
      const widgetTrait = new swim.WidgetTrait();
      widgetTrait.setTitle("Phase");
      widgetTrait.setSubtitle(entityTrait.title.toUpperCase());
      widgetModel.setTrait("widget", widgetTrait);

      const phase0Model = this.createPhaseModel(entityTrait, "phase0", false);
      const phase1Model = this.createPhaseModel(entityTrait, "phase1", true);
      widgetModel.appendChildModel(phase0Model, "phase0");
      widgetModel.appendChildModel(phase1Model, "phase1");
      return widgetModel;
    }

    createPhaseModel(entityTrait, key, hasAxis) {
      const plotModel = new swim.CompoundModel();
      const plotTrait = new swim.LinePlotTrait();
      plotModel.setTrait("plot", plotTrait);
      const dataSetTrait = new swim.DataSetTrait();
      plotModel.setTrait("dataSet", dataSetTrait);

      const chartModel = new swim.CompoundModel();
      const chartTrait = new swim.ChartTrait();
      chartModel.setTrait("chart", chartTrait);
      if (hasAxis) {
        const bottomAxisTrait = new swim.BottomAxisTrait();
        chartModel.setTrait("bottomAxis", bottomAxisTrait);
      }
      const graphTrait = new swim.GraphTrait();
      chartModel.setTrait("graph", graphTrait);
      chartModel.appendChildModel(plotModel, key);

      return chartModel;
    }

    createWaitTimeWidget(entityTrait) {
      const widgetModel = new swim.CompoundModel();
      const widgetTrait = new swim.WidgetTrait();
      widgetTrait.setTitle("Average Wait Time of Vehicles");
      widgetTrait.setSubtitle(entityTrait.title.toUpperCase());
      widgetModel.setTrait("widget", widgetTrait);

      const waitTimeModel = this.createWaitTimeGadget(entityTrait);
      widgetModel.appendChildModel(waitTimeModel, "waitTimeModel");

      return widgetModel;
    }
    createWaitTimeGadget(entityTrait) {
      const plotModel = new swim.CompoundModel();
      const plotTrait = new swim.LinePlotTrait();
      plotModel.setTrait("plot", plotTrait);
      const plotStatus = new swim.StatusTrait();
      plotModel.setTrait("status", plotStatus);
      const dataSetTrait = new swim.DataSetTrait();
      plotModel.setTrait("dataSet", dataSetTrait);

      const chartModel = new swim.CompoundModel();
      const chartTrait = new swim.ChartTrait();
      chartModel.setTrait("chart", chartTrait);
      const bottomAxisTrait = new swim.BottomAxisTrait();
      chartModel.setTrait("bottomAxis", bottomAxisTrait);
      const graphTrait = new swim.GraphTrait();
      chartModel.setTrait("graph", graphTrait);
      chartModel.appendChildModel(plotModel, "waitTime");

      const downlinkTrait = new TrafficIntersectionWaitTimesDownlink(plotModel, entityTrait.uri, WAIT_TIMES_URI);
      downlinkTrait.driver.setTrait(chartTrait);
      chartModel.setTrait("downlink", downlinkTrait);

      return chartModel;
    }

    createInflowWidget(entityTrait) {
      const widgetModel = new swim.CompoundModel();
      const widgetTrait = new swim.WidgetTrait();
      widgetTrait.setTitle("Vehicle Inflow Rate");
      widgetTrait.setSubtitle(entityTrait.title.toUpperCase());
      widgetModel.setTrait("widget", widgetTrait);

      const inflowModel = this.createInflowGadget(entityTrait);
      widgetModel.appendChildModel(inflowModel, "inflowModel");

      return widgetModel;
    }
    createInflowGadget(entityTrait) {
      const plotModel = new swim.CompoundModel();
      const plotTrait = new swim.LinePlotTrait();
      plotModel.setTrait("plot", plotTrait);
      const plotStatus = new swim.StatusTrait();
      plotModel.setTrait("status", plotStatus);
      const dataSetTrait = new swim.DataSetTrait();
      plotModel.setTrait("dataSet", dataSetTrait);

      const chartModel = new swim.CompoundModel();
      const chartTrait = new swim.ChartTrait();
      chartModel.setTrait("chart", chartTrait);
      const bottomAxisTrait = new swim.BottomAxisTrait();
      chartModel.setTrait("bottomAxis", bottomAxisTrait);
      const graphTrait = new swim.GraphTrait();
      chartModel.setTrait("graph", graphTrait);
      chartModel.appendChildModel(plotModel, "inflow");

      const downlinkTrait = new TrafficIntersectionInflowDownlink(plotModel, entityTrait.uri, INFLOW_URI);
      downlinkTrait.driver.setTrait(chartTrait);
      chartModel.setTrait("downlink", downlinkTrait);

      return chartModel;
    }

    createInfoWidget(entityTrait) {
      const widgetModel = new swim.CompoundModel();
      const widgetTrait = new swim.WidgetTrait();
      widgetTrait.setSubtitle(entityTrait.title.toUpperCase());
      widgetModel.setTrait("widget", widgetTrait);
      widgetTrait.setTitle("Info");

      const tableModel = this.createInfoTable(entityTrait);
      widgetModel.appendChildModel(tableModel, "table");

      return widgetModel;
    }
    createInfoTable(entityTrait) {
      const tableModel = new swim.CompoundModel();
      const tableTrait = new swim.TableTrait();
      tableTrait.colSpacing.setState(swim.Length.px(12));
      tableModel.setTrait("table", tableTrait);

      const keyColTrait = new swim.ColTrait();
      keyColTrait.layout.setState({key: "key", grow: 1, textColor: swim.Look.mutedColor});
      tableModel.setTrait("key", keyColTrait);

      const valueColTrait = new swim.ColTrait();
      valueColTrait.layout.setState({key: "value", grow: 2});
      tableModel.setTrait("value", valueColTrait);

      const downlinkTrait = new TrafficIntersectionInfoDownlink(tableModel, entityTrait.uri, INFO_URI);
      downlinkTrait.driver.setTrait(tableTrait);
      tableModel.setTrait("downlink", downlinkTrait);

      return tableModel;
    }

    updateNodeModel(nodeModel, value) {
      const entityTrait = nodeModel.getTrait(swim.EntityTrait);
      //console.log("TrafficIntersectionsGroup.updateNodeModel " + entityTrait.uri + ":", value.toAny());
    }

    onStopConsuming() {
      super.onStopConsuming();
      this.removeAll();
    }
  }

  class TrafficCitiesKpisDownlink extends swim.ValueDownlinkTrait {
    constructor(redLightsPieModel, greenLightsPieModel, pedPieModel, nodeUri, laneUri) {
      super();
      this.redLightsPieModel = redLightsPieModel;
      this.greenLightsPieModel = greenLightsPieModel;
      this.pedPieModel = pedPieModel;
      this.downlink.nodeUri(nodeUri).laneUri(laneUri);
    }

    downlinkDidSet(value) {
      const redWaiting = value.get("redWaiting").numberValue();
      const redClear = value.get("redClear").numberValue();
      const greenFlowing = value.get("greenFlowing").numberValue();
      const greenClear = value.get("greenClear").numberValue();
      const pedWaiting = value.get("pedWaiting").numberValue();
      const pedClear = value.get("pedClear").numberValue();

      this.updatePieSlice(this.redLightsPieModel, "redWaiting", redWaiting, "Waiting");
      this.updatePieSlice(this.redLightsPieModel, "redClear", redClear, "Clear");
      this.updatePieSlice(this.greenLightsPieModel, "greenFlowing", greenFlowing, "Flowing");
      this.updatePieSlice(this.greenLightsPieModel, "greenClear", greenClear, "Clear");
      this.updatePieSlice(this.pedPieModel, "pedWaiting", pedWaiting, "Waiting");
      this.updatePieSlice(this.pedPieModel, "pedClear", pedClear, "Clear");
    }

    updatePieSlice(pieModel, sliceKey, sliceValue, legend) {
      let sliceModel = pieModel.getChildModel(sliceKey);
      if (sliceModel === null) {
        sliceModel = new swim.CompoundModel();
        sliceModel.setTrait("slice", new swim.SliceTrait());
        sliceModel.setTrait("status", new swim.StatusTrait());
        pieModel.setChildModel(sliceKey, sliceModel);
      }
      let status = swim.Status.warning;
      let statusFactor = 0;
      const sliceTrait = sliceModel.getTrait("slice");
      const sliceStatusTrait = sliceModel.getTrait("status");
      /*sliceTrait.formatLabel = function (value) {
        return value + "";
      };*/
      sliceTrait.value.setState(sliceValue);
      sliceTrait.legend.setState(legend + " " + sliceValue);
    }
  }

  class TrafficCitiesGroup extends swim.DownlinkNodeGroup {
    constructor(nodeUri, laneUri, metaHostUri) {
      super(metaHostUri);
      this.downlink.nodeUri(nodeUri).laneUri(laneUri);
    }
    initNodeModel(nodeModel) {
      const entityTrait = nodeModel.getTrait(swim.EntityTrait);
      //console.log("TrafficCitiesGroup.initNodeModel " + entityTrait.uri);

      entityTrait.aggregateStatus = function (statusVector) {}; // don't aggregate subentity status

      let lng;
      let lat;
      switch (entityTrait.uri.toString()) {
        case "/city/PaloAlto_CA_US": lng = -122.138056; lat = 37.429167; break;
        case "/city/SanLeandro_CA_US": lng = -122.156111; lat = 37.725; break;
        default: lng = NaN; lat = NaN;
      }

      const statusTrait = nodeModel.getTrait(swim.StatusTrait);
      statusTrait.setStatusFactor("operational", swim.StatusFactor.create("Operational", swim.StatusVector.of([swim.Status.normal, 1])));

      const locationTrait = new swim.LocationTrait();
      locationTrait.setZoomRange(-Infinity, MIN_INTERSECTION_ZOOM);
      if (isFinite(lng) && isFinite(lat)) {
        const geographic = swim.GeographicPoint.fromInit({
          geometry: new swim.GeoPoint(lng, lat),
          width: cityIconSize,
          height: cityIconSize,
          graphics: cityIcon,
        });
        locationTrait.setGeographic(geographic);
      }
      nodeModel.setTrait("location", locationTrait);

      const districtTrait = new swim.DistrictTrait();
      districtTrait.setZoomRange(MIN_INTERSECTION_ZOOM, Infinity);
      if (isFinite(lng) && isFinite(lat)) {
        districtTrait.setBoundary(new swim.GeoBox(lng - 1, lat - 1, lng + 1, lat + 1));
      } else {
        districtTrait.setBoundary(swim.GeoBox.undefined());
      }
      nodeModel.setTrait("district", districtTrait);

      const subdistricts = new TrafficIntersectionsGroup(entityTrait.uri, INTERSECTIONS_URI, this.metaHostUri);
      subdistricts.setTrait("status", new swim.StatusTrait());
      nodeModel.setChildModel("subdistricts", subdistricts);
      entityTrait.subentities.child = false;
      entityTrait.subentities.setModel(subdistricts);

      const widgetGroup = new swim.WidgetGroup();
      entityTrait.setTrait("widgets", widgetGroup);

      const greenLightsWidget = this.createGreenLightsWidget(entityTrait);
      entityTrait.appendChildModel(greenLightsWidget, "greenLights");

      const redLightsWidget = this.createRedLightsWidget(entityTrait);
      entityTrait.appendChildModel(redLightsWidget, "redLights");

      const pedWidget = this.createPedWidget(entityTrait);
      entityTrait.appendChildModel(pedWidget, "pedWidget");

      const redLightsPieModel = redLightsWidget.getChildModel("pie")
      const downlinkTrait = new TrafficCitiesKpisDownlink(redLightsPieModel,
                                                          greenLightsWidget.getChildModel("pie"),
                                                          pedWidget.getChildModel("pie"),
                                                          entityTrait.uri, CITY_STATE_URI);
      downlinkTrait.driver.setTrait(redLightsPieModel.getTrait("pie"));
      redLightsPieModel.setTrait("downlink", downlinkTrait);
    }
    updateNodeModel(nodeModel, value) {
      //const entityTrait = nodeModel.getTrait(swim.EntityTrait);
      //console.log("TrafficCitiesGroup.updateNodeModel " + entityTrait.uri + ":", value.toAny());
    }
    createRedLightsWidget(entityTrait) {
      const widgetModel = new swim.CompoundModel();
      const widgetTrait = new swim.WidgetTrait();
      widgetTrait.setTitle("Red Lights- Vehicle Backup");
      widgetTrait.setSubtitle(entityTrait.title.toUpperCase());
      widgetModel.setTrait("widget", widgetTrait);

      const pieModel = this.createRedLightsGadget(entityTrait);
      widgetModel.appendChildModel(pieModel, "pie");

      return widgetModel;
    }
    createRedLightsGadget(entityTrait) {
      const pieModel = new swim.CompoundModel();
      const pieTrait = new swim.PieTrait();
      pieModel.setTrait("pie", pieTrait);
      return pieModel;
    }
    createGreenLightsWidget(entityTrait) {
      const widgetModel = new swim.CompoundModel();
      const widgetTrait = new swim.WidgetTrait();
      widgetTrait.setTitle("Green Lights- Vehicle Flow");
      widgetTrait.setSubtitle(entityTrait.title.toUpperCase());
      widgetModel.setTrait("widget", widgetTrait);

      const pieModel = this.createGreenLightsGadget(entityTrait);
      widgetModel.appendChildModel(pieModel, "pie");

      return widgetModel;
    }
    createGreenLightsGadget(entityTrait) {
      const pieModel = new swim.CompoundModel();
      const pieTrait = new swim.PieTrait();
      pieModel.setTrait("pie", pieTrait);
      return pieModel;
    }
    createPedWidget(entityTrait) {
      const widgetModel = new swim.CompoundModel();
      const widgetTrait = new swim.WidgetTrait();
      widgetTrait.setTitle("Pedestrian Backup");
      widgetTrait.setSubtitle(entityTrait.title.toUpperCase());
      widgetModel.setTrait("widget", widgetTrait);

      const pieModel = this.createPedGadget(entityTrait);
      widgetModel.appendChildModel(pieModel, "pie");

      return widgetModel;
    }
    createPedGadget(entityTrait) {
      const pieModel = new swim.CompoundModel();
      const pieTrait = new swim.PieTrait();
      pieModel.setTrait("pie", pieTrait);
      return pieModel;
    }

    getOrCreateStadiumModel(stadiumPath) {
      //console.log("TrafficPlugin.getOrCreateStadiumModel " + stadiumPath);
      let stadiumModel = this.getChildModel(stadiumPath.toString());
      if (stadiumModel === null) {
        stadiumModel = this.createNodeModel(stadiumPath.toString());
        this.initStadiumModel(stadiumModel);
        this.appendChildModel(stadiumModel, stadiumPath.toString());
      }
      return stadiumModel;
    }
    initStadiumModel(stadiumModel) {
      const entityTrait = stadiumModel.getTrait(swim.EntityTrait);
      //console.log("TrafficPlugin.initStadiumModel " + entityTrait.uri);

      entityTrait.setTitle("Standford Stadium");

      const statusTrait = stadiumModel.getTrait(swim.StatusTrait);
      statusTrait.setStatusFactor("operational", swim.StatusFactor.create("Operational", swim.StatusVector.of([swim.Status.normal, 1])));

      const locationTrait = new swim.LocationTrait();
      locationTrait.setZoomRange(MIN_STADIUM_ZOOM, Infinity);
      stadiumModel.setTrait("location", locationTrait);

      const lng = -122.161111;
      const lat = 37.434444;

      const geographic = swim.GeographicPoint.fromInit({
        geometry: new swim.GeoPoint(lng, lat),
        width: stadiumIconSize,
        height: stadiumIconSize,
        graphics: stadiumIcon,
      });
      //const geographic = swim.GeographicArea.fromInit({
      //  geometry: approachValue.get("coords").toAny(),
      //});
      locationTrait.setGeographic(geographic);
    }

    onStartConsuming() {
      super.onStartConsuming();
      this.getOrCreateStadiumModel("/stadium/standford");
    }
    onStopConsuming() {
      super.onStopConsuming();
      this.removeAll();
    }
  }

  class TrafficPlugin extends swim.EntityPlugin {
    injectEntity(entityModel, domainModel) {
      const entityTrait = domainModel.getTrait(swim.EntityTrait);
      const domainUri = entityTrait.uri.toString();
      const entityUri = entityModel.uri.toString();
      //console.log("TrafficPlugin.injectEntity " + domainUri + ", " + entityUri + ":", entityModel);

      if (entityUri.startsWith("warp://localhost:9001")) {
        entityTrait.setTitle("Traffic");
        entityTrait.setIcon(trafficSignalIcon);

        entityModel.setTrait("status", new swim.StatusTrait());
        entityModel.setTrait("indicated", new swim.IndicatedTrait());

        const districtTrait = new swim.DistrictTrait();
        districtTrait.setZoomRange(-Infinity, Infinity);
        entityModel.setTrait("district", districtTrait);

        const subdistricts = new TrafficCitiesGroup(COUNTRY_URI, CITIES_URI);
        subdistricts.setTrait("status", new swim.StatusTrait());
        entityModel.setChildModel("subdistricts", subdistricts);

        const mapModel = new swim.CompoundModel();
        const mapEntityTrait = new swim.EntityTrait(swim.Uri.parse("/map"));
        mapModel.setTrait("entity", mapEntityTrait);
        mapEntityTrait.setTitle("Map");
        const mapSubentities = new TrafficCitiesGroup(COUNTRY_URI, CITIES_URI);
        mapSubentities.setTrait("status", new swim.StatusTrait());
        mapEntityTrait.subentities.setModel(mapSubentities);
        mapEntityTrait.subentities.injectModel();
        mapModel.setTrait("status", new swim.StatusTrait());
        mapModel.setTrait("indicated", new swim.IndicatedTrait());
        entityModel.subentities.model.prependChildModel(mapModel);
      }
    }
  }
  swim.PrismManager.insertPlugin(new TrafficPlugin());
})();
