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

package swim.transit.agent;

import swim.api.SwimLane;
import swim.api.SwimTransient;
import swim.api.agent.AbstractAgent;
import swim.api.lane.CommandLane;
import swim.api.lane.MapLane;
import swim.api.lane.ValueLane;
import swim.concurrent.AbstractTask;
import swim.concurrent.TaskRef;
import swim.concurrent.TimerRef;
import swim.structure.Item;
import swim.structure.Value;
import swim.transit.NextBusHttpAPI;
import swim.transit.edx.EDXApi;
import swim.transit.model.Agency;
import swim.transit.model.Vehicle;
import swim.transit.model.Vehicles;

import java.util.Iterator;

public class VehicleAgent extends AbstractAgent {
  private long lastReportedTime = 0L;

  @SwimLane("vehicle")
  public ValueLane<Vehicle> vehicle;

  @SwimLane("speeds")
  public MapLane<Long, Integer> speeds;

  @SwimLane("rsrps")
  public MapLane<Long, Float> rsrps;

  @SwimLane("addVehicle")
  public CommandLane<Vehicle> addVehicle = this.<Vehicle>commandLane().onCommand(this::onVehicle);

  private void onVehicle(Vehicle v) {
    final long time = System.currentTimeMillis() - (v.getSecsSinceReport() * 1000L);
    final float oldLat = this.vehicle.get() != null ? this.vehicle.get().getLatitude() : 0.0f;
    final float oldLng = this.vehicle.get() != null ? this.vehicle.get().getLongitude() : 0.0f;

    speeds.put(time, v.getSpeed());
    if (speeds.size() > 10) {
      speeds.drop(speeds.size() - 10);
    }
    final float rsrp0 = vehicle.get() != null ? this.vehicle.get().getRsrp0() : 0.0f;
    final float rsrp1 = vehicle.get() != null ? this.vehicle.get().getRsrp1() : 0.0f;
    final float rsrp2 = vehicle.get() != null ? this.vehicle.get().getRsrp2() : 0.0f;
    this.vehicle.set(v.withRsrp0(rsrp0).withRsrp1(rsrp1).withRsrp2(rsrp2));


    if (Float.compare(oldLat, v.getLatitude()) != 0 || Float.compare(oldLng, v.getLongitude()) != 0) {
      getRsps(v.getLatitude(), v.getLongitude());
    }

    lastReportedTime = time;
  }

  private TaskRef pollRsrp;

  private TimerRef timer;

  private void getRsps(double latitude, double longitude) {
    abortPoll();
    this.pollRsrp = asyncStage().task(new AbstractTask() {

      @Override
      public void runTask() {
        final Value response = EDXApi.pointStudy(latitude, longitude);
        final Value results = response.get("results");
        Iterator<Item> iterator = results.iterator();
        int i = 0;
        Vehicle info = vehicle.get();
        float rsrp0 = 0.0f;
        while (iterator.hasNext()) {
          Item item = iterator.next();
          if (i == 0) {
            rsrp0 = item.get("value").floatValue();
            info = info.withRsrp0(rsrp0);
          } else if (i == 1) {
            info = info.withRsrp1(item.get("value").floatValue());
          } else if (i == 2) {
            info = info.withRsrp2(item.get("value").floatValue());
          }
          i += 1;
        }
        vehicle.set(info);
        final long now = System.currentTimeMillis();
        rsrps.put(now, rsrp0);
        if (rsrps.size() > 10) {
          rsrps.drop(rsrps.size() - 10);
        }
      }

      @Override
      public boolean taskWillBlock() {
        return true;
      }
    });

    // Define timer to periodically reschedule task
    if (this.pollRsrp != null) {
      this.timer = setTimer(1000, () -> {
        this.pollRsrp.cue();
      });
    }
  }

  private void abortPoll() {
    if (this.pollRsrp != null) {
      this.pollRsrp.cancel();
      this.pollRsrp = null;
    }
    if (this.timer != null) {
      this.timer.cancel();
      this.timer = null;
    }
  }

  @Override
  public void didStart() {
    abortPoll();
    //System.out.println("Started Agent: " + nodeUri().toString());
  }
}
