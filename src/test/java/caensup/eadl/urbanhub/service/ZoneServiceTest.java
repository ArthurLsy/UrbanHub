package caensup.eadl.urbanhub.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import caensup.eadl.urbanhub.dto.ZoneDto;
import caensup.eadl.urbanhub.entity.Zone;
import caensup.eadl.urbanhub.ingest.exception.ZoneNotFoundException;
import caensup.eadl.urbanhub.repository.ZoneRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ZoneServiceTest {

    @Mock
    private ZoneRepository zoneRepository;

    private ZoneService zoneService;

    @BeforeEach
    void setUp() {
        zoneService = new ZoneService(zoneRepository);
    }

    @Test
    @DisplayName("getAll retourne toutes les zones")
    void getAllShouldReturnAllZones() {
        when(zoneRepository.findAll()).thenReturn(List.of(buildZone("CENTRE"), buildZone("NORD")));

        List<ZoneDto> result = zoneService.getAll();

        assertEquals(2, result.size());
        assertEquals("CENTRE", result.get(0).zoneId());
        verify(zoneRepository).findAll();
    }

    @Test
    @DisplayName("getById retourne la zone correspondante")
    void getByIdShouldReturnZone() {
        when(zoneRepository.findByZoneId("CENTRE")).thenReturn(Optional.of(buildZone("CENTRE")));

        ZoneDto result = zoneService.getById("CENTRE");

        assertEquals("CENTRE", result.zoneId());
        verify(zoneRepository).findByZoneId("CENTRE");
    }

    @Test
    @DisplayName("getById lève ZoneNotFoundException si la zone est introuvable")
    void getByIdShouldThrowNotFoundWhenZoneDoesNotExist() {
        when(zoneRepository.findByZoneId("UNKNOWN")).thenReturn(Optional.empty());

        assertThrows(ZoneNotFoundException.class, () -> zoneService.getById("UNKNOWN"));
    }

    @Test
    @DisplayName("getCount retourne le nombre total de zones")
    void getCountShouldReturnRepositoryCount() {
        when(zoneRepository.count()).thenReturn(5L);

        long result = zoneService.getCount();

        assertEquals(5L, result);
        verify(zoneRepository).count();
    }

    private Zone buildZone(String zoneId) {
        Zone zone = new Zone();
        zone.setUuid(UUID.randomUUID());
        zone.setZoneId(zoneId);
        return zone;
    }
}
