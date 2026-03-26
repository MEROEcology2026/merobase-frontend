import { useSampleFormContext } from "../context/SampleFormContext";

export const useSampleForm = () => {
  const ctx = useSampleFormContext();

  return {
    formData: ctx.formData,
    mode: ctx.mode,
    editingSampleId: ctx.editingSampleId,
    setFormData: ctx.setFormData,
    updateSection: ctx.updateSection,
    setSection: ctx.setSection,
    loadSampleForEdit: ctx.loadSampleForEdit,
    submitSample: ctx.submitSample,
    clearDraftOnly: ctx.clearDraftOnly,
    exitEditMode: ctx.exitEditMode,
  };
};