ontime_data = {
    'weburl': 'http://localhost:8084/webapplication/api/',
//    'weburl': 'http://demotrt.com:8080/ontime/api/',
    'defaultState': 'login',
    'homepage': 'app.dashboard',
    'weatherCity':'New York, NY',
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
    employee_dispatch_responses : {
        '1': 'Interested',
        '0': 'Not Interested',
        '2': 'Not Sure'
    },
    positionGroups: {
        'NURSING_CARE_COORDINATOR': "NCC",
        'STAFFING_COORDINATOR': "SC",
        'OFFICE_STAFF': "OS"
    },
    'pastEventAuthorizationPassword': '!avalanche!',
    'hrPassword': 'Avalanche!HR',
    'date_time_format': "yyyy/MM/dd hh:mm:ss a",
    amazonPublicUrl: "https://s3-us-west-1.amazonaws.com/test-ontimeprofileimage/",
    amazonSignatureUrl: "https://s3-us-west-1.amazonaws.com/test-ontimepatientsign/",
    reportTypes: [
        {id: 'employeecensus', label: "Employee Census - Compliance Tracker"},
        {id: 'employeebenefitshealthcare', label: "Employee Healthcare Benefits Report"},
//        {id: 'employeebenefits401k', label: "Employee 401k benefits Report"},
        {id: 'employeeothours', label: "Employee OT Hours Report"},
        {id: 'ptoreport', label: "Employee PTO Report"},
        {id: 'employeetimesheet', label: "Employee Time Sheet"},
        {id: 'employeeworkedhoursbycounty', label: "Employee Worked Hours - By County"},
        {id: 'wppreport', label: "Employee WPP Report"},
        {id: 'workedhours', label: "Worked Hours"},
        {id: 'notesreport', label: "Employee/Patient Notes"},
        {id: 'lossofhoursreport', label: "Loss Hours"},
        {id: 'patientcensus', label: "Patient Census"},
        {id: 'patienttimesheet', label: "Patient Time Sheet"},
        {id: 'workedhours', label: "Worked Hours"}
    ],
    unitValues: [{value: 0.25, label: "15 min"}, {value: 0.5, label: "30 min"}, {value: 0.45, label: "45 min"}, {value: 1, label: "1 hr"}],
    defaultDistance: 5
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
