import React, { useState } from 'react';
import api from '../services/api';

const PTWFormWorker = ({ task, onComplete }) => {
  const [formData, setFormData] = useState({
    generalDetails: {
      is_valid: false,
      scope_defined: false,
      signed_by_issuer: false,
      documents_attached: false,
      location_identified: false,
      permit_displayed: false,
      weather_suitable: false,
      validity_extended: false,
      co_activity_risks_controlled: false,
      recorded_in_log: false,
    },
    hazardAssessment: {
      hazards_identified: false,
      risk_assessment_complete: false,
      control_measures_documented: false,
      emergency_procedures_communicated: false,
      fire_risk_assessment: false,
      confined_space_hazards: false,
      working_at_height_risks: false,
      electrical_hazards: false,
      chemical_exposure_risks: false,
      environmental_impact: false,
    },
    worksitePreparation: {
      isolation_completed: false,
      gas_testing_completed: false,
      barricades_in_place: false,
      lighting_adequate: false,
      scaffolding_inspected: false,
      access_egress_clear: false,
      ventilation_adequate: false,
      noise_levels_assessed: false,
      hot_work_screens_in_place: false,
      tools_inspected: false,
    },
    ppe: {
      ppe_provided: false,
      ppe_inspected: false,
      specialized_ppe_available: false,
      fall_arrest_in_place: false,
      fire_resistant_clothing: false,
      eye_protection_used: false,
      hearing_protection_used: false,
      gloves_appropriate: false,
      foot_protection_used: false,
      full_body_harness_used: false,
    },
    workforceCommunication: {
      workers_trained: false,
      toolbox_talk_conducted: false,
      communication_methods: false,
      supervisor_present: false,
      workers_familiar_with_ptw: false,
      medically_fit: false,
      buddy_system_in_place: false,
      language_barriers_addressed: false,
      emergency_contact_list: false,
      shift_handover_completed: false,
    },
    specialConditions: {
      hot_work_permit_obtained: false,
      confined_space_permit_obtained: false,
      working_at_height_permit_obtained: false,
      electrical_isolation_confirmed: false,
      excavation_permit_obtained: false,
      radiography_permit_obtained: false,
      lifting_plan_approved: false,
      weather_monitoring_in_place: false,
      fire_watch_appointed: false,
      rescue_plan_in_place: false,
    },
    remarks: '',
  });
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);

  const handleRadioChange = (category, parameter, value) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [parameter]: value,
      },
    }));
  };

  const handleFileChange = (category, parameter, file) => {
    setFiles((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [parameter]: file,
      },
    }));
  };

  const handleRemarksChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      remarks: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const ptwData = new FormData();
      ptwData.append('ptw_form_data', JSON.stringify(formData));
      ptwData.append('action', 'submit_ptw_assurance');
      ptwData.append('task_type', 'ptw');

      for (const category in files) {
        for (const parameter in files[category]) {
          ptwData.append(`${category}_${parameter}_file`, files[category][parameter]);
        }
      }

      await api.updateTask(task.id, ptwData);
      onComplete();
    } catch (error) {
      console.error('Error submitting PTW form:', error);
      alert('Failed to submit PTW form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderChecklist = (category, title, parameters) => (
    <div className="mb-6">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">{title}</h4>
      <div className="space-y-3">
        {parameters.map((param) => (
          <div key={param.key} className="grid grid-cols-5 gap-4 items-center border-b pb-3">
            <div className="col-span-2 text-sm text-gray-700 font-medium">
              {param.label}
            </div>
            <div className="flex items-center space-x-4">
              <label>
                <input
                  type="radio"
                  name={`${category}_${param.key}`}
                  value={true}
                  checked={formData[category][param.key] === true}
                  onChange={() => handleRadioChange(category, param.key, true)}
                  className="mr-1"
                />
                Yes
              </label>
              <label>
                <input
                  type="radio"
                  name={`${category}_${param.key}`}
                  value={false}
                  checked={formData[category][param.key] === false}
                  onChange={() => handleRadioChange(category, param.key, false)}
                  className="mr-1"
                />
                No
              </label>
              <label>
                <input
                  type="radio"
                  name={`${category}_${param.key}`}
                  value="n/a"
                  checked={formData[category][param.key] === 'n/a'}
                  onChange={() => handleRadioChange(category, param.key, 'n/a')}
                  className="mr-1"
                />
                N/A
              </label>
            </div>
            <div>
              <input
                type="text"
                className="w-full px-2 py-1 border rounded-lg text-sm"
                placeholder="Remarks"
                name={`${category}_${param.key}_remarks`}
                value={formData[category][`${param.key}_remarks`] || ''}
                onChange={handleRemarksChange}
              />
            </div>
            <div>
              <input
                type="file"
                className="w-full text-xs text-gray-500"
                onChange={(e) => handleFileChange(category, param.key, e.target.files[0])}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const generalDetails = [
    { key: 'is_valid', label: 'PTW is valid for the specified date/time' },
    { key: 'scope_defined', label: 'Scope of work is clearly defined' },
    { key: 'signed_by_issuer', label: 'Permit is signed by authorized issuer' },
    { key: 'documents_attached', label: 'All relevant drawings / documents attached' },
    { key: 'location_identified', label: 'Work location clearly identified' },
    { key: 'permit_displayed', label: 'Permit displayed at worksite' },
    { key: 'weather_suitable', label: 'Weather conditions suitable for work' },
    { key: 'validity_extended', label: 'Permit validity extended (if applicable)' },
    { key: 'co_activity_risks_controlled', label: 'Co-activity risks identified and controlled' },
    { key: 'recorded_in_log', label: 'PTW number recorded in control log' },
  ];

  const hazardAssessment = [
    { key: 'hazards_identified', label: 'Job-specific hazards identified' },
    { key: 'risk_assessment_complete', label: 'Risk assessment completed & reviewed' },
    { key: 'control_measures_documented', label: 'Control measures documented' },
    { key: 'emergency_procedures_communicated', label: 'Emergency procedures communicated' },
    { key: 'fire_risk_assessment', label: 'Fire risk assessment completed' },
    { key: 'confined_space_hazards', label: 'Confined space hazards addressed' },
    { key: 'working_at_height_risks', label: 'Working at height risks addressed' },
    { key: 'electrical_hazards', label: 'Electrical hazards addressed' },
    { key: 'chemical_exposure_risks', label: 'Chemical exposure risks addressed' },
    { key: 'environmental_impact', label: 'Environmental impact considered' },
  ];

  const worksitePreparation = [
    { key: 'isolation_completed', label: 'Isolation / lockout-tagout completed' },
    { key: 'gas_testing_completed', label: 'Gas testing completed (if required)' },
    { key: 'barricades_in_place', label: 'Barricades / safety signage in place' },
    { key: 'lighting_adequate', label: 'Lighting adequate for task' },
    { key: 'scaffolding_inspected', label: 'Scaffolding inspected and tagged' },
    { key: 'access_egress_clear', label: 'Access and egress routes clear' },
    { key: 'ventilation_adequate', label: 'Ventilation adequate' },
    { key: 'noise_levels_assessed', label: 'Noise levels assessed and mitigated' },
    { key: 'hot_work_screens_in_place', label: 'Hot work screens/fire blankets in place' },
    { key: 'tools_inspected', label: 'Tools and equipment inspected' },
  ];

  const ppe = [
    { key: 'ppe_provided', label: 'PPE specified in PTW provided' },
    { key: 'ppe_inspected', label: 'PPE inspected & in good condition' },
    { key: 'specialized_ppe_available', label: 'Specialized PPE available (e.g., respirators)' },
    { key: 'fall_arrest_in_place', label: 'Fall arrest systems in place (if working at height)' },
    { key: 'fire_resistant_clothing', label: 'Fire-resistant clothing provided' },
    { key: 'eye_protection_used', label: 'Eye protection used' },
    { key: 'hearing_protection_used', label: 'Hearing protection used' },
    { key: 'gloves_appropriate', label: 'Gloves appropriate for task' },
    { key: 'foot_protection_used', label: 'Foot protection used' },
    { key: 'full_body_harness_used', label: 'Full body harness used where required' },
  ];

  const workforceCommunication = [
    { key: 'workers_trained', label: 'Workers trained for the task' },
    { key: 'toolbox_talk_conducted', label: 'Toolbox talk conducted' },
    { key: 'communication_methods', label: 'Communication methods established' },
    { key: 'supervisor_present', label: 'Supervisor present at site' },
    { key: 'workers_familiar_with_ptw', label: 'All workers familiar with PTW contents' },
    { key: 'medically_fit', label: 'Workforce medically fit for task' },
    { key: 'buddy_system_in_place', label: 'Buddy system in place (if required)' },
    { key: 'language_barriers_addressed', label: 'Language barriers addressed' },
    { key: 'emergency_contact_list', label: 'Emergency contact list available' },
    { key: 'shift_handover_completed', label: 'Shift handover communication completed' },
  ];

  const specialConditions = [
    { key: 'hot_work_permit_obtained', label: 'Hot work permit obtained (if applicable)' },
    { key: 'confined_space_permit_obtained', label: 'Confined space entry permit obtained' },
    { key: 'working_at_height_permit_obtained', label: 'Working at height permit obtained' },
    { key: 'electrical_isolation_confirmed', label: 'Electrical isolation confirmed' },
    { key: 'excavation_permit_obtained', label: 'Excavation permit obtained' },
    { key: 'radiography_permit_obtained', label: 'Radiography permit obtained' },
    { key: 'lifting_plan_approved', label: 'Lifting plan approved' },
    { key: 'weather_monitoring_in_place', label: 'Weather monitoring in place' },
    { key: 'fire_watch_appointed', label: 'Fire watch appointed' },
    { key: 'rescue_plan_in_place', label: 'Rescue plan in place' },
  ];

  return (
    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto mx-auto shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">PTW Assurance Form</h3>
        <span className="text-sm font-medium text-purple-600">Permit #{task.permit_number}</span>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h4 className="font-semibold text-lg text-blue-800">Assigned Task Details:</h4>
        <p className="text-sm text-gray-600"><strong>Project / Site:</strong> {task.site_name}</p>
        <p className="text-sm text-gray-600"><strong>Work Description:</strong> {task.work_description}</p>
        <p className="text-sm text-gray-600"><strong>Location of Work:</strong> {task.location_of_work}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {renderChecklist('generalDetails', '1. General PTW Details', generalDetails)}
        {renderChecklist('hazardAssessment', '2. Hazard Identification & Risk Assessment', hazardAssessment)}
        {renderChecklist('worksitePreparation', '3. Worksite Preparation', worksitePreparation)}
        {renderChecklist('ppe', '4. Personal Protective Equipment (PPE)', ppe)}
        {renderChecklist('workforceCommunication', '5. Workforce Competence & Communication', workforceCommunication)}
        {renderChecklist('specialConditions', '6. Special Conditions & Additional Controls', specialConditions)}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Worker Remarks</label>
          <textarea
            name="remarks"
            rows="3"
            value={formData.remarks}
            onChange={handleRemarksChange}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Add any additional remarks or observations..."
          ></textarea>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium disabled:opacity-50 transition-colors duration-200"
          >
            {loading ? 'Submitting...' : 'Submit PTW Assurance Form'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PTWFormWorker;