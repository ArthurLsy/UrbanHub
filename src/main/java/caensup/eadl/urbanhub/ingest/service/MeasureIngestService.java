package caensup.eadl.urbanhub.ingest.service;

import caensup.eadl.urbanhub.ingest.api.dto.IngestMeasureJson;

public interface MeasureIngestService {

    void ingestMeasure(IngestMeasureJson json);

}