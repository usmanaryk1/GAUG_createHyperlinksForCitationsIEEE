ontime_data = {
    // 'weburl': 'https://uat-app.ontimeits.com/ontime/api/',
    'weburl': 'http://207.244.237.74:8081/ontime/api/',
    'defaultState': 'redirect',
    'redirectStateOrURL': 'login',
    'homepage': 'app.dashboard',
    'weatherCity': 'New York, NY',
    'employeeReasons': [
        {key: "SICK", value: "Sick"},
        {key: "PSNL", value: "Personal Day"},
        {key: "VCTN", value: "Vacation"},
        {key: "HOLI", value: "Holiday"},
        {key: "BERV", value: "Bereavement"},
        {key: "JUDU", value: "Jury Duty"}
    ],
    'patientReasons': [
        {key: "HPTL", value: "Hospitalization"},
        {key: "VCTN", value: "Vacation"},
        {key: "INCW", value: "Inclement weather"},
        {key: "NOSP", value: "No Service As Per Patient"},
        {key: "NOSC", value: "No Service - Coverage"},
        {key: "USPC", value: "Unspecified"}
    ],
    'recurranceTypes': {D: "Daily", W: "Weekly", N: "No Repeat"},
    'eventTypes': {S: "Schedule", A: "Available", U: "Unavailable"},
    benefitList: [{key: 'SIT', value: 'Sick Time'}, {key: 'PRT', value: 'Personal Time'}, {key: 'VCT', value: 'Vacation Time'}, {key: 'HEC', value: 'Healthcare'},
        {key: 'WFC', value: 'WPP Flex Cards'}, {key: '401', value: '401K'}],
    benefitMap: {
        'SIT': 'Sick Time',
        'PRT': 'Personal Time',
        'VCT': 'Vacation Time',
        'HEC': 'Healthcare',
        'WFC': 'WPP Flex Cards',
//        '401': '401K'
    },
    'company_code': "TRT",
    employee_dispatch_responses: {
        '1': 'Interested',
        '0': 'Not Interested',
        '2': 'Not Sure'
    },
    positionGroups: {
        'NURSING_CARE_COORDINATOR': "NCC",
        'STAFFING_COORDINATOR': "SC",
        'OFFICE_STAFF': "OS"
    },
    patientRecords: [
        { option: "Nursing Assessment", value: "Nursing_Assessment" },
        { option: "Medication Reconciliation", value: "Medication_Reconciliation" },
        { option: "Progress Note", value: "Progress_Note" },
        { option: "Medical Orders", value: "Medical_Orders" },
        { option: "Home Care Plan", value: "Home_Care_Plan" },
    ],
    patientRecordsObj: {
        Nursing_Assessment: 'Nursing Assessment',
        Medication_Reconciliation: 'Medication Reconciliation',
        Progress_Note: 'Progress Note',
        Medical_Orders: 'Medical Orders',
        Home_Care_Plan: 'Home Care Plan'
    },
    'pastEventAuthorizationPassword': '!avalanche!',
    'hrPassword': 'Avalanche!HR',
    'date_time_format': "yyyy/MM/dd hh:mm:ss a",
    amazonPublicUrl: "https://s3-us-west-1.amazonaws.com/test-ontimeprofileimage/",
    amazonSignatureUrl: "https://s3-us-west-1.amazonaws.com/test-ontimepatientsign/",
    reportTypes: [
        {id: 'applicationlistreport', label: "Application List Report"},
        {id: 'applicationmetricsreport', label: "Application Metrics Report"},
        {id: 'claimrejectionreport', label: "Billing - Claim Rejection Report"},
        {id: 'detailagingreport', label: "Billing - Detail Aging Report"},
        {id: 'summaryagingreport', label: "Billing - Summary Aging Report"},
        {id: 'billingmonitorreport', label: "Billing - Monitor Report"},
        {id: 'complaints', label: "Complaints Report"},
        {id: 'employeecensus', label: "Employee Census - Compliance Tracker"},
        {id: 'employeelastpunchin', label: "Employee Last Punchin Date Report"},
        {id: 'employeebenefitshealthcare', label: "Employee Healthcare Benefits Report"},
//        {id: 'employeebenefits401k', label: "Employee 401k benefits Report"},
        {id: 'employeeothours', label: "Employee OT Hours Report"},
        {id: 'ptoreport', label: "Employee PTO Report"},
        {id: 'employeetimesheet', label: "Employee Time Sheet"},
        {id: 'employeeutilization', label: "Employee Utilization Report"},
        {id: 'employeeworkedhoursbycounty', label: "Employee Worked Hours - By County"},
        {id: 'wppreport', label: "Employee WPP Report"},
        {id: 'eventactivityreport', label: "Event Logs Report"},
        {id: 'evv-emedny-error-report', label: "EVV Errors for EMedNY Report"},
        {id: 'missedpunchreport', label: "Missed Punch Report"},
        {id: 'totalworkedhours', label: "Total Patient Worked Hours Summary"},
        {id: 'workedhours', label: "Worked Hours"},
        {id: 'notesreport', label: "Employee/Patient Notes"},
        {id: 'lossofhoursreport', label: "Loss Hours"},
        {id: 'patientcensus', label: "Patient Census"},
        {id: 'patienttimesheet', label: "Patient Time Sheet"},
        {id: 'employeedeactivatereport', label: "Employee Deactivate Report"},
        {id: 'revenuereconciliationreport', label: "Revenue Reconciliation Report"},
        {id: 'revenuereconciliationbycounty', label: "Revenue Reconciliation By County Report"},
        {id: 'weeklyotanalysis', label: "Weekly OT Analysis Report"}
    ],
    formTypes: [
        {id: 'complaintform', label: "Complaint Form"}
    ],
    complaintTypes: [
        { title: 'Billing Issues', value: 'billing_issues' },
        { title: 'Cultural Sensitivity', value: 'cultural_sensitivity' },
        { title: 'Equipment Failures', value: 'equipment_failures' },
        { title: 'Family Involvement Concerns', value: 'family_involvement_concerns' },
        { title: 'Inadequate Care', value: 'inadequate_care' },
        { title: 'Lack of Care Coordination', value: 'lack_of_care_coordination' },
        { title: 'Lack of Communication', value: 'lack_of_communication' },
        { title: 'Lack of Care Coordination', value: 'lack_of_care_coordination' },
        { title: 'Medication Errors', value: 'medication_errors' },
        { title: 'No Service', value: 'no_service' },
        { title: 'Payroll Issues', value: 'payroll_issues' },
        { title: 'Patient – Staff Conflicts', value: 'patient_staff_conflicts' },
        { title: 'Poor Hygiene', value: 'poor_hygiene' },
        { title: 'Privacy Concerns', value: 'privacy_concerns' },
        { title: 'Safety Issues', value: 'safety_issues' },
        { title: 'Scheduling Problems', value: 'scheduling_problems' },
        { title: 'Service Quality', value: 'service_quality' },
        { title: 'Staff Professionalism', value: 'staff_professionalism' },
        { title: 'Staff Punctuality', value: 'staff_punctuality' },
        { title: 'Technology Issues', value: 'technology_issues' },
        { title: 'Transportation Issues', value: 'transportation_issues' },
    ],
    unitValues: [{value: 0.25, label: "15 min"}, {value: 0.5, label: "30 min"}, {value: 0.45, label: "45 min"}, {value: 1, label: "1 hr"}],
    defaultDistance: 3
};

function arr_diff(a1, a2)
{
    var a = [], diff = [];
    for (var i = 0; i < a1.length; i++)
        a[a1[i]] = true;
    for (var i = 0; i < a2.length; i++)
        if (a[a2[i]])
            delete a[a2[i]];
        else
            a[a2[i]] = true;
    for (var k in a)
        diff.push(k);
    return diff;
}
