package caensup.eadl.urbanhub.repository;

import caensup.eadl.urbanhub.entity.Measure;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface MeasureRepository extends JpaRepository<Measure, UUID> {

    @Override
    @EntityGraph(attributePaths = { "sensor", "sensor.zone", "sensor.sensorType" })
    List<Measure> findAll();

    /**
     * Finds measures associated with a sensor via its functional identifier.
     */
    @EntityGraph(attributePaths = { "sensor", "sensor.zone", "sensor.sensorType" })
    List<Measure> findBySensor_SensorId(String sensorId);

    /**
     * Finds measures whose timestamp falls within [from, to].
     */
    @EntityGraph(attributePaths = { "sensor", "sensor.zone", "sensor.sensorType" })
    @Query("SELECT m FROM Measure m WHERE m.id.timestamp >= :from AND m.id.timestamp <= :to")
    List<Measure> findBetween(@Param("from") OffsetDateTime from, @Param("to") OffsetDateTime to);
}
