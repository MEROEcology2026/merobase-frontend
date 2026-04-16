import {
  createContext,
  useContext,
  useState
} from "react";
import { samplesAPI } from "../services/api";
import { generateSampleId } from "../utils/sampleIdGenerator";

const SampleFormContext = createContext(null);

/* ================= INITIAL STRUCTURE ================= */
const initial = {
  metadata: {
    sampleName: "",
    sampleType: "Biological",
    projectType: "A",
    partOfSample: "",
    projectNumber: "",
    sampleNumber: "",
    diveSite: "",
    customDiveSite: "",
    collectorName: "",
    storageLocation: "Cool Room",
    species: "",
    genus: "",
    family: "",
    kingdom: "Undecided",
    collectionDate: "",
    latitude: "",
    longitude: "",
    samplePhoto: null,
    samplePhotoName: ""
  },
  morphology: {
    semPhotos: [],
    microPhotos: [],
    notes: "",
  },
  microbiology: {
    primaryIsolatedRuns: [],
    isolatedMorphologyRuns: [],
    microbiologyTests: {
      antibacterialRuns: [],
      antimalarialRuns: [],
      biochemicalRuns: [],
      enzymaticRuns: [],
      testNotes: "",
      molecularIdentification: {
        hasIdentification: false,
        speciesName: "",
        pcrPlatform: "",
        pcrProtocolType: "",
        sequencingMethod: "",
        bioinformaticsPipeline: "",
        accessionStatus: "Unpublished",
        accessionNumber: "",
        rawSequenceFile: null
      }
    }
  },
  molecular: {
    gelImage: null,
    rawSequenceFiles: [],
    dnaSource: "",
    extractionKit: "",
    extractionMethod: "",
    pcrMethod: "",
    sequencingMethod: "",
    sequencingQuality: "",
    bioinformaticsPipeline: "",
    dnaConcentrationRange: "",
    phylogeneticNotes: "",
    markers: [
      {
        id: crypto.randomUUID(),
        markerGene: "",
        primerForward: "",
        primerReverse: "",
        pcrProtocolType: "",
        accessionStatus: "",
        accessionNumber: ""
      }
    ]
  },
  publication: {
    links: []
  }
};

/* ================= CLEAN MICROBIOLOGY ================= */
// Strips empty runs before submitting to the API
const cleanMicrobiology = (microbiology) => {
  if (!microbiology) return microbiology;

  /* ── Primary Isolated — must have isolatedId ── */
  const primaryIsolatedRuns = (microbiology.primaryIsolatedRuns || [])
    .filter(r => r.isolatedId && r.isolatedId.trim() !== "");

  /* ── Isolated Morphology — must have isoMorId ── */
  const isolatedMorphologyRuns = (microbiology.isolatedMorphologyRuns || [])
    .filter(r => r.isoMorId && r.isoMorId.trim() !== "");

  const tests = microbiology.microbiologyTests || {};

  /* ── Test runs — must have linkedId AND testId ── */
  const antibacterialRuns = (tests.antibacterialRuns || [])
    .filter(r => r.linkedId && r.testId);

  const antimalarialRuns = (tests.antimalarialRuns || [])
    .filter(r => r.linkedId && r.testId);

  const biochemicalRuns = (tests.biochemicalRuns || [])
    .filter(r => r.linkedId && r.testId);

  const enzymaticRuns = (tests.enzymaticRuns || [])
    .filter(r => r.linkedId && r.testId);

  return {
    ...microbiology,
    primaryIsolatedRuns,
    isolatedMorphologyRuns,
    microbiologyTests: {
      ...tests,
      antibacterialRuns,
      antimalarialRuns,
      biochemicalRuns,
      enzymaticRuns,
    }
  };
};

export function SampleFormProvider({ children }) {
  const [mode, setMode] = useState("add");
  const [editingSampleId, setEditingSampleId] = useState(null);

  const [formData, setFormData] = useState(initial);

  /* ================= AUTO GENERATE SAMPLE ID ================= */
  const computedSampleId = generateSampleId(
    formData.metadata?.sampleType,
    formData.metadata?.projectType,
    formData.metadata?.partOfSample,
    formData.metadata?.projectNumber,
    formData.metadata?.sampleNumber
  );

  /* ================= HELPERS ================= */
  const updateSection = (section, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...value
      }
    }));
  };

  const setSection = (section, value) => {
    setFormData(prev => ({ ...prev, [section]: value }));
  };

  /* ================= EDIT MODE ================= */
  const loadSampleForEdit = (sample) => {
    if (!sample?.metadata?.sampleId && !sample?.sample_id) {
      console.error("Invalid sample for edit");
      return;
    }
    setMode("edit");
    setEditingSampleId(sample.metadata?.sampleId || sample.sample_id);
    setFormData(sample);
  };

  const exitEditMode = () => {
    setMode("add");
    setEditingSampleId(null);
  };

  /* ================= CLEAR ================= */
  const clearDraftOnly = () => {
    setFormData(initial);
    setMode("add");
    setEditingSampleId(null);
  };

  /* ================= SUBMIT TO API ================= */
  const submitSample = async () => {
    const { metadata, morphology, microbiology, molecular, publication } = formData;

    const sampleId = computedSampleId || `SAMPLE-${Date.now()}`;

    /* ✅ Clean empty runs before sending */
    const cleanedMicrobiology = cleanMicrobiology(microbiology);

    const payload = {
      sample_id:       sampleId,
      sample_name:     metadata.sampleName,
      sample_type:     metadata.sampleType,
      project_type:    metadata.projectType,
      part_of_sample:  metadata.partOfSample,
      project_number:  metadata.projectNumber,
      sample_number:   metadata.sampleNumber,
      dive_site:       metadata.diveSite,
      collector_name:  metadata.collectorName,
      collection_date: metadata.collectionDate || null,
      latitude:        metadata.latitude || null,
      longitude:       metadata.longitude || null,
      storage_location: metadata.storageLocation,
      kingdom:         metadata.kingdom,
      genus:           metadata.genus,
      family:          metadata.family,
      species:         metadata.species,
      depth:           metadata.depth || null,
      temperature:     metadata.temperature || null,
      substrate:       metadata.substrate,
      sample_length:   metadata.sampleLength || null,
      morphology,
      microbiology:    cleanedMicrobiology,
      molecular,
      publication
    };

    if (mode === "edit") {
      await samplesAPI.update(editingSampleId, payload);
    } else {
      await samplesAPI.create(payload);
    }

    clearDraftOnly();
  };

  /* ================= PROVIDER ================= */
  return (
    <SampleFormContext.Provider
      value={{
        formData,
        setFormData,
        updateSection,
        setSection,
        mode,
        editingSampleId,
        computedSampleId,
        loadSampleForEdit,
        submitSample,
        clearDraftOnly,
        exitEditMode,
        submitSampleToLocalStorage: submitSample,
      }}
    >
      {children}
    </SampleFormContext.Provider>
  );
}

/* ================= HOOK ================= */
export const useSampleFormContext = () => {
  const ctx = useContext(SampleFormContext);
  if (!ctx) {
    throw new Error("useSampleFormContext must be used inside SampleFormProvider");
  }
  return ctx;
};

export const useSampleForm = useSampleFormContext;