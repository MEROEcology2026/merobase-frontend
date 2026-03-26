import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";
import { samplesAPI } from "../services/api";

const SampleFormContext = createContext(null);

/* ================= INITIAL STRUCTURE ================= */
const initial = {
  metadata: {
    sampleId: "",
    sampleName: "",
    sampleType: "Biological",
    projectType: "A",
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
    primaryIsolated: {
      isolatedId: "",
      shelf: "",
      positionInBox: "",
      storageTemperature: "-20°C",
      agarMedia: "",
      solvent: "Aquades",
      incubationTemperature: "",
      incubationTime: "",
      oxygenRequirement: "",
      notes: ""
    },
    isolatedMorphology: {
      macroscopic: { shape: "", arrangement: "", images: [] },
      colonyDescription: {
        shape: "", margin: "", elevation: "",
        color: "", texture: "", motility: ""
      },
      microscopic: { shape: "", arrangement: "", gramReaction: "", images: [] }
    },
    microbiologyTests: {
      antibacterialAssay: {
        pathogen: "", method: "", activityLevel: "", activityNotes: ""
      },
      antimalarialAssay: "",
      biochemicalTests: [],
      enzymaticTests: [],
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

export function SampleFormProvider({ children }) {
  const [mode, setMode] = useState("add");
  const [editingSampleId, setEditingSampleId] = useState(null);

  const [formData, setFormData] = useState(() => {
    try {
      const raw = localStorage.getItem("merobase_draft");
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });

  /* ================= AUTOSAVE ================= */
  useEffect(() => {
    try {
      localStorage.setItem("merobase_draft", JSON.stringify(formData));
    } catch (err) {
      console.warn("Autosave skipped:", err);
    }
  }, [formData]);

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
    if (!sample?.metadata?.sampleId) {
      console.error("Invalid sample for edit");
      return;
    }
    setMode("edit");
    setEditingSampleId(sample.metadata.sampleId);
    setFormData(sample);
  };

  const exitEditMode = () => {
    setMode("add");
    setEditingSampleId(null);
  };

  /* ================= CLEAR ================= */
  const clearDraftOnly = () => {
    localStorage.removeItem("merobase_draft");
    setFormData(initial);
    setMode("add");
    setEditingSampleId(null);
  };

  /* ================= SUBMIT TO API ================= */
  const submitSample = async () => {
    const { metadata, morphology, microbiology, molecular, publication } = formData;

    const payload = {
      sample_id: metadata.sampleId || `SAMPLE-${Date.now()}`,
      sample_name: metadata.sampleName,
      sample_type: metadata.sampleType,
      project_type: metadata.projectType,
      project_number: metadata.projectNumber,
      sample_number: metadata.sampleNumber,
      dive_site: metadata.diveSite,
      collector_name: metadata.collectorName,
      collection_date: metadata.collectionDate || null,
      latitude: metadata.latitude || null,
      longitude: metadata.longitude || null,
      storage_location: metadata.storageLocation,
      kingdom: metadata.kingdom,
      genus: metadata.genus,
      family: metadata.family,
      species: metadata.species,
      depth: metadata.depth || null,
      temperature: metadata.temperature || null,
      substrate: metadata.substrate,
      sample_length: metadata.sampleLength || null,
      morphology,
      microbiology,
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
        loadSampleForEdit,
        submitSample,
        clearDraftOnly,
        exitEditMode,
        // Keep old name as alias so old code doesn't break yet
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