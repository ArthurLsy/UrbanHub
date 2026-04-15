package caensup.eadl.urbanhub.repository;

import caensup.eadl.urbanhub.entity.Measure;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface MeasureRepository extends JpaRepository<Measure, UUID> {

    @Override
    @EntityGraph(attributePaths = { "sensor", "sensor.zone", "sensor.sensorType" })
    List<Measure> findAll();

    /**
     * Finds measures associated with a sensor via its functional identifier.
     *
     * @param sensorId functional identifier of the sensor
     * @return the list of found measures
     */
    @EntityGraph(attributePaths = { "sensor", "sensor.zone", "sensor.sensorType" })
    List<Measure> findBySensor_SensorId(String sensorId);

    // New helper query methods for trend calculations

    /**
     * Returns the most recent measure for a sensor.
     */
    @EntityGraph(attributePaths = { "sensor", "sensor.zone", "sensor.sensorType" })
    Optional<Measure> findTopBySensor_SensorIdOrderById_TimestampDesc(String sensorId);

    /**
     * Returns the N most recent measures for a sensor ordered descending by timestamp.
     */
    @EntityGraph(attributePaths = { "sensor", "sensor.zone", "sensor.sensorType" })
    List<Measure> findTop2BySensor_SensorIdOrderById_TimestampDesc(String sensorId);

    /**
     * Returns the latest measure with timestamp <= given timestamp.
     */
    @EntityGraph(attributePaths = { "sensor", "sensor.zone", "sensor.sensorType" })
    Optional<Measure> findTopBySensor_SensorIdAndId_TimestampLessThanEqualOrderById_TimestampDesc(String sensorId, OffsetDateTime ts);

    /**
     * Returns the earliest measure with timestamp >= given timestamp.
     */
    @EntityGraph(attributePaths = { "sensor", "sensor.zone", "sensor.sensorType" })
    Optional<Measure> findTopBySensor_SensorIdAndId_TimestampGreaterThanEqualOrderById_TimestampAsc(String sensorId, OffsetDateTime ts);
}
