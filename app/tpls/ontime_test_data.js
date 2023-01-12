ontimedata = {
    patients: [{
            id: '1',
            FName: 'Aichael',
            middleInitial: 'ami',
            LName: 'Qin',
            nameSuffix: 'mq',
            dateOfBirth: '05/12/1984',
            gender: 'M',
            phone: '1304008000',
            addressDataId: '1',
            staffingCordinatorId: '1',
            nurseCaseManagerId: '1',
            careCordinatorId: '1',
            locationLatitude: '100',
            locationLongitude: '1000',
            insuranceProviderId: '1',
            planName: 'Premium',
            policyNumber: '10001',
            mrnNumber: '20001',
            isSubscriber: 'true',
            authorization: 'auth',
            status: 'Administrator',
            filledPage: 'www',
            address1: 'Avenue #1',
            address2: 'Newyork',
            city: 'NYC',
            state: 'NY',
            zipcode: '300400',
            careCordinator: 'Bruce Lee',
            careCordinatorContact: '(130) 400-8000',
            insuranceProvider: 'National Insurance.',
            insuranceId: 'National Insurance.'
        }, {
            id: '2',
            FName: 'Bichael',
            middleInitial: 'bmi',
            LName: 'Qin',
            nameSuffix: 'mq',
            dateOfBirth: '05/12/1984',
            gender: 'M',
            phone: '0304008001',
            addressDataId: '1',
            staffingCordinatorId: '1',
            nurseCaseManagerId: '1',
            careCordinatorId: '1',
            locationLatitude: '100',
            locationLongitude: '1000',
            insuranceProviderId: '1',
            planName: 'Premium',
            policyNumber: '10001',
            mrnNumber: '20001',
            isSubscriber: 'true',
            authorization: 'auth',
            status: 'Administrator',
            filledPage: 'www',
            address1: 'Avenue #1',
            address2: 'Newyork',
            city: 'NYC',
            state: 'NY',
            zipcode: '300400',
            careCordinator: 'Bruce Lee',
            careCordinatorContact: '(130) 400-8000',
            insuranceProvider: 'National Insurance.',
            insuranceId: 'National Insurance.'
        }, {
            id: '3',
            FName: 'Cichael',
            middleInitial: 'cmi',
            LName: 'Qin',
            nameSuffix: 'mq',
            dateOfBirth: '05/12/1984',
            gender: 'M',
            phone: '2304008002',
            addressDataId: '1',
            staffingCordinatorId: '1',
            nurseCaseManagerId: '1',
            careCordinatorId: '1',
            locationLatitude: '100',
            locationLongitude: '1000',
            insuranceProviderId: '1',
            planName: 'Premium',
            policyNumber: '10001',
            mrnNumber: '20001',
            isSubscriber: 'true',
            authorization: 'auth',
            status: 'Administrator',
            filledPage: 'www',
            address1: 'Avenue #1',
            address2: 'Newyork',
            city: 'NYC',
            state: 'NY',
            zipcode: '300400',
            careCordinator: 'Bruce Lee',
            careCordinatorContact: '(130) 400-8000',
            insuranceProvider: 'National Insurance.',
            insuranceId: 'National Insurance.'
        }],
    employees: [{"id": 1,
            "fName": "Hamma",
            wages:"S",
            taxStatus:"1099",
            "lName": "Kureshi",
            "middleInitial": 'ami',
            "dateOfBirth": '05/12/1984',
            "socialSecurity":"3423783452",
            "phone": "0216596425",
            "email": "mohamed.abderrahmen@gmail.com",
            "city": "Tunis",
            "state": "NV",
            "address1": "209-NY Avenue",
            "zipcode": "2036",
            "role": "Administrator",
            "position": "Engineer",
            "status": "OK",
            "timeSheetList": []
        },{"id": 2,
            wages:"H",
            taxStatus:"1099",
            "fName": "Namma",
            "lName": "Abderran",
            middleInitial: 'cmi',
            dateOfBirth: '05/12/1984',
            "socialSecurity":"3423783452",
            "phone": "0216596425",
            "email": "mohamed.abderrahmen@gmail.com",
            "city": "Tunis",
            "state": "NV",
            "address1": "203-NY Avenue",
            "address2":"Street No-5",
            "zipcode": "2036",
            "role": "Administrator",
            "position": "Doctor",
            "status": "OK",
            "timeSheetList": []
        },{"id": 3,
            wages:"H",
            taxStatus:"W-2",
            "fName": "Karry",
            "lName": "Neil",
            middleInitial: 'bmi',
            dateOfBirth: '05/12/1984',
            "socialSecurity":"3423783452",
            "phone": "0216596425",
            "email": "mohamed.abderrahmen@gmail.com",
            "city": "Tunis",
            "state": "NV",
            "address1": "23-NYC Planet",
            "address2":"Street No-7",
            "zipcode": "2036",
            "role": "Staff",
            "position": "Staff",
            "status": "OK",
            "timeSheetList": []
        } ]
};

ontimetest = {
    'weburl': 'api/',
    'defaultState': 'login',
    'patients': ontimedata.patients,
    'employees': ontimedata.employees
//    'getPatients': function($scope, $rootScope, $http) {
//        $scope.patients = ontimedata.patients;
//    },
};
