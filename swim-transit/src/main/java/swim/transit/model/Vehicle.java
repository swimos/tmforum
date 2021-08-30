// Copyright 2015-2019 SWIM.AI inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package swim.transit.model;

import java.util.Objects;
import swim.structure.Form;
import swim.structure.Kind;
import swim.structure.Tag;
import swim.structure.Value;

@Tag("vehicle")
public class Vehicle {

  private String id = "";
  private String uri = "";
  private String agency = "";
  private String routeTag = "";
  private String dirId = "";
  private float latitude = 0.0f;
  private float longitude = 0.0f;
  private int speed = 0;
  private int secsSinceReport = -1;
  private int index = 0;
  private String heading = "";
  private String routeTitle = "";
  private float rsrp0 = 0.0f;
  private float rsrp1 = 0.0f;
  private float rsrp2 = 0.0f;

  public Vehicle() {
  }

  public Vehicle(String id, String uri, String agency, String routeTag, String dirId, float latitude, float longitude,
                 int speed, int secsSinceReport, int index, String heading, String routeTitle,
                 float rsrp0, float rsrp1, float rsrp2) {
    this.id = id;
    this.uri = uri;
    this.agency = agency;
    this.routeTag = routeTag;
    this.dirId = dirId;
    this.latitude = latitude;
    this.longitude = longitude;
    this.speed = speed;
    this.secsSinceReport = secsSinceReport;
    this.index = index;
    this.heading = heading;
    this.routeTitle = routeTitle;
    this.rsrp0 = rsrp0;
    this.rsrp1 = rsrp1;
    this.rsrp2 = rsrp2;
  }

  public String getId() {
    return id;
  }

  public Vehicle withId(String id) {
    return new Vehicle(id, uri, agency, routeTag, dirId, latitude, longitude, speed, secsSinceReport, index, heading, routeTitle, rsrp0, rsrp1, rsrp2);
  }

  public String getUri() {
    return uri;
  }

  public Vehicle withUri(String uri) {
    return new Vehicle(id, uri, agency, routeTag, dirId, latitude, longitude, speed, secsSinceReport, index, heading, routeTitle, rsrp0, rsrp1, rsrp2);
  }

  public String getAgency() {
    return agency;
  }

  public Vehicle withAgency(String agency) {
    return new Vehicle(id, uri, agency, routeTag, dirId, latitude, longitude, speed, secsSinceReport, index, heading, routeTitle, rsrp0, rsrp1, rsrp2);
  }

  public String getRouteTag() {
    return routeTag;
  }

  public Vehicle withRouteTag(String routeTag) {
    return new Vehicle(id, uri, agency, routeTag, dirId, latitude, longitude, speed, secsSinceReport, index, heading, routeTitle, rsrp0, rsrp1, rsrp2);
  }

  public String getDirId() {
    return dirId;
  }

  public Vehicle withDirId(String dirId) {
    return new Vehicle(id, uri, agency, routeTag, dirId, latitude, longitude, speed, secsSinceReport, index, heading, routeTitle, rsrp0, rsrp1, rsrp2);
  }

  public float getLatitude() {
    return latitude;
  }

  public Vehicle withLatitude(float latitude) {
    return new Vehicle(id, uri, agency, routeTag, dirId, latitude, longitude, speed, secsSinceReport, index, heading, routeTitle, rsrp0, rsrp1, rsrp2);
  }

  public float getLongitude() {
    return longitude;
  }

  public Vehicle withLongitude(float longitude) {
    return new Vehicle(id, uri, agency, routeTag, dirId, latitude, longitude, speed, secsSinceReport, index, heading, routeTitle, rsrp0, rsrp1, rsrp2);
  }

  public int getSpeed() {
    return speed;
  }

  public Vehicle withSpeed(int speed) {
    return new Vehicle(id, uri, agency, routeTag, dirId, latitude, longitude, speed, secsSinceReport, index, heading, routeTitle, rsrp0, rsrp1, rsrp2);
  }

  public int getSecsSinceReport() {
    return secsSinceReport;
  }

  public Vehicle withSecsSinceReport(int secsSinceReport) {
    return new Vehicle(id, uri, agency, routeTag, dirId, latitude, longitude, speed, secsSinceReport, index, heading, routeTitle, rsrp0, rsrp1, rsrp2);
  }

  public int getIndex() {
    return index;
  }

  public Vehicle withIndex(int index) {
    return new Vehicle(id, uri, agency, routeTag, dirId, latitude, longitude, speed, secsSinceReport, index, heading, routeTitle, rsrp0, rsrp1, rsrp2);
  }

  public String getHeading() {
    return heading;
  }

  public Vehicle withHeading(String heading) {
    return new Vehicle(id, uri, agency, routeTag, dirId, latitude, longitude, speed, secsSinceReport, index, heading, routeTitle, rsrp0, rsrp1, rsrp2);
  }

  public String getRouteTitle() {
    return routeTitle;
  }

  public Vehicle withRouteTitle(String routeTitle) {
    return new Vehicle(id, uri, agency, routeTag, dirId, latitude, longitude, speed, secsSinceReport, index, heading, routeTitle, rsrp0, rsrp1, rsrp2);
  }

  public float getRsrp0() {
    return rsrp0;
  }

  public Vehicle withRsrp0(float rsrp0) {
    return new Vehicle(id, uri, agency, routeTag, dirId, latitude, longitude, speed, secsSinceReport, index, heading, routeTitle, rsrp0, rsrp1, rsrp2);
  }

  public float getRsrp1() {
    return rsrp1;
  }

  public Vehicle withRsrp1(float rsrp1) {
    return new Vehicle(id, uri, agency, routeTag, dirId, latitude, longitude, speed, secsSinceReport, index, heading, routeTitle, rsrp0, rsrp1, rsrp2);
  }

  public float getRsrp2() {
    return rsrp2;
  }

  public Vehicle withRsrp2(float rsrp2) {
    return new Vehicle(id, uri, agency, routeTag, dirId, latitude, longitude, speed, secsSinceReport, index, heading, routeTitle, rsrp0, rsrp1, rsrp2);
  }

  @Override
  public boolean equals(Object other) {
    if (this == other) {
      return true;
    } else if (other instanceof Vehicle) {
      final Vehicle that = (Vehicle) other;
      return Float.compare(latitude, that.latitude) == 0
          && Float.compare(longitude, that.longitude) == 0
          && speed == that.speed
          && secsSinceReport == that.secsSinceReport
          && index == that.index
          && Objects.equals(id, that.id)
          && Objects.equals(uri, that.uri)
          && Objects.equals(agency, that.agency)
          && Objects.equals(routeTag, that.routeTag)
          && Objects.equals(dirId, that.dirId)
          && Objects.equals(heading, that.heading)
          && Objects.equals(routeTitle, that.routeTitle);
    }
    return false;
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, uri, agency, routeTag, dirId, latitude, longitude, speed, secsSinceReport, index, heading, routeTitle, rsrp0, rsrp1, rsrp2);
  }

  @Override
  public String toString() {
    return "Vehicle{"
        + "id='" + id + '\''
        + ", uri='" + uri + '\''
        + ", agency='" + agency + '\''
        + ", routeTag='" + routeTag + '\''
        + ", dirId='" + dirId + '\''
        + ", latitude=" + latitude
        + ", longitude=" + longitude
        + ", speed=" + speed
        + ", secsSinceReport=" + secsSinceReport
        + ", index=" + index
        + ", heading=" + heading
        + ", routeTitle =" + routeTitle
        + '}';
  }

  public Value toValue() {
    return Form.forClass(Vehicle.class).mold(this).toValue();
  }

  @Kind
  private static Form<Vehicle> form;
}
