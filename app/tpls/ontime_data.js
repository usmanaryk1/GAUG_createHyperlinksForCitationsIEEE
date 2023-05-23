ontime_data = {
    'weburl': 'http://localhost:8080/ontime/api/',
//    'weburl': 'http://demotrt.com:8080/ontime/api/',
    'defaultState': 'login',
    'homepage': 'app.dashboard',
    'weatherCity':'New York, NY',
    'employeeReasons': [
        "Sick", "Personal Day", "Vacation"
    ],
    'patientReasons': [
        "Hospital", "Vacation", "As per Pt.", "No Service"
    ],
    'recurranceTypes': {D: "Daily", W: "Weekly", N: "No Repeat"},
    'eventTypes': {S: "Schedule", A: "Available", U: "Unavailable"},
    benefitList: [{key: 'SIT', value: 'Sick Time'}, {key: 'PRT', value: 'Personal Time'}, {key: 'VCT', value: 'Vacation Time'}, {key: 'HEC', value: 'Healthcare'},
        {key: 'WFC', value: 'WPP Flex Cards'}, {key: '401', value: '401K'}],
    benefitMap: {'SIT': 'Sick Time', 'PRT': 'Personal Time', 'VCT': 'Vacation Time', 'HEC': 'Healthcare', 'WFC': 'WPP Flex Cards', '401': '401K'},    
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
    amazonPublicUrl: "https://s3-us-west-1.amazonaws.com/ontimeprofileimage/",
    amazonSignatureUrl: "https://s3-us-west-1.amazonaws.com/ontimepatientsign/",
    reportTypes: [
        {id: 'employeecensus', label: "Employee Census - Compliance Tracker"},
        {id: 'employeetimesheet', label: "Employee Time Sheet"},
        {id: 'patientcensus', label: "Patient Census"},
        {id: 'patienttimesheet', label: "Patient Time Sheet"},
        {id: 'workedhours', label: "Worked Hours"},
        {id: 'employeeworkedhoursbycounty', label: "Employee Worked Hours - By County"}
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
