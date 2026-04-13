package caensup.eadl.urbanhub.controller;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import caensup.eadl.urbanhub.dto.MesureDto;
import caensup.eadl.urbanhub.service.MesureService;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class MesureControllerTest {

    @Mock
    private MesureService mesureService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new MesureController(mesureService))
                .setMessageConverters(new MappingJackson2HttpMessageConverter())
                .build();
    }

    @Test
    void getMesuresShouldReturnMesureList() throws Exception {
        MesureDto dto = buildDto();
        when(mesureService.getMesures(null)).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/mesures"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].uuid").value(dto.uuid().toString()))
                .andExpect(jsonPath("$[0].mesureId").value("MES-001"))
                .andExpect(jsonPath("$[0].capteurId").value("CAP-001"));

        verify(mesureService).getMesures(null);
    }

    @Test
    void getMesuresShouldForwardCapteurIdFilter() throws Exception {
        MesureDto dto = buildDto();
        when(mesureService.getMesures("CAP-001")).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/mesures").param("capteur_id", "CAP-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].capteurId").value("CAP-001"));

        verify(mesureService).getMesures("CAP-001");
    }

    @Test
    void getMesureByUuidShouldReturnMesure() throws Exception {
        MesureDto dto = buildDto();
        when(mesureService.getMesureByUuid(dto.uuid())).thenReturn(dto);

        mockMvc.perform(get("/api/mesures/{uuid}", dto.uuid()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.uuid").value(dto.uuid().toString()))
                .andExpect(jsonPath("$.zoneId").value("ZONE-001"))
                .andExpect(jsonPath("$.typeCapteurId").value("TYPE-001"));

        verify(mesureService).getMesureByUuid(dto.uuid());
    }

    private MesureDto buildDto() {
        return new MesureDto(
                UUID.fromString("11111111-1111-1111-1111-111111111111"),
                "MES-001",
                OffsetDateTime.parse("2026-04-13T10:15:30+02:00"),
                42.5f,
                "ppm",
                "CAP-001",
                49.1829,
                -0.3707,
                true,
                "ZONE-001",
                "TYPE-001"
        );
    }
}
