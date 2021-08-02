(function () {
  const COUNTRY_URI = swim.Uri.parse("/country/US");

  const SUB_REGIONS_URI = swim.Uri.parse("subRegions");

  const SITES_URI = swim.Uri.parse("sites");

  const GEOMETRY_URI = swim.Uri.parse("geometry");

  const MIN_SITE_ZOOM = 8;

  const cellTowerIcon = swim.VectorIcon.create(24, 24, "M15.4,14.1L15.4,14.1L15.4,14.1L12.7,4L11.3,4L8.6,14.1L7,20L9.1,20L12,17.3L14.9,20L17,20L15.4,14.1ZM9.9,15.3L10.9,16.3L9.1,18.1L9.9,15.3ZM14.2,15.3L14.9,18.1L13.1,16.3L14.2,15.3ZM10.3,13.7L11,10.9L13,10.9L13.8,13.7L12,15.3L10.3,13.7Z");
  const cellTowerIconSize = 24;

  const subscriberIcon = swim.VectorIcon.create(24, 24, "M15,4C16.1,4,17,4.9,17,6L17,18C17,19.1,16.1,20,15,20L9,20C7.9,20,7,19.1,7,18L7,6C7,4.9,7.9,4,9,4L15,4ZM12,17.5C11.4,17.5,11,17.9,11,18.5C11,19.1,11.4,19.5,12,19.5C12.6,19.5,13,19.1,13,18.5C13,17.9,12.6,17.5,12,17.5ZM15,7L9,7L9,17L15,17L15,7ZM13.5,5L10.5,5C10.2,5,10,5.2,10,5.5C10,5.7,10.2,5.9,10.4,6L10.5,6L13.5,6C13.8,6,14,5.8,14,5.5C14,5.3,13.8,5.1,13.6,5L13.5,5Z");
  const subscriberIconSize = 24;

  class CellularSiteGroup extends swim.DownlinkNodeGroup {
    constructor(nodeUri, laneUri, metaHostUri) {
      super(metaHostUri);
      this.downlink.nodeUri(nodeUri).laneUri(laneUri);
    }
    initNodeModel(nodeModel) {
      const entityTrait = nodeModel.getTrait(swim.EntityTrait);
      //console.log("CellularSiteGroup.initNodeModel " + entityTrait.uri);
      entityTrait.setIcon(cellTowerIcon);

      const statusTrait = nodeModel.getTrait(swim.StatusTrait);
      statusTrait.setStatusFactor("operational", swim.StatusFactor.create("Operational", swim.StatusVector.of([swim.Status.normal, 1])));

      const locationTrait = new swim.LocationTrait();
      nodeModel.setTrait("location", locationTrait);
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

      const statusTrait = nodeModel.getTrait(swim.StatusTrait);
      const severity = value.get("severity").numberValue(0);
      if (severity > 1) {
        statusTrait.setStatusFactor("site", swim.StatusFactor.create("Site", swim.StatusVector.of([swim.Status.alert, severity - 1])));
      } else if (severity > 0) {
        statusTrait.setStatusFactor("site", swim.StatusFactor.create("Site", swim.StatusVector.of([swim.Status.warning, severity])));
      } else {
        statusTrait.setStatusFactor("site", null);
      }
    }
    onStopConsuming() {
      super.onStopConsuming();
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
    }
    updateNodeModel(nodeModel, value) {
      //const entityTrait = nodeModel.getTrait(swim.EntityTrait);
      //console.log("CellularStateGroup.updateNodeModel " + entityTrait.uri + ":", value.toAny());

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

        const backhaulModel = new swim.CompoundModel();
        const backhaulEntity = new swim.EntityTrait(swim.Uri.parse("/backhaul"));
        backhaulModel.setTrait("entity", backhaulEntity);
        backhaulEntity.setTitle("Backhaul");
        backhaulEntity.subentities.injectModel();
        backhaulModel.setTrait("status", new swim.StatusTrait());
        backhaulModel.setTrait("indicated", new swim.IndicatedTrait());
        entityModel.subentities.model.prependChildModel(backhaulModel);

        const aggregationPoints = new swim.CompoundModel();
        const aggregationPointsEntity = new swim.EntityTrait(swim.Uri.parse("/backhaul/aggregation"));
        aggregationPoints.setTrait("entity", aggregationPointsEntity);
        aggregationPointsEntity.setTitle("Aggregation Points");
        aggregationPointsEntity.subentities.injectModel();
        aggregationPoints.setTrait("status", new swim.StatusTrait());
        aggregationPoints.setTrait("indicated", new swim.IndicatedTrait());
        backhaulEntity.subentities.model.appendChildModel(aggregationPoints);
      }
    }
  }
  swim.PrismManager.insertPlugin(new CellularPlugin());
})();
