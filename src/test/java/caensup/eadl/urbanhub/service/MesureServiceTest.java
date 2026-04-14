package caensup.eadl.urbanhub.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import caensup.eadl.urbanhub.dto.MesureDto;
import caensup.eadl.urbanhub.entity.Capteur;
import caensup.eadl.urbanhub.entity.Mesure;
import caensup.eadl.urbanhub.entity.TypeCapteur;
import caensup.eadl.urbanhub.entity.Zone;
import caensup.eadl.urbanhub.repository.MesureRepository;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@ExtendWith(MockitoExtension.class)
class MesureServiceTest {

    @Mock
    private MesureRepository mesureRepository;

    private MesureService mesureService;

    @BeforeEach
    void setUp() {
        mesureService = new MesureService(mesureRepository);
    }

    @Test
    void getMesuresShouldReturnAllMesuresWhenNoFilterIsProvided() {
        Mesure mesure = buildMesure();
        when(mesureRepository.findAll()).thenReturn(List.of(mesure));

        List<MesureDto> result = mesureService.getMesures(null);

        assertEquals(1, result.size());
        assertEquals(mesure.getUuid(), result.getFirst().uuid());
        assertEquals("CAP-001", result.getFirst().capteurId());
        verify(mesureRepository).findAll();
    }

    @Test
    void getMesuresShouldFilterByCapteurId() {
        Mesure mesure = buildMesure();
        when(mesureRepository.findByCapteurCapteurId("CAP-001")).thenReturn(List.of(mesure));

        List<MesureDto> result = mesureService.getMesures("CAP-001");

        assertEquals(1, result.size());
        assertEquals("MES-001", result.getFirst().mesureId());
        verify(mesureRepository).findByCapteurCapteurId("CAP-001");
    }

    @Test
    void getMesureByUuidShouldReturnMesure() {
        Mesure mesure = buildMesure();
        when(mesureRepository.findById(mesure.getUuid())).thenReturn(Optional.of(mesure));

        MesureDto result = mesureService.getMesureByUuid(mesure.getUuid());

        assertEquals(mesure.getUuid(), result.uuid());
        assertEquals("ZONE-001", result.zoneId());
        assertEquals("TYPE-001", result.typeCapteurId());
    }

    @Test
    void getMesureByUuidShouldThrowWhenMesureDoesNotExist() {
        UUID uuid = UUID.randomUUID();
        when(mesureRepository.findById(uuid)).thenReturn(Optional.empty());

        ResponseStatusException exception =
                assertThrows(ResponseStatusException.class, () -> mesureService.getMesureByUuid(uuid));

        assertEquals(HttpStatus.NOT_FOUND, exception.getStatusCode());
        verify(mesureRepository).findById(uuid);
    }

    private Mesure buildMesure() {
        Zone zone = new Zone();
        zone.setUuid(UUID.randomUUID());
        zone.setZoneId("ZONE-001");

        TypeCapteur typeCapteur = new TypeCapteur();
        typeCapteur.setUuid(UUID.randomUUID());
        typeCapteur.setTypeCapteurId("TYPE-001");

        Capteur capteur = new Capteur();
        capteur.setUuid(UUID.randomUUID());
        capteur.setCapteurId("CAP-001");
        capteur.setLatitude(49.1829);
        capteur.setLongitude(-0.3707);
        capteur.setStatut(Boolean.TRUE);
        capteur.setZone(zone);
        capteur.setTypeCapteur(typeCapteur);

        Mesure mesure = new Mesure();
        mesure.setUuid(UUID.randomUUID());
        mesure.setMesureId("MES-001");
        mesure.setHorodatage(OffsetDateTime.parse("2026-04-13T10:15:30+02:00"));
        mesure.setValeur(42.5f);
        mesure.setUnite("ppm");
        mesure.setCapteur(capteur);
        return mesure;
    }
}
