package swim.cellular.agent;

import swim.api.SwimLane;
import swim.api.agent.AbstractAgent;
import swim.api.http.HttpLane;
import swim.api.lane.MapLane;
import swim.api.lane.ValueLane;
import swim.cellular.edx.EDXApi;
import swim.codec.Output;
import swim.http.HttpChunked;
import swim.http.HttpEntity;
import swim.http.HttpRequest;
import swim.http.HttpResponse;
import swim.http.HttpStatus;
import swim.http.MediaType;
import swim.json.Json;
import swim.observable.function.DidSet;
import swim.structure.Item;
import swim.structure.Value;

import java.util.Iterator;

/**
 * A specialization of a cell site that represents an eNodeB.  This agent is
 * intended to implement logic and analytics that apply to eNodeBs, but not to
 * other types of cell sites.
 */
public class ENodeBAgent extends AbstractAgent {

  /**
   * Infrequently changing information about the eNodeB, shared with the
   * cell site agent running in the same Swim Node as this eNodeB agent.
   */
  @SwimLane("info")
  ValueLane<Value>  info;


  @SwimLane("rsrps")
  ValueLane<Value> rsrps;

  /**
   * Frequently changing status information about the eNodeB, shared with the
   * cell site agent running in the same Swim Node as this eNodeB agent.
   */
  @SwimLane("status")
  ValueLane<Value> status;

  /**
   * Computed kpis from RAN data for this cell site.
   */
  @SwimLane("kpis")
  ValueLane<Value> kpis;

  /**
   * Latest RAN data for this cell site, updated by a simulator or other
   * driver agent running in the same Swim Node as this eNodeB agent.
   */
  @SwimLane("ranLatest")
  ValueLane<Value> ranLatest = this.<Value>valueLane()
      .didSet(this::didSetRanLatest);

  /**
   * Rolling time series of historical ran samples.
   */
  @SwimLane("ranHistory")
  MapLane<Long, Value> ranHistory = this.<Long, Value>mapLane()
      .didUpdate(this::didUpdateRanHistory);

  @SwimLane("summary")
  HttpLane<Value> summary = this.<Value>httpLane()
      .doRespond(this::onRequestSummary);

  /**
   * REST endpoint that exposes ENodeB summary information.
   */
  HttpResponse<?> onRequestSummary(HttpRequest<Value> request) {
    // Compute the repsonse payload.
    final Value payload = this.status.get().concat(this.kpis.get());
    // Construct the response entity by incrementally serializing and encoding
    // the response payload as JSON.
    final HttpEntity<?> entity = HttpChunked.from(Json.write(payload, Output.full()),
                                                  MediaType.applicationJson());
    // Return the HTTP response.
    return HttpResponse.from(HttpStatus.OK).content(entity);
  }

  /**
   * Invoked when new ran data is received.
   */
  void didSetRanLatest(Value newSample, Value oldSample) {
    // Extract the recorded timestamp from the RAN sample.
    final long timestamp = newSample.get("recorded_time").longValue();
    // Record this sample in the RAN history lane.
    this.ranHistory.put(timestamp, newSample);
    // Update RAN KPIs to account for the newly received sample.
    updateKpis(newSample);
    if (!this.rsrps.get().isDefined()) {
      getRsps(info.get().get("Latitude").doubleValue(), info.get().get("Longitude").doubleValue());
    }
  }

  private void getRsps(double latitude, double longitude) {
    asyncStage().execute(() -> {
      final Value response = EDXApi.pointStudy(latitude, longitude);
      final Value results = response.get("results");
      rsrps.set(results);
      Iterator<Item> iterator = results.iterator();
      int i = 0;
      while (iterator.hasNext()) {
        Item item = iterator.next();
        kpis.set(kpis.get().updatedSlot("rsrp" + i, item.get("value").doubleValue()));
        i += 1;
      }
    });
  }

  /**
   * Invoked when a new sample is added to the RAN history lane.
   */
  void didUpdateRanHistory(Long timestamp, Value newSample, Value oldSample) {
    // Check if the size of the RAN history lane exceeds 10 samples,
    // and drop the oldest excess samples.
    final int dropCount = this.ranHistory.size() - 10;
    if (dropCount > 0) {
      this.ranHistory.drop(dropCount);
    }
  }

  /**
   * Updates RAN KPIs with a newly received RAN sample.
   */
  void updateKpis(Value newSample) {
    final Value oldKpis = this.kpis.get();
    // Get the previous number of RAN samples received, initializing to 0.
    final int oldCount = oldKpis.get("count").intValue(0);

    // Compute running avergae of mean ul sinr;
    // newAvg = ((oldAvg * oldCount) + newValue) / (oldCount + 1)
    final int newMeanUlSinr = newSample.get("mean_ul_sinr").intValue(0);

    // Accumulate rrc re-establishment failures.
    final long newRrcReEstablishmentFailures = newSample.get("rrc_re_establishment_failures").longValue(0);

    // Update the kpis lane with the computed values.
    final Value newKpis = oldKpis
        .updated("severity", Math.round(status.get().get("severity").doubleValue(0.0)))
        .updated("mean_ul_sinr", Math.round(newMeanUlSinr))
        .updated("rrc_re_establishment_failures", newRrcReEstablishmentFailures)
        .updated("numUEs", newSample.get("numUEs").longValue())
        .updated("aveThroughputPerUser", newSample.get("aveThroughputPerUser").doubleValue())
        .updated("count", oldCount + 1);
    this.kpis.set(newKpis);
  }

}
