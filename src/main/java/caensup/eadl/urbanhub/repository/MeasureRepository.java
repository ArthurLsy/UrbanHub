package caensup.eadl.urbanhub.repository;

import caensup.eadl.urbanhub.entity.Measure;
import java.util.List;
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
}
