package caensup.eadl.urbanhub.repository;

import caensup.eadl.urbanhub.entity.SensorType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SensorTypeRepository extends JpaRepository<SensorType, UUID> {

    /**
     * Finds a sensor type by its business identifier (e.g. "AIR", "NOISE"...).
     */
    Optional<SensorType> findBySensorTypeId(String sensorTypeId);

    /**
     * Types ayant au moins un capteur avec {@code last_update >= cutoff} (ex. activité dans la fenêtre récente).
     */
    @Query("SELECT DISTINCT st FROM SensorType st JOIN st.sensors s WHERE s.lastUpdate >= :cutoff")
    List<SensorType> findDistinctWithSensorActivityOnOrAfter(@Param("cutoff") Instant cutoff);

    /**
     * Types ayant au moins un capteur sans activité récente : {@code last_update} nul ou strictement avant {@code cutoff}.
     */
    @Query("SELECT DISTINCT st FROM SensorType st JOIN st.sensors s WHERE s.lastUpdate IS NULL OR s.lastUpdate < :cutoff")
    List<SensorType> findDistinctWithSensorActivityBeforeOrNull(@Param("cutoff") Instant cutoff);
}
