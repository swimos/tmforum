(function () {
  const COUNTRY_URI = swim.Uri.parse("/country/US");

  const AGENCIES_URI = swim.Uri.parse("agencies");

  const BOUNDING_BOX_URI = swim.Uri.parse("boundingBox");

  const VEHICLES_URI = swim.Uri.parse("vehicles");

  const VEHICLE_URI = swim.Uri.parse("vehicle");

  const SPEEDS_URI = swim.Uri.parse("speeds");

  const MIN_VEHICLE_ZOOM = 11;

  const busIcon = swim.VectorIcon.create(24, 24, "M12.2,4C15.9,4,18.9,4.4,19,7.2L19,7.3L19,15.8C19,16.5,18.7,17.1,18.2,17.5L18.1,17.6L18.1,19.1C18.1,19.6,17.8,19.9,17.3,20L17.2,20L16.4,20C15.9,20,15.5,19.6,15.5,19.2L15.5,19.1L15.5,18L8.5,18L8.5,19.1C8.5,19.6,8.2,19.9,7.7,20L7.6,20L6.7,20C6.3,20,5.9,19.6,5.9,19.2L5.9,19.1L5.9,17.6C5.4,17.2,5,16.6,5,15.9L5,15.8L5,7.3C5,4.4,8,4,11.8,4L12.2,4ZM8,16.5C8.8,16.5,9.5,15.8,9.5,15C9.5,14.2,8.8,13.5,8,13.5C7.2,13.5,6.5,14.2,6.5,15C6.5,15.8,7.2,16.5,8,16.5ZM16,16.5C16.8,16.5,17.5,15.8,17.5,15C17.5,14.2,16.8,13.5,16,13.5C15.2,13.5,14.5,14.2,14.5,15C14.5,15.8,15.2,16.5,16,16.5ZM17,7L7,7L7,12L17,12L17,7Z");
  const busIconSize = 24;

  class TransitSpeedDownlink extends swim.MapDownlinkTrait {
    constructor(plotModel, nodeUri, laneUri) {
      super();
      this.plotModel = plotModel;
      this.downlink.nodeUri(nodeUri).laneUri(laneUri);
    }
    downlinkDidUpdate(key, value) {
      const t = key.numberValue(void 0);
      const speed = value.numberValue(void 0);
      if (t !== void 0 && speed !== void 0) {
        const dataPointModel = new swim.CompoundModel();
        const dataPointTrait = new swim.DataPointTrait();
        dataPointTrait.setX(new swim.DateTime(t));
        dataPointTrait.setY(speed);
        dataPointModel.setTrait("dataPoint", dataPointTrait);
        this.plotModel.appendChildModel(dataPointModel, "" + t);
      }
    }
  }

  class TransitVehicleDownlink extends swim.ValueDownlinkTrait {
    constructor(agencyName, tableModel, nodeUri, laneUri) {
      super();
      this.agencyName = agencyName;
      this.tableModel = tableModel;
      this.downlink.nodeUri(nodeUri).laneUri(laneUri);
    }
    downlinkDidSet(value) {
      //console.log("TransitVehicleDownlink.downlinkDidSet " + this.downlink.nodeUri() + ":", value.toAny());
      this.updateRowModel("Bus", value.get("id").stringValue(""));
      this.updateRowModel("Agency", value.get("agency").stringValue("") || this.agencyName);
      this.updateRowModel("Route", value.get("routeTag").stringValue(""));
      this.updateRowModel("Direction", value.get("dirId").stringValue(""));
      this.updateRowModel("Heading", value.get("heading").stringValue(""));
      this.updateRowModel("Speed", value.get("speed").stringValue("0") + "mph");
    }
    updateRowModel(key, value) {
      const rowModel = this.getOrCreateRowModel(key, value);
      const valueCell = rowModel.getTrait("value");
      valueCell.setContent(value);
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
      keyCell.setContent(key);
      const valueCell = new swim.CellTrait();
      rowModel.setTrait("row", rowTrait);
      rowModel.setTrait("key", keyCell);
      rowModel.setTrait("value", valueCell);
      rowModel.setTrait("status", new swim.StatusTrait());
      return rowModel;
    }
  }

  class TransitVehiclesGroup extends swim.DownlinkNodeGroup {
    constructor(nodeUri, laneUri, metaHostUri, agencyName) {
      super(metaHostUri);
      this.agencyName = agencyName;
      this.downlink.nodeUri(nodeUri).laneUri(laneUri);
    }
    initNodeModel(nodeModel) {
      const entityTrait = nodeModel.getTrait(swim.EntityTrait);
      //console.log("TransitVehiclesGroup.initNodeModel " + entityTrait.uri);
      if (this.agencyName !== void 0) {
        const busId = entityTrait.uri.path.foot().head();
        entityTrait.setTitle(this.agencyName + " " + busId);
      }
      entityTrait.setIcon(busIcon);

      const statusTrait = nodeModel.getTrait(swim.StatusTrait);
      statusTrait.setStatusFactor("operational", swim.StatusFactor.create("Operational", swim.StatusVector.of([swim.Status.normal, 1])));

      const locationTrait = new swim.LocationTrait();
      locationTrait.setZoomRange(MIN_VEHICLE_ZOOM, Infinity);
      nodeModel.setTrait("location", locationTrait);

      const widgetGroup = new swim.WidgetGroup();
      entityTrait.setTrait("widgets", widgetGroup);

      const infoWidget = this.createInfoWidget(entityTrait);
      entityTrait.appendChildModel(infoWidget, "info");

      const telemetryWidget = this.createTelemetryWidget(entityTrait);
      entityTrait.appendChildModel(telemetryWidget, "telemetry");
    }
    updateNodeModel(nodeModel, value) {
      const entityTrait = nodeModel.getTrait(swim.EntityTrait);
      //console.log("TransitVehiclesGroup.updateNodeModel " + entityTrait.uri + ":", value.toAny());

      const locationTrait = nodeModel.getTrait(swim.LocationTrait);
      const lng = value.get("longitude").numberValue(NaN);
      const lat = value.get("latitude").numberValue(NaN);
      if (isFinite(lng) && isFinite(lat)) {
        const geographic = swim.GeographicPoint.fromInit({
          geometry: new swim.GeoPoint(lng, lat),
          width: busIconSize,
          height: busIconSize,
          graphics: busIcon,
        });
        locationTrait.setGeographic(geographic);
      } else {
        locationTrait.setGeographic(null);
      }

      const telemetryWidget = entityTrait.getChildModel("telemetry");
      const speedGaugeModel = telemetryWidget.getChildModel("speedGauge");
      const speedDialModel = speedGaugeModel.getChildModel("speed");
      const speedDialTrait = speedDialModel.getTrait(swim.DialTrait);
      const speedDialStatusTrait = speedDialModel.getTrait(swim.StatusTrait);
      const speedHistoryModel = telemetryWidget.getChildModel("speedHistory");
      const speedPlotModel = speedHistoryModel.getChildModel("speed");
      const speedHistoryStatusTrait = speedPlotModel.getTrait(swim.StatusTrait);

      const speed = value.get("speed").numberValue(0);
      speedDialTrait.setValue(speed);

      const statusTrait = nodeModel.getTrait(swim.StatusTrait);
      const criticalSpeed = 75;
      const alertSpeed = 65;
      const warningSpeed = 55;
      if (speed > alertSpeed) {
        const alert = Math.min((speed - alertSpeed) / (criticalSpeed - alertSpeed), 1);
        statusTrait.setStatusFactor("speed", swim.StatusFactor.create("Speed", swim.StatusVector.of([swim.Status.alert, alert])));
        speedDialStatusTrait.setStatusFactor("speed", swim.StatusFactor.create("Speed", swim.StatusVector.of([swim.Status.alert, alert])));
        speedHistoryStatusTrait.setStatusFactor("speed", swim.StatusFactor.create("Speed", swim.StatusVector.of([swim.Status.alert, alert])));
      } else if (speed > warningSpeed) {
        const warning = (speed - warningSpeed) / (alertSpeed - warningSpeed);
        statusTrait.setStatusFactor("speed", swim.StatusFactor.create("Speed", swim.StatusVector.of([swim.Status.warning, warning])));
        speedHistoryStatusTrait.setStatusFactor("speed", swim.StatusFactor.create("Speed", swim.StatusVector.of([swim.Status.warning, warning])));
        speedHistoryStatusTrait.setStatusFactor("speed", swim.StatusFactor.create("Speed", swim.StatusVector.of([swim.Status.warning, warning])));
      } else {
        statusTrait.setStatusFactor("speed", null);
        speedDialStatusTrait.setStatusFactor("speed", null);
        speedHistoryStatusTrait.setStatusFactor("speed", null);
      }
    }
    createInfoWidget(entityTrait) {
      const widgetModel = new swim.CompoundModel();
      const widgetTrait = new swim.WidgetTrait();
      //widgetTrait.setTitle("Bus");
      widgetTrait.setSubtitle(entityTrait.title.toUpperCase());
      widgetModel.setTrait("widget", widgetTrait);

      const tableModel = this.createInfoTable(entityTrait);
      widgetModel.appendChildModel(tableModel, "table");

      return widgetModel;
    }
    createInfoTable(entityTrait) {
      const tableModel = new swim.CompoundModel();
      const tableTrait = new swim.TableTrait();
      tableTrait.setColSpacing(swim.Length.px(12));
      tableModel.setTrait("table", tableTrait);

      const keyColModel = new swim.CompoundModel();
      const keyColTrait = new swim.ColTrait();
      keyColModel.setTrait("col", keyColTrait);
      keyColTrait.setLayout({key: "key", grow: 1, textColor: swim.Look.mutedColor});
      tableModel.appendChildModel(keyColModel);

      const valueColModel = new swim.CompoundModel();
      const valueColTrait = new swim.ColTrait();
      valueColModel.setTrait("col", valueColTrait);
      valueColTrait.setLayout({key: "value", grow: 1});
      tableModel.appendChildModel(valueColModel);

      const downlinkTrait = new TransitVehicleDownlink(this.agencyName, tableModel, entityTrait.uri, VEHICLE_URI);
      downlinkTrait.driver.setTrait(tableTrait);
      tableModel.setTrait("downlink", downlinkTrait);

      return tableModel;
    }
    createTelemetryWidget(entityTrait) {
      const widgetModel = new swim.CompoundModel();
      const widgetTrait = new swim.WidgetTrait();
      widgetTrait.setTitle("Telemetry");
      widgetTrait.setSubtitle(entityTrait.title.toUpperCase());
      widgetModel.setTrait("widget", widgetTrait);

      const speedGaugeModel = this.createSpeedGaugeGadget(entityTrait);
      widgetModel.appendChildModel(speedGaugeModel, "speedGauge");

      const speedHistoryModel = this.createSpeedHistoryGadget(entityTrait);
      widgetModel.appendChildModel(speedHistoryModel, "speedHistory");

      return widgetModel;
    }
    createSpeedGaugeGadget(entityTrait) {
      const gaugeModel = new swim.CompoundModel();
      const gaugeTrait = new swim.GaugeTrait();
      gaugeTrait.setTitle("Speed");
      gaugeModel.setTrait("gauge", gaugeTrait);

      const speedDialModel = new swim.CompoundModel();
      const speedDialTrait = new swim.DialTrait();
      speedDialTrait.formatLabel = function (value, limit) {
        return value.toFixed() + "mph";
      };
      //speedDialTrait.setLegend("Speed");
      speedDialTrait.setLimit(100);
      speedDialTrait.setValue(0);
      speedDialModel.setTrait("dial", speedDialTrait);
      speedDialModel.setTrait("status", new swim.StatusTrait());
      gaugeModel.appendChildModel(speedDialModel, "speed");

      return gaugeModel;
    }
    createSpeedHistoryGadget(entityTrait) {
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
      const graphTrait = new swim.GraphTrait();
      chartModel.setTrait("graph", graphTrait);
      chartModel.appendChildModel(plotModel, "speed");

      const downlinkTrait = new TransitSpeedDownlink(plotModel, entityTrait.uri, SPEEDS_URI);
      downlinkTrait.driver.setTrait(chartTrait);
      chartModel.setTrait("downlink", downlinkTrait);

      return chartModel;
    }
    onStopConsuming() {
      super.onStopConsuming();
      this.removeAll();
    }
  }

  class TransitAgencyLocation extends swim.DownlinkLocationTrait {
    constructor(nodeUri, laneUri) {
      super();
      this.downlink.nodeUri(nodeUri).laneUri(laneUri);
    }
    downlinkDidSet(value) {
      //console.log("TransitAgencyLocation.downlinkDidSet " + this.downlink.nodeUri() + ":", value.toAny());
      const minLng = value.get("minLng").numberValue(void 0);
      const minLat = value.get("minLat").numberValue(void 0);
      const maxLng = value.get("maxLng").numberValue(void 0);
      const maxLat = value.get("maxLat").numberValue(void 0);
      if (minLng !== void 0 && minLng !== 0 && minLat !== void 0 && minLat !== 0 &&
          maxLng !== void 0 && maxLng !== 0 && maxLat !== void 0 && maxLat !== 0) {
        const geographic = swim.GeographicArea.fromInit({
          geometry: [[minLng, minLat], [minLng, maxLat], [maxLng, maxLat], [maxLng, minLat]],
        });
        this.setGeographic(geographic);
        const districtTrait = this.getTrait(swim.DistrictTrait);
        districtTrait.setBoundary(geographic.geometry);
      }
    }
  }

  class TransitAgenciesGroup extends swim.DownlinkNodeGroup {
    constructor(nodeUri, laneUri, metaHostUri) {
      super(metaHostUri);
      this.downlink.nodeUri(nodeUri).laneUri(laneUri);
    }
    initNodeModel(nodeModel) {
      const entityTrait = nodeModel.getTrait(swim.EntityTrait);
      //console.log("TransitAgenciesGroup.initNodeModel " + entityTrait.uri);

      entityTrait.aggregateStatus = function (statusVector) {}; // don't aggregate subentity status

      const statusTrait = nodeModel.getTrait(swim.StatusTrait);
      statusTrait.setStatusFactor("operational", swim.StatusFactor.create("Operational", swim.StatusVector.of([swim.Status.normal, 1])));

      const locationTrait = new TransitAgencyLocation(entityTrait.uri, BOUNDING_BOX_URI);
      locationTrait.setZoomRange(-Infinity, MIN_VEHICLE_ZOOM);
      nodeModel.setTrait("location", locationTrait);

      const districtTrait = new swim.DistrictTrait();
      districtTrait.setZoomRange(MIN_VEHICLE_ZOOM, Infinity);
      districtTrait.setBoundary(swim.GeoBox.undefined());
      nodeModel.setTrait("district", districtTrait);

      const subdistricts = new TransitVehiclesGroup(entityTrait.uri, VEHICLES_URI, this.metaHostUri, entityTrait.title);
      subdistricts.setTrait("status", new swim.StatusTrait());
      nodeModel.setChildModel("subdistricts", subdistricts);
      entityTrait.subentities.child = false;
      entityTrait.subentities.setModel(subdistricts);
    }
    updateNodeModel(nodeModel, value) {
      //const entityTrait = nodeModel.getTrait(swim.EntityTrait);
      //console.log("TransitAgenciesGroup.updateNodeModel " + entityTrait.uri + ":", value.toAny());
    }
    onStopConsuming() {
      super.onStopConsuming();
      this.removeAll();
    }
  }

  class TransitPlugin extends swim.EntityPlugin {
    injectEntity(entityModel, domainModel) {
      const entityTrait = domainModel.getTrait(swim.EntityTrait);
      const domainUri = entityTrait.uri.toString();
      const entityUri = entityModel.uri.toString();
      //console.log("TransitPlugin.injectEntity " + domainUri + ", " + entityUri + ":", entityModel);

      if (entityUri === "warp://localhost:9002") {
        entityTrait.setTitle("Transit");
        entityTrait.setIcon(busIcon);

        entityModel.setTrait("status", new swim.StatusTrait());
        entityModel.setTrait("indicated", new swim.IndicatedTrait());

        const districtTrait = new swim.DistrictTrait();
        districtTrait.setZoomRange(-Infinity, Infinity);
        entityModel.setTrait("district", districtTrait);

        const subdistricts = new TransitAgenciesGroup(COUNTRY_URI, AGENCIES_URI);
        subdistricts.setTrait("status", new swim.StatusTrait());
        entityModel.setChildModel("subdistricts", subdistricts);

        const mapModel = new swim.CompoundModel();
        const mapEntityTrait = new swim.EntityTrait(swim.Uri.parse("/map"));
        mapModel.setTrait("entity", mapEntityTrait);
        mapEntityTrait.setTitle("Map");
        const mapSubentities = new TransitAgenciesGroup(COUNTRY_URI, AGENCIES_URI);
        mapSubentities.setTrait("status", new swim.StatusTrait());
        mapEntityTrait.subentities.setModel(mapSubentities);
        mapEntityTrait.subentities.injectModel();
        mapModel.setTrait("status", new swim.StatusTrait());
        mapModel.setTrait("indicated", new swim.IndicatedTrait());
        entityModel.subentities.model.prependChildModel(mapModel);
      }
    }
  }
  swim.PrismManager.insertPlugin(new TransitPlugin());
})();
