package swim.cellular.agent;

import swim.api.SwimLane;
import swim.api.agent.AbstractAgent;
import swim.api.lane.ValueLane;
import swim.cellular.edx.EDXApi;
import swim.concurrent.TimerRef;
import swim.structure.Record;
import swim.structure.Value;

/**
 * A specialization of a cell site that is intended to simulate the behavior
 * of an eNodeB.
 */
public class ENodeBSimAgent extends AbstractAgent {

  /**
   * Handle to the timer that drives the simulation.
   */
  TimerRef simTicker;

  /**
   * Cell site status lane updated by the simulation, shared with the cell site
   * and eNodeB agents running in the same Swim Node as this sim agent.
   */
  @SwimLane("status")
  ValueLane<Value> status;

  /**
   * Latest RAN data for a cell site updated by the simulation, shared
   * with the cell site and eNodeB agents running in the same Swim Node as
   * this sim agent.
   */
  @SwimLane("ranLatest")
  ValueLane<Value> ranLatest;


  /**
   * Runs a single step of the eNodeB simulation.
   */
  void onSimTick() {
    //System.out.println(nodeUri() + " onSimTick");

    // Reschedule the simulation timer to execute again at a random time
    // between 0 and 60 seconds from now.
    this.simTicker.reschedule(Math.round(30000L * Math.random()));


    // Generate a random mean ul sinr value between 0 and 40.
    final int meanUlSinr = (int) Math.round(Math.random() * 40);

    // Generate a random rrc re-establishment failure count between 1 and 9.
    final long rrcReestablishmentFailures = (long) (1 + Math.random() * 9);

    // Generate a random #ues and throughput
    final double aveThroughputPerUser = Math.round(Math.random() * 4 * 100.0) / 100.0;
    long numUEs = 500;
    if (aveThroughputPerUser > 3.5) {
      numUEs = numUEs + Math.round(Math.random() * 499);
    } else if (aveThroughputPerUser > 3 && aveThroughputPerUser <= 3.5) {
      numUEs = numUEs + Math.round(Math.random() * 750);
    } else if (aveThroughputPerUser > 2.5 && aveThroughputPerUser <= 3) {
      numUEs = numUEs + Math.round(Math.random() * 1000);
    } else if (aveThroughputPerUser > 2 && aveThroughputPerUser <= 2.5) {
      numUEs = numUEs + Math.round(Math.random() * 1250);
    } else if (aveThroughputPerUser > 1.5 && aveThroughputPerUser <= 2) {
      numUEs = numUEs + Math.round(Math.random() * 1500);
    } else if (aveThroughputPerUser > 1 && aveThroughputPerUser <= 1.5) {
      numUEs = numUEs + Math.round(Math.random() * 1750);
    } else if (aveThroughputPerUser <= 1) {
      numUEs = numUEs + Math.round(Math.random() * 2000);
    }


    // Generate a random alert category with a 10% chance of a warning,
    // and a 1% chance of an alert.
    final int category = Math.random() < 0.1 ? Math.random() < 0.1 ? 2 : 1 : 0;
    // Add some fuziness to the alert category to get a continuous severity
    // value between 0 and 2.  A value of 0 represents no alert or warning.
    // The interval (0, 1] represents a warning.  And the interval (1, 2]
    // represents an alert.
    final double severity = category == 0 ? 0.0 : (category - 1) + Math.random();

    // Update this eNodeB's status with the newly computed alert severity.
    final Value oldStatus = this.status.get();
    final Value newStatus = oldStatus.updated("severity", severity).updated("aveThroughputPerUser", aveThroughputPerUser);
    this.status.set(newStatus);

    // Update this eNodeB's ranLatest lane with the simulated data.
    final Value oldRanLatest = this.ranLatest.get();
    final Value newRanLatest = oldRanLatest
        .updated("mean_ul_sinr", meanUlSinr)
        .updated("rrc_re_establishment_failures", rrcReestablishmentFailures)
        .updated("numUEs", numUEs)
        .updated("aveThroughputPerUser", aveThroughputPerUser)
        .updated("recorded_time", System.currentTimeMillis());
    this.ranLatest.set(newRanLatest);
    trace(Record.of("simulated RAN sample", newRanLatest));

  }

  /**
   * Invoked when the SwimOS Kernel begins executing this Web Agent process.
   */
  @Override
  public void didStart() {
    //System.out.println(nodeUri() + " didStart");

    // Immediately run a simulation tick.
    this.simTicker = setTimer(0, this::onSimTick);
  }

}
