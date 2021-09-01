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

  const RED_COLOR = swim.Color.parse("#f6511d");
  const YELLOW_COLOR = swim.Color.parse("#f9f070");
  const GREEN_COLOR = swim.Color.parse("#66ffdd");

  const cityIcon = swim.VectorIcon.create(24, 24, "M15,11L15,5L12,2L9,5L9,7L3,7L3,21L21,21L21,11L15,11ZM7,19L5,19L5,17L7,17L7,19ZM7,15L5,15L5,13L7,13L7,15ZM7,11L5,11L5,9L7,9L7,11ZM13,19L11,19L11,17L13,17L13,19ZM13,15L11,15L11,13L13,13L13,15ZM13,11L11,11L11,9L13,9L13,11ZM13,7L11,7L11,5L13,5L13,7ZM19,19L17,19L17,17L19,17L19,19ZM19,15L17,15L17,13L19,13L19,15Z");
  const cityIconSize = 48;

  const trafficSignalIcon = swim.VectorIcon.create(24, 24, "M20,10L17,10L17,8.86C18.72,8.41,20,6.86,20,5L17,5L17,4C17,3.45,16.55,3,16,3L8,3C7.45,3,7,3.45,7,4L7,5L4,5C4,6.86,5.28,8.41,7,8.86L7,10L4,10C4,11.86,5.28,13.41,7,13.86L7,15L4,15C4,16.86,5.28,18.41,7,18.86L7,20C7,20.55,7.45,21,8,21L16,21C16.55,21,17,20.55,17,20L17,18.86C18.72,18.41,20,16.86,20,15L17,15L17,13.86C18.72,13.41,20,11.86,20,10ZM12,19C10.89,19,10,18.1,10,17C10,15.9,10.89,15,12,15C13.1,15,14,15.9,14,17C14,18.1,13.11,19,12,19ZM12,14C10.89,14,10,13.1,10,12C10,10.9,10.89,10,12,10C13.1,10,14,10.9,14,12C14,13.1,13.11,14,12,14ZM12,9C10.89,9,10,8.1,10,7C10,5.89,10.89,5,12,5C13.1,5,14,5.89,14,7C14,8.1,13.11,9,12,9Z");
  const trafficSignalIconSize = 24;

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
      const keyCell = new swim.CellTrait();
      keyCell.content.setState(key);
      const valueCell = new swim.CellTrait();
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

      const keyColModel = new swim.CompoundModel();
      const keyColTrait = new swim.ColTrait();
      keyColModel.setTrait("col", keyColTrait);
      keyColTrait.layout.setState({key: "key", grow: 1, textColor: swim.Look.mutedColor});
      tableModel.appendChildModel(keyColModel);

      const valueColModel = new swim.CompoundModel();
      const valueColTrait = new swim.ColTrait();
      valueColModel.setTrait("col", valueColTrait);
      valueColTrait.layout.setState({key: "value", grow: 2});
      tableModel.appendChildModel(valueColModel);

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
