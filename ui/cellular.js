(function () {
  const COUNTRY_URI = swim.Uri.parse("/country/US");

  const SUB_REGIONS_URI = swim.Uri.parse("subRegions");

  const SITES_URI = swim.Uri.parse("sites");

  const STATUS_URI = swim.Uri.parse("status");

  const ALERTS_URI = swim.Uri.parse("alerts");

  const GEOMETRY_URI = swim.Uri.parse("geometry");

  const KPIS_URI = swim.Uri.parse("kpis");

  const INFO_URI = swim.Uri.parse("info");

  const RAN_HISTORY_URI = swim.Uri.parse("ranHistory");

  const MIN_SITE_ZOOM = 8;

  const cellTowerIcon = swim.VectorIcon.create(24, 24, "M15.4,14.1L15.4,14.1L15.4,14.1L12.7,4L11.3,4L8.6,14.1L7,20L9.1,20L12,17.3L14.9,20L17,20L15.4,14.1ZM9.9,15.3L10.9,16.3L9.1,18.1L9.9,15.3ZM14.2,15.3L14.9,18.1L13.1,16.3L14.2,15.3ZM10.3,13.7L11,10.9L13,10.9L13.8,13.7L12,15.3L10.3,13.7Z");
  const cellTowerIconSize = 32;

  const subscriberIcon = swim.VectorIcon.create(24, 24, "M15,4C16.1,4,17,4.9,17,6L17,18C17,19.1,16.1,20,15,20L9,20C7.9,20,7,19.1,7,18L7,6C7,4.9,7.9,4,9,4L15,4ZM12,17.5C11.4,17.5,11,17.9,11,18.5C11,19.1,11.4,19.5,12,19.5C12.6,19.5,13,19.1,13,18.5C13,17.9,12.6,17.5,12,17.5ZM15,7L9,7L9,17L15,17L15,7ZM13.5,5L10.5,5C10.2,5,10,5.2,10,5.5C10,5.7,10.2,5.9,10.4,6L10.5,6L13.5,6C13.8,6,14,5.8,14,5.5C14,5.3,13.8,5.1,13.6,5L13.5,5Z");
  const subscriberIconSize = 24;

  const BEAM_CYCLE_TIME = 60000;
  const BEAM_FOCUS_START = 15000;
  const BEAM_FOCUS_END = 30000;
  const BEAM_UNFOCUS_START = 45000;
  const BEAM_UNFOCUS_END = 60000;

  class CellularSiteRanHistoryDownlink extends swim.MapDownlinkTrait {
    constructor(sinrModel, rrcModel, nodeUri, laneUri) {
      super();
      this.sinrModel = sinrModel;
      this.rrcModel = rrcModel;
      this.downlink.nodeUri(nodeUri).laneUri(laneUri);
    }
    downlinkDidUpdate(key, value) {
      const t = key.numberValue(void 0);
      const sinr = value.get("mean_ul_sinr").numberValue(void 0);
      const rrc = value.get("rrc_re_establishment_failures").numberValue(void 0);
      if (t !== void 0 && sinr !== void 0) {
        const dataPointModel = new swim.CompoundModel();
        const dataPointTrait = new swim.DataPointTrait();
        dataPointTrait.x.setState(new swim.DateTime(t));
        dataPointTrait.y.setState(-sinr);
        dataPointModel.setTrait("dataPoint", dataPointTrait);
        this.sinrModel.appendChildModel(dataPointModel, "" + t);
      }
      if (t !== void 0 && sinr !== void 0) {
        const dataPointModel = new swim.CompoundModel();
        const dataPointTrait = new swim.DataPointTrait();
        dataPointTrait.x.setState(new swim.DateTime(t));
        dataPointTrait.y.setState(-rrc);
        dataPointModel.setTrait("dataPoint", dataPointTrait);
        this.rrcModel.appendChildModel(dataPointModel, "" + t);
      }
    }
  }

  class CellularSiteNumUEsDownlink extends swim.MapDownlinkTrait {
    constructor(numUEsModel, nodeUri, laneUri) {
      super();
      this.numUEsModel = numUEsModel;
      this.downlink.nodeUri(nodeUri).laneUri(laneUri);
    }
    downlinkDidUpdate(key, value) {
      const t = key.numberValue(void 0);
      const numUEs = value.get("numUEs").numberValue(void 0);
      if (t !== void 0 && numUEs !== void 0) {
        const dataPointModel = new swim.CompoundModel();
        const dataPointTrait = new swim.DataPointTrait();
        dataPointTrait.x.setState(new swim.DateTime(t));
        dataPointTrait.y.setState(-numUEs);
        dataPointModel.setTrait("dataPoint", dataPointTrait);
        this.numUEsModel.appendChildModel(dataPointModel, "" + t);
      }
    }
  }

  class CellularSiteThroughputDownlink extends swim.MapDownlinkTrait {
    constructor(throughputModel, nodeUri, laneUri) {
      super();
      this.throughputModel = throughputModel;
      this.downlink.nodeUri(nodeUri).laneUri(laneUri);
    }
    downlinkDidUpdate(key, value) {
      const t = key.numberValue(void 0);
      const throughput = value.get("aveThroughputPerUser").numberValue(void 0);
      if (t !== void 0 && throughput !== void 0) {
        const dataPointModel = new swim.CompoundModel();
        const dataPointTrait = new swim.DataPointTrait();
        dataPointTrait.x.setState(new swim.DateTime(t));
        dataPointTrait.y.setState(-throughput);
        dataPointModel.setTrait("dataPoint", dataPointTrait);
        this.throughputModel.appendChildModel(dataPointModel, "" + t);
      }
    }
  }


  class CellularSiteKpisDownlink extends swim.ValueDownlinkTrait {
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
          if (key === "mean_ul_sinr") {
            displayKey = "Latest Mean Sinr"
          } else if (key === "numUEs") {
            displayKey = "# of UEs Connected"
          } else if (key === "aveThroughputPerUser") {
            displayKey = "Ave Throughput/User"
          } else if (key == "rrc_re_establishment_failures") {
            displayKey = "Latest Reconnect Failures"
          } else if (key == "severity") {
            displayKey = "Alert Severity"
          } else if (key == "count") {
            displayKey = "Total Sample Count"
          }
          const rowModel = this.getOrCreateRowModel(displayKey);
          const valueCell = rowModel.getTrait("value");
          const value = item.toValue().stringValue("");
          valueCell.content.setState(value);
        }
      });
    }
    updateRowModel(key, value) {
      let displayKey = key;
      if (key === "mean_ul_sinr") {
        displayKey = "Latest Mean Sinr"
      } else if (key === "numUEs") {
        displayKey = "# of UEs Connected"
      } else if (key === "aveThroughputPerUser") {
        displayKey = "Ave Throughput/User"
      } else if (key == "rrc_re_establishment_failures") {
        displayKey = "Latest Reconnect Failures"
      } else if (key == "severity") {
        displayKey = "Alert Severity"
      } else if (key == "count") {
        displayKey = "Total Sample Count"
      }
      const rowModel = this.getOrCreateRowModel(displayKey, value);
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

  class CellularSiteInfoDownlink extends swim.ValueDownlinkTrait {
    constructor(tableModel, nodeUri, laneUri) {
      super();
      this.tableModel = tableModel;
      this.downlink.nodeUri(nodeUri).laneUri(laneUri);
    }
    downlinkDidSet(value) {
      value.forEach((item) => {
        const key = item.key.stringValue(void 0);
        if (key !== void 0 & key !== "Latitude" & key !== "Longitude" & key !== "node" & key != "SectorId") {
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

  class CellularSiteGroup extends swim.DownlinkNodeGroup {
    constructor(nodeUri, laneUri, metaHostUri) {
      super(metaHostUri);
      this.downlink.nodeUri(nodeUri).laneUri(laneUri);
      this.coverageFrame = void 0;
    }
    initNodeModel(nodeModel) {
      const entityTrait = nodeModel.getTrait(swim.EntityTrait);
      //console.log("CellularSiteGroup.initNodeModel " + entityTrait.uri);
      entityTrait.setIcon(cellTowerIcon);

      const statusTrait = nodeModel.getTrait(swim.StatusTrait);
      statusTrait.setStatusFactor("operational", swim.StatusFactor.create("Operational", swim.StatusVector.of([swim.Status.normal, 1])));

      const locationTrait = new swim.LocationTrait();
      nodeModel.setTrait("location", locationTrait);

      const widgetGroup = new swim.WidgetGroup();
      entityTrait.setTrait("widgets", widgetGroup);

      const kpiWidget = this.createKpiWidget(entityTrait);
      entityTrait.appendChildModel(kpiWidget, "kpi");

      const ranHistoryWidget = this.createRanHistoryWidget(entityTrait);
      entityTrait.appendChildModel(ranHistoryWidget, "ranHistory");

      const numUEsWidget = this.createNumUEsWidget(entityTrait);
      entityTrait.appendChildModel(numUEsWidget, "numUEs");

      const throughputWidget = this.createThroughputWidget(entityTrait);
      entityTrait.appendChildModel(throughputWidget, "throughput");

      const infoWidget = this.createInfoWidget(entityTrait);
      entityTrait.appendChildModel(infoWidget, "info");

      if (entityTrait.uri.toString() === "/site/ABAB") {
        this.initNorthSite(nodeModel);
      } else if (entityTrait.uri.toString() === "/site/ABAD") {
        this.initEastSite(nodeModel);
      } else if (entityTrait.uri.toString() === "/site/ABAA") {
        this.initSouthSite(nodeModel);
      } else if (entityTrait.uri.toString() === "/site/ABAC") {
        this.initWestSite(nodeModel);
      }
    }
    updateNodeModel(nodeModel, value) {
      const entityTrait = nodeModel.getTrait(swim.EntityTrait);
      //console.log("CellularSiteGroup.updateNodeModel " + entityTrait.uri + ":", value.toAny());

      entityTrait.aggregateStatus = function (statusVector) {}; // don't aggregate subentity status

      const locationTrait = nodeModel.getTrait(swim.LocationTrait);

      const coordinates = value.get("coordinates");
      const lng = coordinates.getItem(0).numberValue(NaN);
      const lat = coordinates.getItem(1).numberValue(NaN);
      if (isFinite(lng) && isFinite(lat)) {
        const geographic = swim.GeographicPoint.fromInit({
          geometry: new swim.GeoPoint(lng, lat),
          width: cellTowerIconSize,
          height: cellTowerIconSize,
          graphics: cellTowerIcon,
        });
        locationTrait.setGeographic(geographic);
      } else {
        locationTrait.setGeographic(null);
      }

      const ranHistoryWidget = entityTrait.getChildModel("ranHistory");
      const ranHistoryModel = ranHistoryWidget.getChildModel("ranHistory");

      const sinrPlotModel = ranHistoryModel.getChildModel("sinr");
      const sinrStatusTrait = sinrPlotModel.getTrait(swim.StatusTrait);

      const rccPlotModel = ranHistoryModel.getChildModel("rrc");
      const rrcStatusTrait = rccPlotModel.getTrait(swim.StatusTrait);

      const numUEsWidget = entityTrait.getChildModel("numUEs");
      const numUEsModel = numUEsWidget.getChildModel("numUEs");

      const numUEsPlotModel = numUEsModel.getChildModel("numUEs");
      const numUEsStatusTrait = numUEsPlotModel.getTrait(swim.StatusTrait);

      const throughputWidget = entityTrait.getChildModel("throughput");
      const throughputModel = throughputWidget.getChildModel("throughput");

      const throughputPlotModel = throughputModel.getChildModel("throughput");
      const throughputStatusTrait = throughputPlotModel.getTrait(swim.StatusTrait);

      const statusTrait = nodeModel.getTrait(swim.StatusTrait);
      const severity = value.get("severity").numberValue(0);
      if (severity > 1) {
        statusTrait.setStatusFactor("site", swim.StatusFactor.create("Site", swim.StatusVector.of([swim.Status.alert, severity - 1])));
        sinrStatusTrait.setStatusFactor("site", swim.StatusFactor.create("Site", swim.StatusVector.of([swim.Status.alert, severity - 1])));
        rrcStatusTrait.setStatusFactor("site", swim.StatusFactor.create("Site", swim.StatusVector.of([swim.Status.alert, severity - 1])));
      } else if (severity > 0) {
        statusTrait.setStatusFactor("site", swim.StatusFactor.create("Site", swim.StatusVector.of([swim.Status.warning, severity])));
        sinrStatusTrait.setStatusFactor("site", swim.StatusFactor.create("Site", swim.StatusVector.of([swim.Status.warning, severity])));
        rrcStatusTrait.setStatusFactor("site", swim.StatusFactor.create("Site", swim.StatusVector.of([swim.Status.warning, severity])));
      } else {
        statusTrait.setStatusFactor("site", null);
        sinrStatusTrait.setStatusFactor("site", null);
        rrcStatusTrait.setStatusFactor("site", null);
      }

      const throughput = value.get("aveThroughputPerUser").numberValue(0);
      if (throughput > 2) {
        throughputStatusTrait.setStatusFactor("site", null);
        numUEsStatusTrait.setStatusFactor("site", null);
      } else if (throughput > 1) {
        throughputStatusTrait.setStatusFactor("site", swim.StatusFactor.create("Site", swim.StatusVector.of([swim.Status.warning, throughput - 1])));
        numUEsStatusTrait.setStatusFactor("site", swim.StatusFactor.create("Site", swim.StatusVector.of([swim.Status.warning, throughput - 1])));
      } else {
        throughputStatusTrait.setStatusFactor("site", swim.StatusFactor.create("Site", swim.StatusVector.of([swim.Status.alert, throughput])));
        numUEsStatusTrait.setStatusFactor("site", swim.StatusFactor.create("Site", swim.StatusVector.of([swim.Status.alert, throughput])));
      }

      if (entityTrait.uri.toString() === "/site/ABAB") {
        this.updateNorthSite(nodeModel);
      } else if (entityTrait.uri.toString() === "/site/ABAD") {
        this.updateEastSite(nodeModel);
      } else if (entityTrait.uri.toString() === "/site/ABAA") {
        this.updateSouthSite(nodeModel);
      } else if (entityTrait.uri.toString() === "/site/ABAC") {
        this.updateWestSite(nodeModel);
      }
    }
    createKpiWidget(entityTrait) {
      const widgetModel = new swim.CompoundModel();
      const widgetTrait = new swim.WidgetTrait();
      widgetTrait.setSubtitle(entityTrait.title.toUpperCase());
      widgetModel.setTrait("widget", widgetTrait);
      widgetTrait.setTitle("KPIs");

      const tableModel = this.createKpiTable(entityTrait);
      widgetModel.appendChildModel(tableModel, "table");

      return widgetModel;
    }
    createKpiTable(entityTrait) {
      const tableModel = new swim.CompoundModel();
      const tableTrait = new swim.TableTrait();
      tableTrait.colSpacing.setState(swim.Length.px(12));
      tableModel.setTrait("table", tableTrait);

      const keyColTrait = new swim.ColTrait();
      keyColTrait.layout.setState({key: "key", grow: 2, textColor: swim.Look.mutedColor});
      tableModel.setTrait("key", keyColTrait);

      const valueColTrait = new swim.ColTrait();
      valueColTrait.layout.setState({key: "value", grow: 1});
      tableModel.setTrait("value", valueColTrait);

      const downlinkTrait = new CellularSiteKpisDownlink(tableModel, entityTrait.uri, KPIS_URI);
      downlinkTrait.driver.setTrait(tableTrait);
      tableModel.setTrait("downlink", downlinkTrait);

      return tableModel;
    }
    createRanHistoryWidget(entityTrait) {
      const widgetModel = new swim.CompoundModel();
      const widgetTrait = new swim.WidgetTrait();
      widgetTrait.setTitle("RAN History");
      widgetTrait.setSubtitle(entityTrait.title.toUpperCase());
      widgetModel.setTrait("widget", widgetTrait);

      const ranHistoryModel = this.createRanHistoryGadget(entityTrait);
      widgetModel.appendChildModel(ranHistoryModel, "ranHistory");
      return widgetModel;
    }
    createRanHistoryGadget(entityTrait) {
      const sinrModel = new swim.CompoundModel();
      const sinrPlotTrait = new swim.LinePlotTrait();
      sinrModel.setTrait("plot", sinrPlotTrait);
      const sinrPlotStatus = new swim.StatusTrait();
      sinrModel.setTrait("status", sinrPlotStatus);
      const sinrDataSetTrait = new swim.DataSetTrait();
      sinrModel.setTrait("dataSet", sinrDataSetTrait);

      const rrcFailureModel = new swim.CompoundModel();
      const rrcPlotTrait = new swim.LinePlotTrait();
      rrcFailureModel.setTrait("plot", rrcPlotTrait);
      const rrcPlotStatus = new swim.StatusTrait();
      rrcFailureModel.setTrait("status", rrcPlotStatus);
      const rrcDataSetTrait = new swim.DataSetTrait();
      rrcFailureModel.setTrait("dataSet", rrcDataSetTrait);

      const chartModel = new swim.CompoundModel();
      const chartTrait = new swim.ChartTrait();
      chartModel.setTrait("chart", chartTrait);
      const bottomAxisTrait = new swim.BottomAxisTrait();
      chartModel.setTrait("bottomAxis", bottomAxisTrait);
      const graphTrait = new swim.GraphTrait();
      chartModel.setTrait("graph", graphTrait);
      chartModel.appendChildModel(sinrModel, "sinr");
      chartModel.appendChildModel(rrcFailureModel, "rrc");

      const downlinkTrait = new CellularSiteRanHistoryDownlink(sinrModel, rrcFailureModel, entityTrait.uri, RAN_HISTORY_URI);
      downlinkTrait.driver.setTrait(chartTrait);
      chartModel.setTrait("downlink", downlinkTrait);

      return chartModel;
    }

    createNumUEsWidget(entityTrait) {
      const widgetModel = new swim.CompoundModel();
      const widgetTrait = new swim.WidgetTrait();
      widgetTrait.setTitle("Number of UEs Connected");
      widgetTrait.setSubtitle(entityTrait.title.toUpperCase());
      widgetModel.setTrait("widget", widgetTrait);

      const numUEsModel = this.createNumUEsGadget(entityTrait);
      widgetModel.appendChildModel(numUEsModel, "numUEs");
      return widgetModel;
    }
    createNumUEsGadget(entityTrait) {
      const numUEsModel = new swim.CompoundModel();
      const numUEsPlotTrait = new swim.LinePlotTrait();
      numUEsModel.setTrait("plot", numUEsPlotTrait);
      const numUEsPlotStatus = new swim.StatusTrait();
      numUEsModel.setTrait("status", numUEsPlotStatus);
      const numUEsDataSetTrait = new swim.DataSetTrait();
      numUEsModel.setTrait("dataSet", numUEsDataSetTrait);

      const chartModel = new swim.CompoundModel();
      const chartTrait = new swim.ChartTrait();
      chartModel.setTrait("chart", chartTrait);
      const bottomAxisTrait = new swim.BottomAxisTrait();
      chartModel.setTrait("bottomAxis", bottomAxisTrait);
      const graphTrait = new swim.GraphTrait();
      chartModel.setTrait("graph", graphTrait);
      chartModel.appendChildModel(numUEsModel, "numUEs");

      const downlinkTrait = new CellularSiteNumUEsDownlink(numUEsModel, entityTrait.uri, RAN_HISTORY_URI);
      downlinkTrait.driver.setTrait(chartTrait);
      chartModel.setTrait("downlink", downlinkTrait);

      return chartModel;
    }

    createThroughputWidget(entityTrait) {
      const widgetModel = new swim.CompoundModel();
      const widgetTrait = new swim.WidgetTrait();
      widgetTrait.setTitle("Average Throughput Per User");
      widgetTrait.setSubtitle(entityTrait.title.toUpperCase());
      widgetModel.setTrait("widget", widgetTrait);

      const throughputModel = this.createThroughputGadget(entityTrait);
      widgetModel.appendChildModel(throughputModel, "throughput");
      return widgetModel;
    }
    createThroughputGadget(entityTrait) {
      const throughputModel = new swim.CompoundModel();
      const throughputPlotTrait = new swim.LinePlotTrait();
      throughputModel.setTrait("plot", throughputPlotTrait);
      const throughputPlotStatus = new swim.StatusTrait();
      throughputModel.setTrait("status", throughputPlotStatus);
      const throughputDataSetTrait = new swim.DataSetTrait();
      throughputModel.setTrait("dataSet", throughputDataSetTrait);

      const chartModel = new swim.CompoundModel();
      const chartTrait = new swim.ChartTrait();
      chartModel.setTrait("chart", chartTrait);
      const bottomAxisTrait = new swim.BottomAxisTrait();
      chartModel.setTrait("bottomAxis", bottomAxisTrait);
      const graphTrait = new swim.GraphTrait();
      chartModel.setTrait("graph", graphTrait);
      chartModel.appendChildModel(throughputModel, "throughput");

      const downlinkTrait = new CellularSiteThroughputDownlink(throughputModel, entityTrait.uri, RAN_HISTORY_URI);
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
      keyColTrait.layout.setState({key: "key", grow: 5, textColor: swim.Look.mutedColor});
      tableModel.setTrait("key", keyColTrait);

      const valueColTrait = new swim.ColTrait();
      valueColTrait.layout.setState({key: "value", grow: 1});
      tableModel.setTrait("value", valueColTrait);

      const downlinkTrait = new CellularSiteInfoDownlink(tableModel, entityTrait.uri, INFO_URI);
      downlinkTrait.driver.setTrait(tableTrait);
      tableModel.setTrait("downlink", downlinkTrait);

      return tableModel;
    }

    initDemoSite(nodeModel) {
      const entityTrait = nodeModel.getTrait(swim.EntityTrait);

      const districtTrait = new swim.DistrictTrait();
      districtTrait.setBoundary(swim.GeoBox.undefined());
      nodeModel.setTrait("district", districtTrait);

      const subdistricts = new swim.NodeGroup(this.metaHostUri);
      subdistricts.setTrait("status", new swim.StatusTrait());
      nodeModel.setChildModel("subdistricts", subdistricts);
      entityTrait.subentities.child = false;
      entityTrait.subentities.setModel(subdistricts);

      const sector1Path = entityTrait.uri + "/sector/1";
      const sector1Model = this.createNodeModel(sector1Path);
      sector1Model.setTrait("location", new swim.LocationTrait());
      subdistricts.appendChildModel(sector1Model, sector1Path);

      const sector2Path = entityTrait.uri + "/sector/2";
      const sector2Model = this.createNodeModel(sector2Path);
      sector2Model.setTrait("location", new swim.LocationTrait());
      subdistricts.appendChildModel(sector2Model, sector2Path);

      const sector3Path = entityTrait.uri + "/sector/3";
      const sector3Model = this.createNodeModel(sector3Path);
      sector3Model.setTrait("location", new swim.LocationTrait());
      subdistricts.appendChildModel(sector3Model, sector3Path);

      const sector4Path = entityTrait.uri + "/sector/4";
      const sector4Model = this.createNodeModel(sector4Path);
      sector4Model.setTrait("location", new swim.LocationTrait());
      subdistricts.appendChildModel(sector4Model, sector4Path);
    }
    initNorthSite(nodeModel) {
      //console.log("CellularSiteGroup.initNorthSite");
      this.initDemoSite(nodeModel);
    }
    initEastSite(nodeModel) {
      //console.log("CellularSiteGroup.initEastSite");
      this.initDemoSite(nodeModel);
    }
    initSouthSite(nodeModel) {
      //console.log("CellularSiteGroup.initSouthSite");
      this.initDemoSite(nodeModel);
    }
    initWestSite(nodeModel) {
      //console.log("CellularSiteGroup.initWestSite");
      this.initDemoSite(nodeModel);
    }

    updateDemoSite(nodeModel) {
      const {lng, lat} = nodeModel.getTrait(swim.LocationTrait).geographic.geometry;

      const districtTrait = nodeModel.getTrait(swim.DistrictTrait);
      if (isFinite(lng) && isFinite(lat)) {
        districtTrait.setBoundary(new swim.GeoBox(lng - 1, lat - 1, lng + 1, lat + 1));
      } else {
        districtTrait.setBoundary(swim.GeoBox.undefined());
      }
    }
    updateNorthSite(nodeModel, t, dt) {
      const entityTrait = nodeModel.getTrait(swim.EntityTrait);
      //console.log("CellularSiteGroup.updateNorthSite " + entityTrait.uri);
      this.updateDemoSite(nodeModel);

      const subdistricts = nodeModel.getChildModel("subdistricts");
      const sector1Model = subdistricts.getChildModel(entityTrait.uri + "/sector/1");
      const sector2Model = subdistricts.getChildModel(entityTrait.uri + "/sector/2");
      const sector3Model = subdistricts.getChildModel(entityTrait.uri + "/sector/3");

      const {lng, lat} = nodeModel.getTrait(swim.LocationTrait).geographic.geometry;
      const siteRotation = -115;
      if (t !== void 0) { // animate
        this.updateNorthSiteSector1(sector1Model, lng, lat, siteRotation, t, dt);
      } else {
        t = performance.now();
        dt = 0;
        this.updateNorthSiteSector1(sector1Model, lng, lat, siteRotation, t, dt);
        this.updateNorthSiteSector2(sector2Model, lng, lat, siteRotation, t, dt);
        this.updateNorthSiteSector3(sector3Model, lng, lat, siteRotation, t, dt);
      }
    }
    updateNorthSiteSector1(sectorModel, lng, lat, siteRotation, t, dt) {
      const unfocusRadialOffset = 0.004;
      const unfocusBeamLength = 0.004;
      const unfocusBeamWidth = 0.002;

      const focusRadialOffset = 0.002;
      const focusBeamLength = 0.002;
      const focusBeamWidth = 0.001;

      const u = this.beamPhase(t);
      const v = this.beamPhase(t - dt);
      const locationTrait = sectorModel.getTrait(swim.LocationTrait);
      const radialOffset = focusRadialOffset * u + unfocusRadialOffset * (1 - u);
      const beamLength = focusBeamLength * u + unfocusBeamLength * (1 - u);
      const beamWidth = focusBeamWidth * u + unfocusBeamWidth * (1 - u);
      locationTrait.setGeographic(this.createCoverageEllipse(lng, lat, siteRotation, radialOffset, beamLength, beamWidth));

      const statusTrait = sectorModel.getTrait(swim.StatusTrait);
      if (u === 0 && v !== 0 || dt === 0) {
        statusTrait.setStatusFactor("coverage", swim.StatusFactor.create("Coverage", swim.StatusVector.of([swim.Status.warning, 1])));
      } else if (u === 1 && v !== 1) {
        statusTrait.setStatusFactor("coverage", null);
      }
    }
    updateNorthSiteSector2(sectorModel, lng, lat, siteRotation, t, dt) {
      const locationTrait = sectorModel.getTrait(swim.LocationTrait);
      const radialOffset = 0.004;
      const beamLength = 0.004;
      const beamWidth = 0.002;
      locationTrait.setGeographic(this.createCoverageEllipse(lng, lat, siteRotation + 120, radialOffset, beamLength, beamWidth));
    }
    updateNorthSiteSector3(sectorModel, lng, lat, siteRotation, t, dt) {
      const locationTrait = sectorModel.getTrait(swim.LocationTrait);
      const radialOffset = 0.004;
      const beamLength = 0.004;
      const beamWidth = 0.0025;
      locationTrait.setGeographic(this.createCoverageEllipse(lng, lat, siteRotation + 240, radialOffset, beamLength, beamWidth));
    }
    updateEastSite(nodeModel, t, dt) {
      const entityTrait = nodeModel.getTrait(swim.EntityTrait);
      //console.log("CellularSiteGroup.updateEastSite " + entityTrait.uri);
      this.updateDemoSite(nodeModel);

      const subdistricts = nodeModel.getChildModel("subdistricts");
      const sector1Model = subdistricts.getChildModel(entityTrait.uri + "/sector/1");
      const sector2Model = subdistricts.getChildModel(entityTrait.uri + "/sector/2");
      const sector3Model = subdistricts.getChildModel(entityTrait.uri + "/sector/3");
      const sector4Model = subdistricts.getChildModel(entityTrait.uri + "/sector/4");

      const {lng, lat} = nodeModel.getTrait(swim.LocationTrait).geographic.geometry;
      const siteRotation = -182;
      if (t !== void 0) { // animate
        this.updateEastSiteSector1(sector1Model, lng, lat, siteRotation, t, dt);
      } else {
        t = performance.now();
        dt = 0;
        this.updateEastSiteSector1(sector1Model, lng, lat, siteRotation, t, dt);
        this.updateEastSiteSector2(sector2Model, lng, lat, siteRotation, t, dt);
        this.updateEastSiteSector3(sector3Model, lng, lat, siteRotation, t, dt);
      }
    }
    updateEastSiteSector1(sectorModel, lng, lat, siteRotation, t, dt) {
      const unfocusRadialOffset = 0.004;
      const unfocusBeamLength = 0.004;
      const unfocusBeamWidth = 0.002;

      const focusRadialOffset = 0.0025;
      const focusBeamLength = 0.0025;
      const focusBeamWidth = 0.001;

      const u = this.beamPhase(t);
      const v = this.beamPhase(t - dt);
      const locationTrait = sectorModel.getTrait(swim.LocationTrait);
      const radialOffset = focusRadialOffset * u + unfocusRadialOffset * (1 - u);
      const beamLength = focusBeamLength * u + unfocusBeamLength * (1 - u);
      const beamWidth = focusBeamWidth * u + unfocusBeamWidth * (1 - u);
      locationTrait.setGeographic(this.createCoverageEllipse(lng, lat, siteRotation, radialOffset, beamLength, beamWidth));

      const statusTrait = sectorModel.getTrait(swim.StatusTrait);
      if (u === 0 && v !== 0 || dt === 0) {
        statusTrait.setStatusFactor("coverage", swim.StatusFactor.create("Coverage", swim.StatusVector.of([swim.Status.warning, 1])));
      } else if (u === 1 && v !== 1) {
        statusTrait.setStatusFactor("coverage", null);
      }
    }
    updateEastSiteSector2(sectorModel, lng, lat, siteRotation, t, dt) {
      const locationTrait = sectorModel.getTrait(swim.LocationTrait);
      const radialOffset = 0.004;
      const beamLength = 0.004;
      const beamWidth = 0.002;
      locationTrait.setGeographic(this.createCoverageEllipse(lng, lat, siteRotation + 140, radialOffset, beamLength, beamWidth));
    }
    updateEastSiteSector3(sectorModel, lng, lat, siteRotation, t, dt) {
      const locationTrait = sectorModel.getTrait(swim.LocationTrait);
      const radialOffset = 0.004;
      const beamLength = 0.004;
      const beamWidth = 0.002;
      locationTrait.setGeographic(this.createCoverageEllipse(lng, lat, siteRotation + 220, radialOffset, beamLength, beamWidth));
    }
    updateSouthSite(nodeModel, t, dt) {
      const entityTrait = nodeModel.getTrait(swim.EntityTrait);
      //console.log("CellularSiteGroup.updateSouthSite " + entityTrait.uri);
      this.updateDemoSite(nodeModel);

      const subdistricts = nodeModel.getChildModel("subdistricts");
      const sector1Model = subdistricts.getChildModel(entityTrait.uri + "/sector/1");
      const sector2Model = subdistricts.getChildModel(entityTrait.uri + "/sector/2");
      const sector3Model = subdistricts.getChildModel(entityTrait.uri + "/sector/3");
      const sector4Model = subdistricts.getChildModel(entityTrait.uri + "/sector/4");

      const {lng, lat} = nodeModel.getTrait(swim.LocationTrait).geographic.geometry;
      const siteRotation = 122;
      if (t !== void 0) { // animate
        this.updateSouthSiteSector1(sector1Model, lng, lat, siteRotation, t, dt);
      } else {
        t = performance.now();
        dt = 0;
        this.updateSouthSiteSector1(sector1Model, lng, lat, siteRotation, t, dt);
        this.updateSouthSiteSector2(sector2Model, lng, lat, siteRotation, t, dt);
        this.updateSouthSiteSector3(sector3Model, lng, lat, siteRotation, t, dt);
      }
    }
    updateSouthSiteSector1(sectorModel, lng, lat, siteRotation, t, dt) {
      const unfocusRadialOffset = 0.004;
      const unfocusBeamLength = 0.004;
      const unfocusBeamWidth = 0.002;

      const focusRadialOffset = 0.0025;
      const focusBeamLength = 0.0025;
      const focusBeamWidth = 0.001;

      const u = this.beamPhase(t);
      const v = this.beamPhase(t - dt);
      const locationTrait = sectorModel.getTrait(swim.LocationTrait);
      const radialOffset = focusRadialOffset * u + unfocusRadialOffset * (1 - u);
      const beamLength = focusBeamLength * u + unfocusBeamLength * (1 - u);
      const beamWidth = focusBeamWidth * u + unfocusBeamWidth * (1 - u);
      locationTrait.setGeographic(this.createCoverageEllipse(lng, lat, siteRotation, radialOffset, beamLength, beamWidth));

      const statusTrait = sectorModel.getTrait(swim.StatusTrait);
      if (u === 0 && v !== 0 || dt === 0) {
        statusTrait.setStatusFactor("coverage", swim.StatusFactor.create("Coverage", swim.StatusVector.of([swim.Status.warning, 1])));
      } else if (u === 1 && v !== 1) {
        statusTrait.setStatusFactor("coverage", null);
      }
    }
    updateSouthSiteSector2(sectorModel, lng, lat, siteRotation, t, dt) {
      const locationTrait = sectorModel.getTrait(swim.LocationTrait);
      const radialOffset = 0.004;
      const beamLength = 0.004;
      const beamWidth = 0.002;
      locationTrait.setGeographic(this.createCoverageEllipse(lng, lat, siteRotation + 140, radialOffset, beamLength, beamWidth));
    }
    updateSouthSiteSector3(sectorModel, lng, lat, siteRotation, t, dt) {
      const locationTrait = sectorModel.getTrait(swim.LocationTrait);
      const radialOffset = 0.004;
      const beamLength = 0.004;
      const beamWidth = 0.002;
      locationTrait.setGeographic(this.createCoverageEllipse(lng, lat, siteRotation + 220, radialOffset, beamLength, beamWidth));
    }
    updateWestSite(nodeModel, t, dt) {
      const entityTrait = nodeModel.getTrait(swim.EntityTrait);
      //console.log("CellularSiteGroup.updateWestSite " + entityTrait.uri);
      this.updateDemoSite(nodeModel);

      const subdistricts = nodeModel.getChildModel("subdistricts");
      const sector1Model = subdistricts.getChildModel(entityTrait.uri + "/sector/1");
      const sector2Model = subdistricts.getChildModel(entityTrait.uri + "/sector/2");
      const sector3Model = subdistricts.getChildModel(entityTrait.uri + "/sector/3");
      const sector4Model = subdistricts.getChildModel(entityTrait.uri + "/sector/4");

      const {lng, lat} = nodeModel.getTrait(swim.LocationTrait).geographic.geometry;
      const siteRotation = 17;
      if (t !== void 0) { // animate
        this.updateWestSiteSector1(sector1Model, lng, lat, siteRotation, t, dt);
      } else {
        t = performance.now();
        dt = 0;
        this.updateWestSiteSector1(sector1Model, lng, lat, siteRotation, t, dt);
        this.updateWestSiteSector2(sector2Model, lng, lat, siteRotation, t, dt);
        this.updateWestSiteSector3(sector3Model, lng, lat, siteRotation, t, dt);
      }
    }
    updateWestSiteSector1(sectorModel, lng, lat, siteRotation, t, dt) {
      const unfocusRadialOffset = 0.004;
      const unfocusBeamLength = 0.004;
      const unfocusBeamWidth = 0.002;

      const focusRadialOffset = 0.002;
      const focusBeamLength = 0.002;
      const focusBeamWidth = 0.001;

      const u = this.beamPhase(t);
      const v = this.beamPhase(t - dt);
      const locationTrait = sectorModel.getTrait(swim.LocationTrait);
      const radialOffset = focusRadialOffset * u + unfocusRadialOffset * (1 - u);
      const beamLength = focusBeamLength * u + unfocusBeamLength * (1 - u);
      const beamWidth = focusBeamWidth * u + unfocusBeamWidth * (1 - u);
      locationTrait.setGeographic(this.createCoverageEllipse(lng, lat, siteRotation, radialOffset, beamLength, beamWidth));

      const statusTrait = sectorModel.getTrait(swim.StatusTrait);
      if (u === 0 && v !== 0 || dt === 0) {
        statusTrait.setStatusFactor("coverage", swim.StatusFactor.create("Coverage", swim.StatusVector.of([swim.Status.warning, 1])));
      } else if (u === 1 && v !== 1) {
        statusTrait.setStatusFactor("coverage", null);
      }
    }
    updateWestSiteSector2(sectorModel, lng, lat, siteRotation, t, dt) {
      const locationTrait = sectorModel.getTrait(swim.LocationTrait);
      const radialOffset = 0.004;
      const beamLength = 0.004;
      const beamWidth = 0.0025;
      locationTrait.setGeographic(this.createCoverageEllipse(lng, lat, siteRotation + 120, radialOffset, beamLength, beamWidth));
    }
    updateWestSiteSector3(sectorModel, lng, lat, siteRotation, t, dt) {
      const locationTrait = sectorModel.getTrait(swim.LocationTrait);
      const radialOffset = 0.004;
      const beamLength = 0.004;
      const beamWidth = 0.0025;
      locationTrait.setGeographic(this.createCoverageEllipse(lng, lat, siteRotation + 240, radialOffset, beamLength, beamWidth));
    }

    createCoverageEllipse(lng, lat, r, dr, rx, ry) {
      r = r * Math.PI / 180;
      const cx = lng + dr * Math.cos(r);
      const cy = lat + dr * Math.sin(r);

      const sampleCount = 40;
      const geometry = new Array(sampleCount + 1);
      const da = 2 * Math.PI / sampleCount;
      let a = 0;
      for (let i = 0; i <= sampleCount; i += 1) {
        const ex = rx * Math.cos(a);
        const ey = ry * Math.sin(a);
        const px = ex * Math.cos(r) - ey * Math.sin(r);
        const py = ex * Math.sin(r) + ey * Math.cos(r);
        geometry[i] = new swim.GeoPoint(cx + px, cy + py);
        a += da;
      }

      return swim.GeographicArea.fromInit({
        geometry: geometry,
      });
    }

    beamPhase(t) {
      const cyclePhase = Math.round(t) % BEAM_CYCLE_TIME;
      let phase;
      if (cyclePhase < BEAM_FOCUS_START) {
        phase = 0;
      } else if (cyclePhase < BEAM_FOCUS_END) {
        phase = (cyclePhase - BEAM_FOCUS_START) / (BEAM_FOCUS_END - BEAM_FOCUS_START);
      } else if (cyclePhase < BEAM_UNFOCUS_START) {
        phase = 1;
      } else if (cyclePhase < BEAM_UNFOCUS_END) {
        phase = 1 - (cyclePhase - BEAM_UNFOCUS_START) / (BEAM_UNFOCUS_END - BEAM_UNFOCUS_START);
      } else {
        phase = 0;
      }
      return swim.Easing.quadInOut(phase);
    }

    animateCoverage(t0, t) {
      const dt = t - t0;
      const northSiteModel = this.getChildModel("/site/ABAB");
      if (northSiteModel !== null) {
        this.updateNorthSite(northSiteModel, t, dt);
      }
      const eastSiteModel = this.getChildModel("/site/ABAD");
      if (eastSiteModel !== null) {
        this.updateEastSite(eastSiteModel, t, dt);
      }
      const southSiteModel = this.getChildModel("/site/ABAA");
      if (southSiteModel !== null) {
        this.updateSouthSite(southSiteModel, t, dt);
      }
      const westSiteModel = this.getChildModel("/site/ABAC");
      if (westSiteModel !== null) {
        this.updateWestSite(westSiteModel, t, dt);
      }
      this.coverageFrame = requestAnimationFrame(this.animateCoverage.bind(this, t));
    }

    onStartConsuming() {
      super.onStartConsuming();
      this.coverageFrame = requestAnimationFrame(this.animateCoverage.bind(this, performance.now()));
    }

    onStopConsuming() {
      super.onStopConsuming();
      cancelAnimationFrame(this.coverageFrame);
      this.coverageFrame = void 0;
      this.removeAll();
    }
  }

  class CellularRegionLocation extends swim.DownlinkLocationTrait {
    constructor(nodeUri, laneUri) {
      super();
      this.downlink.nodeUri(nodeUri).laneUri(laneUri);
    }
    downlinkDidSet(value) {
      //console.log("CellularRegionLocation.downlinkDidSet " + this.downlink.nodeUri() + ":", value.toAny());
      const districtTrait = this.getTrait(swim.DistrictTrait);

      const minZoom = value.get("minZoom");
      const maxZoom = value.get("maxZoom");
      if (minZoom.isDefined() || maxZoom.isDefined()) {
        this.setZoomRange(minZoom.numberValue(-Infinity), maxZoom.numberValue(Infinity));
      }

      const minSiteZoom = value.get("minSiteZoom");
      if (minSiteZoom.isDefined()) {
        districtTrait.setZoomRange(minSiteZoom.numberValue(-Infinity), Infinity);
      }

      const type = value.get("type").stringValue(void 0);
      if (type === "Polygon") {
        const geographic = swim.GeographicArea.fromInit({
          geometry: value.get("coordinates").toAny()[0],
        });
        this.setGeographic(geographic);
        districtTrait.setBoundary(geographic.geometry);
      } else if (type === "MultiPolygon") {
        const geographic = swim.GeographicArea.fromInit({
          geometry: value.get("coordinates").toAny()[0],
        });
        this.setGeographic(geographic);
        districtTrait.setBoundary(geographic.geometry);
      } else {
        //const centroid = value.get("centroid");
        //const lng = centroid.getItem(0).numberValue(NaN);
        //const lat = centroid.getItem(1).numberValue(NaN);
        //if (isFinite(lng) && isFinite(lat)) {
        //  const radius = 4;
        //  const geometry = new swim.LocationMarker(lng, lat, radius);
        //  districtTrait.geometry.model.setGeometry(geometry);
        //}
      }
    }
  }

  class CellularStateStatusDownlink extends swim.ValueDownlinkTrait {
    constructor(tableModel, nodeUri, laneUri) {
      super();
      this.tableModel = tableModel;
      this.downlink.nodeUri(nodeUri).laneUri(laneUri);
    }
    downlinkDidSet(value) {
      value.forEach((item) => {
        const key = item.key.stringValue(void 0);
        if (key !== void 0) {
          const rowModel = this.getOrCreateRowModel(key);
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

  class CellularStateAlertsDownlink extends swim.MapDownlinkTrait {

    constructor(tableModel, nodeUri, laneUri) {
      super();
      this.tableModel = tableModel;
      this.downlink.nodeUri(nodeUri).laneUri(laneUri);
    }
    downlinkDidUpdate(key, value) {
      if (key !== void 0) {
        const rowModel = this.getOrCreateRowModel(key.stringValue());
        const valueCell = rowModel.getTrait("value");
        valueCell.content.setState(value.get("severity").numberValue().toFixed(2));
      }
    }
    downlinkDidRemove(key, value) {
      if (key !== void 0) {
        this.tableModel.removeChildModel(key.stringValue());
      }
    }
    updateRowModel(key, value) {
      const rowModel = this.getOrCreateRowModel(key.stringValue());
      const valueCell = rowModel.getTrait("value");
      valueCell.content.setState(value.get("severity").numberValue().toFixed(2));
      return rowModel;
    }
    getOrCreateRowModel(key) {
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

  class CellularStateGroup extends swim.DownlinkNodeGroup {
    constructor(nodeUri, laneUri, metaHostUri) {
      super(metaHostUri);
      this.downlink.nodeUri(nodeUri).laneUri(laneUri);
    }
    initNodeModel(nodeModel) {
      const entityTrait = nodeModel.getTrait(swim.EntityTrait);
      //console.log("CellularStateGroup.initNodeModel " + entityTrait.uri);

      entityTrait.aggregateStatus = function (statusVector) {}; // don't aggregate subentity status

      const statusTrait = nodeModel.getTrait(swim.StatusTrait);
      statusTrait.setStatusFactor("operational", swim.StatusFactor.create("Operational", swim.StatusVector.of([swim.Status.normal, 1])));

      const locationTrait = new CellularRegionLocation(entityTrait.uri, GEOMETRY_URI);
      locationTrait.setZoomRange(-Infinity, MIN_SITE_ZOOM);
      nodeModel.setTrait("location", locationTrait);

      const districtTrait = new swim.DistrictTrait();
      districtTrait.setZoomRange(MIN_SITE_ZOOM, Infinity);
      districtTrait.setBoundary(swim.GeoBox.undefined());
      nodeModel.setTrait("district", districtTrait);

      const subdistricts = new CellularSiteGroup(entityTrait.uri, SITES_URI, this.metaHostUri);
      subdistricts.setTrait("status", new swim.StatusTrait());
      nodeModel.setChildModel("subdistricts", subdistricts);
      entityTrait.subentities.child = false;
      entityTrait.subentities.setModel(subdistricts);

      const widgetGroup = new swim.WidgetGroup();
      entityTrait.setTrait("widgets", widgetGroup);

      const statusWidget = this.createStatusWidget(entityTrait);
      entityTrait.appendChildModel(statusWidget, "status");

      //TODO- Uncomment when the alerts table is fixed
      //const alertsWidget = this.createAlertsWidget(entityTrait);
      //entityTrait.appendChildModel(alertsWidget, "alertsWidget");
    }
    updateNodeModel(nodeModel, value) {
      const entityTrait = nodeModel.getTrait(swim.EntityTrait);

      const statusWidget = entityTrait.getChildModel("status");

      const statusTrait = nodeModel.getTrait(swim.StatusTrait);
      const siteCount = value.get("siteCount").numberValue(0);
      const warnCount = value.get("warnCount").numberValue(0);
      const alertCount = value.get("alertCount").numberValue(0);
      const warnRatio = warnCount / siteCount;
      const alertRatio = alertCount / siteCount;
      if (alertRatio > 0.015) {
        const alert = Math.min((1 / 0.015) * (alertRatio - 0.015), 1);
        statusTrait.setStatusFactor("region", swim.StatusFactor.create("Region", swim.StatusVector.of([swim.Status.alert, alert])));
      } else if (warnRatio > 0.15) {
        const warning = Math.min((1 / 0.15) * (warnRatio - 0.15), 1);
        statusTrait.setStatusFactor("region", swim.StatusFactor.create("Region", swim.StatusVector.of([swim.Status.warning, warning])));
      } else {
        statusTrait.setStatusFactor("region", null);
      }
    }
    createStatusWidget(entityTrait) {
      const widgetModel = new swim.CompoundModel();
      const widgetTrait = new swim.WidgetTrait();
      widgetTrait.setSubtitle(entityTrait.title.toUpperCase());
      widgetModel.setTrait("widget", widgetTrait);
      widgetTrait.setTitle("Status");

      const tableModel = this.createStatusTable(entityTrait);
      widgetModel.appendChildModel(tableModel, "table");

      return widgetModel;
    }
    createStatusTable(entityTrait) {
      const tableModel = new swim.CompoundModel();
      const tableTrait = new swim.TableTrait();
      tableTrait.colSpacing.setState(swim.Length.px(12));
      tableModel.setTrait("table", tableTrait);

      const keyColTrait = new swim.ColTrait();
      keyColTrait.layout.setState({key: "key", grow: 1, textColor: swim.Look.mutedColor});
      tableModel.setTrait("key", keyColTrait);

      const valueColTrait = new swim.ColTrait();
      valueColTrait.layout.setState({key: "value", grow: 1});
      tableModel.setTrait("value", valueColTrait);

      const downlinkTrait = new CellularStateStatusDownlink(tableModel, entityTrait.uri, STATUS_URI);
      downlinkTrait.driver.setTrait(tableTrait);
      tableModel.setTrait("downlink", downlinkTrait);

      return tableModel;
    }
    createAlertsWidget(entityTrait) {
      const widgetModel = new swim.CompoundModel();
      const widgetTrait = new swim.WidgetTrait();
      widgetTrait.setTitle("Key Events");
      widgetTrait.setSubtitle(entityTrait.title.toUpperCase());
      widgetModel.setTrait("widget", widgetTrait);

      const tableModel = this.createAlertsTable(entityTrait);
      widgetModel.appendChildModel(tableModel, "table");

      return widgetModel;
    }
    createAlertsTable(entityTrait) {
      const tableModel = new swim.CompoundModel();
      const tableTrait = new swim.TableTrait();
      tableTrait.colSpacing.setState(swim.Length.px(12));
      tableModel.setTrait("table", tableTrait);

      const keyColTrait = new swim.ColTrait();
      tableModel.setTrait("keyCol", keyColTrait);
      keyColTrait.layout.setState({key: "keyCol", grow: 1, textColor: swim.Look.accentColor});

      const valColTrait = new swim.ColTrait();
      tableModel.setTrait("valCol", valColTrait);
      valColTrait.layout.setState({key: "valCol", grow:1, textColor: swim.Look.mutedColor});

      const downlinkTrait = new CellularStateAlertsDownlink(tableModel, entityTrait.uri, ALERTS_URI);
      downlinkTrait.driver.setTrait(tableTrait);
      tableModel.setTrait("downlink", downlinkTrait);

      return tableModel;
    }
    onStopConsuming() {
      super.onStopConsuming();
      this.removeAll();
    }
  }

  class CellularPlugin extends swim.EntityPlugin {
    injectEntity(entityModel, domainModel) {
      const entityTrait = domainModel.getTrait(swim.EntityTrait);
      const domainUri = entityTrait.uri.toString();
      const entityUri = entityModel.uri.toString();
      //console.log("CellularPlugin.injectEntity " + domainUri + ", " + entityUri + ":", entityModel);

      if (entityUri === "warp://localhost:9003") {
        entityTrait.setTitle("Cellular");
        entityTrait.setIcon(cellTowerIcon);

        entityModel.setTrait("status", new swim.StatusTrait());
        entityModel.setTrait("indicated", new swim.IndicatedTrait());

        const districtTrait = new swim.DistrictTrait();
        districtTrait.setZoomRange(-Infinity, Infinity);
        entityModel.setTrait("district", districtTrait);

        const subdistricts = new CellularStateGroup(COUNTRY_URI, SUB_REGIONS_URI, this.metaHostUri);
        subdistricts.setTrait("status", new swim.StatusTrait());
        entityModel.setChildModel("subdistricts", subdistricts);

        const mapModel = new swim.CompoundModel();
        const mapEntity = new swim.EntityTrait(swim.Uri.parse("/map"));
        mapModel.setTrait("entity", mapEntity);
        mapEntity.setTitle("Map");
        const mapSubentities = new CellularStateGroup(COUNTRY_URI, SUB_REGIONS_URI, this.metaHostUri);
        mapSubentities.setTrait("status", new swim.StatusTrait());
        mapEntity.subentities.setModel(mapSubentities);
        mapEntity.subentities.injectModel();
        mapModel.setTrait("status", new swim.StatusTrait());
        mapModel.setTrait("indicated", new swim.IndicatedTrait());
        entityModel.subentities.model.prependChildModel(mapModel);

      }
    }
  }
  swim.PrismManager.insertPlugin(new CellularPlugin());
})();
