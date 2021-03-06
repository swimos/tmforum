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

package swim.traffic.agent;

import swim.api.SwimLane;
import swim.api.agent.AbstractAgent;
import swim.api.lane.MapLane;
import swim.structure.Value;
import swim.uri.Uri;

public class CountryAgent extends AbstractAgent {


  @SwimLane("cities")
  public MapLane<Uri, Uri> cities = this.<Uri, Uri>mapLane().didUpdate((key, newValue, oldValue) -> {
    command(newValue.toString(), "wake", Value.absent());
  });

  public void didStart() {
    System.out.println(nodeUri() + " didStart");
    this.cities.put(Uri.parse("/city/PaloAlto_CA_US"), Uri.parse("/city/PaloAlto_CA_US"));
  }


}
